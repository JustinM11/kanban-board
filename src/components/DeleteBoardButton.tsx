// src/components/DeleteBoardButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBoardButton({ boardId }: { boardId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // Confirm before deleting
    if (
      !window.confirm(
        "Are you sure you want to delete this board? All columns and cards will be deleted too.",
      )
    ) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/boards/${boardId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition cursor-pointer"
      title="Delete board"
    >
      {loading ? (
        <span className="text-xs">...</span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      )}
    </button>
  );
}
