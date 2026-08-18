import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import orlandoImage from "../../assets/orlando_img.jpg";
import batistaImage from "../../assets/batista_img.jpg";
import potterImage from "../../assets/potter_img.jpg";
import xamImage from "../../assets/xam_img.png";

const teamImages = {
  ORLANDO: orlandoImage,
  "CARLOS BATISTA": batistaImage,
  POTTER: potterImage,
  XAM: xamImage,
};

export default function BarberCard({ professional, index }) {
  const normalizedName = professional.display_name.trim().toUpperCase();
  const image = teamImages[normalizedName] || professional.photo_url;

  return (
    <article className="group relative overflow-hidden bg-zinc-900 text-white">
      <div className="aspect-[4/5] bg-gradient-to-br from-zinc-700 to-black">
        {image ? (
          <img
            src={image}
            alt={`Retrato de ${professional.display_name}`}
            className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <div className="grid h-full place-items-center font-display text-8xl text-white/10">
            {String(index + 1).padStart(2, "0")}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-6 pt-24">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-400">
          Profissional
        </p>
        <h3 className="mt-2 text-2xl font-black uppercase">
          {professional.display_name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/60">
          {professional.bio || "Apresentação profissional em breve."}
        </p>
        <Link
          to={`/agendar?professional=${professional.id}`}
          className="focus-ring mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          Agendar com {professional.display_name.split(" ")[0]}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
