export interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}
