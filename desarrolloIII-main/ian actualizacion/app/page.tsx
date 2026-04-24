"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Reveal from "@/app/components/Reveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      {/* HERO — full-bleed image */}
      <section className="relative w-full overflow-hidden flex flex-col justify-end h-[calc(100vh-72px)] min-h-[560px]">
        {/* Background image */}
        <img
          src="/brand/univalle-main.png"
          alt="Campus Universidad del Valle"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center center" }}
        />

        {/* Dark overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.75) 100%)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end w-full max-w-7xl mx-auto px-6 md:px-14">
          <div className="max-w-xl pb-20">
            {/* Label pill */}
            <div
              className="hero-in inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 mb-6"
              style={{
                background: "rgba(190,22,34,0.95)",
                animationDelay: "80ms",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                Tienda oficial · Universidad del Valle
              </span>
            </div>

            {/* Headline */}
            <h1
              className="hero-in font-bold tracking-display text-white mb-5"
              style={{
                fontSize: "clamp(42px, 5.5vw, 72px)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                animationDelay: "180ms",
              }}
            >
              Tu universidad,
              <br />
              tu estilo.
            </h1>

            {/* Subtext */}
            <p
              className="hero-in text-[18px] text-white/80 leading-[1.65] mb-10 max-w-md"
              style={{
                textShadow: "0 1px 12px rgba(0,0,0,0.4)",
                animationDelay: "300ms",
              }}
            >
              Productos auténticos con el sello de la Universidad del Valle.
              Ropa, libros y accesorios en un solo lugar.
            </p>

            {/* CTA */}
            <Link
              href="/products"
              className="hero-in group inline-flex items-center gap-2 font-semibold text-[16px] text-black bg-white border-2 border-white px-9 py-[14px] rounded-full transition-all duration-[350ms] ease-out hover:text-white hover:-translate-y-0.5"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                animationDelay: "420ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#BE1622";
                e.currentTarget.style.borderColor = "#BE1622";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#ffffff";
              }}
            >
              Explorar catálogo
              <span
                aria-hidden
                className="transition-transform duration-[350ms] group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-10"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >

        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <Reveal>
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                Explora por categoría
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-display text-black mt-3 max-w-xl leading-tight">
                Todo lo que necesitas, en un solo lugar.
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm text-[var(--uv-red)] hover:text-[var(--uv-red-dark)] font-medium"
            >
              Ver catálogo completo →
            </Link>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              tag: "Ropa",
              title: "Viste la marca",
              desc: "Hoodies, camisetas y buzos con el sello oficial Univalle.",
              img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
              cat: "ropa",
            },
            {
              tag: "Tecnología",
              title: "Para tu día a día",
              desc: "Accesorios, dispositivos y gadgets pensados para estudiantes.",
              img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=80",
              cat: "tecnologia",
            },
            {
              tag: "Libros y papelería",
              title: "Listos para aprender",
              desc: "Cuadernos, textos académicos y material editorial de la Universidad.",
              img: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80",
              cat: "libros",
            },
          ].map((c, i) => (
            <Reveal key={c.tag} delay={i * 120}>
              <Link
                href={`/products?category=${c.cat}`}
                className="group uv-card overflow-hidden block"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500">
                    {c.tag}
                  </span>
                  <h3 className="text-xl font-semibold tracking-display text-black mt-2 mb-3 group-hover:text-[var(--uv-red)] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROPUESTA DE VALOR */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid md:grid-cols-4 gap-10 border-t border-gray-100 pt-16">
          {[
            {
              title: "Envío en 48h",
              desc: "Despacho rápido a toda Colombia con seguimiento en tiempo real.",
              icon: (
                <path
                  d="M3 7h13v10H3zM16 10h4l2 3v4h-6M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              ),
            },
            {
              title: "Pagos seguros",
              desc: "Procesados por Mercado Pago. Tarjeta, PSE y más métodos disponibles.",
              icon: (
                <>
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
                </>
              ),
            },
            {
              title: "Devoluciones fáciles",
              desc: "Hasta 30 días para cambiar o devolver sin complicaciones.",
              icon: (
                <path
                  d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
            },
            {
              title: "Soporte real",
              desc: "Equipo de atención al cliente en horario universitario.",
              icon: (
                <>
                  <path d="M4 12a8 8 0 0 1 16 0v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <rect x="2" y="12" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                  <rect x="17" y="12" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                </>
              ),
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="w-10 h-10 rounded-lg bg-[var(--uv-red)]/10 flex items-center justify-center mb-5 text-[var(--uv-red)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-lg font-semibold tracking-display text-black mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal as="section" className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--uv-red)] text-white p-10 md:p-14">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 10% 90%, rgba(0,0,0,0.35), transparent 55%), linear-gradient(135deg, #a7001e 0%, #6b0014 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative grid md:grid-cols-2 gap-10 items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-medium mb-4">
                Empieza hoy
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-display leading-[1.1] mb-5">
                Compra lo que necesitas.
                <br />
                Hecho simple.
              </h2>
              <p className="text-white/75 text-[16px] leading-relaxed max-w-lg">
                Crea tu cuenta en 30 segundos y accede a precios exclusivos,
                historial de pedidos y envíos más rápidos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/products"
                className="h-11 px-5 inline-flex items-center rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Ver catálogo
              </Link>
              <Link
                href="/register"
                className="h-11 px-5 inline-flex items-center rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
