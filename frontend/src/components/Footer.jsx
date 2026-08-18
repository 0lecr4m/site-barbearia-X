import { Scissors, AtSign, MapPin, Phone } from "lucide-react";
export default function Footer() {
  return (
    <footer id="contato" className="bg-black py-16 text-white">
      <div className="container-x grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 font-display text-2xl uppercase">
            <Scissors className="text-blue-500" />
            Projeto X
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
            [Placeholder: breve apresentação oficial da barbearia.]
          </p>
        </div>
        <div>
          <h3 className="eyebrow text-blue-400">Navegação</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <a href="/#sobre">Sobre nós</a>
            <a href="/#servicos">Serviços</a>
            <a href="/#barbeiros">Barbeiros</a>
          </div>
        </div>
        <div>
          <h3 className="eyebrow text-blue-400">Contato</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <span className="flex gap-2">
              <MapPin className="size-4" />
              [Endereço da barbearia]
            </span>
            <span className="flex gap-2">
              <Phone className="size-4" />
              [Telefone]
            </span>
            <span className="flex gap-2">
              <AtSign className="size-4" />
              [@instagram]
            </span>
          </div>
        </div>
        <div>
          <h3 className="eyebrow text-blue-400">Horários</h3>
          <p className="mt-5 text-sm leading-6 text-white/65">
            [Horários de funcionamento serão informados pela barbearia.]
          </p>
        </div>
      </div>
      <div className="container-x mt-14 border-t border-white/10 pt-6 text-xs text-white/35">
        © {new Date().getFullYear()} Projeto X. Conteúdo institucional
        provisório.
      </div>
    </footer>
  );
}
