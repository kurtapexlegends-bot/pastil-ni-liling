export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock?: number;
  is_wholesale?: boolean;
  wholesale_price?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
