// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateBoardButton from "@/components/CreateBoardButton";
import DeleteBoardButton from "@/components/DeleteBoardButton";

export default async function DashboardPage() {
  // This runs on the SERVER — check if user is logged in
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login"); // Not logged in? Send them to login
  }

  // Fetch all boards for this user
  const boards = await prisma.board.findMany({
    where: { userId: user.id },
    include: {
      columns: {
        include: {
          _count: {
            select: { cards: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total cards per board
  const boardsWithCounts = boards.map((board) => ({
    ...board,
    totalCards: board.columns.reduce((sum, col) => sum + col._count.cards, 0),
  }));

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Kanban Board</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user.name}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Sign out
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Boards</h2>
            <p className="text-gray-400 mt-1">
              {boardsWithCounts.length} board
              {boardsWithCounts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateBoardButton />
        </div>

        {/* Board Grid */}
        {boardsWithCounts.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-white mb-2">
              No boards yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first board to start organizing tasks
            </p>
            <CreateBoardButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardsWithCounts.map((board) => (
              <div
                key={board.id}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition relative"
              >
                <Link href={`/board/${board.id}`} className="block">
                  <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition">
                    {board.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{board.columns.length} columns</span>
                    <span>•</span>
                    <span>{board.totalCards} cards</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {board.columns.map((col) => (
                      <div
                        key={col.id}
                        className="flex-1 bg-gray-800 rounded-md px-2 py-1 text-xs text-gray-400 text-center truncate"
                      >
                        {col.title}
                      </div>
                    ))}
                  </div>
                </Link>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                  <DeleteBoardButton boardId={board.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
