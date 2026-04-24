const SAMPLES = [
  { name: "Camiseta Oficial Univalle", description: "Camiseta 100% algodón.", price: 35000, stock: 20, category: "ropa" },
  { name: "Gorra Deportiva Roja", description: "Gorra ajustable con escudo.", price: 25000, stock: 30, category: "accesorios" },
  { name: "Termo Metálico Gris", description: "Acero inoxidable.", price: 45000, stock: 15, category: "accesorios" },
  { name: "Cuaderno Argollado", description: "80 hojas cuadriculadas.", price: 15000, stock: 50, category: "papeleria" },
  { name: "Libro: Historia de la Universidad", description: "Editorial Univalle.", price: 60000, stock: 10, category: "libros" },
  { name: "Maletín para Portátil", description: "Acolchado, resistente al agua.", price: 85000, stock: 8, category: "accesorios" },
  { name: "Kit de Pines", description: "5 pines metálicos.", price: 12000, stock: 40, category: "accesorios" },
  { name: "Sudadera Gris Hoodie", description: "Térmica con capucha.", price: 95000, stock: 12, category: "ropa" },
];

class SeedProducts {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute() {
    await this.productRepository.deleteAll();
    const created = await this.productRepository.insertMany(SAMPLES);
    return created.length;
  }
}

module.exports = { SeedProducts };
