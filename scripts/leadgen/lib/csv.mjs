/**
 * Delimited-file reading and writing, tolerant of what a state agency actually ships.
 *
 * DBPR's licensee extracts change shape between boards and between refreshes —
 * comma one quarter, pipe or tab the next, with column names that drift
 * ("Business Name" vs "DBA Name" vs "Company"). Hardcoding column positions
 * against a file we cannot see would silently produce garbage rows, so the
 * parser reads the header and maps columns by name, then reports exactly which
 * required field it could not find. A loud failure beats 800 malformed leads.
 */
import { squash } from './text.mjs';

const DELIMITERS = [',', '|', '\t', ';'];

/** Pick the delimiter that splits the header into the most fields. */
export function detectDelimiter(headerLine) {
  let best = ',';
  let bestCount = 0;
  for (const candidate of DELIMITERS) {
    const count = splitLine(headerLine, candidate).length;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

/** Split one line, honouring RFC4180 double-quoted fields with escaped quotes. */
function splitLine(line, delimiter) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parse delimited text into row objects keyed by header name.
 * Rows with a different field count than the header are still returned — the
 * caller decides whether a short row is fatal — but are flagged via `_ragged`.
 */
export function parseDelimited(text, options = {}) {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = clean.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = options.delimiter ?? detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map((header) => squash(header));

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = splitLine(lines[i], delimiter);
    const row = {};
    for (let c = 0; c < headers.length; c += 1) {
      row[headers[c]] = squash(values[c] ?? '');
    }
    if (values.length !== headers.length) row._ragged = true;
    rows.push(row);
  }
  return { headers, rows, delimiter };
}

/** Header text reduced to letters+digits so 'Business Name' matches 'business_name'. */
function headerKey(header) {
  return squash(header)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Map logical field names onto whatever the file actually calls them.
 *
 * `spec` is { logicalName: [candidate, candidate, …] }. Candidates are tried as
 * exact normalized matches first, then as substring matches, so a column named
 * "PRIMARY BUSINESS NAME" still satisfies the candidate "BUSINESSNAME".
 */
export function buildHeaderMap(headers, spec) {
  const normalized = headers.map((header) => ({ header, key: headerKey(header) }));
  const mapping = {};

  for (const [logical, candidates] of Object.entries(spec)) {
    const keys = candidates.map(headerKey);
    let match = normalized.find((entry) => keys.includes(entry.key));
    if (!match) {
      match = normalized.find((entry) =>
        keys.some((key) => key.length >= 4 && entry.key.includes(key))
      );
    }
    if (match) mapping[logical] = match.header;
  }
  return mapping;
}

/** Names in `required` that `mapping` could not resolve. */
export function missingFields(mapping, required) {
  return required.filter((field) => !mapping[field]);
}

/** Serialize rows to CSV, quoting only what needs it. */
export function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escape(row[column])).join(','));
  }
  return `${lines.join('\n')}\n`;
}
