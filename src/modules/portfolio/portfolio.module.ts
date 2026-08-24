import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioModel } from '../../models/portfolio.model';

@Module({
  controllers: [PortfolioController],
  providers:   [PortfolioService, PortfolioModel],
  exports:     [PortfolioModel],
})
export class PortfolioModule {}
