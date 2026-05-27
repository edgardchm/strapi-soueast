'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Data Importer Service
 * Handles actual creation, update, and upsert operations
 *
 * @returns {Object} Service with import methods
 */
module.exports = {
  /**
   * Execute import operation for modelo-version
   *
   * @param {Array<Object>} validRows - Pre-validated and mapped data rows
   * @param {Object} options - Import options
   * @param {string} options.mode - 'create' | 'update' | 'upsert' (default: 'upsert')
   * @param {string} options.uniqueField - Field to check for duplicates (default: 'slug')
   * @param {string} options.importId - Import tracking ID
   * @param {string} options.userId - User ID performing import
   * @param {boolean} options.publish - Publish immediately (default: true)
   *
   * @returns {Promise<Object>} Import result with counts and errors
   */
  async importModeloVersions(validRows, options = {}) {
    const {
      mode = 'upsert',
      uniqueField = 'slug',
      importId = uuidv4(),
      userId = null,
      publish = true,
    } = options;

    const result = {
      importId,
      status: 'processing',
      mode,
      createdCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [],
      processedRows: [],
      startedAt: new Date(),
    };

    try {
      // Get modelo-version service
      const service = strapi.entityService;

      // Cache for modelo lookups
      const modeloCache = new Map();

      // Process each row
      for (let i = 0; i < validRows.length; i++) {
        const rowData = validRows[i];
        const rowResult = {
          index: i,
          originalData: rowData,
          status: null,
          recordId: null,
          error: null,
        };

        try {
          // Resolve modelo reference
          const modeloName = rowData.modelo;
          let modeloId = modeloCache.get(modeloName);

          if (!modeloId) {
            // Find modelo by nombre
            const modelos = await service.findMany('api::modelo.modelo', {
              filters: { nombre: modeloName },
              limit: 1,
            });

            if (modelos.length === 0) {
              throw new Error(`Modelo not found: "${modeloName}"`);
            }

            modeloId = modelos[0].id;
            modeloCache.set(modeloName, modeloId);
          }

          const dataToSave = {
            ...rowData,
            modelo: modeloId, // Replace name with ID
            importacion_fuente: 'bulk-import',
            importacion_id: importId,
          };

          // Check if exists (for update/upsert)
          let existingRecord = null;

          if (mode !== 'create' && uniqueField && rowData[uniqueField]) {
            const filter = { [uniqueField]: rowData[uniqueField] };
            const existing = await service.findMany(
              'api::modelo-version.modelo-version',
              { filters: filter, limit: 1 }
            );

            if (existing.length > 0) {
              existingRecord = existing[0];
            }
          }

          // Process based on mode
          if (existingRecord && (mode === 'update' || mode === 'upsert')) {
            // Update existing record
            const updated = await service.update(
              'api::modelo-version.modelo-version',
              existingRecord.id,
              { data: dataToSave }
            );

            rowResult.status = 'updated';
            rowResult.recordId = existingRecord.id;
            result.updatedCount++;

            // Publish if requested
            if (publish) {
              await strapi
                .plugin('content-manager')
                .service('content-types')
                .syncEntity(
                  'api::modelo-version.modelo-version',
                  existingRecord.id
                );
            }
          } else if (mode !== 'update') {
            // Create new record
            const created = await service.create(
              'api::modelo-version.modelo-version',
              { data: dataToSave }
            );

            rowResult.status = 'created';
            rowResult.recordId = created.id;
            result.createdCount++;

            // Publish if requested
            if (publish) {
              await strapi
                .plugin('content-manager')
                .service('content-types')
                .syncEntity(
                  'api::modelo-version.modelo-version',
                  created.id
                );
            }
          } else {
            // mode === 'update' but no existing record
            throw new Error(
              `Record not found for update (${uniqueField}: ${rowData[uniqueField]})`
            );
          }
        } catch (error) {
          rowResult.status = 'error';
          rowResult.error = error.message;
          result.errorCount++;
          result.errors.push({
            rowIndex: i,
            error: error.message,
            data: rowData,
          });
        }

        result.processedRows.push(rowResult);
      }

      result.status = result.errorCount === 0 ? 'completed' : 'completed_with_errors';
    } catch (error) {
      result.status = 'failed';
      result.errors.push({
        general: error.message,
      });
    }

    result.completedAt = new Date();
    result.duration = result.completedAt - result.startedAt;

    // Log import
    await this._logImport('modelo-version', result, userId);

    return result;
  },

  /**
   * Execute import operation for sucursal (dealership)
   *
   * @param {Array<Object>} validRows - Pre-validated and mapped data rows
   * @param {Object} options - Import options
   *
   * @returns {Promise<Object>} Import result
   */
  async importSucursales(validRows, options = {}) {
    const {
      mode = 'upsert',
      uniqueField = 'codigo',
      importId = uuidv4(),
      userId = null,
      publish = true,
    } = options;

    const result = {
      importId,
      status: 'processing',
      mode,
      createdCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [],
      processedRows: [],
      startedAt: new Date(),
    };

    try {
      const service = strapi.entityService;

      for (let i = 0; i < validRows.length; i++) {
        const rowData = validRows[i];
        const rowResult = {
          index: i,
          originalData: rowData,
          status: null,
          recordId: null,
          error: null,
        };

        try {
          const dataToSave = {
            ...rowData,
            importacion_fuente: 'bulk-import',
            importacion_id: importId,
          };

          // Check if exists
          let existingRecord = null;

          if (mode !== 'create' && uniqueField && rowData[uniqueField]) {
            const filter = { [uniqueField]: rowData[uniqueField] };
            const existing = await service.findMany(
              'api::sucursal.sucursal',
              { filters: filter, limit: 1 }
            );

            if (existing.length > 0) {
              existingRecord = existing[0];
            }
          }

          // Process based on mode
          if (existingRecord && (mode === 'update' || mode === 'upsert')) {
            await service.update(
              'api::sucursal.sucursal',
              existingRecord.id,
              { data: dataToSave }
            );

            rowResult.status = 'updated';
            rowResult.recordId = existingRecord.id;
            result.updatedCount++;

            if (publish) {
              await strapi
                .plugin('content-manager')
                .service('content-types')
                .syncEntity(
                  'api::sucursal.sucursal',
                  existingRecord.id
                );
            }
          } else if (mode !== 'update') {
            const created = await service.create(
              'api::sucursal.sucursal',
              { data: dataToSave }
            );

            rowResult.status = 'created';
            rowResult.recordId = created.id;
            result.createdCount++;

            if (publish) {
              await strapi
                .plugin('content-manager')
                .service('content-types')
                .syncEntity(
                  'api::sucursal.sucursal',
                  created.id
                );
            }
          } else {
            throw new Error(
              `Record not found for update (${uniqueField}: ${rowData[uniqueField]})`
            );
          }
        } catch (error) {
          rowResult.status = 'error';
          rowResult.error = error.message;
          result.errorCount++;
          result.errors.push({
            rowIndex: i,
            error: error.message,
            data: rowData,
          });
        }

        result.processedRows.push(rowResult);
      }

      result.status = result.errorCount === 0 ? 'completed' : 'completed_with_errors';
    } catch (error) {
      result.status = 'failed';
      result.errors.push({ general: error.message });
    }

    result.completedAt = new Date();
    result.duration = result.completedAt - result.startedAt;

    await this._logImport('sucursal', result, userId);

    return result;
  },

  /**
   * Prepare data for import (parse, validate, map)
   *
   * @param {Array<Object>} rawRows - Raw rows from parser
   * @param {Object} validators - Validator service
   * @param {Object} mapper - Mapper service
   * @param {string} collectionType - 'modelo-version' | 'sucursal'
   * @param {Object} schema - Zod schema for validation
   *
   * @returns {Object} Prepared data with validation results
   */
  prepareImportData(rawRows, validators, mapper, collectionType, schema) {
    // Map columns to fields
    const mappedRows = mapper.mapRows(rawRows, collectionType);
    const mappingErrors = mappedRows.filter(r => r.error);

    // Validate mapped data
    const validationResult = validators.validateRows(
      mappedRows
        .filter(r => !r.error)
        .map(r => r.mapped),
      schema
    );

    return {
      totalRows: rawRows.length,
      mappedRows: mappedRows.filter(r => !r.error).length,
      mappingErrors,
      validRows: validationResult.validRows.map(r => r.data),
      invalidRows: validationResult.invalidRows,
      summary: {
        total: rawRows.length,
        mapped: mappedRows.filter(r => !r.error).length,
        valid: validationResult.totalValid,
        invalid: validationResult.totalInvalid,
        readyToImport: validationResult.totalValid,
      },
    };
  },

  /**
   * INTERNAL: Log import operation
   *
   * @private
   */
  async _logImport(collectionType, result, userId) {
    try {
      await strapi.entityService.create('api::import-log.import-log', {
        data: {
          import_id: result.importId,
          usuario: userId,
          tipo_importacion: collectionType,
          estado: result.status,
          cantidad_creados: result.createdCount,
          cantidad_actualizados: result.updatedCount,
          cantidad_errores: result.errorCount,
          errores: JSON.stringify(result.errors),
          modo_importacion: result.mode,
          duracion_ms: result.duration,
          metadata: JSON.stringify({
            processedRows: result.processedRows.length,
            startedAt: result.startedAt,
          }),
        },
      });
    } catch (error) {
      console.error('[Importer] Failed to log import:', error.message);
    }
  },

  /**
   * Get import status by ID
   *
   * @param {string} importId - Import ID
   * @returns {Promise<Object>} Import status from logs
   */
  async getImportStatus(importId) {
    try {
      const logs = await strapi.entityService.findMany(
        'api::import-log.import-log',
        {
          filters: { import_id: importId },
          limit: 1,
        }
      );

      if (logs.length === 0) {
        return null;
      }

      const log = logs[0];
      return {
        importId: log.import_id,
        status: log.estado,
        type: log.tipo_importacion,
        created: log.cantidad_creados,
        updated: log.cantidad_actualizados,
        errors: log.cantidad_errores,
        mode: log.modo_importacion,
        duration: log.duracion_ms,
        createdAt: log.createdAt,
      };
    } catch (error) {
      console.error('[Importer] Failed to get import status:', error.message);
      return null;
    }
  },

  /**
   * Get import logs with filters
   *
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} Import logs
   */
  async getImportLogs(options = {}) {
    try {
      const { limit = 50, offset = 0, type = null } = options;

      const filters = {};
      if (type) {
        filters.tipo_importacion = type;
      }

      const logs = await strapi.entityService.findMany(
        'api::import-log.import-log',
        {
          filters,
          limit,
          offset,
          sort: { createdAt: 'desc' },
        }
      );

      return {
        data: logs.map(log => ({
          importId: log.import_id,
          status: log.estado,
          type: log.tipo_importacion,
          created: log.cantidad_creados,
          updated: log.cantidad_actualizados,
          errors: log.cantidad_errores,
          createdAt: log.createdAt,
        })),
        count: logs.length,
        limit,
        offset,
      };
    } catch (error) {
      console.error('[Importer] Failed to get import logs:', error.message);
      return { data: [], count: 0 };
    }
  },
};
