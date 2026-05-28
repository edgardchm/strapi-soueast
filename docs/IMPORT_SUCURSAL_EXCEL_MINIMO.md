# 📊 Importación Mínima de Sucursales desde Excel — Fase 1

**Estado:** ✅ FASE 1 COMPLETADA - Parser local sin endpoints  
**Fecha:** Mayo 2026  
**Objetivo:** Leer Excel de sucursales y normalizar a JSON, sin tocar Strapi  

---

## 📋 Descripción

Este script local **NO conecta a Strapi**, NO toca la base de datos, y NO crea endpoints.

Solo:
1. Lee archivo Excel o CSV local
2. Detecta y normaliza headers
3. Mapea campos al schema de `sucursal`
4. Valida datos requeridos
5. Muestra preview en JSON por consola

---

## 📁 Archivos Fase 1

```
scripts/
  └─ import-sucursal-preview.js     (Parser local)

docs/
  ├─ templates/
  │   └─ sucursal-import-template.csv    (Template de datos)
  └─ IMPORT_SUCURSAL_EXCEL_MINIMO.md     (Este archivo)

package.json                          (Actualizado: +exceljs)
```

---

## 🚀 Uso

### Instalar dependencias

```bash
npm install
```

### Ejecutar preview local

Con CSV:
```bash
node scripts/import-sucursal-preview.js ./docs/templates/sucursal-import-template.csv
```

Con XLSX (si tienes):
```bash
node scripts/import-sucursal-preview.js ./docs/templates/sucursal-import-template.xlsx
```

### Ejemplo de salida esperada

```
ℹ Leyendo archivo: ./docs/templates/sucursal-import-template.csv
✓ Hoja encontrada: "Sheet1"
✓ Headers detectados (10): nombre, direccion, comuna, region, lat, lng, telefono, email, horario, tipo_label

============================================================
RESUMEN DE LECTURA
============================================================
ℹ Total filas en archivo: 6
ℹ Total filas de datos: 5
⚠ Filas vacías omitidas: 0
✗ Filas con errores: 0

PREVIEW JSON (primeras 3 filas)
============================================================

Fila 1:
{
  "nombre": "Sucursal Centro Santiago",
  "direccion": "Av. Providencia 1234",
  "comuna": "Santiago",
  "region": "Metropolitana",
  "lat": -33.4203,
  "lng": -70.5707,
  "telefono": "+56 2 1234 5678",
  "email": "centro@soueast.cl",
  "horario": "Lunes a Viernes 9:00-18:00",
  "tipo_label": "Sala de ventas"
}

Fila 2:
{
  "nombre": "Sucursal Estación Central",
  "direccion": "Calle 5 de Abril 567",
  "comuna": "Estación Central",
  "region": "Metropolitana",
  "lat": -33.4515,
  "lng": -70.6801,
  "telefono": "+56 2 2345 6789",
  "email": "estacion@soueast.cl",
  "horario": "Lunes a Sábado 9:00-19:00",
  "tipo_label": "Servicio Técnico"
}

... y 3 filas más

✓ Preview completado exitosamente
```

---

## 📝 Schema de Sucursal

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| **nombre** | string | ✅ SÍ | Nombre de la sucursal |
| **direccion** | string | ✅ SÍ | Dirección física |
| **comuna** | string | ✅ SÍ | Comuna/ciudad |
| **region** | string | ✅ SÍ | Región/estado |
| **lat** | decimal | ✅ SÍ | Latitud (ej: -33.4203) |
| **lng** | decimal | ✅ SÍ | Longitud (ej: -70.5707) |
| **telefono** | string | - | Teléfono (opcional) |
| **email** | email | - | Email (opcional) |
| **horario** | string | - | Horario de atención (opcional) |
| **tipo_label** | enum | - | ["Sala de ventas", "Showroom Exclusivo", "Servicio Técnico"] |

---

## 🔄 Mapeo Automático de Columnas

El script detecta automáticamente variantes de nombres de columnas:

