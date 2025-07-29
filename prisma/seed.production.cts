import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding production database...");

  // --- Static System Settings ---
  await prisma.systemSetting.upsert({
    where: { key: "earlyAdopterModeEnabled" },
    update: { value: { enabled: false } },
    create: {
      key: "earlyAdopterModeEnabled",
      value: { enabled: false }, // Explicitly disabled for production
    },
  });
  console.log("Production system settings seeded.");

  // --- Product Catalog ---
  console.log("Seeding product catalog...");
  const products = [
    // Cleansers
    { name: 'Gentle Hydrating Cleanser', type: 'Cleanser', brand: 'BrandA', description: 'A mild, non-stripping cleanser for all skin types.' },
    { name: 'Salicylic Acid Cleanser', type: 'Cleanser', brand: 'BrandB', description: 'An exfoliating cleanser for oily and acne-prone skin.' },
    
    // Serums
    { name: 'Vitamin C Serum', type: 'Serum', brand: 'BrandA', description: 'A brightening antioxidant serum for daytime use.' },
    { name: 'Hyaluronic Acid Serum', type: 'Serum', brand: 'BrandC', description: 'Provides intense hydration for dry and dehydrated skin.' },
    
    // Treatments
    { name: 'Retinoid Cream 0.025%', type: 'Treatment', brand: 'BrandB', description: 'A prescription-strength retinoid for anti-aging and acne.' },
    { name: 'Benzoyl Peroxide Gel 5%', type: 'Treatment', brand: 'BrandD', description: 'An effective spot treatment for inflammatory acne.' },
    
    // Moisturizers
    { name: 'Daily Hydration Lotion', type: 'Moisturizer', brand: 'BrandA', description: 'A lightweight daily moisturizer with ceramides.' },
    { name: 'Night Repair Cream', type: 'Moisturizer', brand: 'BrandC', description: 'A rich, nourishing cream for overnight skin repair.' },
    
    // Sunscreens
    { name: 'SPF 50+ Mineral Sunscreen', type: 'Sunscreen', brand: 'BrandD', description: 'A broad-spectrum physical sunscreen for sensitive skin.' },
    { name: 'SPF 30 Chemical Sunscreen', type: 'Sunscreen', brand: 'BrandB', description: 'A lightweight, non-greasy chemical sunscreen.' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
  console.log("Production seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });