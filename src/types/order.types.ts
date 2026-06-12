export type OrderStatus = 'pending' | 'in_progress' | 'testing' | 'revision' | 'completed' | 'canceled';

export interface Order {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  isVip?: boolean;
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
  source: 'client' | 'admin';
  items: Array<{ notes: string; images: string[] }>;
  adminResponse: { notes: string; images: string[] } | null;
  adminRespondedAt: string | null;
  createdAt: string;
}
