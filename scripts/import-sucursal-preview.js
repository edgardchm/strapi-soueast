#!/usr/bin/env node
'use strict';

/**
 * Script local: Leer Excel de sucursales y mostrar preview en JSON
 *
 * Uso:
 *   node scripts/import-sucursal-preview.js ./docs/templates/sucursal-import-template.xlsx
 *
 * NO conecta a Strapi, NO toca base de datos.
 * Solo lee archivo local, normaliza headers, y muestra JSON.
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, msg) {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
  };
  console.log(`${prefix[type]} ${msg}`);
}

function normalizeHeader(header) {
  // Convertir a minúsculas, remover espacios, remover caracteres especiales
  return header
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
}

function normalizeValue(value, fieldName) {
  // Tipo null o undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Si es string, trimear
  if (typeof value === 'string') {
    value = value.trim();
    if (value === '' || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'na') {
      return null;
    }
    return value;
  }

  // Si es número, mantener
  if (typeof value === 'number') {
    return value;
  }

  // Para booleanos
  if (typeof value === 'boolean') {
    return value;
  }

  return String(value).trim();
}

function mapToSucursalSchema(rowData) {
  /**
   * Mapea campos del Excel al schema de sucursal
   * Schema requiere: nombre, direccion, comuna, region, lat, lng
   */

  const mapped = {};

  // Variantes de campo "nombre"
  const nombreField = ['nombre', 'name', 'sucursal', 'sucursal_nombre'].find(
    key => key in rowData
  );
  if (nombreField) {
    mapped.nombre = normalizeValue(rowData[nombreField], 'nombre');
  }

  // Variantes de campo "direccion"
  const direccionField = ['direccion', 'address', 'dirección'].find(
    key => key in rowData
  );
  if (direccionField) {
    mapped.direccion = normalizeValue(rowData[direccionField], 'direccion');
  }

  // Variantes de campo "comuna"
  const comunaField = ['comuna', 'city', 'ciudad'].find(
    key => key in rowData
  );
  if (comunaField) {
    mapped.comuna = normalizeValue(rowData[comunaField], 'comuna');
  }

  // Variantes de campo "region"
  const regionField = ['region', 'región', 'state', 'provincia'].find(
    key => key in rowData
  );
  if (regionField) {
    mapped.region = normalizeValue(rowData[regionField], 'region');
  }

  // Variantes de campo "lat"
  const latField = ['lat', 'latitude', 'latitud'].find(
    key => key in rowData
  );
  if (latField) {
    const val = normalizeValue(rowData[latField], 'lat');
    mapped.lat = val !== null ? parseFloat(val) : null;
  }

  // Variantes de campo "lng"
  const lngField = ['lng', 'longitude', 'longitud', 'lon'].find(
    key => key in rowData
  );
  if (lngField) {
    const val = normalizeValue(rowData[lngField], 'lng');
    mapped.lng = val !== null ? parseFloat(val) : null;
  }

  // Campos opcionales
  const telefonoField = ['telefono', 'teléfono', 'phone', 'fono'].find(
    key => key in rowData
  );
  if (telefonoField && rowData[telefonoField]) {
    mapped.telefono = normalizeValue(rowData[telefonoField], 'telefono');
  }

  const emailField = ['email', 'correo', 'e_mail'].find(
    key => key in rowData
  );
  if (emailField && rowData[emailField]) {
    mapped.email = normalizeValue(rowData[emailField], 'email');
  }

  const horarioField = ['horario', 'horarios', 'hours', 'schedule'].find(
    key => key in rowData
  );
  if (horarioField && rowData[horarioField]) {
    mapped.horario = normalizeValue(rowData[horarioField], 'horario');
  }

  const tipoField = ['tipo_label', 'tipo', 'type', 'label'].find(
    key => key in rowData
  );
  if (tipoField && rowData[tipoField]) {
    const val = normalizeValue(rowData[tipoField], 'tipo_label');
    // Validar contra enum
    const validTipos = ['Sala de ventas', 'Showroom Exclusivo', 'Servicio Técnico'];
    if (val && validTipos.includes(val)) {
      mapped.tipo_label = val;
    }
  }

  return mapped;
}

