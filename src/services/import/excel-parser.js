'use strict';

const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Excel Parser Service
 * Parses Excel (.xlsx) files and extracts structured data
 *
 * @returns {Object} Service with parseFile method
 */
module.exports = {
  /**
   * Parse Excel file and extract all sheets with data
   *
   * @param {string|Buffer} filePath - Path to Excel file or Buffer
   * @param {Object} options - Parser options
   * @param {number} options.headerRowIndex - Row index containing headers (default: 0)
   * @param {boolean} options.detectHeaders - Auto-detect header row (default: true)
   * @param {boolean} options.skipEmpty - Skip completely empty rows (default: true)
   * @param {number} options.maxRows - Max rows to parse (default: 10000)
   *
   * @returns {Promise<Array>} Array of sheet objects with data
   *
   * @example
   * const parser = strapi.service('api::import.excel-parser');
   * const sheets = await parser.parseFile('/path/to/file.xlsx');
   * // Returns: [
   * //   {
   * //     name: 'Vehicles',
   * //     headerRowIndex: 0,
   * //     headers: ['nombre', 'modelo', 'precio'],
   * //     rows: [
   * //       { nombre: 'Vehicle A', modelo: 'Model X', precio: '1000' },
   * //       { nombre: 'Vehicle B', modelo: 'Model Y', precio: '2000' }
   * //     ],
   * //     totalRows: 2,
   * //     emptyRowsSkipped: 0
   * //   }
   * // ]
   */
  async parseFile(filePath, options = {}) {
    const {
      headerRowIndex = 0,
      detectHeaders = true,
      skipEmpty = true,
      maxRows = 10000,
    } = options;

    try {
      // Create workbook from file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const sheets = [];
      let totalParsedRows = 0;

      // Process each worksheet
      for (const worksheet of workbook.worksheets) {
        if (!worksheet.rowCount || worksheet.rowCount === 0) {
          continue; // Skip empty sheets
        }

        // Find header row
        let actualHeaderRowIndex = headerRowIndex;
        let headers = [];

        if (detectHeaders) {
          actualHeaderRowIndex = this._detectHeaderRow(worksheet, headerRowIndex);
        }

        // Extract headers
        headers = this._extractHeaders(worksheet, actualHeaderRowIndex);

        if (headers.length === 0) {
          console.warn(`[ExcelParser] Sheet "${worksheet.name}" has no valid headers`);
          continue;
        }

        // Extract data rows
        const result = this._extractRows(
          worksheet,
          actualHeaderRowIndex,
          headers,
          skipEmpty,
          maxRows - totalParsedRows
        );

        totalParsedRows += result.rows.length;

        sheets.push({
          name: worksheet.name,
          headerRowIndex: actualHeaderRowIndex,
          headers,
          rows: result.rows,
          totalRows: result.rows.length,
          emptyRowsSkipped: result.emptyRowsSkipped,
        });

        // Stop if we've reached maxRows limit
        if (totalParsedRows >= maxRows) {
          console.warn(`[ExcelParser] Reached max rows limit (${maxRows})`);
          break;
        }
      }

      if (sheets.length === 0) {
        throw new Error('No valid sheets found in Excel file');
      }

      return sheets;
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  },

  /**
   * Parse a single sheet from file (convenience method)
   *
   * @param {string|Buffer} filePath - Path to Excel file
   * @param {string|number} sheetName - Sheet name or index
   * @param {Object} options - Parser options (same as parseFile)
   *
   * @returns {Promise<Object>} Single sheet object
   */
  async parseSheet(filePath, sheetName, options = {}) {
    const sheets = await this.parseFile(filePath, options);

    // Find sheet by name or index
    const sheet = typeof sheetName === 'number'
      ? sheets[sheetName]
      : sheets.find(s => s.name === sheetName || s.name.toLowerCase() === String(sheetName).toLowerCase());

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in Excel file`);
    }

    return sheet;
  },

  /**
   * Get list of sheet names from file
   *
   * @param {string|Buffer} filePath - Path to Excel file
   * @returns {Promise<Array>} Array of sheet names
   */
  async getSheetNames(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      return workbook.worksheets.map(ws => ws.name);
    } catch (error) {
      throw new Error(`Failed to read sheet names: ${error.message}`);
    }
  },

  /**
   * INTERNAL: Detect header row by finding first row with mostly string values
   *
   * @private
   */
  _detectHeaderRow(worksheet, startFromRow = 0) {
    for (let rowIndex = startFromRow; rowIndex < Math.min(startFromRow + 10, worksheet.rowCount); rowIndex++) {
      const row = worksheet.getRow(rowIndex + 1); // ExcelJS uses 1-based indexing

      if (!row || !row.values) continue;

      // Count string and number cells (potential headers)
      let headerLikeCells = 0;
      let totalCells = 0;

      for (let colIndex = 1; colIndex <= row.values.length; colIndex++) {
        const cell = row.getCell(colIndex);
        if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
          totalCells++;
          const type = typeof cell.value;
          if (type === 'string' || type === 'number') {
            headerLikeCells++;
          }
        }
      }

      // If >50% of non-empty cells are strings/numbers, likely a header row
      if (totalCells > 0 && headerLikeCells / totalCells > 0.5) {
        return rowIndex;
      }
    }

    return startFromRow; // Default to start row
  },

  /**
   * INTERNAL: Extract headers from worksheet row
   *
   * @private
   */
  _extractHeaders(worksheet, headerRowIndex) {
    const row = worksheet.getRow(headerRowIndex + 1); // ExcelJS uses 1-based indexing

    if (!row || !row.values) return [];

    const headers = [];

    for (let colIndex = 1; colIndex <= row.values.length; colIndex++) {
      const cell = row.getCell(colIndex);
      if (cell && cell.value) {
        // Normalize header: trim, lowercase, replace spaces with underscores
        const normalized = String(cell.value)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');

        if (normalized) {
          headers.push(normalized);
        }
      } else {
        headers.push(null); // Placeholder for empty header cells
      }
    }

    // Remove trailing null headers
    while (headers.length > 0 && headers[headers.length - 1] === null) {
      headers.pop();
    }

    return headers;
  },

  /**
   * INTERNAL: Extract data rows from worksheet
   *
   * @private
   */
  _extractRows(worksheet, headerRowIndex, headers, skipEmpty, maxRows) {
    const rows = [];
    let emptyRowsSkipped = 0;

    // Start from row after header
    const dataStartRow = headerRowIndex + 2; // +1 for 1-based indexing, +1 for header row
    const dataEndRow = Math.min(dataStartRow + maxRows, worksheet.rowCount);

    for (let rowIndex = dataStartRow; rowIndex <= dataEndRow; rowIndex++) {
      const row = worksheet.getRow(rowIndex);

      if (!row) continue;

      // Extract cell values
      const values = [];
      let hasData = false;

      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const cell = row.getCell(colIndex + 1); // ExcelJS uses 1-based indexing
        let value = null;

        if (cell && cell.value !== null && cell.value !== undefined) {
          value = this._normalizeValue(cell.value);
          if (value !== '' && value !== null) {
            hasData = true;
          }
        }

        values.push(value);
      }

      // Skip completely empty rows
      if (!hasData && skipEmpty) {
        emptyRowsSkipped++;
        continue;
      }

      // Create object mapping headers to values
      const rowObj = {};
      headers.forEach((header, index) => {
        if (header !== null) {
          rowObj[header] = values[index];
        }
      });

      rows.push(rowObj);

      if (rows.length >= maxRows) break;
    }

    return { rows, emptyRowsSkipped };
  },

  /**
   * INTERNAL: Normalize cell value
   *
   * @private
   */
  _normalizeValue(value) {
    if (value === null || value === undefined) {
      return null;
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Convert to string and trim
    const str = String(value).trim();

    // Empty string becomes null
    if (str === '' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'null') {
      return null;
    }

    return str;
  },
};
