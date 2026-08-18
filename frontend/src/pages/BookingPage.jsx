import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  UserRound,
  CalendarDays,
} from "lucide-react";
import { useCatalog } from "../hooks/useCatalog.js";
import { bookingApi } from "../api/services.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Button,
  Stepper,
  Loading,
  ErrorState,
  EmptyState,
} from "../components/ui.jsx";
import { money, fullDate, time } from "../utils/format.js";
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
export default function BookingPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    { token } = useAuth(),
    { services, professionals, loading, error, retry } = useCatalog();
  const rescheduleId = params.get("reschedule");
  const [step, setStep] = useState(0),
    [service, setService] = useState(null),
    [professional, setProfessional] = useState(null),
    [anyProfessional, setAnyProfessional] = useState(false),
    [date, setDate] = useState(today()),
    [slots, setSlots] = useState([]),
    [slot, setSlot] = useState(null),
    [slotLoading, setSlotLoading] = useState(false),
    [actionError, setActionError] = useState(""),
    [submitting, setSubmitting] = useState(false),
    [success, setSuccess] = useState(null);
  useEffect(() => {
    if (!services.length || service) return;
    const id = params.get("service");
    if (id) {
      const found = services.find((s) => s.id === id);
      if (found) {
        setService(found);
        setStep(1);
      }
    }
  }, [services, params, service]);
  useEffect(() => {
    if (!professionals.length || professional) return;
    const id = params.get("professional");
    if (id) {
      const found = professionals.find((p) => p.id === id);
      if (found) {
        setProfessional(found);
        setStep(service ? 2 : 0);
      }
    }
  }, [professionals, params, professional, service]);
  const eligible = useMemo(
    () =>
      professionals.filter((p) =>
        p.services?.some((s) => s.id === service?.id),
      ),
    [professionals, service],
  );
  async function loadSlots() {
    setSlotLoading(true);
    setActionError("");
    setSlot(null);
    try {
      if (anyProfessional) {
        const results = await Promise.all(
          eligible
            .map(async (p) => ({
              p,
              data: await bookingApi.availability({
                staffId: p.id,
                serviceIds: [service.id],
                date,
              }),
            }))
            .map((x) => x),
        );
        const best = results.find((x) => x.data.slots.length);
        setProfessional(best?.p || null);
        setSlots(best?.data.slots || []);
      } else {
        const data = await bookingApi.availability({
          staffId: professional.id,
          serviceIds: [service.id],
          date,
        });
        setSlots(data.slots);
      }
    } catch (e) {
      setActionError(e.message);
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
  }
  const next = () => {
      if (step === 2) loadSlots();
      setStep((s) => Math.min(4, s + 1));
    },
    back = () => {
      setActionError("");
      setStep((s) => Math.max(0, s - 1));
    };
  async function confirm() {
    if (!token) {
      navigate("/entrar", {
        state: {
          from: `/agendar?${params.toString()}`,
          message: "Entre para confirmar seu horário.",
        },
      });
      return;
    }
    setSubmitting(true);
    setActionError("");
    try {
      const result = rescheduleId
        ? await bookingApi.reschedule(rescheduleId, slot.starts_at, token)
        : await bookingApi.create(
            {
              staffId: professional.id,
              serviceIds: [service.id],
              startsAt: slot.starts_at,
            },
            token,
          );
      setSuccess(result);
    } catch (e) {
      if (e.code === "TIME_SLOT_UNAVAILABLE") {
        setActionError(
          "Este horário acabou de ser reservado. Escolha outro horário.",
        );
        setStep(3);
        loadSlots();
      } else setActionError(e.message);
    } finally {
      setSubmitting(false);
    }
  }
  if (success)
    return (
      <section className="min-h-[70vh] bg-paper py-20">
        <div className="container-x max-w-2xl">
          <div className="card p-8 text-center sm:p-12">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white">
              <Check className="size-8" />
            </span>
            <p className="eyebrow mt-7">Tudo certo</p>
            <h1 className="display mt-3 text-5xl">
              {rescheduleId ? "Horário reagendado" : "Horário confirmado"}
            </h1>
            <p className="mt-5 text-black/60">
              Seu agendamento foi atualizado. Você pode acompanhá-lo na sua
              área.
            </p>
            <div className="mt-8 grid gap-3 bg-paper p-5 text-left text-sm">
              <span>
                <strong>Serviço:</strong> {service.name}
              </span>
              <span>
                <strong>Profissional:</strong> {professional.display_name}
              </span>
              <span>
                <strong>Quando:</strong> {fullDate(slot.starts_at)},{" "}
                {time(slot.starts_at)}
              </span>
            </div>
            <Button
              className="mt-8 w-full"
              onClick={() => navigate("/minha-conta")}
            >
              Ver meus agendamentos
            </Button>
          </div>
        </div>
      </section>
    );
  return (
    <section className="min-h-screen bg-paper py-10 sm:py-16">
      <div className="container-x max-w-5xl">
        <div className="mb-9">
          <p className="eyebrow">Agendamento online</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl">
            Escolha seu horário
          </h1>
        </div>
        <div className="card">
          <Stepper current={step} />
          <div className="min-h-[420px] p-5 sm:p-9">
            {loading ? (
              <Loading />
            ) : error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : (
              <>
                {step === 0 && (
                  <Step
                    title="Qual serviço você quer?"
                    subtitle="Selecione uma opção para continuar."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {services.map((s) => (
                        <Choice
                          key={s.id}
                          selected={service?.id === s.id}
                          onClick={() => setService(s)}
                          title={s.name}
                          meta={`${s.duration_minutes} min · ${money(s.price)}`}
                        />
                      ))}
                    </div>
                  </Step>
                )}
                {step === 1 && (
                  <Step
                    title="Quem vai cuidar do seu estilo?"
                    subtitle="Mostramos apenas profissionais que realizam o serviço escolhido."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Choice
                        selected={anyProfessional}
                        onClick={() => {
                          setAnyProfessional(true);
                          setProfessional(null);
                        }}
                        title="Qualquer profissional"
                        meta="Encontre a primeira agenda disponível"
                        icon={<UserRound />}
                      />
                      {eligible.map((p) => (
                        <Choice
                          key={p.id}
                          selected={
                            !anyProfessional && professional?.id === p.id
                          }
                          onClick={() => {
                            setAnyProfessional(false);
                            setProfessional(p);
                          }}
                          title={p.display_name}
                          meta={p.bio || "Profissional da casa"}
                        />
                      ))}
                    </div>
                    {!eligible.length && (
                      <EmptyState
                        title="Nenhum profissional disponível"
                        text="Este serviço ainda não está associado a um profissional."
                      />
                    )}
                  </Step>
                )}
                {step === 2 && (
                  <Step
                    title="Qual é o melhor dia?"
                    subtitle="A disponibilidade será consultada em tempo real."
                  >
                    <label className="mx-auto grid max-w-md gap-3 text-sm font-bold">
                      Data do atendimento
                      <input
                        className="focus-ring min-h-16 border-2 border-black bg-white px-5 text-lg"
                        type="date"
                        min={today()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </label>
                  </Step>
                )}
                {step === 3 && (
                  <Step
                    title="Escolha um horário"
                    subtitle={
                      professional
                        ? `Agenda de ${professional.display_name}`
                        : "Buscando a melhor agenda disponível"
                    }
                  >
                    {slotLoading ? (
                      <Loading label="Consultando horários disponíveis" />
                    ) : actionError ? (
                      <ErrorState message={actionError} onRetry={loadSlots} />
                    ) : slots.length ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {slots.map((s) => (
                          <button
                            key={s.starts_at}
                            onClick={() => setSlot(s)}
                            className={`focus-ring min-h-12 border text-sm font-bold transition ${slot?.starts_at === s.starts_at ? "border-brand bg-brand text-white" : "border-black/20 bg-white hover:border-brand"}`}
                          >
                            {time(s.starts_at)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Sem horários neste dia"
                        text="Tente outra data ou outro profissional."
                      />
                    )}
                  </Step>
                )}
                {step === 4 && (
                  <Step
                    title="Revise seu agendamento"
                    subtitle="Confirme se está tudo certo antes de reservar."
                  >
                    <div className="mx-auto max-w-xl divide-y divide-black/10 border border-black/10 bg-white px-6">
                      <Summary
                        icon={<Clock />}
                        label="Serviço"
                        value={`${service.name} · ${money(service.price)}`}
                      />
                      <Summary
                        icon={<UserRound />}
                        label="Profissional"
                        value={professional.display_name}
                      />
                      <Summary
                        icon={<CalendarDays />}
                        label="Data e hora"
                        value={`${fullDate(slot.starts_at)} · ${time(slot.starts_at)}`}
                      />
                    </div>
                    {actionError && (
                      <div className="mt-5">
                        <ErrorState message={actionError} />
                      </div>
                    )}
                  </Step>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-black/10 p-5 sm:px-9">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            {step < 4 ? (
              <Button
                onClick={next}
                disabled={
                  (step === 0 && !service) ||
                  (step === 1 && !professional && !anyProfessional) ||
                  (step === 2 && !date) ||
                  (step === 3 && !slot)
                }
              >
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button loading={submitting} onClick={confirm}>
                Confirmar agendamento
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function Step({ title, subtitle, children }) {
  return (
    <div>
      <h2 className="text-2xl font-black uppercase sm:text-3xl">{title}</h2>
      <p className="mb-7 mt-2 text-sm text-black/55">{subtitle}</p>
      {children}
    </div>
  );
}
function Choice({ selected, onClick, title, meta, icon }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex min-h-24 items-center gap-4 border p-5 text-left transition ${selected ? "border-brand bg-brand text-white" : "border-black/15 bg-white hover:border-brand"}`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center ${selected ? "bg-white text-brand" : "bg-paper text-brand"}`}
      >
        {icon || title.charAt(0)}
      </span>
      <span>
        <strong className="block uppercase">{title}</strong>
        <small
          className={`mt-1 line-clamp-2 ${selected ? "text-white/70" : "text-black/50"}`}
        >
          {meta}
        </small>
      </span>
      {selected && <Check className="ml-auto size-5" />}
    </button>
  );
}
function Summary({ icon, label, value }) {
  return (
    <div className="flex gap-4 py-5">
      <span className="text-brand">{icon}</span>
      <div>
        <span className="block text-xs font-bold uppercase tracking-wider text-black/40">
          {label}
        </span>
        <strong className="mt-1 block">{value}</strong>
      </div>
    </div>
  );
}
