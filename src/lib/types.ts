// src/lib/types.ts
export type Card = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  columnId: string;
};

export type Column = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
};

export type Board = {
  id: string;
  title: string;
  userId: string;
  columns: Column[];
};
