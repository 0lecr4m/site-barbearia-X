import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Input, ErrorState } from "../components/ui.jsx";
import logo from "../../assets/logo_x.png";
export default function AuthPage() {
  const [mode, setMode] = useState("login"),
    [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    { user, login, register } = useAuth(),
    navigate = useNavigate(),
    location = useLocation();
  if (user) return <Navigate to="/minha-conta" replace />;
  const change = (e) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login")
        await login({ login: form.email, password: form.password });
      else
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        });
      navigate(location.state?.from || "/minha-conta", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="grid min-h-[calc(100svh-5rem)] bg-paper lg:grid-cols-2">
      <div className="hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="grid size-16 overflow-hidden bg-blue-950">
          <img
            src={logo}
            alt="Logo X Studio Barber"
            className="size-full scale-[1.75] object-cover"
          />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-blue-200">
            X Studio Barber
          </p>
          <h1 className="display mt-5 text-8xl">
            Seu próximo corte começa aqui.
          </h1>
        </div>
        <p className="text-sm text-white/55">
          Agenda simples, rápida e segura.
        </p>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow">Área do cliente</p>
          <h1 className="display mt-3 text-5xl">
            {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-3 text-sm text-black/55">
            {location.state?.message ||
              "Acesse seus horários e agende em poucos passos."}
          </p>
          <div className="mt-8 flex border-b border-black/15">
            <button
              className={`focus-ring flex-1 border-b-2 py-3 text-sm font-bold ${mode === "login" ? "border-brand text-brand" : "border-transparent"}`}
              onClick={() => setMode("login")}
            >
              ENTRAR
            </button>
            <button
              className={`focus-ring flex-1 border-b-2 py-3 text-sm font-bold ${mode === "register" ? "border-brand text-brand" : "border-transparent"}`}
              onClick={() => setMode("register")}
            >
              CADASTRAR
            </button>
          </div>
          <form onSubmit={submit} className="mt-7 grid gap-5">
            {mode === "register" && (
              <Input
                label="Nome"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                value={form.name}
                onChange={change}
              />
            )}
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={change}
            />
            {mode === "register" && (
              <Input
                label="Telefone (opcional)"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={change}
              />
            )}
            <Input
              label="Senha"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "register" ? 8 : 1}
              value={form.password}
              onChange={change}
              endAdornment={
                <button
                  type="button"
                  className="focus-ring rounded p-1 text-black/55 transition hover:text-brand"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              }
            />
            {error && <ErrorState message={error} />}
            <Button type="submit" loading={loading} className="w-full">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
