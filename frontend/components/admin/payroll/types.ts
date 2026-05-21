export interface Shift {
  id: number;
  user: { name: string };
  hub: { name: string };
  clock_in: string;
  clock_out: string | null;
  hourly_rate: string;
  status: string;
}

export interface PayoutLedger {
  id: number;
  user: { name: string };
  hub: { name: string };
  start_date: string;
  end_date: string;
  base_pay: string;
  commission_pay: string;
  total_pay: string;
  status: string;
}
