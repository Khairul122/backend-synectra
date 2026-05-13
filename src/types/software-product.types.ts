export interface SoftwareProduct {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  techStack: string | null;
  features: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
