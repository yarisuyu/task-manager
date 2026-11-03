import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common'; // Для форматирования даты
import { TaskItem } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  task = input.required<TaskItem>();
  isProcessing = input<boolean>(false);

  statusToggled = output<TaskItem>();
  taskDeleted = output<TaskItem>();
}
