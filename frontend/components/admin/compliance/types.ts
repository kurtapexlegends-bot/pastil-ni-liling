export interface Audit {
  id: number;
  hub: { name: string };
  auditor: { name: string };
  audit_date: string;
  hygiene_score: number;
  recipe_adherence_score: number;
  notes: string;
  status: 'pending' | 'approved' | 'flagged';
  kitchen_photo_path: string;
}

export interface Anomaly {
  id: number;
  hub_id: number;
  hub_name: string;
  offline_order_id: string;
  product_id: number;
  product_name: string;
  requested_quantity: number;
  available_quantity: number;
  status: 'pending' | 'resolved';
  notes: string;
  created_at: string;
}

export interface Hub {
  id: number;
  name: string;
}
