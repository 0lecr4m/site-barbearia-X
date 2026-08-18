import { useCallback, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  LogOut,
  Scissors,
  RotateCcw,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { bookingApi } from "../api/services.js";
import { Button, Loading, ErrorState, EmptyState } from "../components/ui.jsx";
import { money, fullDate, time } from "../utils/format.js";
export default function AccountPage() {
  const { user, token, loading: authLoading, logout } = useAuth(),
    [tab, setTab] = useState("upcoming"),
    [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      setItems(
        await (tab === "upcoming"
          ? bookingApi.upcoming(token)
          : bookingApi.history(token)),
      );
    } catch (e) {
      if (e.status === 401) logout();
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, token, logout]);
  useEffect(() => {
    load();
  }, [load]);
  if (authLoading) return <Loading />;
  if (!user) return <Navigate to="/entrar" replace />;
  async function cancel(id) {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    const reason = window.prompt(
      "Motivo do cancelamento:",
      "Solicitado pelo cliente",
    );
    if (!reason) return;
    try {
      await bookingApi.cancel(id, reason, token);
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="min-h-[70vh] bg-paper py-12 sm:py-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Área do cliente</p>
            <h1 className="display mt-3 text-5xl sm:text-7xl">
              Olá, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-3 text-sm text-black/50">
              {user.email || user.phone}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
        <div className="mt-12 flex border-b border-black/15">
          <button
            className={`focus-ring border-b-2 px-5 py-4 text-sm font-bold uppercase ${tab === "upcoming" ? "border-brand text-brand" : "border-transparent"}`}
            onClick={() => setTab("upcoming")}
          >
            Próximos
          </button>
          <button
            className={`focus-ring border-b-2 px-5 py-4 text-sm font-bold uppercase ${tab === "history" ? "border-brand text-brand" : "border-transparent"}`}
            onClick={() => setTab("history")}
          >
            Histórico
          </button>
        </div>
        <div className="mt-7">
          {loading ? (
            <Loading label="Buscando seus agendamentos" />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : items.length ? (
            <div className="grid gap-4">
              {items.map((a) => (
                <Appointment
                  key={a.appointment_id}
                  item={a}
                  upcoming={tab === "upcoming"}
                  onCancel={() => cancel(a.appointment_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                tab === "upcoming"
                  ? "Nenhum horário marcado"
                  : "Seu histórico está vazio"
              }
              text={
                tab === "upcoming"
                  ? "Que tal reservar seu próximo corte?"
                  : "Seus atendimentos aparecerão aqui."
              }
            />
          )}{" "}
          {tab === "upcoming" && !items.length && (
            <Link to="/agendar">
              <Button className="mt-5">Agendar agora</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
function Appointment({ item, upcoming, onCancel }) {
  const service = item.services?.[0],
    params = new URLSearchParams({
      service: service?.service_id || "",
      professional: item.staff_id,
      reschedule: item.appointment_id,
    });
  return (
    <article className="card grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
      <div className="flex gap-4">
        <span className="grid size-12 shrink-0 place-items-center bg-brand text-white">
          <Scissors className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            {item.status}
          </p>
          <h2 className="mt-1 text-lg font-black uppercase">
            {service?.service_name_snapshot || "Atendimento"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/55">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {fullDate(item.starts_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {time(item.starts_at)}
            </span>
            <span>{item.staff_name}</span>
            <strong>{money(item.total_price)}</strong>
          </div>
        </div>
      </div>
      {upcoming && (
        <div className="flex flex-wrap gap-2">
          <Link to={`/agendar?${params}`}>
            <Button variant="outline">
              <RotateCcw className="size-4" />
              Reagendar
            </Button>
          </Link>
          <Button variant="outline" onClick={onCancel}>
            <X className="size-4" />
            Cancelar
          </Button>
        </div>
      )}
    </article>
  );
}
