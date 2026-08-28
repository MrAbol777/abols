import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. ADMIN USER (idempotent via upsert)
  const adminPhone = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPhone || !adminPassword) {
    throw new Error("ADMIN_PHONE and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { passwordHash }, // update password if admin already exists
    create: {
      phone: adminPhone,
      passwordHash,
      name: "مدیر سیستم",
      role: "ADMIN",
      isActive: true,
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user: ${admin.phone}`);

  // 2. CATEGORIES
  const cpCategory = await prisma.category.upsert({
    where: { slug: "cp" },
    update: {},
    create: {
      name: "خرید CP",
      slug: "cp",
      description: "خرید CP کالاف دیوتی موبایل با قیمت مناسب و تحویل سریع",
      isActive: true,
      sortOrder: 1,
    },
  });

  const accountCategory = await prisma.category.upsert({
    where: { slug: "account" },
    update: {},
    create: {
      name: "خرید اکانت",
      slug: "account",
      description: "خرید اکانت کالاف دیوتی موبایل با سکین و اسلحه",
      isActive: true,
      sortOrder: 2,
    },
  });

  const comboCategory = await prisma.category.upsert({
    where: { slug: "combo" },
    update: {},
    create: {
      name: "خرید کمبو",
      slug: "combo",
      description: "بسته‌های ویژه ترکیبی CP و اکانت",
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log(`✅ Categories: ${cpCategory.name}, ${accountCategory.name}, ${comboCategory.name}`);

  // 3. CP PRODUCTS
  await prisma.product.upsert({
    where: { slug: "cp-80" },
    update: {},
    create: {
      name: "80 CP",
      slug: "cp-80",
      shortDescription: "80 سی‌پی کالاف دیوتی موبایل",
      fullDescription: "بسته 80 سی‌پی کالاف دیوتی موبایل - تحویل سریع و آنی پس از تایید پرداخت",
      price: 15000,
      compareAtPrice: 18000,
      type: "CP",
      categoryId: cpCategory.id,
      isActive: true,
      isFeatured: true,
      inventoryMode: "UNLIMITED",
      inStock: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "cp-420" },
    update: {},
    create: {
      name: "420 CP",
      slug: "cp-420",
      shortDescription: "420 سی‌پی کالاف دیوتی موبایل",
      fullDescription: "بسته 420 سی‌پی کالاف دیوتی موبایل - محبوب‌ترین بسته",
      price: 70000,
      compareAtPrice: 85000,
      type: "CP",
      categoryId: cpCategory.id,
      isActive: true,
      isFeatured: true,
      isBestSelling: true,
      inventoryMode: "UNLIMITED",
      inStock: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "cp-880" },
    update: {},
    create: {
      name: "880 CP",
      slug: "cp-880",
      shortDescription: "880 سی‌پی کالاف دیوتی موبایل",
      fullDescription: "بسته 880 سی‌پی کالاف دیوتی موبایل - بهترین قیمت بازار",
      price: 140000,
      compareAtPrice: 165000,
      type: "CP",
      categoryId: cpCategory.id,
      isActive: true,
      isFeatured: false,
      inventoryMode: "UNLIMITED",
      inStock: true,
    },
  });
  console.log("✅ CP products created");

  // 4. SAMPLE ACCOUNT PRODUCT
  const sampleAccount = await prisma.product.upsert({
    where: { slug: "account-mythic-season-12" },
    update: {},
    create: {
      name: "اکانت میتیک سیزون 12",
      slug: "account-mythic-season-12",
      shortDescription: "اکانت کالاف دیوتی با اسکین میتیک و سلاح‌های نایاب",
      fullDescription:
        "اکانت کالاف دیوتی موبایل با اسکین میتیک سیزون 12، تعداد زیادی اسلحه لجند و اپیک. این اکانت شامل تمامی شخصیت‌های نایاب و کلکسیون کامل اسکین‌های فصلی است.",
      price: 2500000,
      type: "ACCOUNT",
      categoryId: accountCategory.id,
      isActive: true,
      isFeatured: true,
      inventoryMode: "STATUS_ONLY",
      inStock: true,
      cancellationPolicy: "بعد از تحویل اکانت، امکان لغو و استرداد وجه نیست.",
    },
  });

  // Reset attributes for this sample product so the seed stays idempotent
  // (SQLite createMany does not support skipDuplicates).
  await prisma.productAttribute.deleteMany({ where: { productId: sampleAccount.id } });
  await prisma.productAttribute.createMany({
    data: [
      {
        productId: sampleAccount.id,
        key: "region",
        label: "ریجن",
        value: "گلوبال",
        sortOrder: 1,
      },
      {
        productId: sampleAccount.id,
        key: "level",
        label: "لول",
        value: "150",
        sortOrder: 2,
      },
      {
        productId: sampleAccount.id,
        key: "skins",
        label: "اسکین‌ها",
        value: "12 عدد میتیک، 45 عدد لجند",
        sortOrder: 3,
      },
      {
        productId: sampleAccount.id,
        key: "guns",
        label: "اسلحه‌ها",
        value: "تمامی اسلحه‌های لجند سیزون 10 تا 12",
        sortOrder: 4,
      },
    ],
  });
  console.log("✅ Account product with attributes created");

  // 4b. Checkout fields for the account product (get delivered in-game).
  // In-game credentials are NEVER requested or stored; only safe delivery info.
  await prisma.productCheckoutField.deleteMany({ where: { productId: sampleAccount.id } });
  await prisma.productCheckoutField.createMany({
    data: [
      {
        productId: sampleAccount.id,
        label: "ریجن اکانت",
        fieldKey: "region",
        fieldType: "SELECT",
        required: true,
        helpText: "ریجن اکانتی که خریداری کرده‌اید را انتخاب کنید.",
        options: JSON.stringify(["گلوبال", "الکترو مد"]),
        sortOrder: 1,
      },
      {
        productId: sampleAccount.id,
        label: "شناسه کوئست",
        fieldKey: "questId",
        fieldType: "TEXT",
        required: false,
        helpText: "اختیاری — شناسه یا نامی برای شخصی‌سازی تحویل.",
        sortOrder: 2,
      },
    ],
  });
  console.log("✅ Account checkout fields created");

  // 5. SAMPLE COMBO PRODUCT
  await prisma.product.upsert({
    where: { slug: "combo-starter-pack" },
    update: {},
    create: {
      name: "بسته شروع بازی",
      slug: "combo-starter-pack",
      shortDescription: "بسته کمبو 880 CP + اکانت استارتر",
      fullDescription: "بسته ویژه شامل 880 سی‌پی + یک اکانت استارتر با چند اسکین اپیک",
      price: 250000,
      compareAtPrice: 300000,
      type: "COMBO",
      categoryId: comboCategory.id,
      isActive: true,
      isFeatured: false,
      inventoryMode: "EXACT_QUANTITY",
      quantity: 50,
      inStock: true,
    },
  });
  console.log("✅ Combo product created");

  // 6. SITE SETTINGS (singleton)
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      brandName: "Abol Store",
      successfulOrders: 1247,
      cardHolderName: "نمونه کارت (دمو)",
      cardNumber: "6037-9900-0000-0000",
      telegramUrl: "https://t.me/abolstore_demo",
      rubikaUrl: "https://rubika.ir/abolstore_demo",
      supportText: "پشتیبانی 24 ساعته ابول استور",
    },
  });
  console.log("✅ Site settings created");

  // 7. SAMPLE TESTIMONIAL
  await prisma.review.upsert({
    where: { id: "demo-testimonial-1" },
    update: {},
    create: {
      id: "demo-testimonial-1",
      authorName: "علی محمدی",
      rating: 5,
      comment:
        "از خریدم بسیار راضی هستم. تحویل سریع و پشتیبانی عالی. حتما دوباره خرید می‌کنم.",
      isTestimonial: true,
      isApproved: true,
    },
  });
  console.log("✅ Sample testimonial created");

  // 8. FAQ ENTRIES
  await prisma.fAQ.upsert({
    where: { id: "faq-1" },
    update: {},
    create: {
      id: "faq-1",
      question: "چگونه سفارش دهم؟",
      answer:
        "محصول مورد نظر را انتخاب کنید، به سبد خرید اضافه کنید، اطلاعات خود را وارد کنید و فیش واریز را آپلود کنید. پس از تایید پرداخت، سفارش شما پردازش می‌شود.",
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.fAQ.upsert({
    where: { id: "faq-2" },
    update: {},
    create: {
      id: "faq-2",
      question: "زمان تحویل چقدر است؟",
      answer:
        "برای محصولات CP، تحویل آنی پس از تایید پرداخت. برای اکانت‌ها، حداکثر 2 ساعت پس از تایید.",
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.fAQ.upsert({
    where: { id: "faq-3" },
    update: {},
    create: {
      id: "faq-3",
      question: "آیا امکان استرداد وجه وجود دارد؟",
      answer:
        "برای محصولات CP قبل از تحویل، امکان استرداد وجود دارد. برای اکانت‌ها، پس از تحویل امکان استرداد نیست.",
      isActive: true,
      sortOrder: 3,
    },
  });
  console.log("✅ FAQ entries created");

  // 9. SAMPLE BLOG POST
  await prisma.blogPost.upsert({
    where: { slug: "guide-buying-cp" },
    update: {},
    create: {
      title: "راهنمای خرید CP کالاف دیوتی موبایل",
      slug: "guide-buying-cp",
      excerpt: "آموزش کامل خرید امن و سریع CP برای بازی کالاف دیوتی موبایل",
      content:
        "در این مقاله به طور کامل نحوه خرید CP کالاف دیوتی موبایل را توضیح می‌دهیم. CP یا COD Points ارز درون‌بازی کالاف دیوتی است که با آن می‌توانید اسکین، اسلحه و آیتم‌های مختلف را خریداری کنید...",
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log("✅ Blog post created");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
