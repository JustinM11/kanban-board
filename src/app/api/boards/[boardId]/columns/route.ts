// src/app/api/boards/[boardId]/columns/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ boardId: string }> };

// ──────────────────────────────────────
// POST /api/boards/:boardId/columns — Add a new column
// ──────────────────────────────────────
export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;

  // Verify the board belongs to this user
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board || board.userId !== user.id) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title || title.trim() === "") {
    return NextResponse.json(
      { error: "Column title is required" },
      { status: 400 },
    );
  }

  // Get the highest position to add the new column at the end
  const lastColumn = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });

  const newPosition = lastColumn ? lastColumn.position + 1 : 0;

  const column = await prisma.column.create({
    data: {
      title: title.trim(),
      position: newPosition,
      boardId,
    },
    include: { cards: true },
  });

  return NextResponse.json(column, { status: 201 });
}
