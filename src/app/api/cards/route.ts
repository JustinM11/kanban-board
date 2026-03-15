// src/app/api/cards/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ──────────────────────────────────────
// POST /api/cards — Create a new card in a column
// ──────────────────────────────────────
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, columnId, priority, dueDate } = body;

  if (!title || title.trim() === "") {
    return NextResponse.json(
      { error: "Card title is required" },
      { status: 400 },
    );
  }

  if (!columnId) {
    return NextResponse.json(
      { error: "Column ID is required" },
      { status: 400 },
    );
  }

  // Verify the column belongs to a board that the user owns
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.userId !== user.id) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  // Get the highest position in this column
  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { position: "desc" },
  });

  const newPosition = lastCard ? lastCard.position + 1 : 0;

  const card = await prisma.card.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      position: newPosition,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      columnId,
    },
  });

  return NextResponse.json(card, { status: 201 });
}
