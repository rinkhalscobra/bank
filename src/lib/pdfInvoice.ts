import type { BrandingSettings } from '../contexts/BrandingContext';

export type InvoiceField = {
  label: string;
  value: string | number | null | undefined;
};

export type PdfInvoiceDocument = {
  amount: string;
  date: string;
  documentTitle: string;
  fields: InvoiceField[];
  invoiceNumber: string;
  notes?: string;
  referenceId: string;
  sectionTitle: string;
  status: string;
  subtitle: string;
  title: string;
};

type PdfBuilder = {
  commands: string[];
  line: (x1: number, y1: number, x2: number, y2: number, color?: string, width?: number) => void;
  rect: (x: number, y: number, width: number, height: number, fill?: string, stroke?: string, lineWidth?: number) => void;
  text: (value: string, x: number, y: number, size: number, font?: 'F1' | 'F2', color?: string) => void;
};

export function sanitizeInvoiceValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

export function wrapPdfText(value: string, maxLength: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    if (word.length > maxLength) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (let index = 0; index < word.length; index += maxLength) {
        lines.push(word.slice(index, index + maxLength));
      }
      return;
    }

    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function createPdfBuilder(): PdfBuilder {
  const commands: string[] = [];

  return {
    commands,
    rect(x, y, width, height, fill = '', stroke = '', lineWidth = 1) {
      if (fill) commands.push(`${fill} rg`);
      if (stroke) commands.push(`${stroke} RG ${lineWidth} w`);
      commands.push(`${x} ${y} ${width} ${height} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}`);
    },
    line(x1, y1, x2, y2, color = '0.82 0.88 0.92', width = 0.8) {
      commands.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
    },
    text(value, x, y, size, font = 'F1', color = '0.09 0.13 0.22') {
      commands.push(`${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`);
    },
  };
}

function randomInvoiceSuffix(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

export function createTrxInvoiceNumber() {
  return `TRX-${randomInvoiceSuffix()}`;
}

function getMode(data: string) {
  if (/^\d+$/.test(data)) return 1;
  if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return 2;
  return 4;
}

function encodeQrData(data: string): number[] {
  const mode = getMode(data);
  const bits: number[] = [];

  function push(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  }

  if (mode === 4) {
    push(4, 4);
    push(data.length, 8);
    for (let i = 0; i < data.length; i++) push(data.charCodeAt(i), 8);
  } else if (mode === 1) {
    push(1, 4);
    push(data.length, 10);
    for (let i = 0; i < data.length - 1; i += 3) {
      const group = data.substring(i, Math.min(i + 3, data.length));
      push(parseInt(group, 10), group.length === 3 ? 10 : group.length === 2 ? 7 : 4);
    }
  } else {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    push(2, 4);
    push(data.length, 9);
    for (let i = 0; i < data.length - 1; i += 2) {
      push(alphabet.indexOf(data[i]) * 45 + alphabet.indexOf(data[i + 1]), 11);
    }
    if (data.length % 2 === 1) push(alphabet.indexOf(data[data.length - 1]), 6);
  }

  return bits;
}

function getQrVersion(dataLength: number) {
  const capacities = [0, 152, 272, 440, 640, 864, 1088, 1368, 1672, 2040, 2336];
  for (let version = 1; version < capacities.length; version++) {
    if (dataLength <= capacities[version]) return version;
  }
  return 10;
}

function getQrEcInfo(version: number) {
  const table: Record<number, [number, number, number]> = {
    1: [7, 1, 19],
    2: [10, 1, 34],
    3: [15, 1, 55],
    4: [20, 1, 80],
    5: [26, 1, 108],
    6: [18, 2, 68],
    7: [20, 2, 78],
    8: [24, 2, 97],
    9: [30, 2, 116],
    10: [18, 4, 68],
  };

  const [ecPerBlock, numBlocks, totalDataCW] = table[version] || table[1];
  return { ecPerBlock, numBlocks, totalDataCW };
}

function rsEncode(data: number[], ecLen: number): number[] {
  const log: number[] = new Array(256);
  const exp: number[] = new Array(512);
  let value = 1;

  for (let i = 0; i < 255; i++) {
    exp[i] = value;
    log[value] = i;
    value <<= 1;
    if (value >= 256) value ^= 0x11d;
  }

  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];

  const generator: number[] = new Array(ecLen + 1).fill(0);
  generator[0] = 1;

  for (let i = 0; i < ecLen; i++) {
    for (let j = ecLen; j > 0; j--) {
      generator[j] = generator[j - 1] ^ (generator[j] === 0 ? 0 : exp[log[generator[j]] + i]);
    }
    generator[0] = generator[0] === 0 ? 0 : exp[log[generator[0]] + i];
  }

  const message = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coefficient = message[i];
    if (coefficient !== 0) {
      for (let j = 0; j <= ecLen; j++) {
        if (generator[j] !== 0) {
          message[i + j] ^= exp[log[generator[j]] + log[coefficient]];
        }
      }
    }
  }

  return message.slice(data.length);
}

