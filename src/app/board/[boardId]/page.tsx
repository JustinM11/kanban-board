// src/app/board/[boardId]/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BoardView from "@/components/BoardView";

type Params = { params: Promise<{ boardId: string }> };

export default async function BoardPage({ params }: Params) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
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
  });

  // Board not found or doesn't belong to this user
  if (!board || board.userId !== user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm shrink-0">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-white">{board.title}</h1>
        </div>
      </nav>

      {/* Board Content — this is the client component with drag-and-drop */}
      <BoardView board={board} />
    </div>
  );
}
