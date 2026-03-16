import rawCsv from './GWONG(JEBEL ZONE).csv?raw';

const keyMap = {
    'METER NO': 'meterNo',
    'CUS NAME': 'customerName',
    'DEPOSIT': 'deposit',
    'CONTRACT NO': 'contractNo',
    'CONTRACT DATE': 'contractDate',
    'RECEIPT N0': 'receiptNo',
    'HOUSE /PLOT NO': 'housePlotNo',
    'ADDRESS/BLOCK': 'addressBlock',
    'TARIFF': 'customerType',
    'TEL': 'tel',
    'INSTIAL_READING': 'initialReading',
};

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }

    result.push(current);
    return result;
}

function parseCsvToJson(csv) {
    const lines = csv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine).map((h) => h.trim());

    const rows = lines.slice(1);

    return rows
        .map((line) => parseCsvLine(line))
        .filter((cols) => cols.some((c) => c.trim() !== ''))
        .map((cols) => {
            const obj = {};
            headers.forEach((header, idx) => {
                const key = keyMap[header] ?? header;
                const raw = cols[idx] ?? '';
                const value = raw.trim();
                obj[key] = value === '' ? null : value;
            });
            return obj;
        });
}

export const customers = parseCsvToJson(rawCsv);

