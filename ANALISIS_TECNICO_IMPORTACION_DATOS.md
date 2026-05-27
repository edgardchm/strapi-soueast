# ANÁLISIS TÉCNICO: IMPORTACIÓN MASIVA DE DATOS EN STRAPI 4.6

**Fecha:** Mayo 27, 2026  
**Estado:** Diagnóstico técnico completo - NO IMPLEMENTADO AÚN  
**Autor:** Senior Backend Developer (Expert Strapi 4.6)  
**Para:** echavez@kaufmann.cl

---

## 📊 RESUMEN EJECUTIVO

### VIABILIDAD: ✅ SÍ - 100% VIABLE

La importación masiva de datos es **completamente factible** en Strapi 4.6. Todos los componentes necesarios están disponibles:

- ✅ Endpoints personalizados  
- ✅ Plugin Upload nativo  
- ✅ Entity Service API  
- ✅ Servicios personalizados  
- ✅ Sistema de logs  

### RECOMENDACIÓN INMEDIATA

1. **Implementar como endpoints personalizados** (no plugin) - más simple y directo
2. **Soportar Excel .xlsx y CSV** como formatos primarios
3. **Validación en 2 fases**: preview + confirmación
4. **Usar Excel** como formato de intercambio principal (accesible para administradores)

---

## 1. ANÁLISIS DE ARCHIVOS ADJUNTOS

### 1.1 Reporte Precios (46).xlsx

**Tipo de dato:** Catálogo de Productos (Vehículos y Versiones)  
**Registros:** 20 filas  
**Origen:** Sistema de cotización de vehículos

#### Columnas identificadas:

| Columna | Tipo | Ejemplo | Observaciones |
|---------|------|---------|---------------|
| Marca | Texto | JETOUR | Identificador de marca (1-n) |
| Modelo | Texto | DASHING, X70, T2 | Modelo de vehículo (1-n) |
| Version | Texto | 6MT 1.5L Turbo | Versión/trim (1-1) |
| Precio_Lista | Moneda | $17.490.000 | Necesita parseo (sin puntos) |
| Bono_Marca | Moneda | $3.000.000 | Descuento variable por marca |
| Bono_Financiamiento | Moneda | $1.000.000 | Descuento variable |
| Precio_Final | Moneda | $13.490.000 | Calculado (Lista - Bonos) |

#### Mapeo a Strapi (PROPUESTO):

```
Collection: api::vehicle-version.vehicle-version
- slug: (único, from Marca+Modelo+Version)
- nombre: (Modelo + Version)
- marca: relation → api::vehicle-brand.vehicle-brand
- modelo: relation → api::vehicle-model.vehicle-model
- version: (texto)
- precioLista: number
- bonoMarca: number
- bonoFinanciamiento: number
- precioFinal: number (formula o calculado)
- estado: "publicado"
```

#### Campos nuevos requeridos en Strapi:

- `precioLista` (Integer, required)
- `bonoMarca` (Integer)
- `bonoFinanciamiento` (Integer)
- `precioFinal` (Integer, read-only o formula)

---

### 1.2 Reporte pivots - 2026-05-20T165615.388.xlsx

**Tipo de dato:** Directorio de Concesionarios / Puntos de Venta  
**Registros:** 74 sucursales  
**Origen:** Sistema de gestión de dealerships

#### Columnas identificadas (26 totales):

**Identificación:**
- Sucursal (nombre del punto)
- Código CRM (identificador único interno)
- Concesionario (nombre del grupo)

**Ubicación:**
- Dirección (texto completo)
- Latitud (número con decimales)
- Longitud (número con decimales)
- Zona (ZONA NORTE, ZONA CENTRO, etc.)
- Región (ANTOFAGASTA, METROPOLITANA, etc.)
- Comuna (ANTOFAGASTA, CALAMA, LAMPA, etc.)

**Contacto:**
- Contacto (nombre del encargado)
- Cargo (Jefe de ventas, etc.)
- Correo contacto (formato email)
- Teléfono (principal)

**Flags/Servicios:**
- Flag_Venta (true/false)
- Flag_Repuesto (true/false)
- Flag_Servicio_Tecnico (true/false)

**Teléfonos Específicos:**
- Telefono_Ventas
- Telefono_Repuestos
- Telefono_Servicio_Tecnico

**Comunicación:**
- Para (correo a enviar información)
- Con_copia (cc para comunicaciones)
- Con_copia_oculta (bcc para comunicaciones)

**Operación:**
- Horario_L-V (horario lunes-viernes, ej: "8:45-18:00")
- Horario_S (horario sábado)
- Horario_D (horario domingo)

**Catálogo:**
- Categorias_de_Vehiculos (multi-select, ej: "Camioneta, SUV, Comerciales, Escolares")

#### Mapeo a Strapi (PROPUESTO):

