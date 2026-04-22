export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type ShippingInfo = {
  fullName: string;
  address: string;
  city: string;
  phone: string;
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public items: OrderItem[],
    public total: number,
    public shipping: ShippingInfo,
    public status: OrderStatus = "pending",
    public readonly createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate() {
    if (!this.userId) throw new Error("userId requerido");
    if (!this.items || this.items.length === 0) {
      throw new Error("La orden debe tener al menos un producto");
    }
    if (this.total < 0) throw new Error("Total inválido");
    if (!this.shipping.fullName || !this.shipping.address) {
      throw new Error("Datos de envío incompletos");
    }
  }

  changeStatus(next: OrderStatus) {
    if (!VALID_TRANSITIONS[this.status].includes(next)) {
      throw new Error(
        `Transición inválida: ${this.status} → ${next}`
      );
    }
    this.status = next;
  }
}
