export interface IUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  customerSince?: string;
}

export interface IOrder {
  id: number;
  orderDate: string;
  status: string;
  total: number; // Changed from totalAmount to match backend
  shippingAddress: string;
  orderItems: IOrderItem[]; // Changed from items to match backend
}

export interface IOrderItem {
  productId: number;
  quantity: number;
  // Note: Backend OrderItemDto doesn't have productName, price, or imageUrl
  // These might need to be populated from product data
}

export interface IReward {
  availableRewards: number;
  rewardsCode: string;
  ruleUpdated: boolean;
}

export interface IMessage {
  id: number;
  subject: string;
  content: string;
  isRead: boolean;
  date: string;
}

export interface IWishlist {
  id: number;
  name: string;
  items: IWishlistItem[];
}

export interface IWishlistItem {
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}