```
Collection: api::dealership.dealership
- slug: (único, from Sucursal name)
- nombre: (Sucursal)
- codigoCRM: (string, unique)
- grupo: (Concesionario name)

Location (JSON o sub-document):
- direccion: string
- latitud: decimal
- longitud: decimal
- zona: string (enum)
- region: string (relation a Regions)
- comuna: string (relation a Communes)

Contacto (JSON o sub-document):
- nombre: string
- cargo: string
- email: string
- telefono: string

Servicios (JSON o boolean fields):
- flagVenta: boolean
- flagRepuesto: boolean
- flagServicioTecnico: boolean

Teléfonos (JSON o individual fields):
- telefonoVentas: string
- telefonoRepuestos: string
- telefonoServicio: string

Comunicación (JSON):
- emailPara: string
- emailCopia: string
- emailCopiaOculta: string

Operación (JSON):
- horarioLV: string
- horarioSabado: string
- horarioDomingo: string

Relaciones:
- categoriasVehiculos: relation → api::vehicle-category.vehicle-category (many)
```

#### Campos nuevos requeridos en Strapi:

- Crear o adaptar Collection `dealership` si no existe
- Campos JSON para location, contacto, horarios, comunicacion
- O crear sub-documents/single types para cada sección

---

## 2. VIABILIDAD TÉCNICA EN STRAPI 4.6

### 2.1 ¿Se pueden crear endpoints personalizados?

**✅ SÍ - Sin limitaciones**

Strapi 4.6 permite crear endpoints personalizados en `/api/src/api/[collection]/routes/` o `/api/src/routes/`:

```javascript
// /api/src/routes/import.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/import/preview',
      handler: 'controllers.import.preview',
      config: { auth: false, policies: ['isAdmin'] }
    },
    {
      method: 'POST',
      path: '/import/confirm',
      handler: 'controllers.import.confirm',
      config: { auth: false, policies: ['isAdmin'] }
    }
  ]
};
```

**Endpoints recomendados:**

- `POST /api/import/preview` - Validar archivo y retornar preview
- `POST /api/import/confirm` - Confirmar e importar datos
- `GET /api/import/status/:importId` - Obtener estado de importación
- `GET /api/import/logs/:importId` - Obtener logs detallados

---

### 2.2 ¿Se puede usar el plugin Upload?

**✅ SÍ - Está integrado en Strapi 4.6**

El plugin Upload ya viene incluido. Podemos:

1. Recibir archivos en el endpoint personalizado
2. Procesarlos en memoria (sin guardar en storage)
3. O guardarlos temporalmente si es necesario

**Configuración en strapi.config.js:**

```javascript
upload: {
  config: {
    maxFileSize: 5000000, // 5MB (ajustable)
  }
}
```

---

### 2.3 ¿Se pueden crear servicios personalizados?

**✅ SÍ - Sin limitaciones**

Strapi 4.6 permite servicios reutilizables:

```javascript
// /api/src/services/import-service.js
module.exports = () => ({
  async parseFile(buffer, fileType) { /* ... */ },
  async validateData(rows, config) { /* ... */ },
  async mapData(rows, mapping) { /* ... */ },
  async importRows(rows, options) { /* ... */ }
});
```

---

### 2.4 ¿Se puede insertar/actualizar data en Collections?

**✅ SÍ - Via Entity Service API o Query Engine**

Opción 1: Entity Service (recomendado en Strapi 4.6):

```javascript
// Crear
await strapi.entityService.create(
  'api::vehicle-version.vehicle-version',
  { data: { nombre: '...', precioLista: 17490000 } }
);

// Actualizar
await strapi.entityService.update(
  'api::vehicle-version.vehicle-version',
  id,
  { data: { precioLista: 19990000 } }
);

// Buscar
const existing = await strapi.entityService.findMany(
  'api::vehicle-version.vehicle-version',
  { filters: { slug: 'jetour-dashing-6mt' } }
);
```

Opción 2: Query Engine (legacy, pero funciona):

```javascript
const entry = await strapi.query('api::vehicle-version.vehicle-version').create({
  nombre: '...',
  precioLista: 17490000
});
```

**Manejo de transacciones:**

Strapi 4.6 no tiene transacciones nativas, pero podemos usar el driver de BD:

```javascript
const { createConnection } = require('knex');
const connection = strapi.config.get('database.connection');
const trx = await strapi.db.connection.transaction();

try {
  // Operaciones...
  await trx.commit();
} catch (err) {
  await trx.rollback();
  throw err;
}
```

---

### 2.5 Limitaciones específicas de Strapi 4.6

| Limitación | Impacto | Solución |
|------------|--------|----------|
| No hay webhooks de importación | Bajo | Usar eventos internos o logs |
| No hay rollback automático | Medio | Implementar rollback manual + logs |
| Límite de tamaño de request | Bajo | Aumentar en strapi.config.js |
| No hay deduplicación nativa | Medio | Implementar lógica en servicio |
| Draft & Publish afecta visibilidad | Medio | Definir estrategia (draft o publicado) |

**Límite de tamaño de archivo:**

```javascript
// strapi.config.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
    }
  }
});
```

---

## 3. TIPOS DE DOCUMENTOS SOPORTABLES

### Recomendación por formato

| Formato | Ventajas | Desventajas | Recomendación |
|---------|----------|-------------|---------------|
| **Excel .xlsx** | Múltiples hojas, validación de tipos, muy usado, fácil de compartir | Requiere librería pesada | ⭐⭐⭐ PRIMARY |
| **CSV** | Ligero, compatible universal, parseo rápido | Una sola hoja, menos validación, problemas con delimitadores | ⭐⭐ SECONDARY |
| **JSON** | Muy flexible, mapeo directo, estándar API | Complejo para usuarios no técnicos | ⭐ OPCIONAL |
| **Google Sheets** | Colaborativo, cloud-based | Requiere API key, complejidad, costo | ❌ NO RECOMENDADO |

