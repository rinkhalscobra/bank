import { useEffect, useRef } from 'react';

const EC_LEVEL = 1;

function getMode(data: string) {
  if (/^\d+$/.test(data)) return 1;
  if (/^[0-9A-Z $%*+\-./:]+$/.test(data)) return 2;
  return 4;
}

function encode(data: string): number[] {
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
      const g = data.substring(i, Math.min(i + 3, data.length));
      push(parseInt(g, 10), g.length === 3 ? 10 : g.length === 2 ? 7 : 4);
    }
  } else {
    const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
    push(2, 4);
    push(data.length, 9);
    for (let i = 0; i < data.length - 1; i += 2) {
      push(ALPHANUMERIC.indexOf(data[i]) * 45 + ALPHANUMERIC.indexOf(data[i + 1]), 11);
    }
    if (data.length % 2 === 1) push(ALPHANUMERIC.indexOf(data[data.length - 1]), 6);
  }

  return bits;
}

function getVersion(dataLen: number): number {
  const capacities = [0, 152, 272, 440, 640, 864, 1088, 1368, 1672, 2040, 2336];
  for (let v = 1; v < capacities.length; v++) {
    if (dataLen <= capacities[v]) return v;
  }
  return 10;
}

function getECInfo(version: number) {
  const table: Record<number, [number, number, number]> = {
    1: [7, 1, 19], 2: [10, 1, 34], 3: [15, 1, 55], 4: [20, 1, 80],
    5: [26, 1, 108], 6: [18, 2, 68], 7: [20, 2, 78], 8: [24, 2, 97],
    9: [30, 2, 116], 10: [18, 4, 68],
  };
  const [ecPerBlock, numBlocks, totalDataCW] = table[version] || table[1];
  return { ecPerBlock, numBlocks, totalDataCW };
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const LOG: number[] = new Array(256);
  const EXP: number[] = new Array(256);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v >= 256) v ^= 0x11d;
  }
  EXP[255] = EXP[0];
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function rsEncode(data: number[], ecLen: number): number[] {
  const LOG: number[] = new Array(256);
  const EXP: number[] = new Array(512);
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v >= 256) v ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

  const gen: number[] = new Array(ecLen + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < ecLen; i++) {
    for (let j = ecLen; j > 0; j--) {
      gen[j] = gen[j - 1] ^ (gen[j] === 0 ? 0 : EXP[LOG[gen[j]] + i]);
    }
    gen[0] = gen[0] === 0 ? 0 : EXP[LOG[gen[0]] + i];
  }

  const msg = [...data, ...new Array(ecLen).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j <= ecLen; j++) {
        if (gen[j] !== 0) msg[i + j] ^= EXP[LOG[gen[j]] + LOG[coef]];
      }
    }
  }
  return msg.slice(data.length);
}

function createMatrix(version: number): number[][] {
  const size = version * 4 + 17;
  const matrix: number[][] = Array.from({ length: size }, () => new Array(size).fill(-1));
  return matrix;
}

function placeFinderPattern(matrix: number[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const mr = row + r, mc = col + c;
      if (mr < 0 || mr >= matrix.length || mc < 0 || mc >= matrix.length) continue;
      if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        matrix[mr][mc] = 1;
      } else {
        matrix[mr][mc] = 0;
      }
    }
  }
}

function placeAlignmentPattern(matrix: number[][], row: number, col: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (matrix[row + r][col + c] !== -1) return;
    }
  }
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[row + r][col + c] = 1;
      } else {
        matrix[row + r][col + c] = 0;
      }
    }
  }
}

function getAlignmentPositions(version: number): number[] {
  if (version <= 1) return [];
  const positions: number[][] = [
    [], [],
    [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
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

function placeData(matrix: number[][], bits: number[]) {
  const size = matrix.length;
  let bitIdx = 0;
  let upward = true;
  let col = size - 1;

  while (col >= 0) {
    if (col === 6) col--;
    for (let row = 0; row < size; row++) {
      const r = upward ? size - 1 - row : row;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (cc < 0) continue;
        if (matrix[r][cc] !== -1) continue;
        matrix[r][cc] = bitIdx < bits.length ? bits[bitIdx++] : 0;
      }
    }
    upward = !upward;
    col -= 2;
  }
}

function applyMask(matrix: number[][], reserved: number[][], maskId: number) {
  const size = matrix.length;
  const maskFn = (r: number, c: number): boolean => {
    switch (maskId) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return (r * c) % 2 + (r * c) % 3 === 0;
      case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
      case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
      default: return false;
    }
  };
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c] !== -1) continue;
      if (maskFn(r, c)) matrix[r][c] ^= 1;
    }
  }
}

