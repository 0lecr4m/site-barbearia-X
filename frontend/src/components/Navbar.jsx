import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UserRound } from "lucide-react";
import { Button } from "./ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../../assets/logo_x.png";
const links = [
  ["Início", "/#inicio"],
  ["Sobre nós", "/#sobre"],
  ["Serviços", "/#servicos"],
  ["Barbeiros", "/#barbeiros"],
  ["Contato", "/#contato"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false),
    { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="container-x flex h-20 items-center justify-between">
        <Link
          to="/"
          aria-label="X Studio Barber - início"
          className="focus-ring flex items-center gap-3"
        >
          <span className="grid size-11 overflow-hidden bg-brand">
            <img
              src={logo}
              alt=""
              className="size-full scale-[1.75] object-cover"
            />
          </span>
          <span className="font-display text-xl uppercase tracking-wider sm:text-2xl">
            X Studio Barber
          </span>
        </Link>
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Principal"
        >
          {links.map(([n, h]) => (
            <a
              key={n}
              href={h}
              className="focus-ring text-xs font-bold uppercase tracking-widest text-white/65 transition hover:text-white"
            >
              {n}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <Link
              to="/minha-conta"
              className="focus-ring flex items-center gap-2 text-sm font-bold"
            >
              <UserRound className="size-4" />
              Minha conta
            </Link>
          ) : (
            <Link to="/entrar" className="focus-ring text-sm font-bold">
              Entrar
            </Link>
          )}
          <Link to="/agendar">
            <Button>Agendar horário</Button>
          </Link>
        </div>
        <button
          className="focus-ring p-2 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-5 py-5 lg:hidden">
          {links.map(([n, h]) => (
            <a
              key={n}
              href={h}
              onClick={() => setOpen(false)}
              className="block border-b border-white/10 py-4 text-sm font-bold uppercase tracking-wider"
            >
              {n}
            </a>
          ))}
          <div className="mt-5 grid gap-3">
            <Link
              to={user ? "/minha-conta" : "/entrar"}
              onClick={() => setOpen(false)}
            >
              <Button
                variant="outline"
                className="w-full border-white/30 text-white"
              >
                {user ? "Minha conta" : "Entrar"}
              </Button>
            </Link>
            <Link to="/agendar" onClick={() => setOpen(false)}>
              <Button className="w-full">Agendar horário</Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
