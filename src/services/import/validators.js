'use strict';

const { z } = require('zod');

/**
 * Data Validators using Zod
 * Provides schema validation for imported data
 *
 * @returns {Object} Service with validation schemas
 */
module.exports = {
  /**
   * Validator for modelo-version collection
   * Validates vehicle version data for import
   */
  modeloVersionSchema: z.object({
    nombre: z.string()
      .min(1, 'nombre is required')
      .max(255, 'nombre must be max 255 characters')
      .transform(v => v.trim()),

    slug: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim().toLowerCase().replace(/\s+/g, '-') : null),

    codigo: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    modelo: z.string()
      .min(1, 'modelo (reference) is required')
      .transform(v => v.trim()),

    precio_lista: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseInt(String(v).replace(/\D/g, ''), 10);
        return isNaN(num) ? null : num;
      }),

    bono_marca: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .default(0)
      .transform(v => {
        if (!v) return 0;
        const num = parseInt(String(v).replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      }),

    bono_financiamiento: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .default(0)
      .transform(v => {
        if (!v) return 0;
        const num = parseInt(String(v).replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      }),

    precio_final: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseInt(String(v).replace(/\D/g, ''), 10);
        return isNaN(num) ? null : num;
      }),

    moneda: z.enum(['CLP', 'USD', 'UF'])
      .optional()
      .default('CLP'),

    transmision: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    motor: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    combustible: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    potencia: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v).replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
      }),

    torque: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v).replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
      }),

    consumo: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v).replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
      }),

    emision_co2: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v).replace(/[^\d.]/g, ''));
        return isNaN(num) ? null : num;
      }),

    orden: z.union([z.number(), z.string()])
      .optional()
      .default(0)
      .transform(v => {
        if (!v) return 0;
        const num = parseInt(String(v), 10);
        return isNaN(num) ? 0 : num;
      }),

    activo: z.union([z.boolean(), z.string()])
      .optional()
      .default(true)
      .transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          return ['true', 'yes', '1', 'sí', 's'].includes(v.toLowerCase());
        }
        return true;
      }),

    metadata: z.record(z.any())
      .optional()
      .nullable(),
  }).strict(),

  /**
   * Validator for sucursal (dealership) collection
   * Validates dealership/branch data for import
   */
  sucursalSchema: z.object({
    nombre: z.string()
      .min(1, 'nombre is required')
      .max(255, 'nombre must be max 255 characters')
      .transform(v => v.trim()),

    codigo: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    ciudad: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    region: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    telefono: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    email: z.string()
      .email('invalid email format')
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim().toLowerCase() : null),

    direccion: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    latitud: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v));
        return isNaN(num) ? null : num;
      }),

    longitud: z.union([z.number(), z.string()])
      .optional()
      .nullable()
      .transform(v => {
        if (!v) return null;
        const num = parseFloat(String(v));
        return isNaN(num) ? null : num;
      }),

    horario_apertura: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    horario_cierre: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    servicio_venta: z.union([z.boolean(), z.string()])
      .optional()
      .default(true)
      .transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          return ['true', 'yes', '1', 'sí', 's'].includes(v.toLowerCase());
        }
        return true;
      }),

    servicio_servicio: z.union([z.boolean(), z.string()])
      .optional()
      .default(false)
      .transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          return ['true', 'yes', '1', 'sí', 's'].includes(v.toLowerCase());
        }
        return false;
      }),

    servicio_repuestos: z.union([z.boolean(), z.string()])
      .optional()
      .default(false)
      .transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          return ['true', 'yes', '1', 'sí', 's'].includes(v.toLowerCase());
        }
        return false;
      }),

    gerente_nombre: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    gerente_email: z.string()
      .email('invalid email format')
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim().toLowerCase() : null),

    gerente_telefono: z.string()
      .optional()
      .nullable()
      .transform(v => v ? String(v).trim() : null),

    activo: z.union([z.boolean(), z.string()])
      .optional()
      .default(true)
      .transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          return ['true', 'yes', '1', 'sí', 's'].includes(v.toLowerCase());
        }
        return true;
      }),

    metadata: z.record(z.any())
      .optional()
      .nullable(),
  }).strict(),

  /**
   * Validate a single row against a schema
   *
   * @param {Object} row - Data row to validate
   * @param {Object} schema - Zod schema to validate against
   *
   * @returns {Object} { valid: boolean, data: Object|null, errors: Object }
   */
  validateRow(row, schema) {
    try {
      const result = schema.parse(row);
      return {
        valid: true,
        data: result,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });

        return {
          valid: false,
          data: null,
          errors,
        };
      }

      return {
        valid: false,
        data: null,
        errors: { _general: error.message },
      };
    }
  },

  /**
   * Validate multiple rows in batch
   *
   * @param {Array<Object>} rows - Array of data rows
   * @param {Object} schema - Zod schema
   *
   * @returns {Object} { validRows: Array, invalidRows: Array }
   */
  validateRows(rows, schema) {
    const validRows = [];
    const invalidRows = [];

    rows.forEach((row, index) => {
      const result = this.validateRow(row, schema);

      if (result.valid) {
        validRows.push({
          index,
          data: result.data,
        });
      } else {
        invalidRows.push({
          index,
          data: row,
          errors: result.errors,
        });
      }
    });

    return {
      validRows,
      invalidRows,
      totalValid: validRows.length,
      totalInvalid: invalidRows.length,
    };
  },
};
