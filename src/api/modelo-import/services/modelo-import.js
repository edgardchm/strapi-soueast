'use strict';

const ExcelJS = require('exceljs');

module.exports = {
  async preview(file) {
    try {
      const filePath = file.path;

      // 1. Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No se encontró ninguna hoja en el archivo Excel');
      }

      // 2. Detectar automáticamente la fila que contiene headers
      const { headerRowNumber, headerValues } = this.detectHeaderRow(worksheet);

      if (!headerRowNumber) {
        throw new Error('No se encontró una fila con headers válidos en el archivo');
      }

      // Normalizar headers y crear mapping
      const normalizedHeaders = headerValues.map(h => this.normalizeHeader(h));
      const fieldMapping = this.buildFieldMapping(normalizedHeaders, headerValues);

      // 3. Procesar filas (solo después del header row)
      const rows = [];
      const errors = [];
      const warnings = [];
      let emptyRowCount = 0;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowNumber) return; // Skip header row y filas anteriores

        const values = row.values ? row.values.slice(1) : [];

        // Detectar filas vacías
        const isEmpty = values.every(v => !v || v === '');
        if (isEmpty) {
          emptyRowCount++;
          return;
        }

        // Mapear valores a headers normalizados
        const rowData = {};
        normalizedHeaders.forEach((header, idx) => {
          if (idx < values.length) {
            rowData[header] = this.normalizeValue(values[idx], header);
          }
        });

        // Mapear a schema de modelo/precio usando field mapping
        const mapped = this.mapRowDataToModelo(rowData, fieldMapping);

        // Validar
        const fieldErrors = this.validateRow(mapped);
        const fieldWarnings = this.validateRowWarnings(mapped);

        if (fieldErrors.length > 0) {
          // Agregar errores
          fieldErrors.forEach(err => {
            errors.push({
              rowNumber,
              field: err.field,
              message: err.message,
            });
          });
        } else {
          // Fila válida
          rows.push({
            rowNumber,
            status: 'valid',
            data: mapped,
          });

          // Agregar warnings si existen
          fieldWarnings.forEach(warn => {
            warnings.push({
              rowNumber,
              field: warn.field,
              message: warn.message,
              expected: warn.expected,
              received: warn.received,
            });
          });
        }
      });

      // 4. Detectar duplicados dentro del mismo archivo
      const duplicateWarnings = this.detectDuplicates(rows);
      const duplicateRowNumbers = new Set(duplicateWarnings.map(w => w.rowNumber));

      // 5. REMOVER del array rows cualquier fila que sea duplicada
      const validRowsFiltered = rows.filter(row => !duplicateRowNumbers.has(row.rowNumber));

      // 6. Agregar duplicados a errors
      const allErrors = [...errors, ...duplicateWarnings];

      // 7. Calcular resumen de errores y warnings
      const errorSummary = this.buildErrorSummary(allErrors);
      const duplicateRows = duplicateWarnings.length;
      const priceWarnings = warnings.filter(w => w.field === 'precio_final').length;

      // 8. Construir preview
      const preview = {
        summary: {
          totalRows: worksheet.rowCount - headerRowNumber,
          validRows: validRowsFiltered.length,
          invalidRows: new Set(allErrors.map(e => e.rowNumber)).size,
          warnings: emptyRowCount,
          duplicateRows,
          priceWarnings,
        },
        detectedHeaderRow: headerRowNumber,
        detectedHeaders: headerValues,
        fieldMapping: Object.fromEntries(
          Object.entries(fieldMapping).filter(([k, v]) => v !== null)
        ),
        rows: validRowsFiltered,
        errors: allErrors,
        errorSummary,
        warnings,
      };

      return preview;
    } catch (error) {
      throw new Error(`Error al procesar archivo: ${error.message}`);
    }
  },

  detectHeaderRow(worksheet) {
    /**
     * Detecta automáticamente la fila que contiene headers
     * Busca una fila que contenga palabras clave específicas
     * Rechaza filas donde todos los valores son iguales (celdas combinadas/repetidas)
     */
    const requiredHeaderKeywords = [
      'marca',
      'modelo',
      'version',
      'versión',
      'precio_lista',
      'precio lista',
      'bono_marca',
      'bono marca',
      'bono_financiamiento',
      'bono financiamiento',
      'precio_final',
      'precio final',
      'custom'
    ];

    for (let rowNum = 1; rowNum <= Math.min(20, worksheet.rowCount); rowNum++) {
      const row = worksheet.getRow(rowNum);
      if (!row || !row.values || row.values.length < 2) continue;

      const values = row.values.slice(1);
      const headers = values.map(h =>
        (h ? h.toString().toLowerCase().trim() : '')
      );

      // Filtrar celdas vacías
      const nonEmptyHeaders = headers.filter(h => h !== '');
      if (nonEmptyHeaders.length === 0) continue;

      // Rechazar fila si casi todos los valores son idénticos
      // (indica celdas combinadas como "Reporte Precios | Reporte Precios | ...")
      const uniqueValues = new Set(nonEmptyHeaders);
      if (uniqueValues.size <= 1) {
        // Solo 1 valor único repetido, no es un header row válido
        continue;
      }

      // Contar cuántas palabras clave requeridas están presentes
      const keywordMatches = headers.filter(h =>
        requiredHeaderKeywords.some(kw => h.includes(kw))
      ).length;

      // Si encontramos al menos 3 keywords requeridos, es la fila de headers
      if (keywordMatches >= 3) {
        return {
          headerRowNumber: rowNum,
          headerValues: row.values.slice(1).map(v => v ? v.toString() : ''),
        };
      }
    }

    // Si no encuentra headers válidos, devolver null (no asumir fila 1)
    return { headerRowNumber: null, headerValues: [] };
  },

  buildFieldMapping(normalizedHeaders, originalHeaders) {
    /**
     * Construye un mapping de headers normalizados a campos del schema
     */
    const mapping = {};

    const headerMap = {
      // Requeridos
      'marca': 'marca',
      'modelo': 'modelo',
      'model': 'modelo',
      'version': 'version',
      'versión': 'version',
      'precio_lista': 'precio_lista',
      'precio lista': 'precio_lista',
      'precio': 'precio_lista',
      'precio_base': 'precio_lista',

      // Bonos
      'bono_marca': 'bono_marca',
      'bono marca': 'bono_marca',
      'bono_financiamiento': 'bono_financiamiento',
      'bono financiamiento': 'bono_financiamiento',
      'bono_financiero': 'bono_financiamiento',

      // Precio final
      'precio_final': 'precio_final',
      'precio final': 'precio_final',
      'precio_neto': 'precio_final',

      // Otros
      'custom': 'custom',
    };

    normalizedHeaders.forEach((normHeader, idx) => {
      const field = headerMap[normHeader] || null;
      mapping[originalHeaders[idx] || normHeader] = field;
    });

    return mapping;
  },

  normalizeHeader(header) {
    if (!header) return '';
    return header
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[áàâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9_]/g, '');
  },

  normalizeValue(value, fieldName) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      value = value.trim();
      if (value === '' || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'na') {
        return null;
      }

      // Si es un campo de precio, normalizar formato
      if (fieldName && (fieldName.includes('precio') || fieldName.includes('bono'))) {
        return this.normalizePrice(value);
      }

      return value;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    // Si parece ser precio (contiene $), normalizar
    if (String(value).includes('$') || String(value).includes('.')) {
      return this.normalizePrice(String(value));
    }

    return String(value).trim();
  },

  normalizePrice(value) {
    /**
     * Normaliza precios en formato chileno
     * "$17.490.000" -> 17490000
     * Quita: $, puntos de miles, espacios, caracteres invisibles
     */
    if (!value) return null;

    value = String(value)
      .trim()
      // Caracteres invisibles (cero width, bidi marks, etc.)
      .replace(/[​‌‍‎‏‪‫‬‭‮﻿]/g, '')
      // Espacios (nbsp, thin space, etc.)
      .replace(/[\s  -​]/g, '')
      // Símbolos de moneda
      .replace(/[\$€¥]/g, '')
      // Puntos de miles en formato chileno
      .replace(/\./g, '')
      // Comas decimal (si las hay)
      .replace(/,/g, '');

    // Extraer solo dígitos
    const digits = value.replace(/[^0-9]/g, '');
    const num = parseInt(digits, 10);
    return isNaN(num) || digits === '' ? null : num;
  },

  mapRowDataToModelo(rowData, fieldMapping) {
    /**
     * Mapea datos de una fila al schema de modelo/precio
     * rowData tiene keys normalizadas (precio_lista)
     * fieldMapping tiene keys originales (Precio_Lista) -> values normalizadas (precio_lista)
     */
    const mapped = {};

    Object.entries(fieldMapping).forEach(([originalHeader, schemaField]) => {
      if (!schemaField) {
        return;
      }

      // Obtener el valor usando header normalizado
      const normalizedHeader = this.normalizeHeader(originalHeader);
      const value = rowData[normalizedHeader];

      if (value === null || value === undefined) {
        return;
      }

      // Mapear a campo del schema
      // Los valores ya están normalizados por normalizeValue()
      mapped[schemaField] = value;
    });

    return mapped;
  },

  validateRow(rowData) {
    /**
     * Valida una fila de modelo/precio
     */
    const errors = [];

    // Campos requeridos
    const required = ['marca', 'modelo', 'version', 'precio_lista'];

    for (const field of required) {
      if (!rowData[field]) {
        errors.push({
          field,
          message: `Campo requerido faltante: ${field}`,
        });
      }
    }

    // Validar números en precios
    if (rowData.precio_lista !== null && rowData.precio_lista !== undefined) {
      const precio = typeof rowData.precio_lista === 'number' ? rowData.precio_lista : parseInt(rowData.precio_lista, 10);
      if (isNaN(precio) || precio <= 0) {
        errors.push({
          field: 'precio_lista',
          message: `Precio lista debe ser un número positivo: ${rowData.precio_lista}`,
        });
      }
    }

    // Validar bonos si vienen
    if (rowData.bono_marca !== null && rowData.bono_marca !== undefined) {
      const bono = typeof rowData.bono_marca === 'number' ? rowData.bono_marca : parseInt(rowData.bono_marca, 10);
      if (isNaN(bono) || bono < 0) {
        errors.push({
          field: 'bono_marca',
          message: `Bono marca debe ser un número >= 0: ${rowData.bono_marca}`,
        });
      }
    }

    if (rowData.bono_financiamiento !== null && rowData.bono_financiamiento !== undefined) {
      const bono = typeof rowData.bono_financiamiento === 'number' ? rowData.bono_financiamiento : parseInt(rowData.bono_financiamiento, 10);
      if (isNaN(bono) || bono < 0) {
        errors.push({
          field: 'bono_financiamiento',
          message: `Bono financiamiento debe ser un número >= 0: ${rowData.bono_financiamiento}`,
        });
      }
    }

    if (rowData.precio_final !== null && rowData.precio_final !== undefined) {
      const precio = typeof rowData.precio_final === 'number' ? rowData.precio_final : parseInt(rowData.precio_final, 10);
      if (isNaN(precio) || precio <= 0) {
        errors.push({
          field: 'precio_final',
          message: `Precio final debe ser un número positivo: ${rowData.precio_final}`,
        });
      }
    }

    return errors;
  },

  validateRowWarnings(rowData) {
    /**
     * Valida warnings (no invalida, solo advierte)
     */
    const warnings = [];

    // Validar que precio_final cuadre con precio_lista - bonos
    if (
      rowData.precio_lista !== null &&
      rowData.precio_final !== null
    ) {
      const precioLista = typeof rowData.precio_lista === 'number' ? rowData.precio_lista : parseInt(rowData.precio_lista, 10);
      const bonoMarca = rowData.bono_marca ? (typeof rowData.bono_marca === 'number' ? rowData.bono_marca : parseInt(rowData.bono_marca, 10)) : 0;
      const bonoFinanciamiento = rowData.bono_financiamiento ? (typeof rowData.bono_financiamiento === 'number' ? rowData.bono_financiamiento : parseInt(rowData.bono_financiamiento, 10)) : 0;
      const precioFinal = typeof rowData.precio_final === 'number' ? rowData.precio_final : parseInt(rowData.precio_final, 10);

      const expectedPrice = precioLista - bonoMarca - bonoFinanciamiento;

      if (expectedPrice !== precioFinal) {
        warnings.push({
          field: 'precio_final',
          message: 'Precio final no coincide con precio_lista - bonos',
          expected: expectedPrice,
          received: precioFinal,
        });
      }
    }

    return warnings;
  },

  detectDuplicates(rows) {
    /**
     * Detecta duplicados dentro del mismo archivo basado en marca + modelo + version
     */
    const seen = new Map();
    const duplicateWarnings = [];

    for (const row of rows) {
      const { marca, modelo, version } = row.data;
      if (!marca || !modelo || !version) continue;

      const key = `${marca}|${modelo}|${version}`;

      if (seen.has(key)) {
        const firstRow = seen.get(key);
        duplicateWarnings.push({
          rowNumber: row.rowNumber,
          field: 'duplicado',
          message: `Modelo duplicado en el archivo. Primera ocurrencia: fila ${firstRow}.`,
        });
      } else {
        seen.set(key, row.rowNumber);
      }
    }

    return duplicateWarnings;
  },

  buildErrorSummary(errors) {
    /**
     * Agrupa errores por campo para resumen
     */
    const summary = {};

    for (const error of errors) {
      const field = error.field;
      summary[field] = (summary[field] || 0) + 1;
    }

    return summary;
  },

  async confirmPrecioDesde(file) {
    /**
     * Confirma y actualiza precio_desde de modelos
     * basado en el menor precio_final por modelo del Excel
     */
    try {
      // 1. Obtener preview (parseo + validación)
      const preview = await this.preview(file);

      // 2. Si no hay filas válidas, reportar
      if (preview.summary.validRows === 0) {
        return {
          summary: {
            totalRows: preview.summary.totalRows,
            validRows: 0,
            modelsDetected: 0,
            updated: 0,
            skipped: preview.summary.invalidRows,
            errors: 0,
          },
          updated: [],
          skipped: [],
          errors: [],
        };
      }

      // 3. Agrupar filas por modelo
      const modeloMap = new Map(); // modelo.nombre -> [{ precio_final, version, ... }]

      for (const row of preview.rows) {
        const { modelo, precio_final, version } = row.data;
        if (!modelo) continue;

        if (!modeloMap.has(modelo)) {
          modeloMap.set(modelo, []);
        }
        modeloMap.get(modelo).push({
          version,
          precio_final,
          precio_lista: row.data.precio_lista,
          bono_marca: row.data.bono_marca,
          bono_financiamiento: row.data.bono_financiamiento,
        });
      }

      // 4. Procesar cada modelo
      const updated = [];
      const skipped = [];
      const errors = [];

      for (const [modeloNombre, versiones] of modeloMap.entries()) {
        try {
          // Calcular menor precio_final
          let menorPrecio = Math.min(...versiones.map(v => v.precio_final || 999999999));

          // Validar precio
          if (!menorPrecio || menorPrecio <= 0) {
            skipped.push({
              modelo: modeloNombre,
              reason: `Precio final inválido o no encontrado`,
            });
            continue;
          }

          // 4a. Buscar modelo existente en Strapi por nombre
          const existingModelos = await strapi.entityService.findMany(
            'api::modelo.modelo',
            {
              filters: {
                nombre: modeloNombre,
              },
              limit: 1,
            }
          );

          if (!existingModelos || existingModelos.length === 0) {
            skipped.push({
              modelo: modeloNombre,
              reason: `Modelo no encontrado en Strapi`,
            });
            continue;
          }

          // 4b. Actualizar precio_desde
          const id = existingModelos[0].id;
          const precioAnterior = existingModelos[0].precio_desde || null;

          await strapi.entityService.update('api::modelo.modelo', id, {
            data: {
              precio_desde: menorPrecio,
              publishedAt: new Date(),
            },
          });

          updated.push({
            modelo: modeloNombre,
            modeloId: id,
            precio_desde_anterior: precioAnterior,
            precio_desde_nuevo: menorPrecio,
            versiones_consideradas: versiones.length,
          });
        } catch (modeloError) {
          strapi.log.error(`Error procesando modelo ${modeloNombre}:`, modeloError);
          errors.push({
            modelo: modeloNombre,
            message: `Error al actualizar: ${modeloError.message}`,
          });
        }
      }

      // 5. Construir reporte
      const result = {
        summary: {
          totalRows: preview.summary.totalRows,
          validRows: preview.summary.validRows,
          modelsDetected: modeloMap.size,
          updated: updated.length,
          skipped: skipped.length,
          errors: errors.length,
        },
        updated,
        skipped,
        errors,
      };

      return result;
    } catch (error) {
      throw new Error(`Error al procesar confirmación: ${error.message}`);
    }
  },
};