function createQrMatrix(version: number): number[][] {
  const size = version * 4 + 17;
  return Array.from({ length: size }, () => new Array(size).fill(-1));
}

function placeFinderPattern(matrix: number[][], row: number, column: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const matrixRow = row + r;
      const matrixColumn = column + c;

      if (
        matrixRow < 0 ||
        matrixRow >= matrix.length ||
        matrixColumn < 0 ||
        matrixColumn >= matrix.length
      ) {
        continue;
      }

      if (
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      ) {
        matrix[matrixRow][matrixColumn] = 1;
      } else {
        matrix[matrixRow][matrixColumn] = 0;
      }
    }
  }
}

function placeAlignmentPattern(matrix: number[][], row: number, column: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (matrix[row + r][column + c] !== -1) return;
    }
  }

  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[row + r][column + c] = 1;
      } else {
        matrix[row + r][column + c] = 0;
      }
    }
  }
}

function getAlignmentPositions(version: number): number[] {
  if (version <= 1) return [];

  const positions: number[][] = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
  ];

  return positions[version] || [];
}

function placeTimingPatterns(matrix: number[][]) {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === -1) matrix[6][i] = i % 2 === 0 ? 1 : 0;
    if (matrix[i][6] === -1) matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }
}

function reserveFormatInfo(matrix: number[][]) {
  const size = matrix.length;
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === -1) matrix[8][i] = 0;
    if (matrix[i][8] === -1) matrix[i][8] = 0;
  }

  matrix[8][8] = 0;

  for (let i = 0; i < 7; i++) {
    if (matrix[8][size - 1 - i] === -1) matrix[8][size - 1 - i] = 0;
    if (matrix[size - 1 - i][8] === -1) matrix[size - 1 - i][8] = 0;
  }

  matrix[size - 8][8] = 1;
}

function placeQrData(matrix: number[][], bits: number[]) {
  const size = matrix.length;
  let bitIndex = 0;
  let upward = true;
  let column = size - 1;

  while (column >= 0) {
    if (column === 6) column--;

    for (let row = 0; row < size; row++) {
      const targetRow = upward ? size - 1 - row : row;
      for (let offset = 0; offset < 2; offset++) {
        const targetColumn = column - offset;
        if (targetColumn < 0) continue;
        if (matrix[targetRow][targetColumn] !== -1) continue;
        matrix[targetRow][targetColumn] = bitIndex < bits.length ? bits[bitIndex++] : 0;
      }
    }

    upward = !upward;
    column -= 2;
  }
}

function applyMask(matrix: number[][], reserved: number[][], maskId: number) {
  const size = matrix.length;
  const mask = (row: number, column: number) => {
    switch (maskId) {
      case 0: return (row + column) % 2 === 0;
      case 1: return row % 2 === 0;
      case 2: return column % 3 === 0;
      case 3: return (row + column) % 3 === 0;
      case 4: return (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0;
      case 5: return (row * column) % 2 + (row * column) % 3 === 0;
      case 6: return ((row * column) % 2 + (row * column) % 3) % 2 === 0;
      case 7: return ((row + column) % 2 + (row * column) % 3) % 2 === 0;
      default: return false;
    }
  };

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (reserved[row][column] !== -1) continue;
      if (mask(row, column)) matrix[row][column] ^= 1;
    }
  }
}

function writeFormatInfo(matrix: number[][], maskId: number) {
  const formatInfos = [
    0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
    0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
  ];
  const formatInfo = formatInfos[8 + maskId];
  const size = matrix.length;
  const bits: number[] = [];

  for (let i = 14; i >= 0; i--) bits.push((formatInfo >> i) & 1);

  const primaryPositions = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  const secondaryPositions = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4], [8, size - 5],
    [8, size - 6], [8, size - 7], [size - 7, 8], [size - 6, 8], [size - 5, 8],
    [size - 4, 8], [size - 3, 8], [size - 2, 8], [size - 1, 8], [size - 8, 8],
  ];

  for (let i = 0; i < 15; i++) {
    matrix[primaryPositions[i][0]][primaryPositions[i][1]] = bits[i];
    matrix[secondaryPositions[i][0]][secondaryPositions[i][1]] = bits[i];
  }
}

