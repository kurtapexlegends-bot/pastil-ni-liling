export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
