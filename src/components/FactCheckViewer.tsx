import { ShieldCheck, AlertTriangle, ExternalLink, Link } from "lucide-react";

interface FactCheckViewerProps {
  confirmed: string[];
  unconfirmed: string[];
  sources: string[];
}

export default function FactCheckViewer({ confirmed, unconfirmed, sources }: FactCheckViewerProps) {
  return (
    <div className="space-y-6" id="fact-checking-viewer">
      
      {/* Fatos Apurados */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-green-400" />
          Fatos Confirmados e Apurados
        </h3>
        {confirmed && confirmed.length > 0 ? (
          <ul className="space-y-2">
            {confirmed.map((fact, idx) => (
              <li
                key={idx}
                id={`confirmed-fact-${idx}`}
                className="text-xs text-zinc-300 bg-green-950/20 border border-green-900/30 p-3 rounded-xl flex items-start gap-2 leading-relaxed"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500 italic">Nenhum fato listado explicitamente.</p>
        )}
      </div>

      {/* Fatos Não Confirmados / Alertas de Segurança */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-orange-500" />
          Pontos Não Confirmados ou Hipóteses
        </h3>
        {unconfirmed && unconfirmed.length > 0 ? (
          <div className="space-y-2">
            {unconfirmed.map((fact, idx) => (
              <div
                key={idx}
                id={`unconfirmed-fact-${idx}`}
                className="text-xs text-zinc-300 bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl flex items-start gap-2 leading-relaxed"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-orange-500 block mb-0.5">Dramatização de Suspense / Não Confirmado:</span>
                  <span>{fact}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-zinc-950 rounded-xl text-xs text-zinc-400 flex items-center gap-2 border border-zinc-800">
            <ShieldCheck className="h-4 w-4 text-zinc-550" />
            <span>Todos os dados do roteiro foram validados factual mente nas fontes encontradas.</span>
          </div>
        )}
      </div>

      {/* Fontes Utilizadas */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <Link className="h-4.5 w-4.5 text-zinc-400" />
          Fontes Utilizadas e Referências de Grounding
        </h3>
        {sources && sources.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {sources.map((src, idx) => {
              const isUrl = src.startsWith("http");
              return (
                <div
                  key={idx}
                  id={`source-item-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs transition-all hover:bg-zinc-900"
                >
                  <span className="text-zinc-300 truncate font-mono select-all pr-4 flex-1">
                    {src}
                  </span>
                  {isUrl ? (
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white flex items-center gap-1 font-semibold flex-shrink-0"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-zinc-550 italic text-[10px]">Busca Web</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">Nenhuma fonte listada.</p>
        )}
      </div>

    </div>
  );
}
