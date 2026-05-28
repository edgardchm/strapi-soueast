# 📋 POSTMORTEM: Fallo de Implementación del Importador Masivo - Mayo 2026

**Fecha:** 27-28 de Mayo, 2026  
**Proyecto:** Sistema de Importación Masiva de Datos para Strapi 4.25.9  
**Estado:** ❌ ROLLBACK COMPLETADO - Railway restaurado a estado estable  
**Responsable:** Implementación sin validación incremental

---

## 🎯 OBJETIVO ORIGINAL

Implementar un sistema robusto de importación de datos masivos en Strapi 4.25.9 que permitiera:
- Carga de archivos Excel (.xlsx) y CSV
- Validación previa con preview
- UPSERT sin duplicados
- Auditoría completa
- Seguridad JWT + admin-only
- 4 endpoints custom

---

## ❌ LO QUE PASÓ

### Cronología de Errores en Railway

**Error 1: `strapi-server.js is invalid for 'api::import'`**
```
bootstrap is not a function
this field has unspecified keys: default
```
- **Causa:** Creé un `strapi-server.js` con estructura de plugin, no de API estándar
- **Strapi v4:** Las APIs estándar NO necesitan `strapi-server.js`

**Error 2: `strapi-server.js is invalid for 'api::modelo-version'`**
```
bootstrap is not a function
this field has unspecified keys: default
```
- **Causa:** El archivo `/src/api/modelo-version/index.js` contenía:
  ```js
  module.exports = {
    default: {},
    bootstrap: {},
  };
  ```
- **Problema:** Strapi v4 rechaza `default: {}` y `bootstrap: {}` vacío

**Error 3: `Invalid route config config.auth must be a 'object' type, but the final value was: true`**
- **Causa:** En las rutas usé `auth: true`, que es inválido en Strapi v4.25.9
- **Corrección requerida:** Remover `auth: true` o usar forma correcta

**Error 4: `Could not find policy "api::import.import-auth"`**
- **Causa:** Las rutas referenciaban una policy que no existía
- **Realidad:** Solo existía como middleware, no como policy
- **Error conceptual:** Confundí middlewares con policies en Strapi v4

**Error 5: `Cannot read properties of undefined (reading 'find')`**
- **Causa:** El content-type `modelo-version/index.js` tenía `attributes: {}` vacío
- **Impacto:** Strapi no podía generar correctamente el controller/service CRUD
- **Raíz:** Había atributos en `schema.json` pero no en `index.js`

---

## 🔍 CAUSA RAÍZ

### Problemas Estructurales

1. **Implementación Monolítica**
   - Agregué 5 APIs nuevas + servicios + middlewares + policies de una sola vez
   - 2000+ líneas de código sin validar incrementalmente en Railway

2. **Desconocimiento de Strapi v4.25.9**
   - Confundir plugins con APIs estándar
   - Usar `strapi-server.js` innecesariamente
   - No validar sintaxis en `index.js` vs `schema.json`
   - Mezclar middlewares con policies

3. **Falta de Ciclo Deploy-Validación**
   - Implementé múltiples archivos antes de probar en Railway
   - No hice commits pequeños y reversibles
   - Sin testing incremental después de cada cambio

4. **Decisiones de Diseño Problemáticas**
   - Routes custom innecesariamente complejas
   - Controllers personalizados cuando podría usar core
   - Policies duplicadas con middlewares
   - Relaciones sin validar previamente

---

## 📚 QUÉ SE APRENDIÓ

### Lecciones Críticas

1. **Strapi v4 es estricto en estructura**
   - APIs estándar: No necesitan `strapi-server.js`
   - Content-types: Los atributos deben estar en `index.js` O `schema.json` (no ambos desincronizados)
   - Rutas: `config.auth` debe ser `{ enabled: true }` o no existir, nunca `true`

2. **Incremental es obligatorio**
   - Una colección por deploy
   - Una relación por deploy
   - Un endpoint por deploy
   - Validar en Railway entre cada paso

3. **Las convenciones importan**
   - Usar `createCoreController`, `createCoreService`, `createCoreRouter`
   - Evitar custom cuando lo core ya existe
   - Middlewares ≠ Policies en Strapi v4

4. **Rollback es la opción correcta**
   - Cuando hay demasiados errores cascada, rollback es mejor que parchear
   - `git reset --hard` a commit estable es lo más seguro

---

## 🚀 ESTRATEGIA SEGURA PARA REIMPLEMENTAR

### Principios Rectores

- ✅ **Un cambio por commit**
- ✅ **Deploy a Railway después de cada cambio**
- ✅ **Validar que levanta sin errores**
- ✅ **Revertir inmediatamente si falla**
- ✅ **No avanzar sin validación**

### FASE 1: Collection Type Mínima

**Objetivo:** Crear colección `modelo-version` usando solo convención nativa Strapi

