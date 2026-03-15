// src/app/api/boards/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// ──────────────────────────────────────
// GET /api/boards — List all boards for the logged-in user
// ──────────────────────────────────────
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await prisma.board.findMany({
    where: { userId: user.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

// ──────────────────────────────────────
// POST /api/boards — Create a new board
// ──────────────────────────────────────
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title } = body;

  if (!title || title.trim() === "") {
    return NextResponse.json(
      { error: "Board title is required" },
      { status: 400 },
    );
  }

  // Create the board WITH default columns
  const board = await prisma.board.create({
    data: {
      title: title.trim(),
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
      columns: {
        orderBy: { position: "asc" },
        include: { cards: true },
      },
    },
  });

  return NextResponse.json(board, { status: 201 });
}