### Recomendación FINAL

**Implementar soporte para:**

1. **Excel .xlsx (PRIMARY)**
   - Librería: `exceljs` (mejor que `xlsx`)
   - Permite múltiples hojas (una por colección)
   - Usuarios no-técnicos entienden Excel
   - Fácil de compartir y editar

2. **CSV (SECONDARY)**
   - Librería: `papaparse` (más robust que csv-parser)
   - Fallback si Excel no funciona
   - Útil para integraciones automatizadas

3. **JSON (OPCIONAL)**
   - Para APIs/automatización
   - Poder exportar/reimportar

---

## 4. ARQUITECTURA RECOMENDADA

### 4.1 Estructura de directorios

```
src/
├── api/
│   ├── import/                          # Nueva colección "lógica"
│   │   ├── routes/
│   │   │   └── import.js               # Rutas del importador
│   │   └── controllers/
│   │       └── import.js               # Controladores
│   │
│   └── [otras colecciones existentes]/
│
├── services/
│   ├── import/
│   │   ├── import.service.js          # Orquestador principal
│   │   ├── file-parser.js             # Parseo de archivos
│   │   ├── data-validator.js          # Validación de datos
│   │   ├── data-mapper.js             # Mapeo columnas → campos
│   │   └── data-importer.js           # Inserción en BD
│   │
│   └── [servicios existentes]/
│
├── utils/
│   ├── import-config.js               # Configuración de mapeos
│   ├── import-logger.js               # Sistema de logs
│   └── import-errors.js               # Definición de errores
│
├── middleware/
│   └── import-auth.js                 # Validación de admin
│
└── [resto de estructura]/
```