function getPenalty(matrix: number[][]) {
  const size = matrix.length;
  let score = 0;

  for (let row = 0; row < size; row++) {
    let run = 1;
    for (let column = 1; column < size; column++) {
      if (matrix[row][column] === matrix[row][column - 1]) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else {
        run = 1;
      }
    }
  }

  for (let column = 0; column < size; column++) {
    let run = 1;
    for (let row = 1; row < size; row++) {
      if (matrix[row][column] === matrix[row - 1][column]) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else {
        run = 1;
      }
    }
  }

  return score;
}

function generateQrMatrix(data: string) {
  const bits = encodeQrData(data);
  const version = getQrVersion(bits.length);
  const { ecPerBlock, numBlocks, totalDataCW } = getQrEcInfo(version);

  bits.push(0, 0, 0, 0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (codewords.length < totalDataCW) {
    codewords.push(padBytes[padIndex % 2]);
    padIndex++;
  }

  const codewordsPerBlock = Math.floor(totalDataCW / numBlocks);
  const dataBlocks: number[][] = [];
  let offset = 0;

  for (let block = 0; block < numBlocks; block++) {
    dataBlocks.push(codewords.slice(offset, offset + codewordsPerBlock));
    offset += codewordsPerBlock;
  }

  while (offset < totalDataCW) {
    dataBlocks[dataBlocks.length - 1].push(codewords[offset++]);
  }

  const errorBlocks = dataBlocks.map((block) => rsEncode(block, ecPerBlock));
  const interleaved: number[] = [];
  const maxDataLength = Math.max(...dataBlocks.map((block) => block.length));

  for (let index = 0; index < maxDataLength; index++) {
    for (const block of dataBlocks) {
      if (index < block.length) interleaved.push(block[index]);
    }
  }

  for (let index = 0; index < ecPerBlock; index++) {
    for (const block of errorBlocks) {
      if (index < block.length) interleaved.push(block[index]);
    }
  }

  const allBits: number[] = [];
  for (const codeword of interleaved) {
    for (let bit = 7; bit >= 0; bit--) allBits.push((codeword >> bit) & 1);
  }

  const matrix = createQrMatrix(version);
  const size = matrix.length;

  placeFinderPattern(matrix, 0, 0);
  placeFinderPattern(matrix, 0, size - 7);
  placeFinderPattern(matrix, size - 7, 0);

  const alignmentPositions = getAlignmentPositions(version);
  for (const row of alignmentPositions) {
    for (const column of alignmentPositions) {
      placeAlignmentPattern(matrix, row, column);
    }
  }

  placeTimingPatterns(matrix);
  reserveFormatInfo(matrix);

  const reserved = matrix.map((row) => [...row]);
  placeQrData(matrix, allBits);

  let bestMask = 0;
  let bestPenalty = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const testMatrix = matrix.map((row) => [...row]);
    applyMask(testMatrix, reserved, mask);
    writeFormatInfo(testMatrix, mask);
    const penalty = getPenalty(testMatrix);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
  }

  applyMask(matrix, reserved, bestMask);
  writeFormatInfo(matrix, bestMask);

  return matrix;
}

function drawQrCode(builder: PdfBuilder, data: string, x: number, y: number, size: number) {
  const matrix = generateQrMatrix(data);
  const modules = matrix.length;
  const quiet = 4;
  const total = modules + quiet * 2;
  const inset = 8;
  const drawableSize = size - inset * 2;
  const cell = drawableSize / total;

  builder.rect(x, y, size, size, '1 1 1', '0.83 0.87 0.95', 0.8);

  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (matrix[row][column] !== 1) continue;

      builder.rect(
        x + inset + (column + quiet) * cell,
        y + inset + drawableSize - (row + quiet + 1) * cell,
        cell,
        cell,
        '0 0 0'
      );
    }
  }
}

