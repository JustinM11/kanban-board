// src/components/CreateBoardButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateBoardButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const response = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (response.ok) {
      setTitle("");
      setIsOpen(false);
      router.refresh(); // Re-run the server component to show the new board
    }

    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
      >
        + New Board
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder="Board name..."
        autoFocus
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleCreate}
        disabled={loading || !title.trim()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Create"}
      </button>
      <button
        onClick={() => {
          setIsOpen(false);
          setTitle("");
        }}
        className="px-3 py-2 text-gray-400 hover:text-white text-sm transition cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}
