export type PaymentRequest = {
  orderId: string;
  amount: number;
  cardNumber: string;
  cardHolder: string;
};

export type PaymentResult = {
  success: boolean;
  transactionId: string;
  message: string;
};

export interface PaymentGateway {
  charge(request: PaymentRequest): Promise<PaymentResult>;
}
