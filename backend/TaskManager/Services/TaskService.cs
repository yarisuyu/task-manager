using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;
using TaskManager.Interfaces;

namespace TaskManager.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaskItemDto>> GetAllAsync(bool? isCompleted, CancellationToken cancellationToken = default)
    {
        var query = _context.Tasks.AsNoTracking().AsQueryable();

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync(cancellationToken);

        return tasks.Select(MapToDto);
    }

    public async Task<TaskItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks
        .AsNoTracking()
        .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        return task == null ? null : MapToDto(task);
    }

    public async Task<TaskItemDto> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken = default)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow 
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(task);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateTaskDto dto, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FindAsync(new object[] { id }, cancellationToken);
        if (task == null) return false;

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.IsCompleted = dto.IsCompleted;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _context.Tasks.FindAsync(new object[] { id }, cancellationToken);
        if (task == null) return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static TaskItemDto MapToDto(TaskItem task)
    {
        return new TaskItemDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt
        };
    }
}