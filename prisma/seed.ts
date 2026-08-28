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
