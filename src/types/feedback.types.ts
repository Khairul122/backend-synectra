export interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
