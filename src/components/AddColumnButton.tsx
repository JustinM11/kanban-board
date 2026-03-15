// src/components/AddColumnButton.tsx
"use client";

import { useState } from "react";

type Props = {
  boardId: string;
  onRefresh: () => void;
};

export default function AddColumnButton({ boardId, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const response = await fetch(`/api/boards/${boardId}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    if (response.ok) {
      setTitle("");
      setIsOpen(false);
      onRefresh();
    }

    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-72 shrink-0 h-12 border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-xl flex items-center justify-center text-sm text-gray-500 hover:text-gray-300 transition cursor-pointer"
      >
        + Add column
      </button>
    );
  }

  return (
    <div className="w-72 shrink-0 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Column title..."
        autoFocus
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-medium rounded-md transition cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Add column"}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
          className="px-3 py-2 text-gray-400 hover:text-white text-xs transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
