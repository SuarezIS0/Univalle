import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <img
              src="/brand/logo-univalle.png"
              alt="Universidad del Valle"
              className="h-10 w-auto object-contain"
            />
            <span className="text-[15px] font-semibold tracking-display text-black">
              Univalle Shop
            </span>
          </div>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-md">
            Plataforma oficial de e-learning de la Universidad del Valle.
            Maestrías, diplomados y experiencias académicas con la calidad y el
            prestigio que nos caracterizan desde 1945.
          </p>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-black mb-4 tracking-display">
            Programas
          </h4>
          <ul className="space-y-3 text-[14px] text-gray-500">
            <li>
              <Link
                href="/products?category=maestrias"
                className="hover:text-black transition-colors"
              >
                Maestrías
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=diplomados"
                className="hover:text-black transition-colors"
              >
                Diplomados
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=cursos"
                className="hover:text-black transition-colors"
              >
                Cursos cortos
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-black transition-colors"
              >
                Ver catálogo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-black mb-4 tracking-display">
            Institucional
          </h4>
          <ul className="space-y-3 text-[14px] text-gray-500">
            <li>
              <a href="#" className="hover:text-black transition-colors">
                Sobre Univalle
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-black transition-colors">
                Soporte académico
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-black transition-colors">
                Privacidad
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-black transition-colors">
                Términos
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-[12px] text-gray-500">
          <span>
            © {new Date().getFullYear()} Universidad del Valle. Todos los
            derechos reservados.
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--uv-red)]" />
            Cali · Colombia
          </span>
        </div>
      </div>
    </footer>
  );
}
