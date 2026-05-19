export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankLogo: string | null;
  paymentType: 'bank' | 'qris' | 'both';
  qrisImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
