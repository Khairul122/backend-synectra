export interface SoftwareProduct {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  category: string | null;
  price: number;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  techStack: string | null;
  features: string | null;
  featuresEn: string | null;
  softcopyUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
