import { Module } from '@nestjs/common';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackModel } from '../../models/feedback.model';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksService, FeedbackModel],
})
export class FeedbacksModule {}
