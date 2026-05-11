export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';
export type PaymentType  = 'dp' | 'termin_1' | 'pelunasan';

export interface Payment {
  id: string;
  orderId: string;
  paymentType: string;
  amount: number;
  receiptImageUrl: string;
  status: PaymentStatus;
  notes: string | null;
  verifiedAt: string | null;
  createdAt: string;
}
