import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { readCatalog, normalize } from './read-catalog';

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a.startsWith('--') && a !== '--dry-run')) throw new Error('Поддерживается только флаг --dry-run');
  const file = resolve(args.find(a => !a.startsWith('--')) || '../../data/catalog.xlsx');
  const { products, skipped, warnings } = await readCatalog(file);
  const summary = {
    file, products: products.length, stock: products.reduce((s, p) => s + p.stock, 0),
    valueRub: (products.reduce((s, p) => s + Math.round(Number(p.price) * 100) * p.stock, 0) / 100).toFixed(2),
    skippedRows: skipped, warnings,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (args.includes('--dry-run')) { console.log('Проверка завершена. База не изменена.'); return; }
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(async tx => {
      const brand = await tx.brand.upsert({ where: { slug: 'unspecified' }, update: {}, create: { slug: 'unspecified', name: 'Не указан' } });
      const category = await tx.category.upsert({ where: { slug: 'bearings' }, update: {}, create: { slug: 'bearings', name: 'Подшипники' } });
      const supplier = await tx.supplier.upsert({ where: { code: 'OWN-STOCK' }, update: {}, create: { code: 'OWN-STOCK', name: 'Собственный склад' } });
      for (const item of products) {
        const product = await tx.product.upsert({
          where: { sku: item.sku }, update: {},
          create: { sku: item.sku, designation: item.designation, designationNormalized: normalize(item.designation), brandId: brand.id, categoryId: category.id },
        });
        const offer = { salePrice: item.price, stock: item.stock, currency: 'RUB', active: true };
        await tx.supplierOffer.upsert({
          where: { productId_supplierId: { productId: product.id, supplierId: supplier.id } },
          update: offer, create: { ...offer, productId: product.id, supplierId: supplier.id },
        });
      }
    }, { timeout: 120000 });
    console.log(`Импортировано ${products.length} позиций. Цены — рубли за штуку. Повторный импорт обновляет остатки и цены без дублей.`);
  } finally { await prisma.$disconnect(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
