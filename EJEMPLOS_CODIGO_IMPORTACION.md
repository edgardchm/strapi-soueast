# EJEMPLOS DE CÓDIGO: IMPORTACIÓN MASIVA EN STRAPI 4.6

**Nota:** Los siguientes ejemplos están listos para usar como base en la implementación.

---

## 1. SERVICIO DE PARSEO DE ARCHIVOS

### file-parser.js

```javascript
// src/services/import/file-parser.js

const ExcelJS = require('exceljs');
const Papa = require('papaparse');

module.exports = () => ({
  /**
   * Parsear archivo Excel o CSV a JSON
   * @param {Buffer} buffer - Buffer del archivo
   * @param {String} filename - Nombre del archivo
   * @param {Number} sheetIndex - Índice de hoja (para Excel)
   * @returns {Array} Array de objetos con datos
   */
  async parse(buffer, filename, sheetIndex = 0) {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return this._parseExcel(buffer, sheetIndex);
    } else if (filename.endsWith('.csv')) {
      return this._parseCSV(buffer);
    } else {
      throw new Error('Unsupported file format. Use .xlsx or .csv');
    }
  },

  /**
   * Parsear archivo Excel
   */
  async _parseExcel(buffer, sheetIndex) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[sheetIndex];
      if (!worksheet) {
        throw new Error(`Hoja ${sheetIndex} no encontrada`);
      }

      const rows = [];
      const headers = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Primera fila = headers
          headers.push(...row.values.slice(1).map(h => h?.toString().trim()));
        } else {
          // Resto = datos
          const obj = {};
          row.values.slice(1).forEach((value, idx) => {
            const header = headers[idx];
            if (header) {
              obj[header] = value;
            }
          });
          rows.push(obj);
        }
      });

      return rows;
    } catch (err) {
      throw new Error(`Error parsing Excel: ${err.message}`);
    }
  },

  /**
   * Parsear archivo CSV
   */
  async _parseCSV(buffer) {
    try {
      const csvString = buffer.toString('utf8');
      const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h) => h.trim()
      });

      if (result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      }

      return result.data;
    } catch (err) {
      throw new Error(`Error parsing CSV: ${err.message}`);
    }
  },

  /**
   * Obtener nombres de hojas en un Excel
   */
  async getExcelSheets(buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      return workbook.worksheetNames;
    } catch (err) {
      throw new Error(`Error reading sheets: ${err.message}`);
    }
  }
});
```

---

## 2. VALIDACIÓN CON ZOD

### data-validator.js

```javascript
// src/services/import/data-validator.js

const z = require('zod');

// Definir esquemas por colección
const SCHEMAS = {
  'api::vehicle-version.vehicle-version': z.object({
    marca: z.string().min(1, 'Marca requerida').transform(v => v.trim()),
    modelo: z.string().min(1, 'Modelo requerido').transform(v => v.trim()),
    version: z.string().min(1, 'Versión requerida').transform(v => v.trim()),
    precioLista: z.union([
      z.number().positive('Precio debe ser positivo'),
      z.string().regex(/^\d+$/, 'Precio debe ser numérico').transform(Number)
    ]),
    bonoMarca: z.union([
      z.number().min(0).default(0),
      z.string().regex(/^\d*$/, 'Debe ser numérico').transform(Number)
    ]).optional(),
    bonoFinanciamiento: z.union([
      z.number().min(0).default(0),
      z.string().regex(/^\d*$/, 'Debe ser numérico').transform(Number)
    ]).optional()
  }).strict(),

  'api::dealership.dealership': z.object({
    sucursal: z.string().min(1, 'Sucursal requerida'),
    direccion: z.string().min(1, 'Dirección requerida'),
    latitud: z.union([
      z.number(),
      z.string().regex(/^-?\d+\.?\d*$/, 'Latitud debe ser numérica').transform(Number)
    ]),
    longitud: z.union([
      z.number(),
      z.string().regex(/^-?\d+\.?\d*$/, 'Longitud debe ser numérica').transform(Number)
    ]),
    zona: z.string().optional(),
    region: z.string().optional(),
    flagVenta: z.union([
      z.boolean(),
      z.string().toLowerCase().pipe(
        z.enum(['true', 'false']).transform(v => v === 'true')
      )
    ]).default(true),
    telefonoVentas: z.string().regex(/^\+?[\d\s\-()]+$/, 'Teléfono inválido').optional(),
    email: z.string().email('Email inválido').optional()
  }).strict()
};

module.exports = () => ({
  /**
   * Validar todas las filas
   * @param {Array} rows - Filas a validar
   * @param {String} collection - Nombre de la colección
   * @returns {Object} { valid: [], invalid: [] }
   */
  async validate(rows, collection) {
    const schema = SCHEMAS[collection];

    if (!schema) {
      throw new Error(`No schema defined for ${collection}`);
    }

    const valid = [];
    const invalid = [];

    rows.forEach((row, idx) => {
      try {
        const validated = schema.parse(row);
        valid.push({ ...validated, _rowIndex: idx + 2 });
      } catch (err) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));

        invalid.push({
          rowNumber: idx + 2,
          originalData: row,
          errors
        });
      }
    });

    return { valid, invalid };
  },

  /**
   * Validar relación (ej: que exista una marca)
   */
  async validateRelation(collectionName, field, value) {
    try {
      const existing = await strapi.entityService.findMany(
        collectionName,
        { filters: { [field]: value } }
      );
      return existing.length > 0;
    } catch (err) {
      return false;
    }
  },

  /**
   * Validar unicidad de campo
   */
  async validateUniqueness(collection, field, value, excludeId = null) {
    try {
      const filters = { [field]: value };
      if (excludeId) {
        filters.id = { $ne: excludeId };
      }

      const existing = await strapi.entityService.findMany(
        collection,
        { filters }
      );
      return existing.length === 0;
    } catch (err) {
      return false;
    }
  }
});
```