| Columna Excel | Mapeado a | Alternativas |
|---------------|-----------|--------------|
| nombre | nombre | name, sucursal, sucursal_nombre |
| direccion | direccion | address, dirección |
| comuna | comuna | city, ciudad |
| region | region | región, state, provincia |
| lat | lat | latitude, latitud |
| lng | lng | longitude, longitud, lon |
| telefono | telefono | teléfono, phone, fono |
| email | email | correo, e_mail |
| horario | horario | horarios, hours, schedule |
| tipo_label | tipo_label | tipo, type, label |

**Ventaja:** Flexibilidad en nombres de columnas. El script intenta encontrarlas automáticamente.

---

## ✔️ Validación Incluida

El script valida:
- ✅ Campos requeridos no vacíos (nombre, direccion, comuna, region, lat, lng)
- ✅ Latitude es número válido
- ✅ Longitude es número válido
- ✅ Tipo_label está dentro de enum permitido
- ✅ Detecta y omite filas vacías
- ✅ Limpia espacios en blanco
- ✅ Normaliza caracteres (áéíóú → aeiou)
- ✅ Detecta N/A, na, vacíos como NULL

---

## 📊 Template de Datos Incluido

Ubicación: `docs/templates/sucursal-import-template.csv`

Contiene 5 ejemplos reales:
1. Sucursal Centro Santiago
2. Sucursal Estación Central  
3. Showroom Exclusivo Las Condes
4. Sucursal Valparaíso
5. Sucursal Concepción

**Usa como referencia para crear tus propios archivos.**

---

## 🔒 Lo que NO hace Fase 1

- ❌ No conecta a Strapi
- ❌ No toca base de datos
- ❌ No crea endpoints
- ❌ No crea rutas custom
- ❌ No crea colecciones nuevas
- ❌ No modifica schemas
- ❌ No usa JWT/auth
- ❌ No guarda datos

---

## ✅ Próximos Pasos (Fases 2-5)

### Fase 2: Endpoint Preview
- Crear `/api/sucursal-import/preview`
- Recibir archivo por HTTP
- Mostrar JSON normalizado (sin guardar)

### Fase 3: Confirm/UPSERT
- Crear `/api/sucursal-import/confirm`
- Guardar o actualizar sucursales
- Usar UPSERT por `slug`

### Fase 4: Auditoría
- Registrar importaciones en log
- Rastrear usuario que importó
- Guardar errores por fila

### Fase 5: Seguridad
- Requiere JWT
- Solo admin puede importar
- Validar permisos

**CADA FASE se despliega por separado a Railway y se valida antes de avanzar.**

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'exceljs'"
```bash
npm install
```

### Error: "ENOENT: no such file or directory"
Verifica que la ruta del archivo sea correcta:
```bash
ls -la ./docs/templates/sucursal-import-template.csv
```

### Error: "No headers found"
El archivo Excel debe tener headers en la primera fila.

### Script no produce salida
- Asegúrate de usar Node.js >= 18
- Verifica permisos del archivo

---

## 📌 Notas Importantes

1. **Este es un script local**
   - Se ejecuta en tu máquina, no en Railway
   - Útil para debugging y validación previa

2. **No requiere Strapi corriendo**
   - Puedes probar el script sin levantar Strapi
   - Ideal para validar archivos Excel antes de importar

3. **Es reversible**
   - No modifica base de datos
   - Puedes revertir el commit fácilmente si es necesario

4. **Base para Fase 2**
   - La lógica del parser se reutilizará en el endpoint `/api/sucursal-import/preview`
   - Ya está lista para adaptarla

---

## 📞 Contacto / Soporte

Para dudas sobre este script:
- Revisa `docs/POSTMORTEM_IMPORTADOR_FALLIDO.md` para estrategia general
- Consulta schema en `src/api/sucursal/content-types/sucursal/schema.json`
- Tests locales primero, deploy a Railway después

---

**Status Fase 1:** ✅ COMPLETADA  
**Próximo paso:** Aprobación para Fase 2 (endpoint preview)
