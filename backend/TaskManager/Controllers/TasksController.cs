using Microsoft.AspNetCore.Mvc;
using TaskManager.DTOs;
using TaskManager.Interfaces;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Получить список задач с опциональной фильтрацией по статусу.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TaskItemDto>>> GetAll([FromQuery] bool? isCompleted, CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetAllAsync(isCompleted, cancellationToken);
        return Ok(tasks);
    }

    /// <summary>
    /// Получить задачу по идентификатору.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskItemDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(id, cancellationToken);
        if (task == null) return NotFound();

        return Ok(task);
    }

    /// <summary>
    /// Создать новую задачу.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskItemDto>> Create(CreateTaskDto dto, CancellationToken cancellationToken)
    {
        // Благодаря [ApiController] валидация DTO произойдет автоматически до входа в этот метод.
        // Если данные невалидны, клиент получит 400 Bad Request.
        var createdTask = await _taskService.CreateAsync(dto, cancellationToken);

        // Возвращаем 201 Created и ссылку на созданный ресурс (в заголовке Location)
        return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, createdTask);
    }

    /// <summary>
    /// Обновить существующую задачу.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdateTaskDto dto, CancellationToken cancellationToken)
    {
        var updated = await _taskService.UpdateAsync(id, dto, cancellationToken);
        if (!updated) return NotFound();

        return NoContent(); // 204 No Content (успешно, без тела ответа)
    }

    /// <summary>
    /// Удалить задачу.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _taskService.DeleteAsync(id, cancellationToken);
        if (!deleted) return NotFound();

        return NoContent(); // 204 No Content
    }
}