import { Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "../utils/format.js";
export default function ServiceCard({ service }) {
  return (
    <article className="group card flex min-h-64 flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center bg-brand text-sm font-black text-white">
          {String(service.sort_order + 1 || 1).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-black/50">
          <Clock className="size-4" />
          {service.duration_minutes} min
        </span>
      </div>
      <h3 className="mt-8 text-xl font-black uppercase">{service.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/55">
        {service.description || "Descrição do serviço em breve."}
      </p>
      <div className="mt-auto flex items-end justify-between pt-6">
        <strong className="text-xl text-brand">{money(service.price)}</strong>
        <Link
          aria-label={`Agendar ${service.name}`}
          to={`/agendar?service=${service.id}`}
          className="focus-ring grid size-11 place-items-center border border-black transition group-hover:bg-black group-hover:text-white"
        >
          <ArrowUpRight />
        </Link>
      </div>
    </article>
  );
}