---

## 3. MAPEO DE DATOS

### data-mapper.js

```javascript
// src/services/import/data-mapper.js

const MAPPINGS = {
  'api::vehicle-version.vehicle-version': {
    // Mapeo de columnas importadas a campos Strapi
    columnToField: {
      'marca': 'marca',
      'modelo': 'modelo',
      'version': 'version',
      'precioLista': 'precioLista',
      'bonoMarca': 'bonoMarca',
      'bonoFinanciamiento': 'bonoFinanciamiento'
    },
    // Campo único para UPSERT
    uniqueField: 'slug',
    // Normalizaciones
    normalize: (row) => ({
      ...row,
      slug: `${row.marca}-${row.modelo}-${row.version}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
    })
  },

  'api::dealership.dealership': {
    columnToField: {
      'Sucursal': 'nombre',
      'Dirección': 'direccion',
      'Latitud': 'ubicacion.latitud',
      'Longitud': 'ubicacion.longitud',
      'Zona': 'ubicacion.zona',
      'Región': 'ubicacion.region',
      'Contacto': 'contacto.nombre',
      'Cargo': 'contacto.cargo',
      'Correo contacto': 'contacto.email',
      'Teléfono': 'contacto.telefono',
      'Telefono Ventas': 'telefonos.ventas',
      'Flag Venta': 'servicios.venta',
      'Flag Repuesto': 'servicios.repuesto',
      'Flag Servicio Tecnico': 'servicios.servicio'
    },
    uniqueField: 'codigoCRM',
    normalize: (row) => ({
      ...row,
      slug: row.nombre.toLowerCase().replace(/\s+/g, '-')
    })
  }
};

module.exports = () => ({
  /**
   * Mapear datos de importación a estructura de Strapi
   */
  map(rows, collection) {
    const mapping = MAPPINGS[collection];

    if (!mapping) {
      throw new Error(`No mapping defined for ${collection}`);
    }

    return rows.map(row => {
      const normalized = mapping.normalize(row);
      const mapped = {};

      Object.entries(mapping.columnToField).forEach(([sourceField, targetField]) => {
        const value = normalized[sourceField];

        if (value !== undefined && value !== null) {
          this._setNestedValue(mapped, targetField, value);
        }
      });

      return mapped;
    });
  },

  /**
   * Helper para setear valores anidados (ej: ubicacion.latitud)
   */
  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  },

  /**
   * Obtener configuración de mapeo para una colección
   */
  getMapping(collection) {
    return MAPPINGS[collection] || null;
  }
});
```

---

## 4. SERVICIO DE IMPORTACIÓN

### data-importer.js

```javascript
// src/services/import/data-importer.js

