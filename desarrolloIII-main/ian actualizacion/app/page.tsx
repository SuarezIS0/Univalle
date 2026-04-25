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
      <section className="relative w-full overflow-hidden flex flex-col justify-end h-[calc(100vh-65px)] min-h-[560px]">
        {/* Background image */}
        <img
          src="/brand/univalle-main.png"
          alt="Campus Universidad del Valle"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center center" }}
        />

        {/* Soft left-side gradient — sólo detrás del texto, lado derecho intacto */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 60%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end w-full px-6 md:px-10">
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
                textShadow: "0 2px 18px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.5)",
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
                textShadow: "0 1px 10px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.45)",
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
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full -mt-px">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              tag: "Ropa",
              title: "Viste la marca",
              desc: "Hoodies, camisetas y buzos con el sello oficial Univalle.",
              img: "/brand/univalle-ropa.png",
              cat: "ropa",
            },
            {
              tag: "Tecnología",
              title: "Para tu día a día",
              desc: "Accesorios, dispositivos y gadgets pensados para estudiantes.",
              img: "/brand/univalle-tecnologia.png",
              cat: "tecnologia",
            },
            {
              tag: "Libros y papelería",
              title: "Listos para aprender",
              desc: "Cuadernos, textos académicos y material editorial de la Universidad.",
              img: "/brand/univalle-libros.png",
              cat: "libros",
            },
          ].map((c, i) => (
            <Reveal key={c.tag} delay={i * 120}>
              <Link
                href={`/products?category=${c.cat}`}
                className="group block transition-all duration-500 ease-out hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 shadow-sm transition-shadow duration-500 group-hover:shadow-xl">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                  />
                </div>
                <div className="pt-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {c.tag}
                  </span>
                  <h3 className="text-2xl font-bold tracking-display text-black mt-2 mb-3 group-hover:text-[var(--uv-red)] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-gray-500 text-[15px] leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROPUESTA DE VALOR */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-20 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="group h-full bg-white border border-slate-200/80 rounded-2xl p-7 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-slate-200">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-[var(--uv-red)] transition-transform duration-500 group-hover:scale-105"
                  style={{ background: "rgba(190,22,34,0.08)" }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold tracking-display text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-[14.5px] leading-[1.7]">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal as="section" className="max-w-7xl mx-auto px-6 pt-8 pb-24 w-full">
        <div
          className="relative overflow-hidden rounded-3xl text-white p-10 md:p-16 shadow-2xl"
          style={{ boxShadow: "0 30px 80px -20px rgba(167,0,30,0.45)" }}
        >
          {/* Base gradient — rojo profundo con luz cálida */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 85% 15%, rgba(255,180,150,0.28) 0%, rgba(255,180,150,0) 45%), radial-gradient(90% 80% at 15% 110%, rgba(60,0,10,0.55) 0%, rgba(60,0,10,0) 55%), linear-gradient(135deg, #c4001f 0%, #8a0018 55%, #5a000f 100%)",
            }}
          />
          {/* Grid texture sutil */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />
          {/* Halo blanco superior derecho */}
          <div
            className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(8px)",
            }}
          />

          <div className="relative grid md:grid-cols-2 gap-10 items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/65 font-semibold mb-5">
                Empieza hoy
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-display leading-[1.08] mb-6">
                Compra lo que necesitas.
                <br />
                Hecho simple.
              </h2>
              <p className="text-white/80 text-[16px] leading-[1.7] max-w-lg">
                Crea tu cuenta en 30 segundos y accede a precios exclusivos,
                historial de pedidos y envíos más rápidos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="/products"
                className="h-12 px-7 inline-flex items-center rounded-full bg-white text-black text-sm font-semibold shadow-md transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Ver catálogo
              </Link>
              <Link
                href="/register"
                className="h-12 px-7 inline-flex items-center rounded-full border border-white text-white text-sm font-semibold transition-all duration-300 hover:bg-white hover:text-[#a7001e] hover:-translate-y-0.5"
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
