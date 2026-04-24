import { Product } from "@/domain/entities/Product";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { OrderRepository } from "@/domain/repositories/OrderRepository";
import { ImageStorage } from "@/domain/services/ImageStorage";

export class ArchiveProduct {
  constructor(
    private productRepository: ProductRepository,
    private orderRepository: OrderRepository,
    private imageStorage: ImageStorage
  ) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    if (product.isArchived()) {
      return product;
    }

    const activeOrders =
      await this.orderRepository.countActiveByProduct(id);
    if (activeOrders > 0) {
      throw new Error(
        `No se puede archivar: el producto está en ${activeOrders} orden(es) activa(s)`
      );
    }

    const archived = await this.productRepository.archive(id);
    if (!archived) {
      throw new Error("No se pudo archivar el producto");
    }

    if (!product.image.isEmpty() && !product.image.isExternal()) {
      try {
        await this.imageStorage.delete(product.image.storageKey);
      } catch (err) {
        // Compensación: revertir el archive si no podemos liberar la imagen.
        await this.productRepository.restore(id).catch(() => undefined);
        throw new Error(
          `Falló la eliminación de la imagen, archive revertido: ${
            err instanceof Error ? err.message : "Error"
          }`
        );
      }
    }

    return archived;
  }
}