### 4.2 Flujo de procesamiento

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario sube archivo                                 │
│    POST /api/import/preview                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Validación de estructura                             │
│    - Tipo de archivo                                    │
│    - Tamaño máximo                                      │
│    - Columnas obligatorias                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Parseo y mapeo                                       │
│    - Convertir Excel/CSV a JSON                         │
│    - Mapear columnas a campos Strapi                    │
│    - Normalizar datos (trim, lowercase, etc)           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Validación de datos                                  │
│    - Tipos de datos (string, number, date)             │
│    - Campos obligatorios                                │
│    - Campos únicos (no duplicados)                      │
│    - Relaciones existentes                              │
│    - Datos malformados                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Retornar PREVIEW                                     │
│    {                                                    │
│      totalRows: 20,                                     │
│      validRows: 18,                                     │
│      invalidRows: 2,                                    │
│      preview: [...datos válidos...]                    │
│      errors: [{row: 5, field: 'precio', msg: '...'}, ] │
│      importId: 'uuid-xxx'  # para siguiente paso       │
│    }                                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Usuario revisa y CONFIRMA                            │
│    POST /api/import/confirm/{importId}                 │
│    { confirmed: true, mode: 'create|update|upsert' }   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. IMPORTACIÓN (transacción)                            │
│    - Iterar sobre filas válidas                         │
│    - Validar relaciones finales                         │
│    - Crear o actualizar registros                       │
│    - Capturar errores por fila                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. REPORTE FINAL                                        │
│    {                                                    │
│      status: 'completed|partial|failed',               │
│      createdCount: 18,                                  │
│      updatedCount: 2,                                   │
│      skippedCount: 0,                                   │
│      errorCount: 0,                                     │
│      details: {...},                                    │
│      downloadUrl: '/reports/import-xxx.json'            │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Fases detalladas

#### FASE 1: PARSE
- Recibir archivo (multipart/form-data)
- Validar tipo (.xlsx, .csv)
- Validar tamaño (max 50MB)
- Parsear a JSON
- Guardar en cache con importId

#### FASE 2: VALIDATE
- Validar columnas obligatorias
- Validar tipos de datos
- Validar unicidad (si aplica)
- Validar relaciones (si existen las IDs/referencias)
- Normalizar datos (trim, lowercase, parseNumbers)

#### FASE 3: MAP & PREVIEW
- Mapear columnas a campos Strapi (según config)
- Generar preview (primeras 10 filas + estadísticas)
- Retornar filas válidas e inválidas
- User revisa y decide si continuar

#### FASE 4: CONFIRM
- Usuario confirma importación
- Definir modo: CREATE, UPDATE, UPSERT
- Pasar a transacción

#### FASE 5: IMPORT
- Iterar sobre filas válidas
- Validar relaciones en tiempo real
- Crear registros nuevos
- Actualizar registros existentes (si UPSERT)
- Capturar errores por fila (no detener, log y continuar)

#### FASE 6: REPORT
- Contar: creados, actualizados, omitidos
- Generar reporte JSON con logs
- Retornar URL de descarga (opcional)

---

## 5. CASOS DE USO POSIBLES

### ✅ VIABLE para importar:

| Colección | Datos | Ejemplo |
|-----------|-------|---------|
| vehicle-versions | Precios, bonos, especificaciones | Reporte Precios (46).xlsx |
| dealerships | Puntos de venta, contactos, horarios | Reporte pivots |
| vehicle-models | Catálogo de modelos | Excel con nombre, marca, imagen |
| vehicle-brands | Marcas de vehículos | Excel simple con nombre, logo |
| vehicle-categories | Categorías (SUV, Comercial, etc) | CSV con nombre, descripción |
| news | Artículos/noticias | Excel con título, contenido, autor |
| legal-documents | Textos legales (términos, privacidad) | Excel multisheet |
| configuration | Datos de configuración global | JSON o Excel |
| colors | Colores disponibles | CSV con nombre, código hex |
| services | Servicios técnicos | Excel con nombre, precio, duración |

### ⚠️ REQUIERE CUIDADO:

| Colección | Riesgo | Solución |
|-----------|--------|----------|
| Images/Media | URLs roto, descarga falla | Validar URLs y descargar previamente |
| Users | Seguridad, passwords | NO permitir importación de usuarios |
| Audit logs | Integridad histórica | NO permitir importación, solo API interna |
| Sensitive data | Privacidad | Validación y cifrado en tránsito |

---

## 6. RIESGOS TÉCNICOS Y MITIGACIONES

### RIESGO #1: Duplicación de registros

**Problema:** Si se importa el mismo archivo 2 veces, se crean duplicados.

**Mitigación:**
- Implementar modo **UPSERT** por defecto
- Usar campo único (slug, codigo, SKU, email)
- Mostrar advertencia en preview si hay duplicados

---

### RIESGO #2: Inconsistencia de relaciones

**Problema:** Importar una versión cuyo modelo no existe.

**Mitigación:**
- Validar relaciones en FASE 2
- Retornar error específico: "Modelo 'JETOUR' no existe"
- Mostrar en preview qué relaciones faltan

---

### RIESGO #3: Nombres mal escritos en Excel

**Problema:** "ANTOFAGASTA" vs "Antofagasta" (case-sensitive).

**Mitigación:**
- Normalizar: `.toLowerCase().trim()`
- Usar búsqueda case-insensitive en validación
- Mostrar sugerencias en preview

---

### RIESGO #4: URLs/imágenes no encontradas

**Problema:** Link a imagen roto o descarga falla.

**Mitigación:**
- Validar URLs (HEAD request) antes de importar
- Descargar/almacenar imagen localmente
- Si falla: Log error, continuar sin imagen (no detener importación)

---

### RIESGO #5: Sobrescritura accidental de contenido publicado

**Problema:** UPDATE accidental sobre registros en producción.

**Mitigación:**
- Modo **PREVIEW obligatorio** antes de confirmar
- Mostrar exactamente qué se va a actualizar
- Confirmación explícita en UI
- Log de auditoría de quién importó qué

---

### RIESGO #6: Problemas con Draft & Publish

**Problema:** Importar como draft pero usuario esperaba publicado (o vice versa).

**Mitigación:**
- Definir en config: siempre crear como DRAFT o PUBLICADO
- Mostrar en preview el estado que tendrán
- Permitir bulk-publish después de importación si es necesario

---

### RIESGO #7: Campos requeridos faltantes

**Problema:** Importar sin nombre, email, etc (campos marked as "required").

**Mitigación:**
- Validar campos required en FASE 2
- Mostrar en preview: "Fila 5: falta 'nombre'"
- No permitir importar filas incompletas (o usar valores default)

---

### RIESGO #8: Performance con archivos grandes

**Problema:** Excel con 10.000 filas → timeout/crash.

**Mitigación:**
- Límite de filas por importación (ej: max 5.000)
- Procesamiento en batch (1000 filas por iteración)
- Mostrar progress bar en preview
- Usar **job queue** para importaciones muy grandes (Bull, Bee)

---

### RIESGO #9: Validaciones insuficientes

**Problema:** Datos malformados que llegan a la BD (ej: precio negativo, email inválido).

**Mitigación:**
- Implementar validación **schema-based** (Zod, Yup)
- Validar antes de preview
- Rechazar datos malformados en FASE 2

---

### RIESGO #10: Seguridad del endpoint

**Problema:** Cualquiera puede subir archivos y romper datos.

**Mitigación:**
- **Autenticación requerida** (JWT, session)
- **Autorización**: solo ADMIN puede importar
- **Rate limiting** (máximo 1 import/min por usuario)
- **Validación de tamaño** (max 50MB)
- **Sanitización** de datos (no eval, no scripts)

---

## 7. SEGURIDAD Y PERMISOS

### 7.1 Autenticación

```javascript
// /api/src/middleware/import-auth.js
module.exports = (options = {}) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.throw(401, 'Unauthorized');
    }

    if (!user.role || !user.role.name.includes('Admin')) {
      return ctx.throw(403, 'Forbidden: Only admins can import');
    }

    await next();
  };
};
```

**Aplicar en routes:**

```javascript
{
  method: 'POST',
  path: '/import/preview',
  handler: 'controllers.import.preview',
  config: { 
    auth: true,  // Requiere JWT válido
    policies: ['import-auth']  // Requiere admin
  }
}
```

### 7.2 Validación de archivo

```javascript
// Validar tipo
const ALLOWED_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new Error('Only .xlsx and .csv files allowed');
}

// Validar tamaño
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

if (file.size > MAX_SIZE) {
  throw new Error(`File too large. Max: 50MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
}
```

### 7.3 Sanitización de datos

```javascript
// Sanitizar strings
const sanitize = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')  // Remove quotes
    .replace(/<script[^>]*>.*?<\/script>/gi, '');  // Remove scripts
};

