# 📋 PLAN DE IMPLEMENTACIÓN - NUEVA COLECCIÓN `modelo-version`

**Fecha:** 27 Mayo 2026  
**Estado:** Plan detallado listo para implementación segura

---

## ✅ ARCHIVOS A CREAR (NUEVOS)

### 1. Nueva colección `modelo-version`:

```
src/api/modelo-version/
├── content-types/
│   └── modelo-version/
│       ├── schema.json ← NUEVO
│       └── index.js ← NUEVO
├── controllers/
│   ├── modelo-version.js ← NUEVO
│   └── index.js ← NUEVO
├── services/
│   ├── modelo-version.js ← NUEVO
│   └── index.js ← NUEVO
├── routes/
│   ├── modelo-version.js ← NUEVO
│   └── index.js ← NUEVO
└── index.js ← NUEVO
```

### 2. Sistema de importación:

```
src/api/import/
├── content-types/
│   └── import-log/
│       ├── schema.json ← NUEVO
│       └── index.js ← NUEVO
├── controllers/
│   ├── import.js ← NUEVO
│   └── index.js ← NUEVO
├── services/
│   ├── import.js ← NUEVO (orquestador)
│   ├── parser.js ← NUEVO (Excel/CSV)
│   ├── validator.js ← NUEVO (validación Zod)
│   ├── mapper.js ← NUEVO (mapeo columnas)
│   ├── importer.js ← NUEVO (create/update)
│   ├── import-cache.js ← NUEVO (almacenamiento temporal)
│   ├── import-logger.js ← NUEVO (auditoría)
│   └── index.js ← NUEVO
├── routes/
│   ├── import.js ← NUEVO
│   └── index.js ← NUEVO
└── index.js ← NUEVO
```

### 3. Documentación:

```
docs/
├── IMPORTACION_DATOS.md ← NUEVO
├── IMPORTACION_ARQUITECTURA.md ← NUEVO
├── IMPORTACION_SEGURIDAD.md ← NUEVO
└── templates/
    ├── import-modelos-precios-template.csv ← NUEVO
    ├── import-sucursales-template.csv ← NUEVO
    └── import-ejemplo-completo.xlsx ← NUEVO
```

### 4. Utils y helpers:

```
src/utils/
├── import-helpers.js ← NUEVO
└── validators/
    ├── modelo-version-validator.js ← NUEVO
    └── sucursal-validator.js ← NUEVO
```

---

## ✏️ ARCHIVOS A MODIFICAR (EXISTENTES)

### 1. package.json

```diff
{
  "dependencies": {
+   "exceljs": "^4.3.0",
+   "papaparse": "^5.4.1", 
+   "zod": "^3.22.0",
+   "uuid": "^9.0.0"
  }
}
```

**Cambio:** Agregar 4 librerías. Sin modificar otros scripts o dependencias.

### 2. src/api/modelo/content-types/modelo/schema.json

```diff
{
  "attributes": {
    ...campos existentes sin cambios...
+   "versiones_detalladas": {
+     "type": "relation",
+     "relation": "oneToMany",
+     "target": "api::modelo-version.modelo-version",
+     "mappedBy": "modelo"
+   }
  }
}
```

**Cambio:** SOLO agregar una relación inversa (oneToMany) para ver versiones desde modelo.
No tocar versiones component existente.

### 3. .env (opcional)

```diff
+ IMPORT_MAX_FILE_SIZE=52428800
+ IMPORT_SESSION_TTL=3600
+ IMPORT_MAX_ROWS=10000
```

**Cambio:** Agregar variables de configuración opcional. Valores sensatos, sin afectar nada.

---

## 🚫 ARCHIVOS QUE NO MODIFICAREMOS

```
❌ src/api/modelo/content-types/modelo/schema.json
   (Excepto agregar la relación inversa versiones_detalladas)
   
❌ src/api/modelo/[controllers/routes/services]/
   (APIs existentes no se tocan)
   
❌ src/api/sucursal/
   (No tocar sucursal)
   
❌ src/api/noticia/
   (No tocar noticia)
   
❌ src/components/shared/version.json
   (Componente de versiones existente NO SE TOCA)
   
❌ src/components/modelo/
   (Componentes de modelo NO SE TOCAN)
   
❌ config/
   (No tocar configuración base)
   
❌ [resto de colecciones existentes]
```

---

## 📊 IMPACTO ANALIZADOS

### ✅ SEGURO - No afecta APIs existentes:

1. **Nueva colección modelo-version**
   - Es completamente nueva
   - Tiene su propia API: `/api/modelo-versions`
   - No interfiere con `/api/modelos`

