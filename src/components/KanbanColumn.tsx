// src/components/KanbanColumn.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "@/lib/types";
import KanbanCard from "./KanbanCard";
import AddCardButton from "./AddCardButton";

type Props = {
  column: Column;
  boardId: string;
  onRefresh: () => void;
};

export default function KanbanColumn({ column, boardId, onRefresh }: Props) {
  // useDroppable makes this column a valid drop target
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="w-72 shrink-0 flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">
            {column.title}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-900/50 rounded-xl p-2 space-y-2 min-h-[200px] transition border-2 ${
          isOver ? "border-blue-500/50 bg-blue-500/5" : "border-transparent"
        }`}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onRefresh={onRefresh} />
          ))}
        </SortableContext>

        <AddCardButton columnId={column.id} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