// Validar email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validar número
const parseNumber = (value) => {
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
};
```

### 7.4 Rate Limiting

```javascript
// Middleware para limitar importaciones
const rateLimit = new Map();

module.exports = (options = {}) => {
  return async (ctx, next) => {
    const userId = ctx.state.user.id;
    const now = Date.now();
    const limit = rateLimit.get(userId) || [];

    // Permitir 1 importación cada 60 segundos
    const recent = limit.filter(time => now - time < 60000);

    if (recent.length >= 1) {
      return ctx.throw(429, 'Too many imports. Wait 60 seconds.');
    }

    recent.push(now);
    rateLimit.set(userId, recent);

    await next();
  };
};
```

### 7.5 Logs de auditoría

```javascript
// Registrar cada importación
const logImport = async (importId, userId, collection, status, summary) => {
  await strapi.entityService.create('api::import-log.import-log', {
    data: {
      importId,
      userId,
      collection,
      status,  // 'preview', 'confirmed', 'completed', 'failed'
      summary,  // { created: 18, updated: 2, failed: 0 }
      timestamp: new Date(),
      ipAddress: ctx.request.ip,
      userAgent: ctx.request.header['user-agent']
    }
  });
};
```

---

## 8. FLUJO RECOMENDADO PARA EL USUARIO ADMINISTRADOR

### Paso 1: Seleccionar archivo
```
[Admin Panel] → [Importar datos] → [Seleccionar archivo]
  ↓
  Usuario selecciona Excel o CSV
```

### Paso 2: Cargar y validar
```
  ↓
  POST /api/import/preview { file }
  ↓
  Sistema parsea y valida
  ↓
  Retorna: {
    importId: 'xxx',
    totalRows: 20,
    validRows: 18,
    invalidRows: 2,
    preview: [ ... ],
    errors: [ ... ]
  }
```

### Paso 3: Revisar preview
```
[UI] Muestra tabla con:
  - Primeras 10 filas válidas
  - Filas con error (marcadas en rojo)
  - Estadísticas (18 válidas, 2 con error)
  - Botón "Importar" (deshabilitado si hay errores)
  - Botón "Cancelar"
```

### Paso 4: Confirmar
```
  Usuario hace clic en "Importar"
  ↓
  POST /api/import/confirm/{importId}
  { mode: 'create|update|upsert' }
```

### Paso 5: Procesar importación
```
  Sistema:
    1. Inicia transacción
    2. Itera sobre filas válidas
    3. Crea o actualiza registros
    4. Captura errores por fila
    5. Genera reporte
    6. Retorna resultado
```

### Paso 6: Mostrar reporte
```
[UI] Muestra:
  ✓ Creados: 18
  ✓ Actualizados: 0
  ⚠ Omitidos: 0
  ✗ Errores: 2 (pero se importaron los 18 válidos)
  
  [Descargar reporte JSON]
  [Descargar reporte CSV]
  [Aceptar]
```

---

## 9. LIBRERÍAS RECOMENDADAS

### Parseo de archivos

#### Excel (.xlsx)
**Opción 1: exceljs** (RECOMENDADO)

```bash
npm install exceljs
```

Ventajas:
- Soporta múltiples hojas
- Manejo de estilos
- Mejor validación de tipos
- Comunidad activa

```javascript
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(buffer);
const worksheet = workbook.getWorksheet(1);
const rows = [];
worksheet.eachRow((row) => {
  rows.push(row.values);
});
```

**Opción 2: xlsx**

```bash
npm install xlsx
```

Ventajas:
- Más ligero
- Parseo muy rápido
- Comunidad grande

```javascript
const XLSX = require('xlsx');
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
```

**Recomendación:** Usar **exceljs** para mejor control, o **xlsx** si necesitas rapidez.

#### CSV
**papaparse** (RECOMENDADO)

```bash
npm install papaparse
```

```javascript
const Papa = require('papaparse');
const result = Papa.parse(csvString, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: false
});
```

Ventajas:
- Manejo robusto de delimitadores
- Detección automática de cabeceras
- Manejo de comillas y escapes
- Comunidad grande

### Validación de datos

**Zod** (RECOMENDADO - más moderno)

```bash
npm install zod
```

```javascript
const z = require('zod');

const VehicleVersionSchema = z.object({
  marca: z.string().min(1, 'Marca requerida'),
  modelo: z.string().min(1, 'Modelo requerido'),
  version: z.string().min(1, 'Versión requerida'),
  precioLista: z.number().min(0, 'Precio debe ser positivo'),
  bonoMarca: z.number().default(0)
});

// Validar fila
try {
  const validated = VehicleVersionSchema.parse(row);
} catch (err) {
  console.error(err.errors);  // Detalles del error
}
```

**Yup** (Alternativa popular)

```bash
npm install yup
```

```javascript
const yup = require('yup');

