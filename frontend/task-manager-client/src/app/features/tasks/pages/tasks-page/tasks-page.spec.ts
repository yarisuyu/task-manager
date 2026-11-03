import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksPageComponent } from './tasks-page';
import { TaskService } from '../../../../core/services/task.service';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskItem } from '../../../../core/models/task.model';

describe('TasksPageComponent', () => {
  let component: TasksPageComponent;
  let fixture: ComponentFixture<TasksPageComponent>;

  let taskServiceMock: Partial<TaskService>;

  const mockTask: TaskItem = {
    id: '1',
    title: 'Test Task',
    description: 'Desc',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    taskServiceMock = {
      getTasks: vi.fn().mockReturnValue(of([mockTask])),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [{ provide: TaskService, useValue: taskServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    component = fixture.componentInstance;
  });

  it('должен создаваться', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- ТЕСТЫ ЗАГРУЗКИ (GET) ---
  it('должен загружать задачи и управлять флагом isLoading', () => {
    fixture.detectChanges();

    expect(taskServiceMock.getTasks).toHaveBeenCalled();
    expect(component.tasks()).toEqual([mockTask]);
    expect(component.isLoading()).toBe(false);
  });

  it('должен обрабатывать ошибку при загрузке задач', () => {
    const errorResponse = new HttpErrorResponse({ status: 500 });
    taskServiceMock.getTasks = vi.fn().mockReturnValue(throwError(() => errorResponse));

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Не удалось загрузить задачи');
    expect(component.isLoading()).toBe(false);
  });

  // --- ТЕСТЫ СОЗДАНИЯ (POST) ---
  it('должен добавлять новую задачу в начало списка', () => {
    fixture.detectChanges();

    const newTask: TaskItem = {
      id: '2',
      title: 'New',
      description: 'New Desc',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    taskServiceMock.createTask = vi.fn().mockReturnValue(of(newTask));

    component.onTaskCreated({ title: 'New', description: 'New Desc' });

    expect(taskServiceMock.createTask).toHaveBeenCalledWith({
      title: 'New',
      description: 'New Desc',
    });
    expect(component.tasks().length).toBe(2);
    expect(component.tasks()[0]).toEqual(newTask);
  });

  // --- ТЕСТЫ ОБНОВЛЕНИЯ (PUT) ---
  it('должен блокировать задачу (processingId) во время запроса и обновлять статус', () => {
    fixture.detectChanges();

    const updateSubject = new Subject<void>();
    taskServiceMock.updateTask = vi.fn().mockReturnValue(updateSubject.asObservable());

    component.onToggleStatus(mockTask);

    expect(component.processingId()).toBe('1');
    expect(taskServiceMock.updateTask).toHaveBeenCalled();

    updateSubject.next();
    updateSubject.complete();

    expect(component.processingId()).toBeNull();
    expect(component.tasks()[0].isCompleted).toBe(true);
  });

  it('НЕ должен отправлять запрос на обновление, если задача уже в процессе обработки', () => {
    fixture.detectChanges();

    component.processingId.set('1');

    component.onToggleStatus(mockTask);

    expect(taskServiceMock.updateTask).not.toHaveBeenCalled();
  });

  // --- ТЕСТЫ УДАЛЕНИЯ (DELETE) ---
  it('должен удалять задачу из списка', () => {
    fixture.detectChanges();

    taskServiceMock.deleteTask = vi.fn().mockReturnValue(of(void 0));

    component.onDeleteTask(mockTask);

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith('1');
    expect(component.tasks().length).toBe(0);
  });
});
