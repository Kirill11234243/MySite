import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async run(rawQuery: string) {
    const q = rawQuery.trim();
    if (!q) return [];

    const dims = this.parseDimensions(q);
    if (dims) {
      return this.prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          specification: {
            innerDiameter: dims.d,
            outerDiameter: dims.D,
            width: dims.B,
          },
        },
        include: {
          brand: true,
          specification: true,
          offers: { where: { active: true }, orderBy: { salePrice: 'asc' } },
        },
      });
    }

    const normalized = this.normalizeDesignation(q);
    const tokens = q.split(/\s+/).filter(Boolean);
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { designationNormalized: { contains: normalized, mode: 'insensitive' } },
          { designation: { contains: q, mode: 'insensitive' } },
          { brand: { name: { contains: tokens[0] || q, mode: 'insensitive' } } },
        ],
      },
      include: {
        brand: true,
        specification: true,
        offers: { where: { active: true }, orderBy: { salePrice: 'asc' } },
      },
      take: 50,
    });
  }

  private normalizeDesignation(value: string) {
    return value.toUpperCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-').trim();
  }

  private parseDimensions(value: string) {
    const match = value.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*[xх×*]\s*(\d+(?:\.\d+)?)\s*[xх×*]\s*(\d+(?:\.\d+)?)/i);
    if (!match) return null;
    return { d: Number(match[1]), D: Number(match[2]), B: Number(match[3]) };
  }
}
