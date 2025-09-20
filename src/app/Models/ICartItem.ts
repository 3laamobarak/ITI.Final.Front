export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  description: string;
  imageUrl?: string;
}