module.exports = () => ({
  /**
   * Importar filas validadas a la BD
   * @param {Array} rows - Filas validadas
   * @param {String} collection - Nombre de colección
   * @param {String} mode - 'create|update|upsert'
   * @param {String} userId - ID del usuario que realiza la importación
   */
  async import(rows, collection, mode = 'upsert', userId) {
    const logger = strapi.service('api::import.import-logger');
    const importId = crypto.randomUUID();
    const timestamp = new Date();

    const result = {
      importId,
      status: 'completed',
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: []
    };

    logger.info(`Import started: ${collection}`, { importId, mode, rowCount: rows.length });

    // Procesar en batches para evitar memory leak
    const BATCH_SIZE = 100;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      for (const row of batch) {
        try {
          const record = await this._processRow(row, collection, mode);

          if (record.action === 'created') {
            result.createdCount++;
          } else if (record.action === 'updated') {
            result.updatedCount++;
          } else if (record.action === 'skipped') {
            result.skippedCount++;
          }

          // Log de auditoría
          await this._logAudit(importId, userId, collection, record, timestamp);
        } catch (err) {
          result.errorCount++;
          result.errors.push({
            row: row._rowIndex,
            error: err.message
          });

          logger.error(`Row failed: ${err.message}`, {
            importId,
            row: row._rowIndex,
            data: row
          });
        }
      }
    }

    result.status = result.errorCount > 0 ? 'partial' : 'completed';

    logger.info(`Import completed`, {
      importId,
      ...result
    });

    return result;
  },

  /**
   * Procesar una fila (create, update o upsert)
   */
  async _processRow(row, collection, mode) {
    const mapping = MAPPINGS[collection]; // Asume acceso a MAPPINGS
    const uniqueField = mapping.uniqueField;
    const uniqueValue = row[uniqueField];

    // Buscar si existe
    let existing = null;

    if (uniqueValue) {
      const found = await strapi.entityService.findMany(collection, {
        filters: { [uniqueField]: uniqueValue }
      });
      existing = found.length > 0 ? found[0] : null;
    }

    // Decidir acción según mode
    if (mode === 'create') {
      if (existing) {
        return { action: 'skipped', reason: 'Already exists' };
      }
      return await this._create(row, collection);
    } else if (mode === 'update') {
      if (!existing) {
        return { action: 'skipped', reason: 'Not found' };
      }
      return await this._update(existing.id, row, collection);
    } else if (mode === 'upsert') {
      if (existing) {
        return await this._update(existing.id, row, collection);
      } else {
        return await this._create(row, collection);
      }
    }

    throw new Error(`Unknown mode: ${mode}`);
  },

  /**
   * Crear nuevo registro
   */
  async _create(data, collection) {
    const record = await strapi.entityService.create(collection, { data });
    return {
      action: 'created',
      id: record.id
    };
  },

  /**
   * Actualizar registro existente
   */
  async _update(id, data, collection) {
    await strapi.entityService.update(collection, id, { data });
    return {
      action: 'updated',
      id
    };
  },

  /**
   * Log de auditoría
   */
  async _logAudit(importId, userId, collection, record, timestamp) {
    try {
      await strapi.entityService.create('api::import-audit.import-audit', {
        data: {
          importId,
          userId,
          collection,
          action: record.action,
          recordId: record.id,
          timestamp
        }
      });
    } catch (err) {
      // Silenciar errores de log, no detener importación
      strapi.log.warn(`Audit log failed: ${err.message}`);
    }
  }
});
```

---

## 5. CONTROLADOR

### controllers/import.js

```javascript
// src/api/import/controllers/import.js

module.exports = {
  /**
   * POST /api/import/preview
   * Carga archivo y retorna preview de datos
   */
  async preview(ctx) {
    try {
      const { files, fields } = ctx.request;
      const file = files?.file;
      const collection = fields?.collection || 'api::vehicle-version.vehicle-version';

      if (!file) {
        return ctx.throw(400, 'File is required');
      }

      // Validar tipo y tamaño
      const ALLOWED_TYPES = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/vnd.ms-excel'
      ];

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return ctx.throw(400, 'Only .xlsx and .csv files allowed');
      }

      const MAX_SIZE = 50 * 1024 * 1024; // 50MB

      if (file.size > MAX_SIZE) {
        return ctx.throw(400, `File too large. Max: 50MB`);
      }

      // Procesar
      const importService = strapi.service('api::import.import');
      const result = await importService.preview(file, collection);

      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  },

  /**
   * POST /api/import/confirm/:importId
   * Confirma importación y procesa datos
   */
  async confirm(ctx) {
    try {
      const { importId } = ctx.params;
      const { mode } = ctx.request.body;

      if (!importId) {
        return ctx.throw(400, 'importId is required');
      }

      if (!['create', 'update', 'upsert'].includes(mode)) {
        return ctx.throw(400, 'mode must be create, update, or upsert');
      }

      const importService = strapi.service('api::import.import');
      const result = await importService.confirm(
        importId,
        mode,
        ctx.state.user.id
      );

      ctx.body = result;
      ctx.status = 200;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  },

  /**
   * GET /api/import/status/:importId
   */
  async status(ctx) {
    try {
      const { importId } = ctx.params;
      const importService = strapi.service('api::import.import');
      const status = await importService.getStatus(importId);

      if (!status) {
        return ctx.throw(404, 'Import not found');
      }

      ctx.body = status;
    } catch (err) {
      ctx.throw(400, err.message);
    }
  }
};
```

---

## 6. RUTAS

### routes/import.js

```javascript
// src/api/import/routes/import.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/import/preview',
      handler: 'api::import.import.preview',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Parse and validate import file',
        tag: 'import'
      }
    },
    {
      method: 'POST',
      path: '/import/confirm/:importId',
      handler: 'api::import.import.confirm',
      config: {
        auth: true,
        policies: ['api::import.import-auth'],
        description: 'Confirm and process import',
        tag: 'import'
      }
    },
    {
      method: 'GET',
      path: '/import/status/:importId',
      handler: 'api::import.import.status',
      config: {
        auth: true,
        description: 'Get import status',
        tag: 'import'
      }
    }
  ]
};
```

---

## 7. MIDDLEWARE DE AUTENTICACIÓN

### middlewares/import-auth.js

```javascript
// src/api/import/middlewares/import-auth.js