const schema = yup.object().shape({
  marca: yup.string().required('Marca requerida'),
  precioLista: yup.number().min(0).required()
});

await schema.validate(row);
```

### Sistema de logs

**Winston** (RECOMENDADO)

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'import.log' })
  ]
});

logger.info('Import started', { importId: 'xxx', collection: 'vehicle-versions' });
logger.error('Row failed', { row: 5, field: 'precio', message: 'Invalid' });
```

**Pino** (Alternativa más rápida)

```bash
npm install pino
```

```javascript
const pino = require('pino');
const logger = pino();

logger.info({ importId: 'xxx' }, 'Import completed');
```

### Procesamiento en background (para archivos grandes)

**Bull** (Job Queue - RECOMENDADO)

```bash
npm install bull redis
```

```javascript
const Queue = require('bull');
const importQueue = new Queue('imports', process.env.REDIS_URL);

// Encolar importación
await importQueue.add({
  importId: 'xxx',
  collection: 'vehicle-versions'
}, { attempts: 3 });

// Procesar
importQueue.process(async (job) => {
  await importService.import(job.data);
  job.progress(100);
});
```

**Bee Queue** (Alternativa, más simple)

```bash
npm install bee-queue
```

### Utilidades

**Lodash** (para transformaciones)

```bash
npm install lodash
```

```javascript
const _ = require('lodash');

// Normalizar
const data = _.map(rows, row => ({
  ...row,
  nombre: _.trim(row.nombre).toLowerCase(),
  email: _.toLower(_.trim(row.email))
}));

// Agrupar
const grouped = _.groupBy(rows, 'collection');

// Deduplicar
const unique = _.uniqBy(rows, 'slug');
```

### Stack final recomendado

```json
{
  "dependencies": {
    "exceljs": "^4.3.0",
    "papaparse": "^5.4.1",
    "zod": "^3.22.0",
    "winston": "^3.10.0",
    "lodash": "^4.17.21",
    "bull": "^4.11.0",
    "redis": "^4.6.0"
  },
  "devDependencies": {
    "jest": "^29.5.0"
  }
}
```

---

## 10. ESTRATEGIA DE ACTUALIZACIÓN DE REGISTROS

### Opción 1: CREATE ONLY (Sin actualizar existentes)

**Mejor para:** Primeras importaciones, nuevos datos puros

```
Si existe (por slug/código) → Error o skip
Si no existe → Crear
```

**Ventajas:**
- Simple
- Evita sobrescrituras accidentales
- Ideal para primeras cargas

**Desventajas:**
- No permite actualizaciones
- Duplicados si se importa 2 veces

---

### Opción 2: UPDATE ONLY (Actualizar existentes, no crear)

**Mejor para:** Sincronización de cambios en datos existentes

```
Si existe (por slug/código) → Actualizar
Si no existe → Skip/Error
```

**Ventajas:**
- Controla cambios sin crear nuevos
- Seguro para actualizaciones planificadas

**Desventajas:**
- No crea registros nuevos
- Menos flexible

---

### Opción 3: UPSERT (Crear si no existe, actualizar si existe) ⭐ RECOMENDADO

**Mejor para:** Importaciones regulares, sincronización bidireccional

```
Si existe (por slug/código/identificador único) → Actualizar
Si no existe → Crear
```

**Ventajas:**
- Flexible
- Idempotente (importar 2 veces = resultado igual)
- Estándar en integraciones

**Desventajas:**
- Puede actualizar accidentalmente si hay duplicados

**Implementación:**

```javascript
const upsert = async (collection, data, uniqueField) => {
  const existing = await strapi.entityService.findMany(
    collection,
    { filters: { [uniqueField]: data[uniqueField] } }
  );

  if (existing.length > 0) {
    // UPDATE
    return await strapi.entityService.update(
      collection,
      existing[0].id,
      { data }
    );
  } else {
    // CREATE
    return await strapi.entityService.create(
      collection,
      { data }
    );
  }
};
```

---

### Opción 4: PREVIEW ONLY (Sin guardar)

**Mejor para:** Testing, validación sin riesgos

```
Parse → Validate → Show Preview (pero NO guardar)
Usuario puede ver qué pasaría sin comprometerse
```

**Ventajas:**
- Cero riesgo
- Ideal para testing

**Desventajas:**
- No persiste datos
- Requiere 2 pasos (preview + confirm)

---

### Recomendación FINAL

**Implementar modo UPSERT por defecto**, pero permitir al usuario elegir en el UI:

```
Opciones en formulario:
☑ Crear solo registros nuevos (CREATE)
☐ Actualizar registros existentes (UPSERT)
☐ Vista previa sin guardar (PREVIEW)
```

**Campo único para UPSERT:**

Para cada colección, definir campo único:

```javascript
// vehicle-versions
uniqueField: 'slug'  // 'jetour-dashing-6mt'

// dealership
uniqueField: 'codigoCRM'  // código interno

// news
uniqueField: 'slug'  // generado de título
```

---

## 11. ENTREGABLES REQUERIDOS

### A) Diagnóstico técnico de viabilidad ✅

Completado en este documento.

---

### B) Recomendación del mejor enfoque ✅

**Enfoque recomendado:**

