'use strict';

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

module.exports = {
  /**
   * POST /api/import/preview
   * Parse file, validate data, return preview without saving
   *
   * Body:
   *   - file: multipart file (Excel or CSV)
   *   - type: 'modelo-version' | 'sucursal'
   *   - sheet: (optional) sheet name for Excel files
   */
  async preview(ctx) {
    let tempFile = null;

    try {
      const { type = 'modelo-version', sheet = 0 } = ctx.request.body;
      const file = ctx.request.files?.file;

      if (!file) {
        return ctx.throw(400, 'Se requiere un archivo para importar');
      }

      // Validate type
      if (!['modelo-version', 'sucursal'].includes(type)) {
        return ctx.throw(400, 'Tipo de importación inválido (modelo-version | sucursal)');
      }

      const importId = uuidv4();

      strapi.log.info(
        `[IMPORT] Preview iniciado (${type}) por ${ctx.state.importUser.username}`
      );

      // Save temp file
      const tempDir = path.join(process.cwd(), '.tmp', 'imports');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      tempFile = path.join(tempDir, `${importId}-${file.name}`);
      const fileBuffer = fs.readFileSync(file.filepath);
      fs.writeFileSync(tempFile, fileBuffer);

      // Get parsers and validators
      const excelParser = strapi.service('api::import.excel-parser');
      const csvParser = strapi.service('api::import.csv-parser');
      const validators = strapi.service('api::import.validators');
      const mapper = strapi.service('api::import.data-mapper');
      const importer = strapi.service('api::import.data-importer');

      let rawRows = [];
      let fileType = null;

      // Parse file based on extension
      const ext = path.extname(file.name).toLowerCase();

      if (ext === '.xlsx' || ext === '.xls') {
        fileType = 'excel';
        const sheets = await excelParser.parseFile(tempFile);
        const sheetData = sheets[typeof sheet === 'number' ? sheet : 0];

        if (!sheetData) {
          return ctx.throw(400, `Sheet "${sheet}" not found`);
        }

        rawRows = sheetData.rows;
      } else if (ext === '.csv') {
        fileType = 'csv';
        const result = await csvParser.parseFile(tempFile);
        rawRows = result.rows;
      } else {
        return ctx.throw(400, 'Formato de archivo no soportado (.xlsx, .csv)');
      }

      // Get appropriate schema
      const schema =
        type === 'modelo-version'
          ? validators.modeloVersionSchema
          : validators.sucursalSchema;

      // Prepare data (map and validate)
      const prepared = importer.prepareImportData(
        rawRows,
        validators,
        mapper,
        type,
        schema
      );

      // Build response
      ctx.body = {
        importId,
        status: 'preview',
        type,
        fileType,
        filename: file.name,
        fileSize: file.size,
        summary: {
          totalRows: prepared.summary.total,
          mappedRows: prepared.summary.mapped,
          validRows: prepared.summary.valid,
          invalidRows: prepared.summary.invalid,
          readyToImport: prepared.summary.readyToImport,
        },
        preview: {
          validRows: prepared.validRows.slice(0, 5), // First 5 valid rows
          invalidRows: prepared.invalidRows.slice(0, 5), // First 5 invalid
        },
        statistics: {
          validPercentage: prepared.summary.total > 0
            ? Math.round((prepared.summary.valid / prepared.summary.total) * 100)
            : 0,
          invalidPercentage: prepared.summary.total > 0
            ? Math.round((prepared.summary.invalid / prepared.summary.total) * 100)
            : 0,
        },
        user: ctx.state.importUser.username,
        timestamp: new Date().toISOString(),
      };

      ctx.status = 200;

      strapi.log.info(
        `[IMPORT] Preview completado: ${prepared.summary.valid}/${prepared.summary.total} filas válidas`
      );
    } catch (error) {
      strapi.log.error(`[IMPORT] Error en preview: ${error.message}`);
      ctx.throw(400, error.message);
    } finally {
      // Clean up temp file
      if (tempFile && fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (err) {
          strapi.log.warn(`[IMPORT] Failed to clean temp file: ${err.message}`);
        }
      }
    }
  },

  /**
   * POST /api/import/confirm/:importId
   * Confirm and execute actual import
   *
   * Body:
   *   - importId: ID from preview
   *   - type: 'modelo-version' | 'sucursal'
   *   - mode: 'create' | 'update' | 'upsert' (default: 'upsert')
   *   - file: multipart file (same file from preview)
   */
  async confirm(ctx) {
    let tempFile = null;

    try {
      const {
        type = 'modelo-version',
        mode = 'upsert',
        sheet = 0,
      } = ctx.request.body;

      const file = ctx.request.files?.file;

      if (!file) {
        return ctx.throw(400, 'Se requiere un archivo para importar');
      }

      if (!['modelo-version', 'sucursal'].includes(type)) {
        return ctx.throw(400, 'Tipo de importación inválido');
      }

      const importId = uuidv4();

      strapi.log.info(
        `[IMPORT] Confirm iniciado (${type}, mode=${mode}) por ${ctx.state.importUser.username}`
      );

      // Save temp file
      const tempDir = path.join(process.cwd(), '.tmp', 'imports');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      tempFile = path.join(tempDir, `${importId}-${file.name}`);
      const fileBuffer = fs.readFileSync(file.filepath);
      fs.writeFileSync(tempFile, fileBuffer);

      // Get services
      const excelParser = strapi.service('api::import.excel-parser');
      const csvParser = strapi.service('api::import.csv-parser');
      const validators = strapi.service('api::import.validators');
      const mapper = strapi.service('api::import.data-mapper');
      const importer = strapi.service('api::import.data-importer');

      let rawRows = [];

      // Parse file
      const ext = path.extname(file.name).toLowerCase();

      if (ext === '.xlsx' || ext === '.xls') {
        const sheets = await excelParser.parseFile(tempFile);
        const sheetData = sheets[typeof sheet === 'number' ? sheet : 0];
        rawRows = sheetData.rows;
      } else if (ext === '.csv') {
        const result = await csvParser.parseFile(tempFile);
        rawRows = result.rows;
      }

      // Validate
      const schema =
        type === 'modelo-version'
          ? validators.modeloVersionSchema
          : validators.sucursalSchema;

      const prepared = importer.prepareImportData(
        rawRows,
        validators,
        mapper,
        type,
        schema
      );

      if (prepared.validRows.length === 0) {
        return ctx.throw(400, 'No hay filas válidas para importar');
      }

      // Execute import
      let result;

      if (type === 'modelo-version') {
        result = await importer.importModeloVersions(prepared.validRows, {
          mode,
          importId,
          userId: ctx.state.importUser.id,
          publish: true,
        });
      } else {
        result = await importer.importSucursales(prepared.validRows, {
          mode,
          importId,
          userId: ctx.state.importUser.id,
          publish: true,
        });
      }

      ctx.body = {
        importId: result.importId,
        status: result.status,
        type,
        mode,
        summary: {
          created: result.createdCount,
          updated: result.updatedCount,
          errors: result.errorCount,
          total: result.createdCount + result.updatedCount + result.errorCount,
        },
        errors: result.errors.slice(0, 10), // First 10 errors
        totalErrors: result.errors.length,
        user: ctx.state.importUser.username,
        duration: `${(result.duration / 1000).toFixed(2)}s`,
        timestamp: new Date().toISOString(),
      };

      ctx.status = result.errorCount === 0 ? 200 : 207;

      strapi.log.info(
        `[IMPORT] Confirm completado: ${result.createdCount} creados, ${result.updatedCount} actualizados, ${result.errorCount} errores`
      );
    } catch (error) {
      strapi.log.error(`[IMPORT] Error en confirm: ${error.message}`);
      ctx.throw(400, error.message);
    } finally {
      if (tempFile && fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (err) {
          strapi.log.warn(`[IMPORT] Failed to clean temp file: ${err.message}`);
        }
      }
    }
  },

  /**
   * GET /api/import/status/:importId
   * Get status of a specific import
   */
  async status(ctx) {
    try {
      const { importId } = ctx.params;

      if (!importId) {
        return ctx.throw(400, 'importId es requerido');
      }

      const importer = strapi.service('api::import.data-importer');
      const importStatus = await importer.getImportStatus(importId);

      if (!importStatus) {
        return ctx.throw(404, 'Importación no encontrada');
      }

      ctx.body = {
        ...importStatus,
        timestamp: new Date().toISOString(),
      };
      ctx.status = 200;
    } catch (error) {
      strapi.log.error(`[IMPORT] Error en status: ${error.message}`);
      ctx.throw(error.statusCode || 400, error.message);
    }
  },

  /**
   * GET /api/import/logs
   * Get import logs with optional filters
   */
  async logs(ctx) {
    try {
      const { limit = 50, offset = 0, type } = ctx.query;

      strapi.log.info(`[IMPORT] Logs solicitados por ${ctx.state.importUser.username}`);

      const importer = strapi.service('api::import.data-importer');
      const logsResult = await importer.getImportLogs({
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        type,
      });

      ctx.body = {
        status: 'success',
        data: logsResult.data,
        pagination: {
          limit: logsResult.limit,
          offset: logsResult.offset,
          count: logsResult.count,
        },
        timestamp: new Date().toISOString(),
      };

      ctx.status = 200;
    } catch (error) {
      strapi.log.error(`[IMPORT] Error en logs: ${error.message}`);
      ctx.throw(400, error.message);
    }
  },
};