module.exports = (options = {}) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.throw(401, 'Unauthorized');
    }

    // Verificar que sea admin
    const isAdmin = user.role && user.role.name === 'Super Admin';

    if (!isAdmin) {
      return ctx.throw(403, 'Only admins can import data');
    }

    // Rate limiting simple
    const key = `import:${user.id}`;
    const count = await strapi.cache.get(key) || 0;

    if (count >= 10) {  // Max 10 imports per hour
      return ctx.throw(429, 'Too many imports. Try again later.');
    }

    await strapi.cache.set(key, count + 1, 3600);  // 1 hour TTL

    await next();
  };
};
```

---

## 8. EJEMPLO DE USO EN FRONTEND

```javascript
// src/utils/importApi.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

export class ImportService {
  /**
   * Cargar archivo y obtener preview
   */
  static async previewImport(file, collection) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', collection);

    const response = await fetch(`${API_URL}/api/import/preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /**
   * Confirmar importación
   */
  static async confirmImport(importId, mode = 'upsert') {
    const response = await fetch(`${API_URL}/api/import/confirm/${importId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mode })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /**
   * Obtener estado de importación
   */
  static async getStatus(importId) {
    const response = await fetch(`${API_URL}/api/import/status/${importId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }
}
```

```jsx
// src/components/ImportDialog.jsx

import React, { useState } from 'react';
import { ImportService } from '../utils/importApi';

export function ImportDialog({ collection, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('upsert');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ImportService.previewImport(file, collection);
      setPreview(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ImportService.confirmImport(preview.importId, mode);
      alert(`Import completed!\nCreated: ${result.createdCount}\nUpdated: ${result.updatedCount}`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog">
      <h2>Importar datos</h2>

      {!preview ? (
        <>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            disabled={loading}
          />
          <button onClick={handlePreview} disabled={loading || !file}>
            {loading ? 'Loading...' : 'Preview'}
          </button>
        </>
      ) : (
        <>
          <div className="summary">
            <p>Total filas: {preview.totalRows}</p>
            <p>✓ Válidas: {preview.validRows}</p>
            <p>✗ Inválidas: {preview.invalidRows}</p>
          </div>

          {preview.invalidRows > 0 && (
            <div className="errors">
              <h3>Errores encontrados:</h3>
              {preview.errors.map((err, idx) => (
                <p key={idx}>
                  Fila {err.rowNumber}: {err.errors.map(e => e.message).join(', ')}
                </p>
              ))}
            </div>
          )}

          <table className="preview">
            <thead>
              <tr>
                {Object.keys(preview.preview[0] || {}).map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.preview.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, cidx) => (
                    <td key={cidx}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="create">Crear solo nuevos</option>
            <option value="upsert">Crear o actualizar</option>
            <option value="update">Solo actualizar existentes</option>
          </select>

          <button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Importing...' : 'Confirmar'}
          </button>
          <button onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 9. TESTS UNITARIOS

### tests/file-parser.test.js

```javascript
// tests/file-parser.test.js

const ExcelJS = require('exceljs');

describe('File Parser', () => {
  let fileParser;

  beforeAll(() => {
    fileParser = strapi.service('api::import.file-parser');
  });

  test('should parse valid Excel file', async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.addRow(['Marca', 'Modelo', 'Precio']);
    worksheet.addRow(['JETOUR', 'DASHING', 17490000]);

    const buffer = await workbook.xlsx.writeBuffer();
    const rows = await fileParser.parse(buffer, 'test.xlsx', 0);

    expect(rows.length).toBe(1);
    expect(rows[0].Marca).toBe('JETOUR');
  });

  test('should parse valid CSV file', async () => {
    const csv = 'Marca,Modelo,Precio\nJETOUR,DASHING,17490000';
    const buffer = Buffer.from(csv);

    const rows = await fileParser.parse(buffer, 'test.csv');

    expect(rows.length).toBe(1);
    expect(rows[0].Marca).toBe('JETOUR');
  });

  test('should throw on unsupported format', async () => {
    const buffer = Buffer.from('test');

    await expect(fileParser.parse(buffer, 'test.txt')).rejects.toThrow();
  });
});
```

---

**FIN DE EJEMPLOS DE CÓDIGO**