1. **Endpoints personalizados** (no plugin)
2. **Excel .xlsx + CSV**
3. **UPSERT mode** (predeterminado)
4. **Validación en 2 fases** (preview + confirm)
5. **Modo preview obligatorio** antes de importar
6. **Admin-only access** con rate limiting
7. **Job queue** para archivos grandes (>1000 filas)

---

### C) Arquitectura propuesta ✅

Completada en sección 4.

---

### D) Modelo de flujo de importación ✅

Completado en sección 8.

---

### E) Riesgos y mitigaciones ✅

Completado en sección 6.

---

### F) Lista de archivos a crear/modificar

```
CREAR NUEVOS:
├── src/api/import/
│   ├── routes/import.js
│   └── controllers/import.js
│
├── src/services/import/
│   ├── import.service.js
│   ├── file-parser.js
│   ├── data-validator.js
│   ├── data-mapper.js
│   └── data-importer.js
│
├── src/utils/
│   ├── import-config.js
│   ├── import-logger.js
│   ├── import-errors.js
│   └── import-auth.js
│
├── src/middleware/
│   └── import-auth.js
│
├── tests/
│   ├── import.test.js
│   ├── file-parser.test.js
│   └── data-validator.test.js
│
├── docs/
│   ├── IMPORT_GUIDE.md
│   ├── IMPORT_API.md
│   └── IMPORT_EXAMPLES.md
│
└── package.json (ACTUALIZAR con librerías)

MODIFICAR EXISTENTES:
├── strapi.config.js (aumentar upload limit)
├── database.config.js (si es necesario para transacciones)
└── .env.example (agregar REDIS_URL si se usa Bull)

CREAR COLLECTIONS (si no existen):
├── api::import-log.import-log
│   (para auditoría de importaciones)
└── Cualquier collection faltante según análisis
```

---

### G) Ejemplo de estructura esperada del Excel/CSV

#### Reporte Precios (para vehicle-versions)

```
| Marca  | Modelo    | Version              | Precio_Lista | Bono_Marca | Bono_Financiamiento |
|--------|-----------|----------------------|--------------|------------|---------------------|
| JETOUR | DASHING   | 6MT 1.5L Turbo LUX   | 17490000     | 3000000    | 1000000             |
| JETOUR | DASHING   | 6DCT 1.5T LUX        | 19490000     | 2500000    | 1000000             |
| JETOUR | X70       | 1.5L 6MT TURBO FL    | 17490000     | 4000000    | 1000000             |
| JETOUR | T2        | 2.0T GDI AWD 7DCT    | 29990000     | 2500000    | 1500000             |
```

**Nota:**
- Precios SIN puntos (17490000 no 17.490.000)
- Marcas y modelos deben existir en Strapi
- Slug se genera automáticamente

#### Reporte Concesionarios (para dealership)

```
| Sucursal                    | Dirección                      | Latitud   | Longitud  | Zona        | Region        | Telefonos Ventas | Flag_Venta | Categorias_de_Vehiculos              |
|-----------------------------|--------------------------------|-----------|-----------|-------------|---------------|------------------|------------|--------------------------------------|
| ANDES RETAIL - ANTOFAGASTA  | Av. Iquique 6231, Antofagasta  | -23.612819| -70.39021 | ZONA NORTE  | ANTOFAGASTA   | +56 9 41321635   | true       | Camioneta, Comerciales, Eléctricos  |
| ANDES RETAIL - CALAMA       | Camino a Chiu Chiu 402, Calama | -22.441814| -68.897042| ZONA NORTE  | ANTOFAGASTA   | +56 9 41321635   | true       | Camioneta, SUV, Comerciales         |
```

---

### H) Ejemplo de endpoint personalizado

```javascript
// src/api/import/routes/import.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/import/preview',
      handler: 'controllers.import.preview',
      config: { auth: true, policies: ['api::import.import-auth'] }
    },
    {
      method: 'POST',
      path: '/import/confirm/:importId',
      handler: 'controllers.import.confirm',
      config: { auth: true, policies: ['api::import.import-auth'] }
    },
    {
      method: 'GET',
      path: '/import/status/:importId',
      handler: 'controllers.import.status',
      config: { auth: true }
    },
    {
      method: 'GET',
      path: '/import/logs/:importId',
      handler: 'controllers.import.getLogs',
      config: { auth: true, policies: ['api::import.import-auth'] }
    }
  ]
};
```

```javascript
// src/api/import/controllers/import.js

module.exports = {
  async preview(ctx) {
    try {
      const { files, collection } = ctx.request;
      const file = files.file;

      if (!file) {
        return ctx.throw(400, 'No file provided');
      }

      const importService = strapi.service('api::import.import');
      const result = await importService.preview(
        file,
        collection || 'vehicle-versions'
      );

      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  },

  async confirm(ctx) {
    try {
      const { importId } = ctx.params;
      const { mode } = ctx.request.body;

      const importService = strapi.service('api::import.import');
      const result = await importService.confirm(importId, mode, ctx.state.user.id);

      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  },

  async status(ctx) {
    const { importId } = ctx.params;
    const importService = strapi.service('api::import.import');
    const status = await importService.getStatus(importId);
    ctx.body = status;
  },

  async getLogs(ctx) {
    const { importId } = ctx.params;
    const importService = strapi.service('api::import.import');
    const logs = await importService.getLogs(importId);
    ctx.body = logs;
  }
};
```

