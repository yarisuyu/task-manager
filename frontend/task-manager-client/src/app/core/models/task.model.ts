// src/app/core/models/task.model.ts

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string | null;
  isCompleted: boolean;
}
