'use strict';

const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

/**
 * CSV Parser Service
 * Parses CSV files and extracts structured data
 *
 * @returns {Object} Service with parseFile method
 */
module.exports = {
  /**
   * Parse CSV file and extract data
   *
   * @param {string|Buffer} filePath - Path to CSV file or Buffer
   * @param {Object} options - Parser options
   * @param {string} options.delimiter - Field delimiter (auto-detect by default)
   * @param {number} options.headerRowIndex - Row index containing headers (default: 0)
   * @param {boolean} options.skipEmpty - Skip completely empty rows (default: true)
   * @param {number} options.maxRows - Max rows to parse (default: 10000)
   * @param {string} options.encoding - File encoding (default: 'utf-8')
   *
   * @returns {Promise<Object>} Parsed data object
   *
   * @example
   * const parser = strapi.service('api::import.csv-parser');
   * const result = await parser.parseFile('/path/to/file.csv', {
   *   delimiter: ',',
   *   maxRows: 1000
   * });
   * // Returns: {
   * //   headers: ['nombre', 'modelo', 'precio'],
   * //   rows: [
   * //     { nombre: 'Vehicle A', modelo: 'Model X', precio: '1000' },
   * //     { nombre: 'Vehicle B', modelo: 'Model Y', precio: '2000' }
   * //   ],
   * //   totalRows: 2,
   * //   emptyRowsSkipped: 0,
   * //   delimiter: ',',
   * //   lineCount: 3
   * // }
   */
  async parseFile(filePath, options = {}) {
    const {
      delimiter = undefined, // Auto-detect
      headerRowIndex = 0,
      skipEmpty = true,
      maxRows = 10000,
      encoding = 'utf-8',
    } = options;

    try {
      // Read file
      let fileContent;
      if (typeof filePath === 'string') {
        fileContent = fs.readFileSync(filePath, encoding);
      } else if (Buffer.isBuffer(filePath)) {
        fileContent = filePath.toString(encoding);
      } else {
        throw new Error('filePath must be a string path or Buffer');
      }

      // Parse CSV using papaparse
      const parseResult = await new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
          header: false, // We'll handle headers manually
          dynamicTyping: false, // Keep all as strings initially
          skipEmptyLines: false, // We'll handle empty lines ourselves
          delimiter: delimiter || undefined,
          complete: (results) => resolve(results),
          error: (error) => reject(error),
        });
      });

      if (!parseResult.data || parseResult.data.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Extract headers from specified row
      if (headerRowIndex >= parseResult.data.length) {
        throw new Error(`Header row index ${headerRowIndex} exceeds file rows`);
      }

      const headerRow = parseResult.data[headerRowIndex];
      const headers = this._normalizeHeaders(headerRow);

      if (headers.length === 0) {
        throw new Error('No valid headers found in CSV file');
      }

      // Detect actual delimiter if not provided
      const detectedDelimiter = this._detectDelimiter(parseResult, headerRow);

      // Extract data rows
      const result = this._extractRows(
        parseResult.data,
        headerRowIndex,
        headers,
        skipEmpty,
        maxRows
      );

      return {
        headers,
        rows: result.rows,
        totalRows: result.rows.length,
        emptyRowsSkipped: result.emptyRowsSkipped,
        delimiter: detectedDelimiter,
        lineCount: parseResult.data.length,
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${error.message}`);
    }
  },

  /**
   * Parse CSV buffer
   *
   * @param {Buffer} buffer - CSV file buffer
   * @param {Object} options - Parser options (same as parseFile)
   * @returns {Promise<Object>} Parsed data
   */
  async parseBuffer(buffer, options = {}) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('Input must be a Buffer');
    }

    try {
      const tempFile = path.join(require('os').tmpdir(), `csv-${Date.now()}.csv`);
      fs.writeFileSync(tempFile, buffer);

      const result = await this.parseFile(tempFile, options);

      // Clean up temp file
      fs.unlinkSync(tempFile);

      return result;
    } catch (error) {
      throw new Error(`Failed to parse CSV buffer: ${error.message}`);
    }
  },

  /**
   * INTERNAL: Normalize headers
   *
   * @private
   */
  _normalizeHeaders(headerRow) {
    if (!Array.isArray(headerRow)) {
      return [];
    }

    return headerRow
      .map((header) => {
        if (!header) return null;

        return String(header)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      })
      .filter(h => h !== null && h !== '');
  },

  /**
   * INTERNAL: Detect delimiter by analyzing header row
   *
   * @private
   */
  _detectDelimiter(parseResult, headerRow) {
    // If header row has multiple columns, use the detected delimiter
    if (Array.isArray(headerRow) && headerRow.length > 1) {
      // Default to comma for CSV
      return ',';
    }

    // Otherwise try semicolon (common in European CSVs)
    return ';';
  },

  /**
   * INTERNAL: Extract data rows
   *
   * @private
   */
  _extractRows(data, headerRowIndex, headers, skipEmpty, maxRows) {
    const rows = [];
    let emptyRowsSkipped = 0;

    // Start from row after header
    for (let i = headerRowIndex + 1; i < data.length && rows.length < maxRows; i++) {
      const rowData = data[i];

      if (!Array.isArray(rowData)) continue;

      // Check if row is empty
      const hasData = rowData.some(cell => cell && String(cell).trim() !== '');

      if (!hasData && skipEmpty) {
        emptyRowsSkipped++;
        continue;
      }

      // Create object mapping headers to values
      const rowObj = {};
      headers.forEach((header, index) => {
        const value = this._normalizeValue(rowData[index]);
        rowObj[header] = value;
      });

      rows.push(rowObj);
    }

    return { rows, emptyRowsSkipped };
  },

  /**
   * INTERNAL: Normalize cell value
   *
   * @private
   */
  _normalizeValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Trim whitespace
    const str = String(value).trim();

    // Special cases
    if (str === '' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'null') {
      return null;
    }

    return str;
  },

  /**
   * Detect delimiter from CSV content
   * Useful for auto-detecting delimiter without full parsing
   *
   * @param {string} content - CSV content
   * @returns {string} Detected delimiter
   */
  detectDelimiter(content) {
    const delimiters = [',', ';', '\t', '|'];
    const lines = content.split('\n').slice(0, 3); // Check first 3 lines

    let maxScore = 0;
    let bestDelimiter = ',';

    for (const delimiter of delimiters) {
      let score = 0;

      for (const line of lines) {
        const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
        if (count > 0) score += count;
      }

      if (score > maxScore) {
        maxScore = score;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  },
};
