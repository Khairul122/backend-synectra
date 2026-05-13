export interface ServicePackage {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  price: number;
  duration: string | null;
  durationEn: string | null;
  features: string | null;
  featuresEn: string | null;
  badge: string | null;
  badgeEn: string | null;
  iconUrl: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
