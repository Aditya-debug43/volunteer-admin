const { createObjectCsvStringifier } = require('csv-writer');

/**
 * Generates CSV text with a UTF-8 BOM prefix.
 * The BOM is important: without it, Excel opens UTF-8 files as Latin-1 and
 * mangles non-ASCII characters (e.g. "—" becomes "â€"").
 * @param {Array<{id:string,title:string}>} header
 * @param {Array<Object>} records
 * @returns {string} CSV text (UTF-8 BOM + header + rows)
 */
function generateCSV(header, records) {
  const csv = createObjectCsvStringifier({ header });
  return '\uFEFF' + csv.getHeaderString() + csv.stringifyRecords(records);
}

module.exports = { generateCSV };
