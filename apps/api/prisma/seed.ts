import { PrismaClient, AnalogRelationType } from '@prisma/client';
const prisma = new PrismaClient();

function normalized(value: string) {
  return value.toUpperCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-').trim();
}

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: 'deep-groove-ball-bearings' },
    update: {},
    create: { name: 'Радиальные шариковые', slug: 'deep-groove-ball-bearings' },
  });

  const [skf, fag, nsk] = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'skf' }, update: {}, create: { name: 'SKF', slug: 'skf' } }),
    prisma.brand.upsert({ where: { slug: 'fag' }, update: {}, create: { name: 'FAG', slug: 'fag' } }),
    prisma.brand.upsert({ where: { slug: 'nsk' }, update: {}, create: { name: 'NSK', slug: 'nsk' } }),
  ]);

  const supplier = await prisma.supplier.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: { name: 'Demo Supplier', code: 'DEMO' },
  });

  const seedProducts = [
    { sku: 'SKF-6205-2RS', designation: '6205-2RS', brandId: skf.id, d: 25, D: 52, B: 15, seal: '2RS', price: 12.40, stock: 34 },
    { sku: 'FAG-6205-2RSR', designation: '6205-2RSR', brandId: fag.id, d: 25, D: 52, B: 15, seal: '2RS', price: 11.90, stock: 18 },
    { sku: 'NSK-6205DDU', designation: '6205DDU', brandId: nsk.id, d: 25, D: 52, B: 15, seal: 'DDU', price: 10.80, stock: 27 },
    { sku: 'SKF-6204-2RS', designation: '6204-2RS', brandId: skf.id, d: 20, D: 47, B: 14, seal: '2RS', price: 9.60, stock: 51 },
  ];

  const created = [];
  for (const item of seedProducts) {
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        designation: item.designation,
        designationNormalized: normalized(item.designation),
        brandId: item.brandId,
        categoryId: category.id,
      },
      create: {
        sku: item.sku,
        designation: item.designation,
        designationNormalized: normalized(item.designation),
        description: `Демо-карточка ${item.designation}`,
        brandId: item.brandId,
        categoryId: category.id,
      },
    });
    await prisma.bearingSpecification.upsert({
      where: { productId: product.id },
      update: { innerDiameter: item.d, outerDiameter: item.D, width: item.B, sealType: item.seal, clearance: 'CN' },
      create: { productId: product.id, innerDiameter: item.d, outerDiameter: item.D, width: item.B, sealType: item.seal, clearance: 'CN' },
    });
    await prisma.supplierOffer.upsert({
      where: { productId_supplierId: { productId: product.id, supplierId: supplier.id } },
      update: { purchasePrice: item.price * 0.72, salePrice: item.price, stock: item.stock, active: true },
      create: { productId: product.id, supplierId: supplier.id, purchasePrice: item.price * 0.72, salePrice: item.price, stock: item.stock },
    });
    created.push(product);
  }

  const skf6205 = created.find((p) => p.sku === 'SKF-6205-2RS');
  const fag6205 = created.find((p) => p.sku === 'FAG-6205-2RSR');
  const nsk6205 = created.find((p) => p.sku === 'NSK-6205DDU');
  if (skf6205 && fag6205 && nsk6205) {
    for (const analog of [fag6205, nsk6205]) {
      await prisma.productAnalog.upsert({
        where: { productId_analogProductId: { productId: skf6205.id, analogProductId: analog.id } },
        update: { relationType: AnalogRelationType.COMPATIBLE },
        create: { productId: skf6205.id, analogProductId: analog.id, relationType: AnalogRelationType.COMPATIBLE },
      });
    }
  }

  console.log('Seed completed. Demo products:', created.length);
}

main().finally(() => prisma.$disconnect());
