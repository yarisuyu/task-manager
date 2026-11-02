import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form';
import { By } from '@angular/platform-browser';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('должен создаваться', () => {
    expect(component).toBeTruthy();
  });

  // --- ТЕСТЫ ВАЛИДАЦИИ ---
  it('форма должна быть невалидной, если поле title пустое', () => {
    // Сначала делаем форму валидной
    component.taskForm.controls.title.setValue('Валидное название');
    expect(component.taskForm.valid).toBe(true);

    // Затем очищаем
    component.taskForm.controls.title.setValue('');
    expect(component.taskForm.invalid).toBe(true);
  });

  it('форма должна быть невалидной, если title длиннее 200 символов', () => {
    component.taskForm.controls.title.setValue('a'.repeat(201));
    expect(component.taskForm.invalid).toBe(true);
  });

  it('форма должна быть валидной при корректном заполнении', () => {
    component.taskForm.patchValue({
      title: 'Купить молоко',
      description: '2 литра',
    });
    expect(component.taskForm.valid).toBe(true);
  });

  // --- ТЕСТЫ ОТПРАВКИ ---
  it('НЕ должен выбрасывать событие, если форма невалидна', () => {
    vi.spyOn(component.taskCreated, 'emit');
    component.taskForm.controls.title.setValue(''); // Делаем невалидной

    component.onSubmit();

    expect(component.taskCreated.emit).not.toHaveBeenCalled();
  });

  it('должен выбрасывать событие taskCreated и очищать форму при валидной отправке', () => {
    vi.spyOn(component.taskCreated, 'emit');

    component.taskForm.patchValue({
      title: 'Новая задача',
      description: 'Описание',
    });

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);

    // Проверяем, что событие вызвано с правильными данными
    expect(component.taskCreated.emit).toHaveBeenCalledWith({
      title: 'Новая задача',
      description: 'Описание',
    });

    // Проверяем, что форма очистилась (пустые строки, а не null)
    expect(component.taskForm.controls.title.value).toBe('');
    expect(component.taskForm.controls.description.value).toBe('');
  });
});
