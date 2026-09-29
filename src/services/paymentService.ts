export interface PaymentService {
  createOrder(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<{ id: string; status: string }>;
  confirmPayment(
    paymentId: string
  ): Promise<{ success: boolean; transactionId: string }>;
}

function makePayId(): string {
  return `pay_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

function makeTxnId(): string {
  return `txn_${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now()
    .toString(36)
    .slice(-4)
    .toUpperCase()}`;
}

export class MockPaymentService implements PaymentService {
  private orders: Map<
    string,
    { id: string; amount: number; currency: string; orderId: string }
  >;

  constructor() {
    this.orders = new Map();
  }

  async createOrder(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<{ id: string; status: string }> {
    if (amount <= 0) throw new Error("Invalid amount");
    const id = makePayId();
    const record = { id, amount, currency, orderId };
    this.orders.set(id, record);
    return { id, status: "created" };
  }

  async confirmPayment(
    paymentId: string
  ): Promise<{ success: boolean; transactionId: string }> {
    const order = this.orders.get(paymentId);
    if (!order) throw new Error("Payment order not found");
    return {
      success: true,
      transactionId: makeTxnId(),
    };
  }
}

const mockPaymentService: PaymentService = new MockPaymentService();
export default mockPaymentService;
