import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { catalog } from "./seed-data";
import {
  generateBarcode,
  generateProductCode,
  generateSku,
  slugify,
} from "../src/lib/product-codes";

// Prefer the direct (non-pooled) connection for the seed script — pooled
// endpoints can drop long-running interactive-transaction seeds.
// DATABASE_URL_UNPOOLED is what Vercel's Neon integration provides.
const adapter = new PrismaPg({
  connectionString:
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding: warehouse, roles, super admin...");

  const warehouse = await prisma.warehouse.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ana Depo",
      location: "Merkez",
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
      description: "Sisteme tam erişim yetkisine sahip rol",
    },
  });

  await prisma.role.upsert({
    where: { name: "Kasiyer" },
    update: {},
    create: { name: "Kasiyer", description: "POS ve satış işlemleri" },
  });

  await prisma.role.upsert({
    where: { name: "Depo Sorumlusu" },
    update: {},
    create: { name: "Depo Sorumlusu", description: "Envanter ve stok yönetimi" },
  });

  const corePermissions = [
    { key: "products.manage", description: "Ürün ekleme/düzenleme/silme" },
    { key: "sales.manage", description: "Satış ve POS işlemleri" },
    { key: "purchases.manage", description: "Satın alma işlemleri" },
    { key: "users.manage", description: "Kullanıcı yönetimi" },
    { key: "reports.view", description: "Raporları görüntüleme" },
    { key: "settings.manage", description: "Sistem ayarlarını yönetme" },
  ];

  for (const permission of corePermissions) {
    const created = await prisma.permission.upsert({
      where: { key: permission.key },
      update: {},
      create: permission,
    });
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: created.id,
        },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: created.id },
    });
  }

  const superAdminPassword = "Ikizler2026!";
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

  await prisma.user.upsert({
    where: { email: "bilgino575@gmail.com" },
    update: { passwordHash: superAdminPasswordHash },
    create: {
      email: "bilgino575@gmail.com",
      name: "Super Admin",
      passwordHash: superAdminPasswordHash,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });
  console.log(`Super Admin giriş şifresi: ${superAdminPassword}`);

  console.log("Seeding: product catalog...");

  let productSequence = 1;
  let totalProducts = 0;

  for (const category of catalog) {
    const parentCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: { name: category.name, slug: category.slug },
    });

    for (const subcategory of category.subcategories) {
      const subSlug = `${category.slug}-${slugify(subcategory.name)}`;
      const childCategory = await prisma.category.upsert({
        where: { slug: subSlug },
        update: { name: subcategory.name, parentId: parentCategory.id },
        create: {
          name: subcategory.name,
          slug: subSlug,
          parentId: parentCategory.id,
        },
      });

      for (const product of subcategory.products) {
        let brandId: string | undefined;
        if (product.brand) {
          const brand = await prisma.brand.upsert({
            where: { name: product.brand },
            update: {},
            create: { name: product.brand },
          });
          brandId = brand.id;
        }

        const productCode = generateProductCode(productSequence);
        const sku = generateSku(productSequence);
        const barcode = generateBarcode(productSequence);

        await prisma.product.upsert({
          where: { productCode },
          update: {
            name: product.name,
            categoryId: childCategory.id,
            brandId,
          },
          create: {
            productCode,
            sku,
            barcode,
            name: product.name,
            categoryId: childCategory.id,
            brandId,
            unit: product.unit ?? "PIECE",
            purchasePrice: 0,
            salePrice: 0,
            wholesalePrice: 0,
            vat: 20,
            stock: 0,
            minimumStock: 5,
            warehouseId: warehouse.id,
            status: "ACTIVE",
          },
        });

        productSequence += 1;
        totalProducts += 1;
      }
    }
  }

  console.log(`Seed tamamlandı: ${totalProducts} ürün, ${catalog.length} ana kategori.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
