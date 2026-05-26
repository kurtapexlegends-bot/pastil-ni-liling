export interface Product {
  id: number | null;
  name: string;
  slug?: string;
  description: string;
  price: number;
  wholesale_price: number;
  stock: number;
  category: string;
  is_wholesale: boolean;
  is_active: boolean;
  image_url?: string | null;
}

export interface FranchiseApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  target_location: string;
  investment_capacity: string;
  experience_summary: string | null;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export interface Hub {
  id: number | null;
  name: string;
  address: string;
  franchisee_id: string;
  status: string;
  franchisee?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  type: 'retail' | 'wholesale';
  user?: {
    name: string;
    email: string;
  };
  contact_number: string;
  shipping_address: string | null;
  total_amount: string;
  status: string;
  items?: OrderItem[];
  hub?: {
    name: string;
  };
}

export interface FranchiseeUser {
  id: number;
  name: string;
  email: string;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock: number;
  min_stock: number;
  unit_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductIngredient {
  id: number;
  product_id: number;
  ingredient_id: number;
  quantity_required: number;
  product?: Product;
  ingredient?: Ingredient;
}

export interface InventoryBatch {
  id: number;
  batch_number: string;
  product_id: number;
  hub_id: number | null;
  quantity: number;
  initial_quantity: number;
  manufacture_date: string;
  expiry_date: string;
  discount_triggered: boolean;
  product?: Product;
  hub?: Hub;
}
