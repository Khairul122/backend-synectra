export interface ProgressReport {
  id: string;
  orderId: string;
  title: string;
  description: string | null;
  progressPercentage: number;
  attachmentUrl: string | null;
  reportedAt: string;
}
