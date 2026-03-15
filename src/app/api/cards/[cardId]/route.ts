// src/app/api/cards/[cardId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ cardId: string }> };

// Helper: verify the card belongs to the current user
async function getAuthorizedCard(cardId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: { board: true },
      },
    },
  });

  if (!card || card.column.board.userId !== userId) {
    return null;
  }

  return card;
}

// ──────────────────────────────────────
// GET /api/cards/:cardId — Get a single card
// ──────────────────────────────────────
export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await getAuthorizedCard(cardId, user.id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

// ──────────────────────────────────────
// PATCH /api/cards/:cardId — Update a card (title, description, priority, move between columns)
// ──────────────────────────────────────
export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await getAuthorizedCard(cardId, user.id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, priority, dueDate, columnId, position } = body;

  // Build the update object dynamically
  const updateData: Record<string, unknown> = {};

  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined)
    updateData.description = description?.trim() || null;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined)
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (columnId !== undefined) updateData.columnId = columnId;
  if (position !== undefined) updateData.position = position;

  const updatedCard = await prisma.card.update({
    where: { id: cardId },
    data: updateData,
  });

  return NextResponse.json(updatedCard);
}

// ──────────────────────────────────────
// DELETE /api/cards/:cardId — Delete a card
// ──────────────────────────────────────
export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await getAuthorizedCard(cardId, user.id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: cardId } });

  return NextResponse.json({ message: "Card deleted" });
}
