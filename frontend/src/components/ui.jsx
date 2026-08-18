import { LoaderCircle, TriangleAlert, CalendarX } from "lucide-react";
export function Button({
  variant = "primary",
  className = "",
  loading,
  children,
  ...props
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-blue-950",
    dark: "bg-black text-white hover:bg-zinc-800",
    light: "bg-white text-black hover:bg-zinc-100",
    outline:
      "border border-black/20 bg-transparent hover:border-brand hover:text-brand",
  };
  return (
    <button
      className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
export function Input({ label, error, endAdornment, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <span className="relative">
        <input
          className={`focus-ring min-h-12 w-full border border-black/20 bg-white px-4 font-normal placeholder:text-black/35 ${endAdornment ? "pr-12" : ""}`}
          {...props}
        />
        {endAdornment && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </span>
        )}
      </span>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  );
}
export function Loading({ label = "Carregando" }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-black/60">
      <LoaderCircle className="size-5 animate-spin text-brand" />
      {label}
    </div>
  );
}
export function EmptyState({
  title = "Nada por aqui",
  text = "Não há informações disponíveis no momento.",
}) {
  return (
    <div className="card grid min-h-48 place-items-center p-8 text-center">
      <div>
        <CalendarX className="mx-auto mb-4 size-7 text-brand" />
        <h3 className="font-bold">{title}</h3>
        <p className="mt-2 text-sm text-black/55">{text}</p>
      </div>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="border border-red-200 bg-red-50 p-5 text-sm text-red-900"
    >
      <TriangleAlert className="mb-2 size-5" />
      <p>{message}</p>
      {onRetry && (
        <button
          className="focus-ring mt-3 font-bold underline"
          onClick={onRetry}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
export function Stepper({ current }) {
  const steps = ["Serviço", "Barbeiro", "Data", "Horário", "Confirmar"];
  return (
    <ol
      aria-label="Etapas do agendamento"
      className="flex overflow-x-auto border-b border-black/10"
    >
      {steps.map((s, i) => (
        <li
          key={s}
          className={`min-w-fit flex-1 border-b-2 px-3 py-4 text-center text-[11px] font-bold uppercase tracking-wider ${i === current ? "border-brand text-brand" : i < current ? "border-black text-black" : "border-transparent text-black/35"}`}
        >
          <span className="mr-1.5">0{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}
