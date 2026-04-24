export class ProductImage {
  constructor(
    public readonly url: string,
    public readonly storageKey: string
  ) {
    this.validate();
  }

  private validate() {
    if (!this.url || this.url.trim().length === 0) {
      throw new Error("La URL de la imagen es requerida");
    }
    if (!this.storageKey || this.storageKey.trim().length === 0) {
      throw new Error("El storageKey de la imagen es requerido");
    }
  }

  static empty(): ProductImage {
    return new ProductImage("__empty__", "__empty__");
  }

  isEmpty(): boolean {
    return this.url === "__empty__" && this.storageKey === "__empty__";
  }

  isExternal(): boolean {
    return this.storageKey.startsWith("external://");
  }

  toJSON() {
    return this.isEmpty() ? "" : this.url;
  }
}
