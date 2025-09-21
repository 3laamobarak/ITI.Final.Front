// src/app/models/payment.model.ts
export interface IPayment {
  id: number;
  amount: number;
  paymentDate: string; // أو Date لو هتعمل parsing
  paymentMethod: string;
  isSuccessful: boolean;
  orderId: number;
  userId: string;
  paymentIntentId: string;
  refundedAmount: number;
  userName: string;
  fullName: string;
  shippingAddress: string;
}
