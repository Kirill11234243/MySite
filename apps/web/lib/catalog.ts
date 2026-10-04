import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type CatalogProduct = {
  id: string;
  sku: string;
  designation: string;
  brand: { name: string };
  specification: {
    innerDiameter: number;
    outerDiameter: number;
    width: number;
    sealType?: string | null;
    clearance?: string | null;
  } | null;
  offers: Array<{ salePrice: string; stock: number; currency: 'RUB' }>;
  description: string | null;
};

let catalogPromise: Promise<CatalogProduct[]> | undefined;

function normalize(value: string) {
  return value.toUpperCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-').trim();
}

function cellValue(cell: ExcelJS.Cell): string | number | null {
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object' && 'richText' in value) return value.richText.map((part) => part.text).join('');
  return null;
}

function numberValue(value: string | number | null) {
  if (value === null || String(value).trim() === '') return null;
  const parsed = Number(String(value).trim().replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function catalogPath() {
  const candidates = [
    resolve(process.cwd(), 'data/catalog.xlsx'),
    resolve(process.cwd(), '../../data/catalog.xlsx'),
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error('Файл data/catalog.xlsx не найден');
  return found;
}

async function readCatalog(): Promise<CatalogProduct[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(catalogPath());
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('В файле каталога нет листов');

  const products: CatalogProduct[] = [];
  for (let index = 1; index <= sheet.rowCount; index += 1) {
    const row = sheet.getRow(index);
    const nameCell = cellValue(row.getCell(1));
    const stockCell = cellValue(row.getCell(2));
    const priceCell = cellValue(row.getCell(3));
    const designation = String(nameCell ?? '').trim();

    if (!designation && (stockCell === null || stockCell === '')) continue;
    if (designation.toLowerCase() === 'подшипник' && String(stockCell).trim().toLowerCase() === 'кол-во') continue;

    const stock = stockCell === null && designation === '2-36114Л(3гпз)' ? 0 : numberValue(stockCell);
    const price = numberValue(priceCell);
    if (!designation || stock === null || price === null) continue;

    const key = designation.replace(/\s+/g, ' ').toUpperCase();
    const sku = `STOCK-${createHash('sha256').update(key).digest('hex').slice(0, 24)}`;
    products.push({
      id: sku,
      sku,
      designation,
      brand: { name: 'Не указан' },
      specification: null,
      offers: [{ salePrice: price.toFixed(2), stock, currency: 'RUB' }],
      description: null,
    });
  }
  return products;
}

export function getCatalogProducts() {
  catalogPromise ??= readCatalog();
  return catalogPromise;
}

export async function searchCatalogProducts(query: string) {
  const products = await getCatalogProducts();
  const tokens = normalize(query).split('-').filter(Boolean);
  if (!tokens.length) return products;
  return products.filter((product) => {
    const value = normalize(`${product.designation} ${product.brand.name}`);
    return tokens.every((token) => value.includes(token));
  });
}

export async function getCatalogProduct(id: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.id === id) ?? null;
}
