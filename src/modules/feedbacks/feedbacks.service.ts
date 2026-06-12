import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackModel } from '../../models/feedback.model';
import { Feedback } from '../../types/feedback.types';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { cached, invalidateCache } from '../../common/utils/memory-cache';

const CACHE_KEY = 'feedbacks:findAll';
const CACHE_TTL = 60_000;

@Injectable()
export class FeedbacksService {
  constructor(private readonly feedbackModel: FeedbackModel) {}

  findAll(): Promise<Feedback[]> {
    return cached(CACHE_KEY, CACHE_TTL, () => this.feedbackModel.findAll());
  }

  async findById(id: string): Promise<Feedback> {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) throw new NotFoundException(`Feedback dengan id ${id} tidak ditemukan`);
    return feedback;
  }

  async create(dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = await this.feedbackModel.create(dto);
    invalidateCache(CACHE_KEY);
    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto): Promise<Feedback> {
    await this.findById(id);
    const updated = await this.feedbackModel.update(id, dto);
    invalidateCache(CACHE_KEY);
    return updated!;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.feedbackModel.delete(id);
    invalidateCache(CACHE_KEY);
  }
}
