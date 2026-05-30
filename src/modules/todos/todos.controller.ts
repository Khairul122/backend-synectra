import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CarryForwardDto } from './dto/carry-forward.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ToggleTodoDto } from './dto/toggle-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@ApiTags('todos')
@Controller('todos')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiCookieAuth('access_token')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua todo admin di tanggal tertentu' })
  @ApiQuery({ name: 'date', required: true, example: '2026-05-30', description: 'Format: YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Daftar todo berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — bukan admin' })
  findByDate(
    @CurrentUser('id') adminId: string,
    @Query('date') date: string,
  ) {
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    return this.todosService.getTodosByDate(adminId, targetDate);
  }

  @Post()
  @ApiOperation({ summary: 'Buat todo baru' })
  @ApiResponse({ status: 201, description: 'Todo berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todosService.createTodo(adminId, dto);
  }

  @Post('carry-forward')
  @ApiOperation({ summary: 'Salin todo belum selesai dari tanggal sebelumnya ke tanggal tujuan' })
  @ApiResponse({ status: 201, description: 'Carry forward berhasil' })
  @ApiResponse({ status: 400, description: 'Validasi gagal' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  carryForward(
    @CurrentUser('id') adminId: string,
    @Body() dto: CarryForwardDto,
  ) {
    return this.todosService.carryForward(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update judul atau urutan todo' })
  @ApiResponse({ status: 200, description: 'Todo berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Todo tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todosService.updateTodo(id, adminId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle status selesai todo' })
  @ApiResponse({ status: 200, description: 'Status todo berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Todo tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  toggle(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
    @Body() dto: ToggleTodoDto,
  ) {
    return this.todosService.toggleTodo(id, adminId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus todo' })
  @ApiResponse({ status: 204, description: 'Todo berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Todo tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(
    @CurrentUser('id') adminId: string,
    @Param('id') id: string,
  ) {
    return this.todosService.deleteTodo(id, adminId);
  }
}
