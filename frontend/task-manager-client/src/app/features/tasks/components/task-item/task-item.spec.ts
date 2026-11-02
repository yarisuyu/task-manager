import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item';
import { TaskItem } from '../../../../core/models/task.model';
import { By } from '@angular/platform-browser';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;
  let mockTask: TaskItem;

  beforeEach(async () => {
    mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    await TestBed.configureTestingModule({
      imports: [TaskItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('должен создаваться', () => {
    expect(component).toBeTruthy();
  });

  it('должен отображать данные задачи (title и description)', () => {
    const titleEl = fixture.debugElement.query(By.css('h3')).nativeElement;
    const descEl = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(titleEl.textContent).toContain('Test Task');
    expect(descEl.textContent).toContain('Test Description');
  });

  it('НЕ должен отображать тег <p>, если description пустой', () => {
    fixture.componentRef.setInput('task', { ...mockTask, description: null });
    fixture.detectChanges();

    const descEl = fixture.debugElement.query(By.css('p'));
    expect(descEl).toBeNull();
  });

  it('должен менять текст кнопки в зависимости от статуса', () => {
    const btn = fixture.debugElement.query(By.css('.btn-toggle')).nativeElement;
    expect(btn.textContent).toContain('Выполнено');

    fixture.componentRef.setInput('task', { ...mockTask, isCompleted: true });
    fixture.detectChanges();

    expect(btn.textContent).toContain('Вернуть в работу');
  });

  it('должен добавлять класс completed, если задача выполнена', () => {
    let card = fixture.debugElement.query(By.css('.task-card')).nativeElement;
    expect(card.classList.contains('completed')).toBe(false);

    fixture.componentRef.setInput('task', { ...mockTask, isCompleted: true });
    fixture.detectChanges();

    card = fixture.debugElement.query(By.css('.task-card')).nativeElement;
    expect(card.classList.contains('completed')).toBe(true);
  });

  it('должен выбрасывать событие toggleStatus с правильным объектом задачи', () => {
    vi.spyOn(component.statusToggled, 'emit');

    const btn = fixture.debugElement.query(By.css('.btn-toggle'));
    btn.nativeElement.click();

    expect(component.statusToggled.emit).toHaveBeenCalledWith(mockTask);
  });

  it('должен выбрасывать событие deleteTask с правильным объектом задачи', () => {
    vi.spyOn(component.taskDeleted, 'emit');

    const btn = fixture.debugElement.query(By.css('.btn-delete'));
    btn.nativeElement.click();

    expect(component.taskDeleted.emit).toHaveBeenCalledWith(mockTask);
  });
});
