import { registerAs } from '@nestjs/config';

export default registerAs('github', () => ({
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  portfolioTopic: process.env.GITHUB_PORTFOLIO_TOPIC ?? 'portfolio',
}));
