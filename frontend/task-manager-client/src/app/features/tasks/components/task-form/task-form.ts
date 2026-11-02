import { Component, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskRequest } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule], // Импортируем модуль для работы с формами
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);

  taskCreated = output<CreateTaskRequest>();

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
  });

  get isTitleInvalid(): boolean {
    const titleControl = this.taskForm.get('title');

    return !!(titleControl?.invalid && titleControl?.touched);
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.getRawValue();

      const request: CreateTaskRequest = {
        title: formValue.title ?? '',
        description: formValue.description || null,
      };

      this.taskCreated.emit(request);

      this.taskForm.reset({
        title: '',
        description: '',
      });
    }
  }
}
