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

        // Mapear a schema de sucursal usando field mapping
        const mapped = this.mapRowDataToSucursal(rowData, fieldMapping);

        // Validar
        const fieldErrors = this.validateRow(mapped);

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
        }
      });

      // 4. Construir preview
      const preview = {
        summary: {
          totalRows: worksheet.rowCount - headerRowNumber, // Total desde después del header
          validRows: rows.length,
          invalidRows: new Set(errors.map(e => e.rowNumber)).size,
          warnings: emptyRowCount,
        },
        detectedHeaderRow: headerRowNumber,
        detectedHeaders: headerValues,
        fieldMapping: Object.fromEntries(
          Object.entries(fieldMapping).filter(([k, v]) => v !== null)
        ),
        rows,
        errors,
      };

      return preview;
    } catch (error) {
      throw new Error(`Error al procesar archivo: ${error.message}`);
    }
  },

  detectHeaderRow(worksheet) {
    /**
     * Detecta automáticamente la fila que contiene headers
     * Busca una fila que contenga palabras clave como: sucursal, latitud, longitud, region, comuna
     */
    const keywordPatterns = [
      'sucursal', 'nombre', 'latitud', 'latitude', 'longitud', 'longitude',
      'region', 'región', 'comuna', 'ciudad', 'dirección', 'direccion'
    ];

    for (let rowNum = 1; rowNum <= Math.min(20, worksheet.rowCount); rowNum++) {
      const row = worksheet.getRow(rowNum);
      if (!row || !row.values || row.values.length < 2) continue;

      const headers = row.values.slice(1).map(h =>
        (h ? h.toString().toLowerCase().trim() : '')
      );

      // Contar cuántas palabras clave están presentes
      const keywordMatches = headers.filter(h =>
        keywordPatterns.some(kw => h.includes(kw))
      ).length;

      // Si encontramos al menos 3 palabras clave, es probable que sea la fila de headers
      if (keywordMatches >= 3) {
        return {
          headerRowNumber: rowNum,
          headerValues: row.values.slice(1).map(v => v ? v.toString() : ''),
        };
      }
    }

    // Si no encuentra headers automáticamente, asumir fila 1
    const firstRow = worksheet.getRow(1);
    if (firstRow && firstRow.values && firstRow.values.length > 1) {
      return {
        headerRowNumber: 1,
        headerValues: firstRow.values.slice(1).map(v => v ? v.toString() : ''),
      };
    }

    return { headerRowNumber: null, headerValues: [] };
  },

  buildFieldMapping(normalizedHeaders, originalHeaders) {
    /**
     * Construye un mapping de headers normalizados a campos del schema
     * Basado en las palabras clave detectadas
     */
    const mapping = {};

    const headerMap = {
      // Requeridos
      'sucursal': 'nombre',
      'nombre': 'nombre',
      'name': 'nombre',
      'direccion': 'direccion',
      'dirección': 'direccion',
      'address': 'direccion',
      'comuna': 'comuna',
      'ciudad': 'comuna',
      'city': 'comuna',
      'region': 'region',
      'región': 'region',
      'state': 'region',
      'provincia': 'region',
      'lat': 'lat',
      'latitude': 'lat',
      'latitud': 'lat',
      'lng': 'lng',
      'longitude': 'lng',
      'longitud': 'lng',
      'lon': 'lng',

      // Opcionales
      'horario': 'horario',
      'horarios': 'horario',
      'hours': 'horario',
      'schedule': 'horario',
      'telefono': 'telefono',
      'teléfono': 'telefono',
      'phone': 'telefono',
      'fono': 'telefono',
      'email': 'email',
      'correo': 'email',
      'e_mail': 'email',
      'contacto': 'email', // Mapear contacto a email si contiene @
      'correcto_contacto': 'email',
      'tipo_label': 'tipo_label',
      'tipo': 'tipo_label',
      'type': 'tipo_label',
      'label': 'tipo_label',

      // Campos Excel extras (ignorar por ahora)
      'cargo': null,
      'flag_venta': null,
      'flag_repuesto': null,
      'flag_servicio_tecnico': null,
      'telefono_ventas': null,
      'telefono_repuestos': null,
      'telefono_servicio': null,
      'para': null,
      'con_copia': null,
      'con_copia_oculta': null,
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
      return value;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return String(value).trim();
  },

  mapRowDataToSucursal(rowData, fieldMapping) {
    /**
     * Mapea datos de una fila al schema de sucursal
     * usando el field mapping detectado automáticamente
     */
    const mapped = {};

    Object.entries(fieldMapping).forEach(([originalHeader, schemaField]) => {
      if (!schemaField || !rowData[this.normalizeHeader(originalHeader)]) {
        return;
      }

      const normalizedHeader = this.normalizeHeader(originalHeader);
      const value = rowData[normalizedHeader];

      if (value === null || value === undefined) {
        return;
      }

      // Mapear a campo del schema
      if (schemaField === 'lat' || schemaField === 'lng') {
        mapped[schemaField] = value !== null ? parseFloat(value) : null;
      } else if (schemaField === 'email') {
        // Validar formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          mapped[schemaField] = value;
        }
      } else {
        mapped[schemaField] = value;
      }
    });

    return mapped;
  },

  mapToSucursalSchema(rowData) {
    /**
     * Método legacy: mapea usando patrones de nombres conocidos
     * Se mantiene para compatibilidad con código existente
     */
    const mapped = {};

    // Variantes de campo "nombre"
    const nombreField = ['nombre', 'name', 'sucursal', 'sucursal_nombre'].find(
      key => key in rowData
    );
    if (nombreField) {
      mapped.nombre = this.normalizeValue(rowData[nombreField], 'nombre');
    }

    // Variantes de campo "direccion"
    const direccionField = ['direccion', 'address', 'dirección'].find(
      key => key in rowData
    );
    if (direccionField) {
      mapped.direccion = this.normalizeValue(rowData[direccionField], 'direccion');
    }

    // Variantes de campo "comuna"
    const comunaField = ['comuna', 'city', 'ciudad'].find(
      key => key in rowData
    );
    if (comunaField) {
      mapped.comuna = this.normalizeValue(rowData[comunaField], 'comuna');
    }

    // Variantes de campo "region"
    const regionField = ['region', 'región', 'state', 'provincia'].find(
      key => key in rowData
    );
    if (regionField) {
      mapped.region = this.normalizeValue(rowData[regionField], 'region');
    }

    // Variantes de campo "lat"
    const latField = ['lat', 'latitude', 'latitud'].find(
      key => key in rowData
    );
    if (latField) {
      const val = this.normalizeValue(rowData[latField], 'lat');
      mapped.lat = val !== null ? parseFloat(val) : null;
    }

    // Variantes de campo "lng"
    const lngField = ['lng', 'longitude', 'longitud', 'lon'].find(
      key => key in rowData
    );
    if (lngField) {
      const val = this.normalizeValue(rowData[lngField], 'lng');
      mapped.lng = val !== null ? parseFloat(val) : null;
    }

    // Campos opcionales
    const telefonoField = ['telefono', 'teléfono', 'phone', 'fono'].find(
      key => key in rowData
    );
    if (telefonoField && rowData[telefonoField]) {
      mapped.telefono = this.normalizeValue(rowData[telefonoField], 'telefono');
    }

    const emailField = ['email', 'correo', 'e_mail'].find(
      key => key in rowData
    );
    if (emailField && rowData[emailField]) {
      mapped.email = this.normalizeValue(rowData[emailField], 'email');
    }

    const horarioField = ['horario', 'horarios', 'hours', 'schedule'].find(
      key => key in rowData
    );
    if (horarioField && rowData[horarioField]) {
      mapped.horario = this.normalizeValue(rowData[horarioField], 'horario');
    }

    const tipoField = ['tipo_label', 'tipo', 'type', 'label'].find(
      key => key in rowData
    );
    if (tipoField && rowData[tipoField]) {
      const val = this.normalizeValue(rowData[tipoField], 'tipo_label');
      const validTipos = ['Sala de ventas', 'Showroom Exclusivo', 'Servicio Técnico'];
      if (val && validTipos.includes(val)) {
        mapped.tipo_label = val;
      }
    }

    return mapped;
  },

  validateRow(rowData) {
    const errors = [];

    // Campos requeridos según schema
    const required = ['nombre', 'direccion', 'comuna', 'region', 'lat', 'lng'];

    for (const field of required) {
      if (!rowData[field]) {
        errors.push({
          field,
          message: `Campo requerido faltante: ${field}`,
        });
      }
    }

    // Validar números en lat/lng
    if (rowData.lat !== null && rowData.lat !== undefined) {
      if (isNaN(parseFloat(rowData.lat))) {
        errors.push({
          field: 'lat',
          message: `Latitud no es un número válido: ${rowData.lat}`,
        });
      }
    }

    if (rowData.lng !== null && rowData.lng !== undefined) {
      if (isNaN(parseFloat(rowData.lng))) {
        errors.push({
          field: 'lng',
          message: `Longitud no es un número válido: ${rowData.lng}`,
        });
      }
    }

    // Validar enum tipo_label si está presente
    if (rowData.tipo_label) {
      const validTipos = ['Sala de ventas', 'Showroom Exclusivo', 'Servicio Técnico'];
      if (!validTipos.includes(rowData.tipo_label)) {
        errors.push({
          field: 'tipo_label',
          message: `Tipo inválido: ${rowData.tipo_label}. Permitidos: ${validTipos.join(', ')}`,
        });
      }
    }

    return errors;
  },

  async confirm(file) {
    try {
      // 1. Obtener preview (parseo + validación)
      const preview = await this.preview(file);

      // 2. Inicializar acumuladores
      const created = [];
      const updated = [];
      const skipped = [];
      const errors = [];

      // 3. Procesar solo filas válidas
      for (const row of preview.rows) {
        try {
          const rowData = row.data;
          const rowNumber = row.rowNumber;

          // 3a. Validar que existan todos los campos requeridos
          const required = ['nombre', 'direccion', 'comuna', 'region', 'lat', 'lng'];
          const missingRequired = required.filter(field => !rowData[field]);

          if (missingRequired.length > 0) {
            errors.push({
              rowNumber,
              field: 'validation',
              message: `Campos requeridos faltantes: ${missingRequired.join(', ')}`,
            });
            continue;
          }

          // 3b. Preparar datos para Strapi (campos requeridos + opcionales válidos)
          // NOTA: NO incluir slug (Strapi lo genera automáticamente desde nombre)
          // NOTA: NO incluir imagen_portada, orden (no vienen en Excel)
          const strapiData = {
            nombre: rowData.nombre,
            direccion: rowData.direccion,
            comuna: rowData.comuna,
            region: rowData.region,
            lat: rowData.lat,
            lng: rowData.lng,
          };

          // Agregar campos opcionales solo si tienen valor
          if (rowData.horario) {
            strapiData.horario = rowData.horario;
          }

          if (rowData.tipo_label) {
            strapiData.tipo_label = rowData.tipo_label;
          }

          if (rowData.telefono) {
            strapiData.telefono = rowData.telefono;
          }

          if (rowData.email) {
            // Validar email básicamente
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(rowData.email)) {
              strapiData.email = rowData.email;
            }
          }

          // 4. Buscar sucursal existente por nombre + comuna (clave de búsqueda)
          // NOTA: Buscamos por nombre + comuna porque slug es autogenerado por Strapi
          // LIMITACIÓN: Si el nombre cambia entre imports, creará un nuevo registro
          // RECOMENDACIÓN FASE FUTURA: Usar identificador estable como código_sucursal, ID interno, o dirección + comuna
          const existingSucursales = await strapi.entityService.findMany(
            'api::sucursal.sucursal',
            {
              filters: {
                nombre: rowData.nombre,
                comuna: rowData.comuna,
              },
              limit: 1,
            }
          );

          if (existingSucursales && existingSucursales.length > 0) {
            // 5. ACTUALIZAR existente
            const id = existingSucursales[0].id;
            const existingSlug = existingSucursales[0].slug;

            // Limpiar datos para update: no sobrescribir con vacíos
            const updateData = this.cleanDataForUpdate(strapiData);

            await strapi.entityService.update('api::sucursal.sucursal', id, {
              data: updateData,
            });

            updated.push({
              rowNumber,
              id,
              slug: existingSlug,
            });
          } else {
            // 5. CREAR nuevo
            const newSucursal = await strapi.entityService.create(
              'api::sucursal.sucursal',
              {
                data: strapiData,
              }
            );

            created.push({
              rowNumber,
              id: newSucursal.id,
              slug: newSucursal.slug,
            });
          }
        } catch (rowError) {
          strapi.log.error(`Error procesando fila ${row.rowNumber}:`, rowError);
          errors.push({
            rowNumber: row.rowNumber,
            field: 'general',
            message: `Error al guardar: ${rowError.message}`,
          });
        }
      }

      // 6. Procesar filas inválidas (skipped)
      for (const error of preview.errors) {
        skipped.push({
          rowNumber: error.rowNumber,
          reason: `Campo "${error.field}": ${error.message}`,
        });
      }

      // 7. Construir reporte
      const result = {
        summary: {
          totalRows: preview.summary.totalRows,
          validRows: preview.summary.validRows,
          invalidRows: preview.summary.invalidRows,
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

      return result;
    } catch (error) {
      throw new Error(`Error al procesar confirmación: ${error.message}`);
    }
  },

  cleanDataForUpdate(data) {
    /**
     * Filtra datos para update: no incluir campos vacíos
     * Esto evita sobrescribir valores existentes con null/undefined/''
     */
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) =>
        value !== undefined && value !== null && value !== ''
      )
    );
  },

  async generateSlug(nombre) {
    /**
     * Genera slug de manera similar a Strapi UID
     * Strapi usa: lowercase, reemplaza espacios por -, remueve caracteres especiales
     */
    if (!nombre) return '';

    return nombre
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Espacios por guiones
      .replace(/[áàâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\-]/g, '') // Solo alfanuméricos y guiones
      .replace(/^-+|-+$/g, '') // Remover guiones al inicio/final
      .replace(/-+/g, '-'); // Colapsar múltiples guiones
  },
};
