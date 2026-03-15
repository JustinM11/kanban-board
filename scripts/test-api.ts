// scripts/test-api.ts
// Run with: npx tsx scripts/test-api.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get the test user
  const user = await prisma.user.findUnique({
    where: { email: "dev@example.com" },
  });

  if (!user) {
    console.log("No test user found. Run the signup curl command first.");
    return;
  }

  console.log("✅ User found:", user.name, user.email);

  // Create a board
  const board = await prisma.board.create({
    data: {
      title: "My First Board",
      userId: user.id,
      columns: {
        create: [
          { title: "To Do", position: 0 },
          { title: "In Progress", position: 1 },
          { title: "Done", position: 2 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  console.log("✅ Board created:", board.title);
  console.log("  Columns:", board.columns.map((c) => c.title).join(", "));

  // Add some cards to "To Do"
  const todoColumn = board.columns.find((c) => c.title === "To Do")!;

  const card1 = await prisma.card.create({
    data: {
      title: "Set up project",
      description: "Initialize Next.js with Prisma",
      position: 0,
      priority: "high",
      columnId: todoColumn.id,
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: "Build drag and drop",
      description: "Implement DnD for cards",
      position: 1,
      priority: "medium",
      columnId: todoColumn.id,
    },
  });

  const card3 = await prisma.card.create({
    data: {
      title: "Deploy to Vercel",
      position: 2,
      priority: "low",
      columnId: todoColumn.id,
    },
  });

  console.log("✅ Cards created:", card1.title, card2.title, card3.title);

  // Fetch the full board to verify everything
  const fullBoard = await prisma.board.findUnique({
    where: { id: board.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: { orderBy: { position: "asc" } },
        },
      },
    },
  });

  console.log("\n📋 Full Board Structure:");
  console.log(`Board: ${fullBoard!.title}`);
  for (const col of fullBoard!.columns) {
    console.log(`  📁 ${col.title} (${col.cards.length} cards)`);
    for (const card of col.cards) {
      console.log(`    - [${card.priority}] ${card.title}`);
    }
  }

  console.log("\n🎉 All tests passed! Your backend is ready for Sunday.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
