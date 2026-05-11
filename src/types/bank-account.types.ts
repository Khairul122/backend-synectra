export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankLogo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