export function createProfessionalInvoicePdf(invoice: PdfInvoiceDocument, branding: BrandingSettings) {
  const builder = createPdfBuilder();
  const brandGreen = '0.00 0.39 0.27';
  const brandGreenLight = '0.82 0.90 0.87';
  const brandGreenSoft = '0.94 0.98 0.96';
  const accentText = '0.35 0.41 0.55';
  const qrPayload = [
    `INV:${invoice.invoiceNumber}`,
    `REF:${invoice.referenceId}`,
    `DATE:${invoice.date}`,
    `AMT:${invoice.amount}`,
  ].join('|');
  const referenceLines = wrapPdfText(`Reference: ${invoice.referenceId}`, 34);
  const titleLines = wrapPdfText(invoice.title, 34);
  const detailsBoxHeight = 132 + Math.max(0, referenceLines.length - 1) * 14;
  const detailsBoxTopY = 636;
  const detailsBoxBottomY = detailsBoxTopY - detailsBoxHeight;
  const statusY = 566 - referenceLines.length * 13 - 6;
  const issuedY = statusY - 18;
  const qrSize = 146;
  const qrY = detailsBoxTopY - qrSize;
  const titleTopY = 450;
  const titleLineHeight = 18;
  const titleBottomY = titleTopY - (titleLines.length - 1) * titleLineHeight - 12;
  const tableHeaderY = titleBottomY - 42;
  const lineItemY = tableHeaderY - 84;
  const totalRowY = lineItemY - 56;
  const notesTopY = totalRowY - 12;
  const notesBottomY = 132;
  const notesHeight = notesTopY - notesBottomY;
  const noteLines = wrapPdfText(
    invoice.notes || `Official ${invoice.documentTitle.toLowerCase()} generated for customer records.`,
    82
  );

  builder.rect(0, 662, 612, 130, brandGreen);
  builder.text(branding.brandName.toUpperCase(), 42, 732, 24, 'F2', '1 1 1');
  builder.text(invoice.documentTitle, 42, 700, 30, 'F2', '1 1 1');
  builder.text(invoice.documentTitle, 420, 722, 14, 'F2', '1 1 1');
  builder.text(`Date: ${invoice.date}`, 420, 702, 12, 'F2', '1 1 1');

  builder.rect(42, detailsBoxBottomY, 354, detailsBoxHeight, '1 1 1', brandGreenLight);
  builder.text(invoice.sectionTitle, 58, 606, 13, 'F2', '0 0 0');
  builder.text(`Invoice No.: ${invoice.invoiceNumber}`, 58, 584, 11, 'F1', accentText);
  referenceLines.forEach((line, index) => {
    builder.text(line, 58, 566 - index * 13, 11, 'F1', accentText);
  });
  builder.text(`Status: ${invoice.status}`, 58, statusY, 11, 'F1', accentText);
  builder.text(`Issued: ${invoice.date}`, 58, issuedY, 11, 'F1', accentText);

  builder.text('SCAN TO VERIFY', 442, 614, 9, 'F2', brandGreen);
  drawQrCode(builder, qrPayload, 424, qrY, qrSize);

  titleLines.forEach((line, index) => {
    builder.text(line, 42, titleTopY - index * titleLineHeight, 18, 'F2', '0.09 0.13 0.22');
  });
  builder.rect(42, tableHeaderY, 528, 44, brandGreen);
  builder.text('Description', 60, tableHeaderY + 18, 12, 'F2', '1 1 1');
  builder.text('Amount', 470, tableHeaderY + 18, 12, 'F2', '1 1 1');

  builder.rect(42, lineItemY, 528, 84, '1 1 1', brandGreenLight);
  builder.text(invoice.title, 60, lineItemY + 42, 12, 'F1', '0.18 0.21 0.29');
  builder.text(invoice.amount, 470, lineItemY + 42, 12, 'F1', '0.18 0.21 0.29');
  builder.line(430, lineItemY, 430, tableHeaderY, '0.86 0.90 0.96', 0.7);

  builder.rect(42, totalRowY, 528, 56, brandGreenSoft);
  builder.text('Total Amount', 60, totalRowY + 23, 13, 'F2', brandGreen);
  builder.text(invoice.amount, 446, totalRowY + 23, 13, 'F2', brandGreen);

  builder.rect(42, notesBottomY, 528, notesHeight, '1 1 1', brandGreenLight, 0.8);
  builder.text('Notes', 58, notesTopY - 24, 13, 'F2', '0 0 0');
  noteLines.forEach((line, index) => {
    builder.text(line, 58, notesTopY - 48 - index * 14, 11, 'F1', accentText);
  });

  const stream = builder.commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}