2. **Relación inversa en modelo**
   - Solo agrega un campo de relación
   - Es opcional, el frontend puede ignorarlo
   - No rompe APIs existentes
   - No afecta estructura de respuestas API

3. **Nuevo sistema de importación**
   - API privada: `/api/import/*`
   - Completamente aislada
   - No afecta APIs públicas

4. **Nuevas librerías**
   - No rompen dependencias existentes
   - No hay conflictos de versión

### ⚠️ VERIFICACIONES ANTES DE IMPLEMENTAR

- [ ] El build sigue funcionando después de agregar librerías
- [ ] Las APIs de `/api/modelos` siguen funcionando exactamente igual
- [ ] Las APIs de `/api/sucursales` siguen funcionando exactamente igual
- [ ] El admin de Strapi sigue mostrando todas las colecciones
- [ ] El frontend no se ve afectado (no hay cambios en respuestas API)
- [ ] El componente `versiones` sigue funcionando normalmente
- [ ] No hay datos de prueba permanentes después de la implementación

---

## 🔄 FLUJO DE IMPORTACIÓN PLANEADO

### Para Reporte Precios (modelo-version):

```
1. Usuario sube Reporte Precios (46).xlsx
   ↓
2. POST /api/import/preview
   - Parsear Excel
   - Detectar marca + modelo + version
   - Buscar modelo existente por nombre normalizado
   - Buscar versiones existentes por codigo o nombre
   - Validar precios (limpiar símbolos, convertir a integer)
   - Retornar preview: qué se creará, qué se actualizará, qué errores hay
   ↓
3. Usuario revisa preview
   - Ver modelos encontrados vs no encontrados
   - Ver versiones a crear vs actualizar
   - Ver errores por fila
   ↓
4. POST /api/import/confirm/{importId}
   - Ejecutar importación definitiva
   - Crear registros de modelo-version
   - Generar log de auditoría
   - Retornar reporte: creados, actualizados, errores
```

### Para Reporte Pivots (sucursal):

```
1. Usuario sube Reporte pivots.xlsx
   ↓
2. POST /api/import/preview
   - Parsear Excel
   - Buscar sucursal existente por slug
   - Normalizar datos: lat/lng, teléfono, email
   - Validar campos requeridos
   - Retornar preview
   ↓
3. Usuario revisa preview
   ↓
4. POST /api/import/confirm/{importId}
   - Ejecutar importación definitiva (UPSERT)
   - Retornar reporte
```

---

## 🛡️ VALIDACIONES IMPLEMENTADAS

### Para modelo-version:

```
✅ nombre: required, no vacío
✅ modelo: debe existir
✅ precio_lista: number >= 0
✅ bono_marca: number >= 0
✅ bono_financiamiento: number >= 0
✅ slug: unique
✅ codigo: unique si existe
✅ Campos opcionales: transmision, motor, combustible, etc.
```

### Para sucursal (UPSERT):

```
✅ nombre: required
✅ direccion: required
✅ comuna: required
✅ region: required
✅ lat: number, -90 a 90
✅ lng: number, -180 a 180
✅ telefono: formato válido
✅ email: formato válido
✅ slug: unique (para UPSERT)
```

---

## 📁 RESUMEN DE CAMBIOS

### Nuevos archivos: **~30 archivos**
- modelo-version: 6 carpetas + 10 archivos base
- import: 6 carpetas + 12 archivos base  
- docs: 5 archivos
- utils: 2 archivos

### Archivos modificados: **3**
- package.json (agregar librerías)
- src/api/modelo/schema.json (relación inversa)
- .env (variables opcionales)

### Archivos NO tocados: **50+**
- Todas las colecciones existentes
- Todos los componentes existentes
- Config base
- Frontend

---

## ✅ CRITERIO DE SEGURIDAD

**Este plan es SEGURO porque:**

1. ✅ Nueva colección completamente aislada
2. ✅ No elimina ni modifica destructivamente nada existente
3. ✅ Solo agrega una relación opcional inversa
4. ✅ Las APIs existentes NO se ven afectadas
5. ✅ El frontend NO se ve afectado
6. ✅ El build no se rompe (librerías compatibles)
7. ✅ Componentes existentes siguen intactos
8. ✅ Datos existentes no se tocan

---

## 🚀 LISTO PARA IMPLEMENTACIÓN

Este plan está listo. Procederemos con:

1. ✅ Crear estructura de modelo-version
2. ✅ Agregar librerías en package.json
3. ✅ Implementar sistema de importación
4. ✅ Agregar seguridad
5. ✅ Crear parsers y validadores
6. ✅ Documentar
7. ✅ Testear sin romper nada existente

---

**PLAN APROBADO PARA PROCEDER**
