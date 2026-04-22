export type ProductCategory =
  | "ropa"
  | "accesorios"
  | "libros"
  | "papeleria"
  | "tecnologia"
  | "otros";

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public image: string,
    public category: ProductCategory = "otros"
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error("El nombre del producto es requerido");
    }
    if (!this.description || this.description.trim().length < 5) {
      throw new Error("La descripción es demasiado corta");
    }
    if (this.price < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    if (this.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  reduceStock(quantity: number) {
    if (!this.hasStock(quantity)) {
      throw new Error(`Stock insuficiente para ${this.name}`);
    }
    this.stock -= quantity;
  }
}