**Tareas:**
1. Crear directorio `src/api/modelo-version/`
2. Crear `content-types/modelo-version/schema.json` con atributos básicos:
   - `nombre` (string, required)
   - `slug` (uid, unique)
   - `modelo` (relation manyToOne to api::modelo.modelo)
3. Crear `controllers/index.js` con `createCoreController`
4. Crear `services/index.js` con `createCoreService`
5. Crear `routes/index.js` con `createCoreRouter`
6. **NO crear:** `index.js` en raíz, `strapi-server.js`, controllers custom, routes custom
7. Commit y push
8. **VALIDAR EN RAILWAY:**
   - Strapi levanta sin errores
   - Admin accesible en :1337/admin
   - Colección visible en Content Manager
   - Endpoints CRUD generados automáticamente

**Reversal Plan:** `git reset --hard HEAD~1`

---

### FASE 2: Agregar Relación con Modelo

**Objetivo:** Validar que las relaciones funcionan correctamente

**Tareas:**
1. Actualizar `schema.json` para agregar relación:
   ```json
   "modelo": {
     "type": "relation",
     "relation": "manyToOne",
     "target": "api::modelo.modelo",
     "inversedBy": "versiones_detalladas"
   }
   ```
2. Actualizar `modelo/schema.json` si necesario para relación inversa
3. Commit y push
4. **VALIDAR EN RAILWAY:**
   - Strapi levanta sin errores
   - Relación visible en admin
   - Puedo crear modelo-version y asignar modelo

**Reversal Plan:** `git reset --hard HEAD~1`

---

### FASE 3: Endpoint Preview Mínimo

**Objetivo:** Agregar un endpoint simple que solo retorna datos, sin guardar

**Tareas:**
1. Crear `routes/custom.js` con una única ruta:
   ```js
   {
     method: 'POST',
     path: '/modelo-versions/preview',
     handler: 'api::modelo-version.preview'
   }
   ```
2. Crear `controllers/preview.js` con lógica mínima (solo lectura)
3. **NO crear:** middlewares custom, policies, auth
4. Commit y push
5. **VALIDAR EN RAILWAY:**
   - Endpoint responde sin auth
   - Strapi levanta sin errores
   - Preview retorna datos válidos

**Reversal Plan:** `git reset --hard HEAD~1`

---

### FASE 4: Agregar Confirmación e Importación

**Objetivo:** Agregar lógica de escritura a BD

**Tareas:**
1. Agregar endpoint `/modelo-versions/confirm` que crea registros
2. Agregar servicio simple para UPSERT
3. Commit y push
4. **VALIDAR EN RAILWAY:**
   - Endpoint crea registros en BD
   - UPSERT evita duplicados
   - Strapi levanta sin errores

**Reversal Plan:** `git reset --hard HEAD~1`

---

### FASE 5: Agregar Seguridad Formal

**Objetivo:** Aplicar JWT y admin-only después de validar funcionalidad

**Tareas:**
1. Crear middleware `import-auth.js` para validar JWT
2. Aplicar middleware a las rutas
3. **NO usar policies**, solo middlewares
4. Commit y push
5. **VALIDAR EN RAILWAY:**
   - Endpoints requieren auth
   - Admin-only funciona
   - Strapi levanta sin errores

**Reversal Plan:** `git reset --hard HEAD~1`

---

## 📋 CHECKLIST PARA FUTUROS INTENTOS

- [ ] Cada fase es un commit único
- [ ] Cada commit tiene un push a Railway
- [ ] Strapi levanta sin errores después de cada push
- [ ] Se valida funcionalidad antes de avanzar
- [ ] Si algo falla, rollback inmediato
- [ ] No mezclar múltiples cambios en un commit
- [ ] Usar `createCoreController`, `createCoreService`, `createCoreRouter`
- [ ] Evitar `strapi-server.js` en APIs estándar
- [ ] Evitar policies redundantes con middlewares
- [ ] Sincronizar `index.js` y `schema.json` en content-types

---

## 📚 REFERENCIAS ÚTILES

**Documentación Strapi v4.25.9:**
- https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/file-structure.html
- https://docs.strapi.io/developer-docs/latest/development/backend-customization/routes.html
- https://docs.strapi.io/developer-docs/latest/development/backend-customization/middlewares.html
- https://docs.strapi.io/developer-docs/latest/development/backend-customization/policies.html

---

## 🏁 CONCLUSIÓN

**Lo que NO funcionó:**
- Implementación monolítica
- Falta de validación incremental
- Desconocimiento de convenciones Strapi v4
- Múltiples cambios simultáneos

**Lo que SÍ funcionó:**
- Rollback seguro con `git reset --hard`
- Recuperación rápida a estado estable
- Railway volvió a funcionar inmediatamente

**Próximas acciones:**
- No reimplementar ahora
- Esperar a aplicar estrategia de 5 fases
- Hacer commits pequeños y reversibles
- Validar en Railway después de cada fase

---

**Estado actual:** ✅ Railway ESTABLE - Sin cambios del importador  
**Próximo intento:** Seguir estrictamente las 5 fases con validación incremental

