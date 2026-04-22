import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/application/infrastructure/database/mongo";
import { ProductModel } from "@/application/infrastructure/database/models/ProductModel";

const sampleProducts = [
  {
    name: "Camiseta Oficial Univalle",
    description: "Camiseta de algodón 100% con el logo bordado de la Universidad del Valle. Disponible en todas las tallas.",
    price: 35000,
    stock: 20,
    category: "ropa",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
  },
  {
    name: "Gorra Deportiva Roja",
    description: "Gorra ajustable con el escudo de Univalle. Ideal para el sol en el campus de Meléndez.",
    price: 25000,
    stock: 30,
    category: "accesorios",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop",
  },
  {
    name: "Termo Metálico Gris",
    description: "Termo de acero inoxidable con grabado láser de Univalle. Mantiene tus bebidas frías por 12 horas.",
    price: 45000,
    stock: 15,
    category: "accesorios",
    image: "https://images.unsplash.com/photo-1602143399827-7217ff3339d0?w=400&h=300&fit=crop",
  },
  {
    name: "Cuaderno Argollado Grande",
    description: "80 hojas cuadriculadas con separadores de las facultades y mapa del campus Meléndez.",
    price: 15000,
    stock: 50,
    category: "papeleria",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop",
  },
  {
    name: "Libro: Historia de la Universidad",
    description: "Relato detallado sobre la fundación y evolución de nuestra alma mater. Editorial Univalle.",
    price: 60000,
    stock: 10,
    category: "libros",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop",
  },
  {
    name: "Maletín para Portátil",
    description: "Maletín acolchado con múltiples compartimentos y el escudo de la Universidad. Resistente al agua.",
    price: 85000,
    stock: 8,
    category: "accesorios",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
  },
  {
    name: "Kit de Pines Univalle",
    description: "Colección de 5 pines metálicos representativos de los hitos arquitectónicos del campus.",
    price: 12000,
    stock: 40,
    category: "accesorios",
    image: "https://images.unsplash.com/photo-1590561607362-13f3503fd710?w=400&h=300&fit=crop",
  },
  {
    name: "Sudadera Gris Hoodie",
    description: "Sudadera térmica muy cómoda para los días de lluvia. Con capucha y bolsillo frontal.",
    price: 95000,
    stock: 12,
    category: "ropa",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop",
  },
];

export async function POST() {
  try {
    if (!isDBConnected()) await connectDB();
    await ProductModel.deleteMany({});
    const created = await ProductModel.insertMany(sampleProducts);
    return NextResponse.json(
      {
        success: true,
        message: `${created.length} productos creados exitosamente`,
        seeded: true,
        count: created.length,
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
