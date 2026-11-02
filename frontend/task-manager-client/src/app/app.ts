import { Component } from '@angular/core';
import { TaskFormComponent } from './features/tasks/components/task-form/task-form';
import { TaskItemComponent } from './features/tasks/components/task-item/task-item';
import { CreateTaskRequest, TaskItem } from './core/models/task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskFormComponent, TaskItemComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Создаем фейковую задачу для теста
  mockTask: TaskItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Выучить Angular',
    description: 'Прочитать документацию по Signals и Standalone компонентам',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  // Методы для проверки событий (Output)
  onTaskCreated(data: CreateTaskRequest) {
    console.log('Форма отправила данные:', data);
  }

  onToggleStatus(task: TaskItem) {
    console.log('Нажата кнопка "Выполнено" для задачи:', task.title);
    this.mockTask.isCompleted = !this.mockTask.isCompleted; // Для визуального теста
  }

  onDeleteTask(task: TaskItem) {
    console.log('Нажата кнопка "Удалить" для задачи:', task.title);
  }
}
