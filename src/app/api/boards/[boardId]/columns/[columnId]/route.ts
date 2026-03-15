// src/app/api/boards/[boardId]/columns/[columnId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ boardId: string; columnId: string }> };

// ──────────────────────────────────────
// PATCH /api/boards/:boardId/columns/:columnId — Update column title or position
// ──────────────────────────────────────
export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, columnId } = await params;

  // Verify ownership
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.userId !== user.id) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, position } = body;

  const updateData: { title?: string; position?: number } = {};
  if (title !== undefined) updateData.title = title.trim();
  if (position !== undefined) updateData.position = position;

  const column = await prisma.column.update({
    where: { id: columnId },
    data: updateData,
    include: { cards: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(column);
}

// ──────────────────────────────────────
// DELETE /api/boards/:boardId/columns/:columnId — Delete a column
// ──────────────────────────────────────
export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, columnId } = await params;

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.userId !== user.id) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  await prisma.column.delete({ where: { id: columnId } });

  return NextResponse.json({ message: "Column deleted" });
}
