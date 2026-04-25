import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src="/brand/logo-univalle.png"
              alt="Universidad del Valle"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[14px] font-semibold tracking-display text-slate-900">
              Univalle Shop
            </span>
          </div>
          <p className="text-[13px] text-slate-500 leading-[1.65]">
            Plataforma oficial de e-commerce de la Universidad del Valle.
            Ropa, tecnología, libros y accesorios con el sello de calidad que
            nos caracteriza desde 1945.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 tracking-display">
            Catálogo
          </h4>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>
              <Link
                href="/products?category=ropa"
                className="hover:text-red-700 transition-colors"
              >
                Ropa
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=tecnologia"
                className="hover:text-red-700 transition-colors"
              >
                Tecnología
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=libros"
                className="hover:text-red-700 transition-colors"
              >
                Libros y papelería
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-red-700 transition-colors"
              >
                Ver todo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 tracking-display">
            Institucional
          </h4>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>
              <a href="#" className="hover:text-red-700 transition-colors">
                Sobre Univalle
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-700 transition-colors">
                Soporte académico
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-700 transition-colors">
                Privacidad
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-700 transition-colors">
                Términos
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-1.5 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} Universidad del Valle. Todos los
            derechos reservados.
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--uv-red)]" />
            Cali · Colombia
          </span>
        </div>
      </div>
    </footer>
  );
}
