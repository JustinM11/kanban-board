// src/components/AddCardButton.tsx
"use client";

import { useState } from "react";

type Props = {
  columnId: string;
  onRefresh: () => void;
};

export default function AddCardButton({ columnId, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), columnId }),
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
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition cursor-pointer"
      >
        + Add card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="Card title..."
        autoFocus
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-medium rounded-md transition cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Add"}
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
          className="px-3 py-1.5 text-gray-400 hover:text-white text-xs transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
