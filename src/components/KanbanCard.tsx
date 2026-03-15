// src/components/KanbanCard.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/lib/types";
import { useState } from "react";

type Props = {
  card: Card;
  isOverlay?: boolean;
  onRefresh?: () => void;
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function KanbanCard({
  card,
  isOverlay = false,
  onRefresh,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = async () => {
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setIsEditing(false);
    onRefresh?.();
  };

  const handleDelete = async () => {
    await fetch(`/api/cards/${card.id}`, {
      method: "DELETE",
    });
    onRefresh?.();
  };

  // Editing mode
  if (isEditing) {
    return (
      <div className="bg-gray-800 border border-blue-500/50 rounded-lg p-3 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setTitle(card.title);
              setDescription(card.description || "");
            }}
            className="px-3 py-1 text-gray-400 hover:text-white text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-red-400 hover:text-red-300 text-xs ml-auto transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  // Normal display mode
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition group ${
        isDragging ? "opacity-30" : ""
      } ${isOverlay ? "shadow-xl shadow-black/50 rotate-2" : ""}`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Priority Indicator + Title */}
      <div className="flex items-start gap-2">
        <div
          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
            priorityColors[card.priority] || "bg-gray-500"
          }`}
        />
        <p className="text-sm text-white font-medium leading-snug">
          {card.title}
        </p>
      </div>

      {/* Description (if exists) */}
      {card.description && (
        <p className="text-xs text-gray-400 mt-2 ml-4 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Due Date (if exists) */}
      {card.dueDate && (
        <div className="mt-2 ml-4">
          <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded">
            📅 {new Date(card.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
