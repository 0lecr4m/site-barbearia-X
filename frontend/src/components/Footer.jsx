import { AtSign, MapPin, Phone, Quote, Star } from "lucide-react";
import logo from "../../assets/logo_x.png";

const illustrativeReviews = [
  {
    name: "Rafael M.",
    text: "Atendimento cuidadoso, ambiente acolhedor e um resultado que respeitou exatamente o meu estilo.",
  },
  {
    name: "Diego S.",
    text: "A experiência foi tranquila do agendamento ao corte. Profissionalismo e muita atenção aos detalhes.",
  },
  {
    name: "André L.",
    text: "Mais do que renovar o visual: música boa, conversa e a sensação de estar em um espaço feito para nós.",
  },
];
export default function Footer() {
  return (
    <footer id="contato" className="bg-black py-16 text-white">
      <section
        className="container-x mb-16 border-b border-white/10 pb-16"
        aria-labelledby="reviews-title"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-blue-400">Experiências</p>
            <h2
              id="reviews-title"
              className="display mt-3 text-5xl sm:text-6xl"
            >
              Quem passa por aqui
            </h2>
          </div>
          <p className="text-xs text-white/40">
            Depoimentos ilustrativos — conteúdo provisório
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {illustrativeReviews.map((review) => (
            <article
              key={review.name}
              className="border border-white/10 bg-white/[.04] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1" aria-label="5 de 5 estrelas">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star
                      key={star}
                      className="size-3.5 fill-blue-500 text-blue-500"
                    />
                  ))}
                </div>
                <Quote className="size-5 text-white/20" />
              </div>
              <p className="mt-5 text-sm leading-6 text-white/70">
                “{review.text}”
              </p>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider">
                {review.name}
              </p>
            </article>
          ))}
        </div>
      </section>
      <div className="container-x grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 font-display text-2xl uppercase">
            <span className="grid size-12 overflow-hidden bg-brand">
              <img
                src={logo}
                alt=""
                className="size-full scale-[1.75] object-cover"
              />
            </span>
            X Studio Barber
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
        © {new Date().getFullYear()} X Studio Barber. Conteúdo institucional
        provisório.
      </div>
    </footer>
  );
}
