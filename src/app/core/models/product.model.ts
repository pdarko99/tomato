export interface Product {
  id: number;
  title: string;
  description: string;
  inStock: boolean;
  quantity: number;
  price: number;
  productUrl: string;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}
