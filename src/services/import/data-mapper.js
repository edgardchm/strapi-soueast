'use strict';

/**
 * Data Mapper Service
 * Handles column-to-field mapping and data transformation
 *
 * @returns {Object} Service with mapping methods
 */
module.exports = {
  /**
   * Mapping configuration for modelo-version imports
   * Maps common column names to internal field names
   */
  modeloVersionMappings: {
    // Nombre/Name
    'nombre': 'nombre',
    'name': 'nombre',
    'version': 'nombre',
    'producto': 'nombre',

    // Slug
    'slug': 'slug',
    'url_slug': 'slug',

    // Código/Code
    'codigo': 'codigo',
    'code': 'codigo',
    'sku': 'codigo',
    'codigo_interno': 'codigo',

    // Modelo
    'modelo': 'modelo',
    'modelo_nombre': 'modelo',
    'modelo_id': 'modelo',
    'vehiculo': 'modelo',

    // Precio Lista
    'precio_lista': 'precio_lista',
    'precio': 'precio_lista',
    'precio_base': 'precio_lista',
    'price': 'precio_lista',
    'list_price': 'precio_lista',

    // Bono Marca
    'bono_marca': 'bono_marca',
    'descuento_marca': 'bono_marca',
    'brand_discount': 'bono_marca',
    'brand_bonus': 'bono_marca',

    // Bono Financiamiento
    'bono_financiamiento': 'bono_financiamiento',
    'descuento_financiamiento': 'bono_financiamiento',
    'financing_discount': 'bono_financiamiento',
    'financing_bonus': 'bono_financiamiento',

    // Precio Final
    'precio_final': 'precio_final',
    'final_price': 'precio_final',
    'precio_venta': 'precio_final',
    'sale_price': 'precio_final',

    // Moneda
    'moneda': 'moneda',
    'currency': 'moneda',
    'divisa': 'moneda',

    // Transmisión
    'transmision': 'transmision',
    'transmission': 'transmision',
    'caja_cambios': 'transmision',

    // Motor
    'motor': 'motor',
    'engine': 'motor',
    'displacement': 'motor',

    // Combustible
    'combustible': 'combustible',
    'fuel': 'combustible',
    'tipo_combustible': 'combustible',
    'fuel_type': 'combustible',

    // Potencia
    'potencia': 'potencia',
    'power': 'potencia',
    'hp': 'potencia',
    'horsepower': 'potencia',

    // Torque
    'torque': 'torque',
    'torque_nm': 'torque',
    'nm': 'torque',

    // Consumo
    'consumo': 'consumo',
    'consumption': 'consumo',
    'mpg': 'consumo',
    'liters_per_100km': 'consumo',

    // Emisión CO2
    'emision_co2': 'emision_co2',
    'co2_emission': 'emision_co2',
    'co2': 'emision_co2',

    // Orden
    'orden': 'orden',
    'order': 'orden',
    'display_order': 'orden',
    'position': 'orden',

    // Activo
    'activo': 'activo',
    'active': 'activo',
    'enabled': 'activo',
    'status': 'activo',
  },

  /**
   * Mapping configuration for sucursal (dealership) imports
   */
  sucursalMappings: {
    // Nombre
    'nombre': 'nombre',
    'name': 'nombre',
    'sucursal': 'nombre',
    'branch_name': 'nombre',

    // Código
    'codigo': 'codigo',
    'code': 'codigo',
    'branch_code': 'codigo',

    // Ciudad
    'ciudad': 'ciudad',
    'city': 'ciudad',

    // Región
    'region': 'region',
    'state': 'region',
    'provincia': 'region',

    // Teléfono
    'telefono': 'telefono',
    'phone': 'telefono',
    'phone_number': 'telefono',

    // Email
    'email': 'email',
    'correo': 'email',
    'contact_email': 'email',

    // Dirección
    'direccion': 'direccion',
    'address': 'direccion',
    'street': 'direccion',

    // Latitud
    'latitud': 'latitud',
    'latitude': 'latitud',
    'lat': 'latitud',

    // Longitud
    'longitud': 'longitud',
    'longitude': 'longitud',
    'lon': 'longitud',

    // Horarios
    'horario_apertura': 'horario_apertura',
    'opening_hours': 'horario_apertura',
    'opening_time': 'horario_apertura',
    'open': 'horario_apertura',

    'horario_cierre': 'horario_cierre',
    'closing_hours': 'horario_cierre',
    'closing_time': 'horario_cierre',
    'close': 'horario_cierre',

    // Servicios
    'servicio_venta': 'servicio_venta',
    'venta': 'servicio_venta',
    'sales_service': 'servicio_venta',
    'offers_sales': 'servicio_venta',

    'servicio_servicio': 'servicio_servicio',
    'servicio': 'servicio_servicio',
    'service': 'servicio_servicio',
    'maintenance_service': 'servicio_servicio',

    'servicio_repuestos': 'servicio_repuestos',
    'repuestos': 'servicio_repuestos',
    'parts_service': 'servicio_repuestos',
    'spare_parts': 'servicio_repuestos',

    // Gerente
    'gerente_nombre': 'gerente_nombre',
    'manager_name': 'gerente_nombre',
    'manager': 'gerente_nombre',

    'gerente_email': 'gerente_email',
    'manager_email': 'gerente_email',

    'gerente_telefono': 'gerente_telefono',
    'manager_phone': 'gerente_telefono',

    // Activo
    'activo': 'activo',
    'active': 'activo',
    'enabled': 'activo',
    'status': 'activo',
  },

  /**
   * Map row columns to internal field names
   *
   * @param {Object} row - Data row from parser
   * @param {string} type - Collection type ('modelo-version' | 'sucursal')
   * @param {Object} customMappings - Optional custom column mappings
   *
   * @returns {Object} Mapped row with internal field names
   */
  mapRow(row, type, customMappings = {}) {
    const mappings = this._getMappings(type, customMappings);
    const mapped = {};

    Object.entries(row).forEach(([columnName, value]) => {
      const normalizedColumn = String(columnName)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      // Find matching field name
      const fieldName = mappings[normalizedColumn] || normalizedColumn;

      mapped[fieldName] = value;
    });

    return mapped;
  },

  /**
   * Map multiple rows
   *
   * @param {Array<Object>} rows - Data rows from parser
   * @param {string} type - Collection type
   * @param {Object} customMappings - Optional custom mappings
   *
   * @returns {Array<Object>} Array of mapped rows
   */
  mapRows(rows, type, customMappings = {}) {
    return rows.map((row, index) => {
      try {
        return {
          index,
          mapped: this.mapRow(row, type, customMappings),
          error: null,
        };
      } catch (error) {
        return {
          index,
          mapped: null,
          error: error.message,
        };
      }
    });
  },

  /**
   * Get all available mappings for a collection type
   *
   * @param {string} type - Collection type
   * @returns {Object} Mapping object
   */
  getMappings(type) {
    return this._getMappings(type);
  },

  /**
   * Suggest field name for a given column
   *
   * @param {string} column - Column name
   * @param {string} type - Collection type
   *
   * @returns {Object} { suggested: string|null, confidence: 'high'|'medium'|'low' }
   */
  suggestMapping(column, type) {
    const mappings = this._getMappings(type);
    const normalized = String(column)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    // Exact match
    if (mappings[normalized]) {
      return {
        suggested: mappings[normalized],
        confidence: 'high',
        column: normalized,
      };
    }

    // Partial match (Levenshtein distance)
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(mappings).forEach(([key, field]) => {
      const score = this._levenshteinSimilarity(normalized, key);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = field;
      }
    });

    if (bestMatch) {
      return {
        suggested: bestMatch,
        confidence: bestScore > 0.8 ? 'high' : 'medium',
        column: normalized,
        similarity: bestScore,
      };
    }

    return {
      suggested: null,
      confidence: 'low',
      column: normalized,
    };
  },

  /**
   * INTERNAL: Get mappings for type
   *
   * @private
   */
  _getMappings(type, customMappings = {}) {
    let baseMappings = {};

    if (type === 'modelo-version') {
      baseMappings = { ...this.modeloVersionMappings };
    } else if (type === 'sucursal') {
      baseMappings = { ...this.sucursalMappings };
    }

    return { ...baseMappings, ...customMappings };
  },

  /**
   * INTERNAL: Calculate string similarity (Levenshtein distance)
   *
   * @private
   */
  _levenshteinSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1)
      .fill(null)
      .map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);

    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  },

  /**
   * Build mapping report from headers and type
   *
   * @param {Array<string>} headers - Column headers from file
   * @param {string} type - Collection type
   *
   * @returns {Array<Object>} Mapping suggestions for each column
   */
  buildMappingReport(headers, type) {
    return headers.map((header) => {
      const suggestion = this.suggestMapping(header, type);
      return {
        column: header,
        ...suggestion,
      };
    });
  },
};
