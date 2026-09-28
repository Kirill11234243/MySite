import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        brand: true,
        category: true,
        specification: true,
        offers: { where: { active: true }, orderBy: { salePrice: 'asc' } },
      },
      orderBy: [{ brand: { name: 'asc' } }, { designation: 'asc' }],
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        specification: true,
        offers: { where: { active: true }, include: { supplier: true }, orderBy: { salePrice: 'asc' } },
        analogsFrom: { include: { analogProduct: { include: { brand: true, specification: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
