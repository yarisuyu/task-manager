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

  let mockTask: TaskItem;

  beforeEach(async () => {
    mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Desc',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

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

  // --- ТЕСТЫ ФИЛЬТРАЦИИ ---
  it('должен загружать все задачи (undefined) при инициализации', () => {
    fixture.detectChanges(); // Вызывает ngOnInit

    expect(component.currentFilter()).toBeUndefined();
    expect(taskServiceMock.getTasks).toHaveBeenCalledWith(undefined);
  });

  it('должен запрашивать только активные задачи при выборе фильтра false', () => {
    fixture.detectChanges();
    vi.clearAllMocks(); // Очищаем предыдущие вызовы, чтобы тест был чистым

    component.setFilter(false);

    expect(component.currentFilter()).toBe(false);
    expect(taskServiceMock.getTasks).toHaveBeenCalledWith(false);
  });

  it('должен запрашивать только выполненные задачи при выборе фильтра true', () => {
    fixture.detectChanges();
    vi.clearAllMocks();

    component.setFilter(true);

    expect(component.currentFilter()).toBe(true);
    expect(taskServiceMock.getTasks).toHaveBeenCalledWith(true);
  });

  it('НЕ должен делать новый запрос, если выбранный фильтр уже активен', () => {
    fixture.detectChanges(); // Изначально фильтр undefined
    vi.clearAllMocks();

    // Пытаемся установить тот же фильтр
    component.setFilter(undefined);

    // Запрос не должен уйти
    expect(taskServiceMock.getTasks).not.toHaveBeenCalled();
  });

  it('должен удалять задачу из списка, если она перестает соответствовать активному фильтру', () => {
    fixture.detectChanges();

    component.setFilter(false);

    expect(component.tasks().length).toBe(1);

    taskServiceMock.updateTask = vi.fn().mockReturnValue(of(void 0));

    component.onToggleStatus(mockTask);

    // Проверяем, что задача исчезла из списка, так как она больше не "Активная"
    expect(component.tasks().length).toBe(0);
  });

  it('должен удалять задачу из списка, если она перестает соответствовать фильтру "Выполненные"', () => {
    // 1. Создаем задачу со статусом "выполнена"
    const completedTask: TaskItem = {
      ...mockTask,
      isCompleted: true,
    };

    // Имитируем, что сервер вернул именно эту задачу
    taskServiceMock.getTasks = vi.fn().mockReturnValue(of([completedTask]));

    fixture.detectChanges();

    // 2. Устанавливаем фильтр "Выполненные" (true)
    component.setFilter(true);
    expect(component.tasks().length).toBe(1); // Задача на экране

    // 3. Мокаем успешный ответ от сервера
    taskServiceMock.updateTask = vi.fn().mockReturnValue(of(void 0));

    // 4. Возвращаем задачу в работу (меняем статус на false)
    component.onToggleStatus(completedTask);

    // 5. Проверяем, что задача исчезла из списка, так как она больше не "Выполненная"
    expect(component.tasks().length).toBe(0);
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

  it('должен обрабатывать ошибку при создании задачи', () => {
    fixture.detectChanges();
    const errorResponse = new HttpErrorResponse({ status: 400 });
    taskServiceMock.createTask = vi.fn().mockReturnValue(throwError(() => errorResponse));

    component.onTaskCreated({ title: 'New', description: 'New Desc' });

    expect(component.errorMessage()).toBe('Ошибка при создании задачи');
    expect(component.tasks().length).toBe(1); // Список не изменился
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

  it('должен обрабатывать ошибку при удалении задачи', () => {
    fixture.detectChanges();
    const errorResponse = new HttpErrorResponse({ status: 500 });
    taskServiceMock.deleteTask = vi.fn().mockReturnValue(throwError(() => errorResponse));

    component.onDeleteTask(mockTask);

    expect(component.errorMessage()).toBe('Ошибка при удалении задачи');
    expect(component.tasks().length).toBe(1); // Задача не удалилась из списка
  });
});
