export type OrderStatus = 'pending' | 'in_progress' | 'testing' | 'revision' | 'completed' | 'canceled';

export interface Order {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  title: string;
  serviceCategory: string | null;
  description: string | null;
  totalPrice: number | null;
  deadline: string | null;
  status: OrderStatus;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRevision {
  id: string;
  orderId: string;
  items: Array<{ notes: string; images: string[] }>;
  createdAt: string;
}
