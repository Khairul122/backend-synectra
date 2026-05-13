export type SoftwarePurchaseStatus = 'pending_payment' | 'pending_verification' | 'verified' | 'rejected';

export interface SoftwarePurchase {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  softwareId: string;
  softwareName: string;
  softwarePrice: number;
  quantity: number;
  totalPrice: number;
  receiptImageUrl: string | null;
  paymentStatus: SoftwarePurchaseStatus;
  notes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
