export interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  features: string | null;
  badge: string | null;
  iconUrl: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