function writeFormatInfo(matrix: number[][], maskId: number) {
  const FORMAT_INFOS = [
    0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
    0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
  ];
  const ecLevelIdx = EC_LEVEL;
  const formatInfo = FORMAT_INFOS[ecLevelIdx * 8 + maskId];
  const size = matrix.length;
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) bits.push((formatInfo >> i) & 1);

  const pos1 = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  const pos2 = [
    [8, size - 1], [8, size - 2], [8, size - 3], [8, size - 4],
    [8, size - 5], [8, size - 6], [8, size - 7],
    [size - 7, 8], [size - 6, 8], [size - 5, 8], [size - 4, 8],
    [size - 3, 8], [size - 2, 8], [size - 1, 8], [size - 8, 8],
  ];

  for (let i = 0; i < 15; i++) {
    matrix[pos1[i][0]][pos1[i][1]] = bits[i];
    matrix[pos2[i][0]][pos2[i][1]] = bits[i];
  }
}

function penalty(matrix: number[][]): number {
  const size = matrix.length;
  let score = 0;
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        run++;
        if (run === 5) score += 3;
        else if (run > 5) score++;
      } else {
        run = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
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

function generateQR(data: string): number[][] {
  const bits = encode(data);
  const version = getVersion(bits.length);
  const { ecPerBlock, numBlocks, totalDataCW } = getECInfo(version);
  const totalBits = totalDataCW * 8;

  bits.push(0, 0, 0, 0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    codewords.push(byte);
  }

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < totalDataCW) {
    codewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  const cwPerBlock = Math.floor(totalDataCW / numBlocks);
  const dataBlocks: number[][] = [];
  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    dataBlocks.push(codewords.slice(offset, offset + cwPerBlock));
    offset += cwPerBlock;
  }
  while (offset < totalDataCW) {
    dataBlocks[dataBlocks.length - 1].push(codewords[offset++]);
  }

  const ecBlocks: number[][] = [];
  for (const block of dataBlocks) {
    ecBlocks.push(rsEncode(block, ecPerBlock));
  }

  const interleaved: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) interleaved.push(block[i]);
    }
  }

  const allBits: number[] = [];
  for (const cw of interleaved) {
    for (let i = 7; i >= 0; i--) allBits.push((cw >> i) & 1);
  }

  const matrix = createMatrix(version);
  const size = matrix.length;

  placeFinderPattern(matrix, 0, 0);
  placeFinderPattern(matrix, 0, size - 7);
  placeFinderPattern(matrix, size - 7, 0);

  const alignPos = getAlignmentPositions(version);
  for (const r of alignPos) {
    for (const c of alignPos) {
      placeAlignmentPattern(matrix, r, c);
    }
  }

  placeTimingPatterns(matrix);
  reserveFormatInfo(matrix);

  const reserved = matrix.map(row => [...row]);
  placeData(matrix, allBits);

  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    const test = matrix.map(row => [...row]);
    applyMask(test, reserved, m);
    writeFormatInfo(test, m);
    const p = penalty(test);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMask = m;
    }
  }

  applyMask(matrix, reserved, bestMask);
  writeFormatInfo(matrix, bestMask);

  return matrix;
}

interface QRCodeProps {
  data: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export default function QRCode({ data, size = 200, fgColor = '#0f172a', bgColor = '#ffffff', className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const matrix = generateQR(data);
      const modules = matrix.length;
      const quiet = 2;
      const total = modules + quiet * 2;
      const cellSize = size / total;

      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = fgColor;
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (matrix[r][c] === 1) {
            ctx.fillRect(
              (c + quiet) * cellSize,
              (r + quiet) * cellSize,
              cellSize + 0.5,
              cellSize + 0.5
            );
          }
        }
      }
    } catch {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Error', size / 2, size / 2);
    }
  }, [data, size, fgColor, bgColor]);

  return <canvas ref={canvasRef} width={size} height={size} className={className} />;
}