---

### I) Ejemplo de servicio de importación

```javascript
// src/services/import/import.service.js

module.exports = () => ({
  async preview(file, collection) {
    // 1. Parse file
    const parser = strapi.service('api::import.file-parser');
    const rows = await parser.parse(file);

    // 2. Validate
    const validator = strapi.service('api::import.data-validator');
    const validation = await validator.validate(rows, collection);

    // 3. Map
    const mapper = strapi.service('api::import.data-mapper');
    const mapped = mapper.map(validation.valid, collection);

    // 4. Store in cache
    const importId = crypto.randomUUID();
    await strapi.cache.set(
      `import:${importId}`,
      { rows: mapped, collection, timestamp: Date.now() },
      300  // 5 minutes TTL
    );

    // 5. Return preview
    return {
      importId,
      totalRows: rows.length,
      validRows: validation.valid.length,
      invalidRows: validation.invalid.length,
      preview: mapped.slice(0, 10),
      errors: validation.invalid.map((row, idx) => ({
        rowNumber: row.rowNumber,
        errors: row.errors
      }))
    };
  },

  async confirm(importId, mode, userId) {
    // Get cached data
    const cached = await strapi.cache.get(`import:${importId}`);
    if (!cached) {
      throw new Error('Import expired. Please re-upload file.');
    }

    const { rows, collection } = cached;

    // 3. Run import
    const importer = strapi.service('api::import.data-importer');
    const result = await importer.import(rows, collection, mode, userId);

    // 4. Log import
    await this.logImport({
      importId,
      userId,
      collection,
      status: result.status,
      summary: {
        created: result.created,
        updated: result.updated,
        failed: result.failed
      }
    });

    return result;
  },

  async getStatus(importId) {
    const log = await strapi.entityService.findMany('api::import-log.import-log', {
      filters: { importId }
    });
    return log[0] || null;
  },

  async getLogs(importId) {
    const logs = await strapi.entityService.findMany('api::import-log.import-log', {
      filters: { importId },
      sort: { createdAt: 'desc' }
    });
    return logs;
  },

  async logImport(data) {
    return await strapi.entityService.create('api::import-log.import-log', {
      data
    });
  }
});
```

---

### J) Plan de implementación por etapas

#### FASE 0: PREPARACIÓN (1-2 días)

- [ ] Instalar librerías (exceljs, zod, winston, bull)
- [ ] Crear estructura de directorios
- [ ] Definir configuración de colecciones importables
- [ ] Crear Collection Type `import-log` en Strapi

#### FASE 1: CORE (3-4 días)

- [ ] Implementar file-parser.js (Excel + CSV)
- [ ] Implementar data-validator.js (con Zod)
- [ ] Implementar data-mapper.js (mapeo de columnas)
- [ ] Implementar endpoints `/import/preview` y `/import/confirm`
- [ ] Tests unitarios

#### FASE 2: SEGURIDAD (1 día)

- [ ] Implementar import-auth middleware
- [ ] Rate limiting
- [ ] Validación de tipos de archivo
- [ ] Sanitización de datos

#### FASE 3: UI (2-3 días)

- [ ] Diseñar UI para carga de archivo
- [ ] Tabla de preview
- [ ] Modal de confirmación
- [ ] Reporte final

#### FASE 4: OPTIMIZACIÓN (1-2 días)

- [ ] Job queue para archivos grandes (Bull)
- [ ] Progress tracking
- [ ] Manejo de errores mejorado
- [ ] Tests de integración

#### FASE 5: DOCUMENTACIÓN (1 día)

- [ ] README de uso
- [ ] API documentation
- [ ] Ejemplos de Excel/CSV
- [ ] Troubleshooting guide

**Timeline total:** 2 semanas

---

## 12. CONCLUSIONES Y PRÓXIMOS PASOS

### ✅ VIABILIDAD CONFIRMADA

Strapi 4.6 es **100% viable** para esta funcionalidad. Todos los componentes necesarios están disponibles.

### 📋 RECOMENDACIÓN FINAL

1. **Implementar endpoints personalizados**, no plugin
2. **Soportar Excel y CSV**
3. **Modo UPSERT por defecto**
4. **Validación en 2 fases (preview + confirm)**
5. **Admin-only con auditoría**
6. **Job queue para archivos grandes**

### 🚀 PRÓXIMOS PASOS

1. **Revisar este diagnóstico**
2. **Validar arquitectura propuesta**
3. **Definir timeline de implementación**
4. **Crear colecciones nuevas en Strapi** (si faltan)
5. **Iniciar Fase 0 (preparación)**

### 📝 NOTAS IMPORTANTES

- **NO modificar código todavía** - este es solo diagnóstico
- **NO romper colecciones existentes** - solo añadir campos
- **NO afectar frontend** - cambios serán backend-only
- **Documentar todo** para mantenibilidad futura
- **Considerar versioning** de colecciones si es necesario

---

## 📞 CONTACTO

Para dudas o clarificaciones sobre este análisis, contactar a:

**echavez@kaufmann.cl**

---

**FIN DEL ANÁLISIS TÉCNICO**
