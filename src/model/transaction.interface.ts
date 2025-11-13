export interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit'; 
  category: string;
  account: string;
  createdAt: string;
  updatedAt: string;
}