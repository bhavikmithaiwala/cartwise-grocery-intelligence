import "dotenv/config";
import { db } from "../src/db.js";
import { hashPassword, verifyPassword } from "../src/services/passwords.js";
import { saveReview, confirmReceipt } from "../src/services/review.js";
const email = "demo@cartwise.test",
  password = "CartWise-demo-2026!";
try {
  let user = await db.user.findUnique({ where: { email } });
  if (user && !(await verifyPassword(password, user.passwordHash)))
    throw new Error(
      "Existing demo email has a different password; seed will not overwrite it.",
    );
  if (!user)
    user = await db.user.create({
      data: { email, passwordHash: await hashPassword(password) },
    });
  const oats = await db.canonicalProduct.upsert({
    where: {
      userId_name_unitFamily: {
        userId: user.id,
        name: "Fictional rolled oats",
        unitFamily: "mass",
      },
    },
    create: {
      userId: user.id,
      name: "Fictional rolled oats",
      unitFamily: "mass",
    },
    update: {},
  });
  const milk = await db.canonicalProduct.upsert({
    where: {
      userId_name_unitFamily: {
        userId: user.id,
        name: "Fictional milk",
        unitFamily: "volume",
      },
    },
    create: { userId: user.id, name: "Fictional milk", unitFamily: "volume" },
    update: {},
  });
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (i > 1 ? i - 1 : 0),
      i === 0 ? 1 : 8,
    );
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const id = `fictional-seed-${user.id}-${localDate}-${i}`;
    if (await db.receipt.findUnique({ where: { id } })) continue;
    const oatCents = i % 2 === 0 ? 499 : 449;
    const milkCents = i % 2 === 0 ? 525 : 499;
    await db.receipt.create({ data: { id, userId: user.id } });
    await saveReview(user.id, id, {
      merchant:
        i % 2 === 0 ? "Fictional Maple Market" : "Fictional Cedar Grocer",
      purchaseDate: localDate,
      subtotalCents: oatCents + milkCents + 300,
      taxCents: 0,
      totalCents: oatCents + milkCents + 300,
      correctionNote: "Fictional seeded demonstration purchase.",
      lines: [
        {
          description: "Fictional rolled oats",
          rawText: "SYNTHETIC OATS",
          category: "Pantry",
          quantityDecimal: "1",
          quantityUnit: "each",
          packageSizeDecimal: "500",
          packageUnit: "g",
          lineTotalCents: oatCents,
          productId: oats.id,
        },
        {
          description: "Fictional milk",
          rawText: "SYNTHETIC MILK",
          category: "Dairy",
          quantityDecimal: "1",
          quantityUnit: "each",
          packageSizeDecimal: "1",
          packageUnit: "l",
          lineTotalCents: milkCents,
          productId: milk.id,
        },
        {
          description: "Fictional apples",
          rawText: "SYNTHETIC APPLES",
          category: "Produce",
          quantityDecimal: "1",
          quantityUnit: "kg",
          lineTotalCents: 300,
        },
      ],
    });
    await confirmReceipt(user.id, id);
  }
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  for (const category of ["Dairy", "Pantry", "Produce"])
    await db.monthlyBudget.upsert({
      where: { userId_category_month: { userId: user.id, category, month } },
      create: { userId: user.id, category, month, limitCents: 2000 },
      update: {},
    });
  console.log(
    `Fictional seed ready for ${month}. Demo: ${email} / ${password}`,
  );
} finally {
  await db.$disconnect();
}
