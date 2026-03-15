// src/app/api/cards/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ──────────────────────────────────────
// PUT /api/cards/reorder — Move a card to a new position/column
// Body: { cardId, targetColumnId, newPosition }
// ──────────────────────────────────────
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { cardId, targetColumnId, newPosition } = body;

  if (!cardId || !targetColumnId || newPosition === undefined) {
    return NextResponse.json(
      { error: "cardId, targetColumnId, and newPosition are required" },
      { status: 400 },
    );
  }

  // Verify ownership
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== user.id) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const sourceColumnId = card.columnId;

  // Use a transaction to keep positions consistent
  await prisma.$transaction(async (tx) => {
    // If moving to a different column
    if (sourceColumnId !== targetColumnId) {
      // Decrease positions of cards below in the source column
      await tx.card.updateMany({
        where: {
          columnId: sourceColumnId,
          position: { gt: card.position },
        },
        data: { position: { decrement: 1 } },
      });

      // Increase positions of cards at or below the target position
      await tx.card.updateMany({
        where: {
          columnId: targetColumnId,
          position: { gte: newPosition },
        },
        data: { position: { increment: 1 } },
      });
    } else {
      // Moving within the same column
      if (newPosition > card.position) {
        // Moving down: shift cards between old and new position up
        await tx.card.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gt: card.position, lte: newPosition },
          },
          data: { position: { decrement: 1 } },
        });
      } else if (newPosition < card.position) {
        // Moving up: shift cards between new and old position down
        await tx.card.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gte: newPosition, lt: card.position },
          },
          data: { position: { increment: 1 } },
        });
      }
    }

    // Move the card to its new position and column
    await tx.card.update({
      where: { id: cardId },
      data: {
        columnId: targetColumnId,
        position: newPosition,
      },
    });
  });

  return NextResponse.json({ message: "Card moved successfully" });
}
