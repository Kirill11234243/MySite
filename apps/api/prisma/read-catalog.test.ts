import { test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { parseSheet } from './read-catalog';

function sheet(rows: unknown[][]) {
  const s = new ExcelJS.Workbook().addWorksheet('Каталог');
  s.addRows(rows); return s;
}
test('Preserves identifiers, numeric strings and unit prices; skips headers and totals', () => {
  const result = parseSheet(sheet([['подшипник', 'кол-во', 'цена'], ['0018', '4', '20,50'], [null, null, { formula: '1+1', result: 2 }], ['подшипник', 'кол-во', 'цена'], ['2-36114Л(3гпз)', null, 7000]]));
  assert.equal(result.products.length, 2);
  assert.equal(result.products[0].designation, '0018');
  assert.equal(result.products[0].price, '20.50');
  assert.equal(result.products[0].stock, 4);
  assert.equal(result.products[1].stock, 0);
  assert.equal(result.warnings.length, 1);
});
test('Rejects missing, negative, fractional stock, duplicate items and formula prices', () => {
  for (const rows of [[['A', null, 10]], [['A', -1, 10]], [['A', 1.5, 10]], [['A', 1, 1.111]], [['A', 1, 10], ['a', 2, 20]], [['A', 1, { formula: '1+1', result: 2 }]]]) {
    assert.throws(() => parseSheet(sheet(rows)));
  }
});
test('Reordering rows does not change the import key', () => {
  const a = parseSheet(sheet([['A', 1, 20], ['B', 2, 30]]));
  const b = parseSheet(sheet([['B', 3, 40], ['A', 5, 50]]));
  assert.equal(a.products[0].sku, b.products[1].sku);
});
