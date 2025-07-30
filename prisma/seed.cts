import { PrismaClient, SkinType, ConcernSeverity } from "@prisma/client";
import { encrypt } from "../src/lib/encryption"; // Import the encryption service

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Skinova database...");

  // --- Static System Settings ---
  await prisma.systemSetting.upsert({
    where: { key: "earlyAdopterModeEnabled" },
    update: {},
    create: {
      key: "earlyAdopterModeEnabled",
      value: { enabled: true },
    },
  });
  console.log("Seeded initial system settings.");

  // --- Admin User ---
  const adminEmail = process.env.ADMIN_EMAIL || "kent720p@gmail.com";
  const adminUserId = process.env.ADMIN_USER_ID || "65e6deb7-5a6f-49ee-bed6-42bbf354a05a";
  
  const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
          id: adminUserId,
          supabaseAuthId: adminUserId,
          email: adminEmail,
          subscriptionTier: "ADMIN",
          skinType: SkinType.NORMAL,
          primaryConcern: "Redness", // Add default primary concern
          onboardingCompleted: true
      }
  });
  console.log(`Ensured admin user exists: ${adminEmail}`);

  // --- Seed a Default Routine for the Admin User ---
  await prisma.routine.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
    },
  });
  console.log(`Ensured default routine exists for admin user.`);

  // --- Seed a Mock Scan and Analysis for immediate UI testing ---
  const existingScan = await prisma.skinScan.findFirst({ where: { userId: adminUser.id } });
  if (!existingScan) {
    const mockScan = await prisma.skinScan.create({
      data: {
        userId: adminUser.id,
        imageUrl: encrypt("https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop"),
        notes: encrypt("This is the first seeded scan for the admin user."),
        analysis: {
          create: {
            overallScore: 88,
            analysisJson: encrypt(JSON.stringify({ skinCondition: "Good", hydration: "Optimal" })),
            rawAiResponse: encrypt(JSON.stringify({ message: "Mock AI response" })),
            concerns: {
              create: [
                { name: "Mild Redness", severity: ConcernSeverity.MILD, description: "Slight inflammation detected on the cheek area." },
                { name: "Dehydration", severity: ConcernSeverity.MODERATE, description: "Fine lines on the forehead indicate a lack of hydration." },
              ]
            }
          }
        }
      }
    });
    console.log(`Created mock scan and analysis (ID: ${mockScan.id}) for admin user.`);
  }

  // --- Curated Production-Ready Product Catalog ---
  console.log("Seeding product catalog from production data...");
  const products = [
    // Cleansers
    { 
      name: 'CeraVe Hydrating Facial Cleanser', 
      type: 'Cleanser', 
      brand: 'CeraVe', 
      description: 'A gentle, non-foaming cleanser with ceramides and hyaluronic acid to hydrate and restore the skin barrier.',
      imageUrl: 'https://i5.walmartimages.com/seo/CeraVe-Hydrating-Facial-Cleanser-with-Hyaluronic-Acid-and-Ceramides-for-Normal-to-Dry-Skin-Fragrance-Free-Face-Wash-24-fl-oz_3859bf53-9031-4822-bdd4-2f22c68f270a.194433e5b38d73b0a701e400a403d1c1.jpeg',
      purchaseUrl: 'https://www.amazon.com/dp/B01MSSDEPK',
      tags: ['for-normal', 'for-dry', 'for-sensitive', 'hydrating']
    },
    { 
      name: 'La Roche-Posay Effaclar Medicated Gel Cleanser', 
      type: 'Cleanser', 
      brand: 'La Roche-Posay', 
      description: 'An acne face wash with 2% salicylic acid that targets excess oil and helps clear acne breakouts.',
      imageUrl: 'https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dw83a5f257/product-images/Effaclar/Effaclar-Medicated-Gel-Cleanser/3337872413038_EfaclarGelCleanser_Front_3000x3000.jpg',
      purchaseUrl: 'https://www.amazon.com/dp/B00LO1DNXU',
      tags: ['for-oily', 'for-combination', 'acne']
    },
    
    // Serums
    { 
      name: 'The Ordinary Niacinamide 10% + Zinc 1%', 
      type: 'Serum', 
      brand: 'The Ordinary', 
      description: 'A high-strength vitamin and mineral blemish formula that reduces the appearance of skin blemishes and congestion.',
      imageUrl: 'https://images.ulta.com/is/image/Ulta/2551167',
      purchaseUrl: 'https://www.amazon.com/dp/B07DN7343P',
      tags: ['for-oily', 'for-combination', 'acne', 'redness']
    },
    { 
      name: 'Vichy Mineral 89 Hyaluronic Acid Face Serum', 
      type: 'Serum', 
      brand: 'Vichy', 
      description: 'A daily plumping and hydrating booster made with natural origin hyaluronic acid and Vichy Volcanic Water.',
      imageUrl: 'https://www.vichyusa.com/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-vichy-master-catalog/default/dw1505c24a/product-packshots/mineral-89/Mineral-89-Serum-3337875543248-75ml-front-Vichy-USA.jpg',
      purchaseUrl: 'https://www.amazon.com/dp/B074Z4665V',
      tags: ['for-dry', 'for-sensitive', 'dryness', 'hydrating']
    },
    
    // Treatments
    { 
      name: 'Differin Adapalene Gel 0.1% Acne Treatment', 
      type: 'Treatment', 
      brand: 'Differin', 
      description: 'A prescription-strength retinoid for clearing breakouts, preventing new acne, and restoring skin tone and texture.',
      imageUrl: 'https://i5.walmartimages.com/seo/Differin-Gel-Acne-Treatment-with-0-1-Adapalene-45g-90-Day-Supply_f608933c-4e89-42b7-a3f8-dc49285038f4.b3294314c442657d4c82c6328e1d5e21.jpeg',
      purchaseUrl: 'https://www.amazon.com/dp/B07L1PHSY9',
      tags: ['acne', 'fine-lines-&-wrinkles', 'hyperpigmentation']
    },
    
    // Moisturizers
    { 
      name: 'CeraVe PM Facial Moisturizing Lotion', 
      type: 'Moisturizer', 
      brand: 'CeraVe', 
      description: 'An oil-free night cream with niacinamide, hyaluronic acid, and ceramides that helps calm the skin and restore the barrier.',
      imageUrl: 'https://i5.walmartimages.com/seo/CeraVe-PM-Facial-Moisturizing-Lotion-for-Nighttime-Use-with-Hyaluronic-Acid-and-Niacinamide-3-fl-oz_9d5b4a9a-00db-432e-9d29-a78d2b86d2f3.b89115f07a7833a789a69cb229239d5e.jpeg',
      purchaseUrl: 'https://www.amazon.com/dp/B00365DABC',
      tags: ['for-normal', 'for-combination', 'for-sensitive', 'hydrating']
    },
    { 
      name: 'Vanicream Moisturizing Cream', 
      type: 'Moisturizer', 
      brand: 'Vanicream', 
      description: 'A non-greasy, long-lasting moisturizing cream that is easy to spread, quickly absorbed, and non-comedogenic. Ideal for sensitive skin.',
      imageUrl: 'https://www.vanicream.com/wp-content/uploads/2023/12/VC-Moisturizing-Cream-16oz-F.jpg',
      purchaseUrl: 'https://www.amazon.com/dp/B000NWGCZ2',
      tags: ['for-dry', 'for-sensitive', 'dryness']
    },
    
    // Sunscreens
    { 
      name: 'EltaMD UV Clear Broad-Spectrum SPF 46', 
      type: 'Sunscreen', 
      brand: 'EltaMD', 
      description: 'An oil-free sunscreen that helps calm and protect sensitive skin types prone to discoloration and breakouts.',
      imageUrl: 'https://eltamd.com/cdn/shop/files/UV-Clear-Untinted-PDP-FRONTRIGHT-1.7oz.png',
      purchaseUrl: 'https://www.amazon.com/dp/B002MSN3QQ',
      tags: ['for-oily', 'for-combination', 'for-sensitive', 'acne', 'redness', 'hyperpigmentation']
    },
    { 
      name: 'La Roche-Posay Anthelios Melt-In Milk Sunscreen SPF 60', 
      type: 'Sunscreen', 
      brand: 'La Roche-Posay', 
      description: 'A fast-absorbing, velvety texture sunscreen for face and body with broad-spectrum protection.',
      imageUrl: 'https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-lrp-master-catalog/default/dw1537b8d7/product-images/Anthelios/Anthelios-Melt-in-Milk-Sunscreen-SPF-60/La-Roche-Posay-Face-and-Body-Sunscreen-Anthelios-Melt-in-Milk-SPF-60-3606000468334-Front.jpg',
      purchaseUrl: 'https://www.amazon.com/dp/B002CML1XE',
      tags: ['for-normal', 'for-dry', 'for-sensitive']
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });