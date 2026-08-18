import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Quote, Star } from "lucide-react";
import hero from "../assets/barbershop-hero.png";
import { Button, Loading, ErrorState, EmptyState } from "../components/ui.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import BarberCard from "../components/BarberCard.jsx";
import { useCatalog } from "../hooks/useCatalog.js";
export default function HomePage() {
  const { services, professionals, loading, error, retry } = useCatalog();
  return (
    <>
      <section
        id="inicio"
        className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-black text-white"
      >
        <img
          src={hero}
          alt="Barbeiro realizando corte em ambiente urbano contemporâneo"
          className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="noise absolute inset-0" />
        <div className="container-x relative flex min-h-[calc(100svh-5rem)] items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[.3em] text-blue-400">
              <span className="h-px w-10 bg-blue-500" />
              Corte, cultura & atitude
            </p>
            <h1 className="display text-[clamp(4.5rem,12vw,10rem)]">
              Seu estilo.
              <br />
              <span className="text-blue-500">Sua marca.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
              Precisão em cada detalhe. Uma experiência urbana feita para quem
              não passa despercebido.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/agendar">
                <Button className="px-7">
                  Agendar horário
                  <ArrowUpRight className="size-4" />
                </Button>
              </Link>
              <a href="#servicos">
                <Button variant="light">Ver serviços</Button>
              </a>
            </div>
          </div>
        </div>
        <a
          href="#sobre"
          aria-label="Ir para Sobre nós"
          className="focus-ring absolute bottom-8 right-8 hidden animate-bounce border border-white/30 p-3 sm:block"
        >
          <ArrowDown />
        </a>
      </section>
      <section id="sobre" className="bg-paper py-24 sm:py-32">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Manifesto</p>
            <h2 className="display mt-5 text-6xl sm:text-8xl">
              Mais que
              <br />
              um corte.
            </h2>
          </div>
          <div className="border-l-4 border-brand pl-6 sm:pl-10">
            <Quote className="size-8 text-brand" />
            <p className="mt-6 text-xl font-medium leading-9 sm:text-2xl">
              [Placeholder institucional: conte aqui a história da barbearia,
              sua conexão com a cultura Hip-Hop e a experiência que deseja
              oferecer.]
            </p>
            <p className="mt-6 text-sm leading-6 text-black/55">
              Este conteúdo é provisório e deve ser substituído pelas
              informações reais da marca.
            </p>
          </div>
        </div>
      </section>
      <section id="servicos" className="bg-white py-24">
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">O que fazemos</p>
              <h2 className="display mt-4 text-6xl sm:text-7xl">Serviços</h2>
            </div>
            <Link
              to="/agendar"
              className="focus-ring flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
            >
              Agendar agora
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          {loading ? (
            <Loading label="Buscando serviços" />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : services.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          ) : (
            <EmptyState title="Serviços em breve" />
          )}
        </div>
      </section>
      <section id="barbeiros" className="bg-black py-24 text-white">
        <div className="container-x">
          <div className="mb-12">
            <p className="eyebrow text-blue-400">Quem faz acontecer</p>
            <h2 className="display mt-4 text-6xl sm:text-7xl">O time</h2>
          </div>
          {loading ? (
            <Loading label="Buscando profissionais" />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : professionals.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((p, i) => (
                <BarberCard key={p.id} professional={p} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState title="Profissionais em breve" />
          )}
        </div>
      </section>
      <section className="overflow-hidden bg-brand py-20 text-white">
        <div className="container-x flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="mb-4 flex gap-1" aria-label="5 estrelas">
              <Star className="size-4 fill-white" />
              <Star className="size-4 fill-white" />
              <Star className="size-4 fill-white" />
              <Star className="size-4 fill-white" />
              <Star className="size-4 fill-white" />
            </div>
            <h2 className="display max-w-3xl text-5xl sm:text-7xl">
              Pronto para o próximo nível?
            </h2>
          </div>
          <Link to="/agendar">
            <Button variant="light" className="whitespace-nowrap px-8">
              Escolher meu horário
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
