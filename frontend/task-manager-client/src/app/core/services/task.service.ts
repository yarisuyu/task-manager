// src/app/core/services/task.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskRequest, TaskItem, UpdateTaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  // Внедряем HttpClient с помощью современной функции inject()
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  // GET /api/tasks
  getTasks(isCompleted?: boolean): Observable<TaskItem[]> {
    let params = new HttpParams();
    if (isCompleted !== undefined) {
      params = params.append('isCompleted', isCompleted.toString());
    }
    return this.http.get<TaskItem[]>(this.apiUrl, { params });
  }

  // GET /api/tasks/{id}
  getTask(id: string): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  // POST /api/tasks
  createTask(request: CreateTaskRequest): Observable<TaskItem> {
    return this.http.post<TaskItem>(this.apiUrl, request);
  }

  // PUT /api/tasks/{id}
  updateTask(id: string, request: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  // DELETE /api/tasks/{id}
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
