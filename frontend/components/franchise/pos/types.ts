export interface POSCartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  maxStock: number;
  flavor_modifier?: string;
}
