// src/app/api/boards/[boardId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ boardId: string }> };

// Helper: verify the board belongs to the current user
async function getAuthorizedBoard(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: { orderBy: { position: "asc" } },
        },
      },
    },
  });

  if (!board || board.userId !== userId) {
    return null;
  }

  return board;
}

// ──────────────────────────────────────
// GET /api/boards/:boardId — Get a single board with all columns and cards
// ──────────────────────────────────────
export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const board = await getAuthorizedBoard(boardId, user.id);

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}

// ──────────────────────────────────────
// PATCH /api/boards/:boardId — Update board title
// ──────────────────────────────────────
export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const board = await getAuthorizedBoard(boardId, user.id);

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title || title.trim() === "") {
    return NextResponse.json(
      { error: "Board title is required" },
      { status: 400 },
    );
  }

  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: { title: title.trim() },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: { cards: { orderBy: { position: "asc" } } },
      },
    },
  });

  return NextResponse.json(updatedBoard);
}

// ──────────────────────────────────────
// DELETE /api/boards/:boardId — Delete a board and all its data
// ──────────────────────────────────────
export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const board = await getAuthorizedBoard(boardId, user.id);

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  await prisma.board.delete({
    where: { id: boardId },
  });

  return NextResponse.json({ message: "Board deleted successfully" });
}
