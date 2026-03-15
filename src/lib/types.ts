// src/lib/types.ts
// These types match our Prisma models but are plain objects (no Prisma methods)

export type Card = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
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
