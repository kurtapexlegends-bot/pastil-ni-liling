export interface Expense {
  id: number;
  hub_id: number | null;
  category: string;
  amount: string;
  date: string;
  description: string | null;
  created_at: string;
  hub?: {
    id: number;
    name: string;
  } | null;
}