function validateRow(rowData) {
  const errors = [];

  // Campos requeridos
  const required = ['nombre', 'direccion', 'comuna', 'region', 'lat', 'lng'];
  for (const field of required) {
    if (!rowData[field]) {
      errors.push(`Campo requerido faltante: ${field}`);
    }
  }

  // Validar números en lat/lng
  if (rowData.lat && isNaN(parseFloat(rowData.lat))) {
    errors.push(`Latitude no es un número válido: ${rowData.lat}`);
  }

  if (rowData.lng && isNaN(parseFloat(rowData.lng))) {
    errors.push(`Longitude no es un número válido: ${rowData.lng}`);
  }

  return errors;
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    log('error', 'Se requiere ruta del archivo Excel');
    console.log('\nUso:');
    console.log('  node scripts/import-sucursal-preview.js ./docs/templates/sucursal.xlsx\n');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    log('error', `Archivo no encontrado: ${fullPath}`);
    process.exit(1);
  }

  log('info', `Leyendo archivo: ${fullPath}`);

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fullPath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      log('error', 'No se encontró ninguna hoja en el archivo Excel');
      process.exit(1);
    }

    log('success', `Hoja encontrada: "${worksheet.name}"`);

    // Obtener headers de la primera fila
    const headerRow = worksheet.getRow(1);
    if (!headerRow || !headerRow.values || headerRow.values.length === 0) {
      log('error', 'La primera fila está vacía o no contiene headers');
      process.exit(1);
    }

    const headers = headerRow.values
      .slice(1) // Ignorar primera posición (índice 0)
      .map((h, idx) => {
        const normalized = normalizeHeader(h);
        return normalized;
      });

    log('success', `Headers detectados (${headers.length}): ${headers.join(', ')}`);

    const rows = [];
    let emptyRowCount = 0;
    let errorRowCount = 0;

    // Procesar filas (comenzar desde fila 2)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const values = row.values ? row.values.slice(1) : [];

      // Detectar filas vacías
      const isEmpty = values.every(v => !v || v === '');
      if (isEmpty) {
        emptyRowCount++;
        return;
      }

      // Mapear valores a headers
      const rowData = {};
      headers.forEach((header, idx) => {
        if (idx < values.length) {
          rowData[header] = normalizeValue(values[idx], header);
        }
      });

      // Mapear a schema de sucursal
      const mapped = mapToSucursalSchema(rowData);

      // Validar
      const errors = validateRow(mapped);
      if (errors.length > 0) {
        errorRowCount++;
        mapped._errors = errors;
      }

      rows.push(mapped);
    });

    // Mostrar resumen
    console.log('\n' + colors.cyan + '=' + colors.reset.repeat(60));
    console.log(colors.cyan + 'RESUMEN DE LECTURA' + colors.reset);
    console.log(colors.cyan + '=' + colors.reset.repeat(60));

    log('info', `Total filas en archivo: ${worksheet.rowCount}`);
    log('info', `Total filas de datos: ${rows.length}`);
    log('warn', `Filas vacías omitidas: ${emptyRowCount}`);
    log('error', `Filas con errores: ${errorRowCount}`);

    // Mostrar preview JSON
    console.log('\n' + colors.cyan + 'PREVIEW JSON (primeras 3 filas)' + colors.reset);
    console.log(colors.cyan + '-' + colors.reset.repeat(60));

    const previewRows = rows.slice(0, 3);
    previewRows.forEach((row, idx) => {
      console.log(`\n${colors.blue}Fila ${idx + 1}:${colors.reset}`);
      console.log(JSON.stringify(row, null, 2));
    });

    if (rows.length > 3) {
      log('info', `... y ${rows.length - 3} filas más`);
    }

    // Mostrar errores si los hay
    if (errorRowCount > 0) {
      console.log('\n' + colors.yellow + 'ERRORES DETECTADOS' + colors.reset);
      console.log(colors.yellow + '-' + colors.reset.repeat(60));
      rows.forEach((row, idx) => {
        if (row._errors && row._errors.length > 0) {
          console.log(`${colors.red}Fila ${idx + 1}: ${colors.reset}`);
          row._errors.forEach(err => {
            console.log(`  • ${err}`);
          });
        }
      });
    }

    log('success', '\n✓ Preview completado exitosamente');
    console.log(
      `\nProximos pasos: Importar estos datos a Strapi cuando esté listo el endpoint.\n`
    );
  } catch (error) {
    log('error', `Error al procesar archivo: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
