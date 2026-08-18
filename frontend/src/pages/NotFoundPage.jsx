import { Link } from "react-router-dom";
import { Button } from "../components/ui.jsx";
export default function NotFoundPage() {
  return (
    <section className="grid min-h-[65vh] place-items-center bg-paper px-5 text-center">
      <div>
        <p className="display text-9xl text-brand">404</p>
        <h1 className="mt-4 text-2xl font-black uppercase">
          Página não encontrada
        </h1>
        <p className="mt-3 text-black/55">O endereço acessado não existe.</p>
        <Link to="/">
          <Button className="mt-7">Voltar ao início</Button>
        </Link>
      </div>
    </section>
  );
}
