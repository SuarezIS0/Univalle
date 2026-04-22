export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export class Cart {
  constructor(public items: CartItem[] = []) {}

  add(item: Omit<CartItem, "quantity">, quantity = 1) {
    const existing = this.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ ...item, quantity });
    }
  }

  remove(productId: string) {
    this.items = this.items.filter((i) => i.productId !== productId);
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      this.remove(productId);
    } else {
      item.quantity = quantity;
    }
  }

  clear() {
    this.items = [];
  }

  get totalItems(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
