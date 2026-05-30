import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { TodoModel } from '../../models/todo.model';
import { Todo } from '../../types/todo.types';
import { CarryForwardDto } from './dto/carry-forward.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ToggleTodoDto } from './dto/toggle-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);

  constructor(private readonly todoModel: TodoModel) {}

  async getTodosByDate(adminId: string, date: string): Promise<Todo[]> {
    return this.todoModel.findByAdminAndDate(adminId, date);
  }

  async createTodo(adminId: string, dto: CreateTodoDto): Promise<Todo> {
    const maxOrder = await this.todoModel.getMaxSortOrder(adminId, dto.todoDate);
    const sortOrder = dto.sortOrder ?? maxOrder + 1;
    return this.todoModel.create({ adminId, title: dto.title, todoDate: dto.todoDate, sortOrder });
  }

  async updateTodo(id: string, adminId: string, dto: UpdateTodoDto): Promise<Todo> {
    await this.findOrThrow(id, adminId);
    const updated = await this.todoModel.update(id, adminId, dto);
    if (!updated) throw new NotFoundException(`Todo dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async toggleTodo(id: string, adminId: string, dto: ToggleTodoDto): Promise<Todo> {
    await this.findOrThrow(id, adminId);
    const updated = await this.todoModel.toggleComplete(id, adminId, dto.isCompleted);
    if (!updated) throw new NotFoundException(`Todo dengan id ${id} tidak ditemukan`);
    return updated;
  }

  async deleteTodo(id: string, adminId: string): Promise<void> {
    await this.findOrThrow(id, adminId);
    await this.todoModel.delete(id, adminId);
    this.logger.log(`Todo ${id} dihapus oleh admin ${adminId}`);
  }

  async carryForward(adminId: string, dto: CarryForwardDto): Promise<{ todos: Todo[]; count: number }> {
    const uncompleted = await this.todoModel.findUncompletedByAdminAndDate(adminId, dto.fromDate);
    if (uncompleted.length === 0) {
      return { todos: [], count: 0 };
    }

    const maxOrder = await this.todoModel.getMaxSortOrder(adminId, dto.toDate);
    const items = uncompleted.map((todo, index) => ({
      adminId,
      title:     todo.title,
      todoDate:  dto.toDate,
      sortOrder: maxOrder + 1 + index,
    }));

    const created = await this.todoModel.bulkCreate(items);
    this.logger.log(`Carry forward ${created.length} todo dari ${dto.fromDate} ke ${dto.toDate} oleh admin ${adminId}`);
    return { todos: created, count: created.length };
  }

  private async findOrThrow(id: string, adminId: string): Promise<Todo> {
    const todo = await this.todoModel.findById(id, adminId);
    if (!todo) throw new NotFoundException(`Todo dengan id ${id} tidak ditemukan`);
    return todo;
  }
}
