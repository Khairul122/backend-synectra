export interface Banner {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
