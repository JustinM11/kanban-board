// src/components/BoardView.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Board, Card, Column as ColumnType } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import AddColumnButton from "./AddColumnButton";

export default function BoardView({ board }: { board: Board }) {
  // State: we maintain a local copy of columns so drag-and-drop updates are instant
  const [columns, setColumns] = useState<ColumnType[]>(board.columns);
  // Track which card is currently being dragged (for the overlay)
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Configure the drag sensor — requires 5px of movement before drag starts
  // This prevents accidental drags when clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // ── DRAG START ──
  // When the user picks up a card, store it so we can show the overlay
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCardById(active.id as string);
    if (card) {
      setActiveCard(card);
    }
  };

  // ── DRAG OVER ──
  // Fires while dragging over different columns — we move the card in state
  // so the UI updates in real-time as you drag
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which columns the active card and the target are in
    const activeColumn = findColumnByCardId(activeId);
    const overColumn =
      findColumnByCardId(overId) || columns.find((col) => col.id === overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Move the card between columns in local state
    setColumns((prev) => {
      const activeCards = [...activeColumn.cards];
      const overCards = [...overColumn.cards];

      const activeIndex = activeCards.findIndex((c) => c.id === activeId);
      const overIndex = overCards.findIndex((c) => c.id === overId);

      // Remove from source column
      const [movedCard] = activeCards.splice(activeIndex, 1);
      movedCard.columnId = overColumn.id;

      // Insert into target column
      const insertIndex = overIndex >= 0 ? overIndex : overCards.length;
      overCards.splice(insertIndex, 0, movedCard);

      return prev.map((col) => {
        if (col.id === activeColumn.id) return { ...col, cards: activeCards };
        if (col.id === overColumn.id) return { ...col, cards: overCards };
        return col;
      });
    });
  };

  // ── DRAG END ──
  // When the user drops the card, update positions and save to the database
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByCardId(activeId);
    if (!activeColumn) return;

    // Handle reordering within the same column
    const oldIndex = activeColumn.cards.findIndex((c) => c.id === activeId);
    const newIndex = activeColumn.cards.findIndex((c) => c.id === overId);

    if (oldIndex !== newIndex && newIndex >= 0) {
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== activeColumn.id) return col;
          const newCards = [...col.cards];
          const [moved] = newCards.splice(oldIndex, 1);
          newCards.splice(newIndex, 0, moved);
          return { ...col, cards: newCards };
        }),
      );
    }

    // Find the final position and column, then save to database
    const finalColumn = findColumnByCardId(activeId);
    if (!finalColumn) return;
    const finalPosition = finalColumn.cards.findIndex((c) => c.id === activeId);

    // Save to database in the background (don't await — keep UI snappy)
    fetch("/api/cards/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: activeId,
        targetColumnId: finalColumn.id,
        newPosition: finalPosition,
      }),
    });
  };

  // ── HELPER FUNCTIONS ──
  function findCardById(cardId: string): Card | null {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function findColumnByCardId(cardId: string): ColumnType | null {
    return (
      columns.find((col) => col.cards.some((c) => c.id === cardId)) || null
    );
  }

  // Called by child components when a card is added or deleted
  const refreshBoard = async () => {
    const response = await fetch(`/api/boards/${board.id}`);
    if (response.ok) {
      const updatedBoard = await response.json();
      setColumns(updatedBoard.columns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              boardId={board.id}
              onRefresh={refreshBoard}
            />
          ))}
          <AddColumnButton boardId={board.id} onRefresh={refreshBoard} />
        </div>
      </div>

      {/* Drag Overlay — the floating card that follows your cursor */}
      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
