using TaskManager.DTOs;

namespace TaskManager.Interfaces;

public interface ITaskService
{
    Task<IEnumerable<TaskItemDto>> GetAllAsync(bool? isCompleted, CancellationToken cancellationToken = default);
    Task<TaskItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TaskItemDto> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Guid id, UpdateTaskDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}