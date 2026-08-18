export const money = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(v),
  );
export const shortDate = (v) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(
    new Date(v),
  );
export const fullDate = (v) =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(v));
export const time = (v) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(v));
