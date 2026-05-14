import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackModel } from '../../models/feedback.model';
import { Feedback } from '../../types/feedback.types';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbacksService {
  constructor(private readonly feedbackModel: FeedbackModel) {}

  findAll(): Promise<Feedback[]> {
    return this.feedbackModel.findAll();
  }

  async findById(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) throw new NotFoundException(`Feedback dengan id ${id} tidak ditemukan`);
    return feedback;
  }

  create(dto: CreateFeedbackDto): Promise<Feedback> {
    return this.feedbackModel.create(dto);
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    await this.findById(id);
    const updated = await this.feedbackModel.update(id, dto);
    return updated!;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    return this.feedbackModel.delete(id);
  }
}
