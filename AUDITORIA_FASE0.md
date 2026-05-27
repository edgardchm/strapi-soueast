# 🔍 AUDITORÍA FASE 0 - PROYECTO STRAPI 4.6

**Fecha:** 27 Mayo 2026  
**Estado:** Auditoría completada - Listo para implementación  
**Proyecto:** soueast-cms (SOUEAST Chile CMS)

---

## 1. VERSIÓN EXACTA DE STRAPI

✅ **Strapi 4.25.9** (compatible con Strapi 4.6)

Plugins:
- @strapi/plugin-i18n: 4.25.9
- @strapi/plugin-users-permissions: 4.25.9

---

## 2. BASE DE DATOS

✅ **SQLite (local development)**
- DATABASE_CLIENT=sqlite
- DATABASE_FILENAME=.tmp/data.db

---

## 3. COLECCIONES EXISTENTES

### CollectionTypes:
- **modelo** (modelos de vehículos)
- **sucursal** (puntos de venta/dealerships)
- **noticia** (noticias/blog)

### SingleTypes (Páginas):
- home-page, noticias-page, contacto-page, legal-page, gracias-page, cotizador-page, test-drive-page, footer, global

---

## 4. COLECCIONES CANDIDATAS PARA IMPORTACIÓN

### 🎯 PRIORIDAD ALTA:

**modelo**
- Datos: Vehículos SOUEAST
- Campos: nombre, tagline, descripcion, precio_desde, categoria
- Datos desde: Reporte Precios (46).xlsx
- Campo único para UPSERT: **slug**

**sucursal**
- Datos: Dealerships/concesionarios  
- Campos: nombre, direccion, comuna, region, lat, lng, horario, telefono, email
- Datos desde: Reporte pivots - 2026-05-20T165615.388.xlsx
- Campo único para UPSERT: **slug** o compuesto nombre+comuna

---

## 5. CAMPOS ÚNICOS

- modelo: **slug** (UID, auto-generado de nombre)
- sucursal: **slug** (UID, auto-generado de nombre)

---

## 6. CAMPOS REQUERIDOS

modelo:
- nombre (required)
- slug (required)

sucursal:
- nombre (required)
- direccion (required)
- comuna (required)
- region (required)
- lat (required, decimal)
- lng (required, decimal)

---

## 7. RELACIONES Y COMPONENTES

modelo:
- versiones (component repeatable: shared.version)
- galeria (component repeatable: modelo.feature)
- colores (component repeatable: modelo.color)
- seguridad (component repeatable: modelo.feature)
- seo (component single: shared.seo)

sucursal:
- servicios (JSON field) - almacena array/object de servicios
- imagen_portada (media)

---

## 8. CAMPOS NO TOCAR POR IMPORTACIÓN

❌ id, createdAt, updatedAt, publishedAt (Strapi managed)
❌ Componentes complejos: galeria, colores, seguridad
❌ Media: imagen_principal, imagen_lateral, imagen_portada (requiere descargar URLs)

---

## 9. ESTRUCTURA DE CARPETAS

```
src/
├── api/
│   ├── modelo/
│   ├── sucursal/
│   ├── noticia/
│   ├── [otras colecciones]/
│   └── import/ ← CREAREMOS AQUÍ
│
├── components/
├── config/
└── extensions/

docs/ ← Documentación (nueva)
```

---

## 10. ARCHIVOS A CREAR

```
src/api/import/
├── routes/import.js
├── controllers/import.js
├── services/
│   ├── import.js
│   ├── parser.js
│   ├── validator.js
│   ├── mapper.js
│   ├── importer.js
│   └── import-cache.js
└── content-types/import-log/schema.json

docs/
├── IMPORTACION_DATOS.md
├── IMPORTACION_ARQUITECTURA.md
└── templates/
    ├── import-modelos-template.csv
    └── import-sucursales-template.csv
```

---

## 11. ARCHIVOS A MODIFICAR

✅ package.json → Agregar librerías
✅ .env → Agregar config opcional

---

## 12. ARCHIVOS QUE NO MODIFICAREMOS

❌ src/api/modelo/, sucursal/, noticia/, etc. (colecciones existentes)
❌ config/, components/ (no tocar sin justificación)

---

## 13. MAPEO PROPUESTO

### modelo (from Reporte Precios):
| Excel | Strapi | Tipo | Transf |
|-------|--------|------|--------|
| Modelo | nombre | string | - |
| Precio_Lista | precio_desde | integer | Parse: $17.490.000 → 17490000 |
| Categoría | categoria | enum | SUV/Sedán/Pick Up/Híbrido |

⚠️ Versiones + precios específicos: REQUIERE REVISIÓN (están como component)

### sucursal (from Reporte pivots):
| Excel | Strapi | Tipo | Transf |
|-------|--------|------|--------|
| Sucursal | nombre | string | - |
| Dirección | direccion | string | - |
| Latitud | lat | decimal | Parse as decimal |
| Longitud | lng | decimal | Parse as decimal |
| Región | region | string | - |
| Comuna | comuna | string | - |
| Teléfono | telefono | string | - |
| Email | email | email | Validate email |
| Horario L-V | horario | string/json | JSON format |
| Flag Venta | servicios.venta | bool | Parse Sí/No → true/false |
| Flag Repuesto | servicios.repuesto | bool | - |
| Flag Servicio | servicios.servicio | bool | - |

---

## 14. LIBRERÍAS A INSTALAR

```bash
npm install --save \
  exceljs@^4.3.0 \
  papaparse@^5.4.1 \
  zod@^3.22.0 \
  uuid@^9.0.0
```

---

## 15. RESUMEN POSITIVO

✅ Proyecto bien estructurado
✅ Campos únicos (slug) ideales para UPSERT
✅ Draft & Publish en su lugar
✅ Validaciones claras
✅ Sin dependencias problemáticas

---

## 16. CONSIDERACIONES

⚠️ **Versiones:** Están como componentes, no colección. Dónde van precios específicos?
⚠️ **Media:** No se pueden descargar URLs en esta fase
⚠️ **Draft & Publish:** Importados como Draft, bulk-publish después si es necesario

---

## AUDITORÍA COMPLETA - LISTO PARA FASE 1

Todos los puntos de auditoría completados. Se procede con implementación.
