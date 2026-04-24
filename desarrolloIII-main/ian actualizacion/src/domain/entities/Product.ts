import { ProductImage } from "./ProductImage";

export type ProductCategory =
  | "ropa"
  | "accesorios"
  | "libros"
  | "papeleria"
  | "tecnologia"
  | "otros";

export type ProductPatch = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: ProductImage;
  category?: ProductCategory;
};

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public image: ProductImage,
    public category: ProductCategory = "otros",
    public archivedAt: Date | null = null
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

  isArchived(): boolean {
    return this.archivedAt !== null;
  }

  archive() {
    if (this.isArchived()) return;
    this.archivedAt = new Date();
  }

  restore() {
    this.archivedAt = null;
  }

  applyPatch(patch: ProductPatch) {
    if (patch.name !== undefined) this.name = patch.name;
    if (patch.description !== undefined) this.description = patch.description;
    if (patch.price !== undefined) this.price = patch.price;
    if (patch.stock !== undefined) this.stock = patch.stock;
    if (patch.image !== undefined) this.image = patch.image;
    if (patch.category !== undefined) this.category = patch.category;
    this.validate();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      image: this.image.isEmpty() ? "" : this.image.url,
      category: this.category,
      archivedAt: this.archivedAt,
    };
  }
}
