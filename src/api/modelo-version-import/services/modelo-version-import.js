'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const EXPECTED_BRAND = 'SOUEAST';
const HEADER_KEYWORDS = [
  'marca',
  'modelo',
  'version',
  'precio_lista',
  'bono_marca',
  'bono_financiamiento',
  'precio_final',
];

module.exports = () => ({
  normalizePrice(value) {
    if (!value) return null;
    if (typeof value === 'number') return Math.floor(value);
    const str = String(value).trim();
    if (!str) return null;
    const cleaned = str.replace(/[\$\s]/g, '').replace(/\./g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
  },

  detectHeaderRow(worksheet) {
    let headerRow = 1;
    let maxKeywordMatches = 0;

    for (let row = 1; row <= Math.min(10, worksheet.rowCount); row++) {
      const values = worksheet.getRow(row).values || [];
      const strValues = values
        .slice(1)
        .map((v) => (v ? String(v).toLowerCase().trim() : ''))
        .filter((v) => v);

      const uniqueValues = new Set(strValues);
      if (uniqueValues.size < 3 && strValues.length > 3) {
        continue;
      }

      const keywordMatches = HEADER_KEYWORDS.filter((kw) =>
        strValues.some((v) => v.includes(kw))
      ).length;

      if (keywordMatches > maxKeywordMatches) {
        maxKeywordMatches = keywordMatches;
        headerRow = row;
      }
    }

    return maxKeywordMatches >= 3 ? headerRow : 1;
  },

  findColumnIndex(headerRow, columnName) {
    const values = headerRow.values || [];
    const normalized = columnName.toLowerCase().trim();
    for (let i = 1; i < values.length; i++) {
      const cell = values[i];
      if (cell && String(cell).toLowerCase().trim().includes(normalized)) {
        return i;
      }
    }
    return -1;
  },

  mapRowData(row, headerRow) {
    const marcaIdx = this.findColumnIndex(headerRow, 'marca');
    const modeloIdx = this.findColumnIndex(headerRow, 'modelo');
    const versionIdx = this.findColumnIndex(headerRow, 'version');
    const precioListaIdx = this.findColumnIndex(headerRow, 'precio_lista');
    const bonoMarcaIdx = this.findColumnIndex(headerRow, 'bono_marca');
    const bonoFinanciamientoIdx = this.findColumnIndex(
      headerRow,
      'bono_financiamiento'
    );
    const precioFinalIdx = this.findColumnIndex(headerRow, 'precio_final');
    const customIdx = this.findColumnIndex(headerRow, 'custom');

    const marca = marcaIdx > 0 ? row.getCell(marcaIdx).value : null;
    const modeloNombre = modeloIdx > 0 ? row.getCell(modeloIdx).value : null;
    const version = versionIdx > 0 ? row.getCell(versionIdx).value : null;
    const precioLista =
      precioListaIdx > 0 ? row.getCell(precioListaIdx).value : null;
    const bonoMarca =
      bonoMarcaIdx > 0 ? row.getCell(bonoMarcaIdx).value : null;
    const bonoFinanciamiento =
      bonoFinanciamientoIdx > 0 ? row.getCell(bonoFinanciamientoIdx).value : null;
    const precioFinal =
      precioFinalIdx > 0 ? row.getCell(precioFinalIdx).value : null;
    const custom = customIdx > 0 ? row.getCell(customIdx).value : null;

    return {
      marca: marca ? String(marca).trim() : null,
      modelo_nombre: modeloNombre ? String(modeloNombre).trim() : null,
      version: version ? String(version).trim() : null,
      precio_lista: this.normalizePrice(precioLista),
      bono_marca: this.normalizePrice(bonoMarca),
      bono_financiamiento: this.normalizePrice(bonoFinanciamiento),
      precio_final: this.normalizePrice(precioFinal),
      moneda: 'CLP',
      activo: true,
      metadata: {
        source: 'excel',
        custom: custom ? String(custom).trim() : null,
      },
    };
  },

  resolvePrecioFinal(data) {
    if (data.precio_final !== null && data.precio_final !== undefined) {
      return data.precio_final;
    }
    const lista = data.precio_lista || 0;
    const marca = data.bono_marca || 0;
    const financiamiento = data.bono_financiamiento || 0;
    return Math.max(0, lista - marca - financiamiento);
  },

  async findModeloByName(modeloNombre) {
    try {
      const entrada = await strapi.entityService.findMany('api::modelo.modelo', {
        filters: { nombre: modeloNombre },
      });

      if (entrada && entrada.length > 0) {
        return entrada[0];
      }

      const todos = await strapi.entityService.findMany('api::modelo.modelo', {
        pagination: { pageSize: 1000 },
      });

      if (todos && todos.length > 0) {
        const normalized = modeloNombre.toLowerCase().trim();
        for (const modelo of todos) {
          if (modelo.nombre.toLowerCase().trim() === normalized) {
            return modelo;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding modelo:', error);
      return null;
    }
  },

  async previewFile(fileBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet || worksheet.rowCount < 4) {
      return {
        ok: false,
        type: 'modelo-version-preview',
        error: 'Excel inválido: debe tener al menos 4 filas',
      };
    }

    const detectedHeaderRow = this.detectHeaderRow(worksheet);
    const headerRowObj = worksheet.getRow(detectedHeaderRow);
    const detectedHeaders = (headerRowObj.values || [])
      .slice(1)
      .filter((v) => v);

    const rows = [];
    const errors = [];
    const warnings = [];
    const processedVersions = new Set();
    let validRowCount = 0;
    let invalidRowCount = 0;
    const modelsDetected = new Set();
    const modelsFound = new Set();
    const modelsMissing = new Set();
    let duplicateCount = 0;

    for (
      let rowNum = detectedHeaderRow + 1;
      rowNum <= worksheet.rowCount;
      rowNum++
    ) {
      const row = worksheet.getRow(rowNum);
      const firstCell = row.getCell(1).value;

      if (!firstCell || String(firstCell).trim() === '') {
        continue;
      }

      const mappedData = this.mapRowData(row, headerRowObj);

      if (
        !mappedData.modelo_nombre ||
        !mappedData.version ||
        !mappedData.precio_lista
      ) {
        invalidRowCount++;
        errors.push({
          rowNumber: rowNum,
          reason: 'Campos requeridos faltantes',
          data: mappedData,
        });
        continue;
      }

      if (mappedData.marca !== EXPECTED_BRAND) {
        invalidRowCount++;
        errors.push({
          rowNumber: rowNum,
          reason: `Marca incorrecta: ${mappedData.marca} (esperada: ${EXPECTED_BRAND})`,
          data: mappedData,
        });
        continue;
      }

      modelsDetected.add(mappedData.modelo_nombre);
      const modelo = await this.findModeloByName(mappedData.modelo_nombre);

      if (!modelo) {
        invalidRowCount++;
        modelsMissing.add(mappedData.modelo_nombre);
        errors.push({
          rowNumber: rowNum,
          reason: `Modelo no encontrado: ${mappedData.modelo_nombre}`,
          data: mappedData,
        });
        continue;
      }

      modelsFound.add(mappedData.modelo_nombre);
      const versionKey = `${modelo.id}_${mappedData.version}`;

      if (processedVersions.has(versionKey)) {
        invalidRowCount++;
        duplicateCount++;
        errors.push({
          rowNumber: rowNum,
          reason: `Versión duplicada en Excel: ${mappedData.modelo_nombre} - ${mappedData.version}`,
          data: mappedData,
        });
        continue;
      }

      processedVersions.add(versionKey);
      const precioFinal = this.resolvePrecioFinal(mappedData);

      rows.push({
        rowNumber: rowNum,
        status: 'valid',
        data: {
          ...mappedData,
          modelo_id: modelo.id,
          precio_final: precioFinal,
        },
      });

      validRowCount++;
    }

    return {
      ok: true,
      type: 'modelo-version-preview',
      summary: {
        totalRows: validRowCount + invalidRowCount,
        validRows: validRowCount,
        invalidRows: invalidRowCount,
        modelsDetected: modelsDetected.size,
        modelsFound: modelsFound.size,
        modelsMissing: modelsMissing.size,
        duplicateRows: duplicateCount,
        priceWarnings: 0,
      },
      detectedHeaderRow,
      detectedHeaders: detectedHeaders.map((h) =>
        h ? String(h).trim() : ''
      ),
      rows,
      errors,
      warnings,
    };
  },

  async confirmFile(fileBuffer, importToken) {
    const expectedToken = process.env.IMPORT_SECRET_TOKEN;

    if (!expectedToken) {
      return {
        ok: false,
        type: 'modelo-version-confirm',
        error: 'IMPORT_SECRET_TOKEN no configurado',
      };
    }

    if (!importToken || importToken !== expectedToken) {
      return {
        ok: false,
        type: 'modelo-version-confirm',
        error: 'No autorizado para confirmar importación',
        statusCode: 403,
      };
    }

    const preview = await this.previewFile(fileBuffer);

    if (!preview.ok) {
      return preview;
    }

    const { rows: validRows } = preview;
    const created = [];
    const updated = [];
    const skipped = [];
    const errors = [];

    for (const row of validRows) {
      const { data, rowNumber } = row;

      try {
        const existing = await strapi.entityService.findMany(
          'api::modelo-version.modelo-version',
          {
            filters: {
              modelo: data.modelo_id,
              version: data.version,
            },
          }
        );

        const existingRecord = existing && existing.length > 0 ? existing[0] : null;

        if (existingRecord) {
          const updated_record = await strapi.entityService.update(
            'api::modelo-version.modelo-version',
            existingRecord.id,
            {
              data: {
                marca: data.marca,
                modelo_nombre: data.modelo_nombre,
                version: data.version,
                precio_lista: data.precio_lista,
                bono_marca: data.bono_marca,
                bono_financiamiento: data.bono_financiamiento,
                precio_final: data.precio_final,
                moneda: data.moneda,
                activo: data.activo,
                metadata: data.metadata,
                modelo: data.modelo_id,
                publishedAt: new Date(),
              },
            }
          );

          updated.push({
            rowNumber,
            id: updated_record.id,
            modelo: data.modelo_nombre,
            modeloId: data.modelo_id,
            version: data.version,
            precio_final: data.precio_final,
          });
        } else {
          const created_record = await strapi.entityService.create(
            'api::modelo-version.modelo-version',
            {
              data: {
                marca: data.marca,
                modelo_nombre: data.modelo_nombre,
                version: data.version,
                precio_lista: data.precio_lista,
                bono_marca: data.bono_marca,
                bono_financiamiento: data.bono_financiamiento,
                precio_final: data.precio_final,
                moneda: data.moneda,
                activo: data.activo,
                metadata: data.metadata,
                modelo: data.modelo_id,
                publishedAt: new Date(),
              },
            }
          );

          created.push({
            rowNumber,
            id: created_record.id,
            modelo: data.modelo_nombre,
            modeloId: data.modelo_id,
            version: data.version,
            precio_final: data.precio_final,
          });
        }
      } catch (err) {
        errors.push({
          rowNumber,
          error: err.message,
          data,
        });
      }
    }

    return {
      ok: true,
      type: 'modelo-version-confirm',
      summary: {
        totalRows: preview.summary.totalRows,
        validRows: preview.summary.validRows,
        created: created.length,
        updated: updated.length,
        skipped: skipped.length,
        errors: errors.length,
      },
      created,
      updated,
      skipped,
      errors,
    };
  },
});
