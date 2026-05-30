import { Module } from '@nestjs/common';

import { TodoModel } from '../../models/todo.model';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodoModel],
})
export class TodosModule {}
