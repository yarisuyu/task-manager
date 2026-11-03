import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskService } from '../../../../core/services/task.service';
import { CreateTaskRequest, TaskItem } from '../../../../core/models/task.model';
import { TaskFormComponent } from '../../components/task-form/task-form';
import { TaskItemComponent } from '../../components/task-item/task-item';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [TaskFormComponent, TaskItemComponent],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent implements OnInit {
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  tasks = signal<TaskItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  processingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getTasks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.tasks.set(data);
        },
        error: (err) => this.handleError('Не удалось загрузить задачи', err),
      });
  }

  onTaskCreated(request: CreateTaskRequest): void {
    this.taskService
      .createTask(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newTask) => {
          this.tasks.update((current) => [newTask, ...current]);
        },
        error: (err) => {
          this.handleError('Ошибка при создании задачи', err);
        },
      });
  }

  onToggleStatus(task: TaskItem): void {
    if (this.processingId() === task.id) return;

    this.processingId.set(task.id);

    const updateRequest = {
      title: task.title,
      description: task.description,
      isCompleted: !task.isCompleted,
    };

    this.taskService
      .updateTask(task.id, updateRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.processingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.tasks.update((tasks) =>
            tasks.map((t) => (t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t)),
          );
        },
        error: (err) => {
          this.handleError('Ошибка при обновлении статуса', err);
        },
      });
  }

  onDeleteTask(task: TaskItem): void {
    if (this.processingId() === task.id) return;

    this.processingId.set(task.id);

    this.taskService
      .deleteTask(task.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.processingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
        },
        error: (err) => {
          this.handleError('Ошибка при удалении задачи', err);
        },
      });
  }

  private handleError(message: string, error: HttpErrorResponse): void {
    this.errorMessage.set(message);
    console.error(message, error);
  }
}
