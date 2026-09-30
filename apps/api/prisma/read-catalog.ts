import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';

export function normalize(value: string) {
  return value.toUpperCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-').trim();
}

function scalar(cell: ExcelJS.Cell): string | number | null {
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object' && 'richText' in value) return value.richText.map(v => v.text).join('');
  // Formula caches can be stale. Ask for explicit values instead of importing stale prices.
  throw new Error(`Ячейка ${cell.address}: нужны текст или число, без формул.`);
}

function numeric(value: string | number | null, row: number, field: string): number {
  if (value === null || String(value).trim() === '') throw new Error(`Строка ${row}: не заполнено ${field}`);
  const text = String(value).trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) throw new Error(`Строка ${row}: неверное ${field}`);
  const number = Number(text);
  if (!Number.isFinite(number)) throw new Error(`Строка ${row}: неверное ${field}`);
  return number;
}

export function parseSheet(sheet: ExcelJS.Worksheet) {
  const products: Array<{ sku: string; designation: string; stock: number; price: string; row: number }> = [];
  const skipped: number[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  for (let i = 1; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const a = scalar(row.getCell(1));
    const b = scalar(row.getCell(2));
    // Totals may contain formulas; ignore them only when BOTH name and count are blank.
    if ((a === null || a === '') && (b === null || b === '')) { skipped.push(i); continue; }
    if (String(a).trim().toLowerCase() === 'подшипник' && String(b).trim().toLowerCase() === 'кол-во') {
      skipped.push(i); continue;
    }
    if (a === null || !String(a).trim()) throw new Error(`Строка ${i}: нет обозначения`);
    const designation = String(a).trim();
    const key = designation.replace(/\s+/g, ' ').toUpperCase();
    if (seen.has(key)) throw new Error(`Строка ${i}: повтор обозначения ${designation}`);
    seen.add(key);
    let stock: number;
    if (b === null && designation === '2-36114Л(3гпз)') {
      stock = 0;
      warnings.push(`Строка ${i}: ${designation}, пустой остаток принят за 0 по указанию владельца.`);
    } else stock = numeric(b, i, 'количество');
    if (!Number.isInteger(stock) || stock > 2147483647) throw new Error(`Строка ${i}: количество должно быть целым`);
    const price = numeric(scalar(row.getCell(3)), i, 'цена');
    if (price >= 1e10 || Math.abs(price * 100 - Math.round(price * 100)) > 0.0001) throw new Error(`Строка ${i}: цена должна иметь не более 2 знаков после запятой`);
    const sku = 'STOCK-' + createHash('sha256').update(key).digest('hex').slice(0, 24);
    products.push({ sku, designation, stock, price: price.toFixed(2), row: i });
  }
  if (!products.length) throw new Error('На первом листе нет товаров');
  return { products, skipped, warnings };
}

export async function readCatalog(path: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  if (!workbook.worksheets[0]) throw new Error('В книге нет листов');
  return parseSheet(workbook.worksheets[0]);
}
