// import { PrismaClient, SkinType, ConcernSeverity } from "@prisma/client";
// import { encrypt } from "../src/lib/encryption"; // Import the encryption service

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Seeding Skinova database...");

//   // --- Static System Settings ---
//   await prisma.systemSetting.upsert({
//     where: { key: "earlyAdopterModeEnabled" },
//     update: {},
//     create: {
//       key: "earlyAdopterModeEnabled",
//       value: { enabled: true },
//     },
//   });
//   console.log("Seeded initial system settings.");

//   // --- Admin User ---
//   const adminEmail = process.env.ADMIN_EMAIL || "kent720p@gmail.com";
//   const adminUserId = process.env.ADMIN_USER_ID || "65e6deb7-5a6f-49ee-bed6-42bbf354a05a";
  
//   const adminUser = await prisma.user.upsert({
//       where: { email: adminEmail },
//       update: {},
//       create: {
//           id: adminUserId,
//           supabaseAuthId: adminUserId,
//           email: adminEmail,
//           subscriptionTier: "ADMIN",
//           skinType: SkinType.NORMAL,
//           primaryConcern: "Redness", // Add default primary concern
//           onboardingCompleted: true
//       }
//   });
//   console.log(`Ensured admin user exists: ${adminEmail}`);

//   // --- Seed a Default Routine for the Admin User ---
//   // await prisma.routine.upsert({
//   //   where: { userId: adminUser.id },
//   //   update: {},
//   //   create: {
//   //     userId: adminUser.id,
//   //   },
//   // });
//   // console.log(`Ensured default routine exists for admin user.`);

//   // --- Seed a Mock Scan and Analysis for immediate UI testing ---
//   // const existingScan = await prisma.skinScan.findFirst({ where: { userId: adminUser.id } });
//   // if (!existingScan) {
//   //   const mockScan = await prisma.skinScan.create({
//   //     data: {
//   //       userId: adminUser.id,
//   //       imageUrl: encrypt("https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop"),
//   //       notes: encrypt("This is the first seeded scan for the admin user."),
//   //       analysis: {
//   //         create: {
//   //           overallScore: 88,
//   //           analysisJson: encrypt(JSON.stringify({ skinCondition: "Good", hydration: "Optimal" })),
//   //           rawAiResponse: encrypt(JSON.stringify({ message: "Mock AI response" })),
//   //           concerns: {
//   //             create: [
//   //               { name: "Mild Redness", severity: ConcernSeverity.MILD, description: "Slight inflammation detected on the cheek area." },
//   //               { name: "Dehydration", severity: ConcernSeverity.MODERATE, description: "Fine lines on the forehead indicate a lack of hydration." },
//   //             ]
//   //           }
//   //         }
//   //       }
//   //     }
//   //   });
//   //   console.log(`Created mock scan and analysis (ID: ${mockScan.id}) for admin user.`);
//   // }

//   // --- Product Catalog ---
//   console.log("Seeding product catalog...");
//   const products = [
//     // Cleansers
//     { name: 'Gentle Hydrating Cleanser', type: 'Cleanser', brand: 'BrandA', description: 'A mild, non-stripping cleanser for all skin types.' },
//     { name: 'Salicylic Acid Cleanser', type: 'Cleanser', brand: 'BrandB', description: 'An exfoliating cleanser for oily and acne-prone skin.' },
    
//     // Serums
//     { name: 'Vitamin C Serum', type: 'Serum', brand: 'BrandA', description: 'A brightening antioxidant serum for daytime use.' },
//     { name: 'Hyaluronic Acid Serum', type: 'Serum', brand: 'BrandC', description: 'Provides intense hydration for dry and dehydrated skin.' },
    
//     // Treatments
//     { name: 'Retinoid Cream 0.025%', type: 'Treatment', brand: 'BrandB', description: 'A prescription-strength retinoid for anti-aging and acne.' },
//     { name: 'Benzoyl Peroxide Gel 5%', type: 'Treatment', brand: 'BrandD', description: 'An effective spot treatment for inflammatory acne.' },
    
//     // Moisturizers
//     { name: 'Daily Hydration Lotion', type: 'Moisturizer', brand: 'BrandA', description: 'A lightweight daily moisturizer with ceramides.' },
//     { name: 'Night Repair Cream', type: 'Moisturizer', brand: 'BrandC', description: 'A rich, nourishing cream for overnight skin repair.' },
    
//     // Sunscreens
//     { name: 'SPF 50+ Mineral Sunscreen', type: 'Sunscreen', brand: 'BrandD', description: 'A broad-spectrum physical sunscreen for sensitive skin.' },
//     { name: 'SPF 30 Chemical Sunscreen', type: 'Sunscreen', brand: 'BrandB', description: 'A lightweight, non-greasy chemical sunscreen.' },
//   ];

//   for (const product of products) {
//     await prisma.product.upsert({
//       where: { name: product.name },
//       update: {},
//       create: product,
//     });
//   }
//   console.log(`Seeded ${products.length} products.`);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
