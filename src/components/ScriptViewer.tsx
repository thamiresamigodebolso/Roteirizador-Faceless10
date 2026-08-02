import { useState } from "react";
import { ScriptBlock } from "../types";
import { Copy, Check, Tv, CheckSquare, Sparkles, BookOpen } from "lucide-react";

interface ScriptViewerProps {
  blocks: ScriptBlock[];
  onLaunchTeleprompter: () => void;
}

export default function ScriptViewer({ blocks, onLaunchTeleprompter }: ScriptViewerProps) {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const getBlockColor = (type: string) => {
    switch (type) {
      case "gancho":
        return "bg-rose-950/40 text-rose-400 border-rose-900/60";
      case "contexto":
        return "bg-zinc-900 text-zinc-300 border-zinc-800";
      case "desenvolvimento":
        return "bg-orange-950/40 text-orange-400 border-orange-900/60";
      case "revelacao":
        return "bg-amber-950/40 text-amber-400 border-amber-900/60";
      case "fechamento":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/60";
      default:
        return "bg-zinc-900 text-zinc-300 border-zinc-800";
    }
  };

  const getBlockLabel = (type: string) => {
    switch (type) {
      case "gancho":
        return "1. Gancho de Mistério";
      case "contexto":
        return "2. Contexto Narrativo";
      case "desenvolvimento":
        return "3. Desenvolvimento";
      case "revelacao":
        return "4. Revelação / Virada";
      case "fechamento":
        return "5. Fechamento & Chamada";
      default:
        return type;
    }
  };

  const getBlockDesc = (type: string) => {
    switch (type) {
      case "gancho":
        return "Abre a curiosidade do espectador sem dar spoilers do final.";
      case "contexto":
        return "Situa quem, onde, quando e por que o fato central importa.";
      case "desenvolvimento":
        return "Aprofunda a cronologia, números, reações e detalhes factuais.";
      case "revelacao":
        return "O clímax informativo que responde ao mistério do gancho.";
      case "fechamento":
        return "Conclusão breve e chamada de engajamento.";
      default:
        return "";
    }
  };

  const copyBlock = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockIdx(idx);
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  const copyAllScript = () => {
    const fullScript = blocks
      .map((b) => b.texto_narracao.trim())
      .join(" ");
    navigator.clipboard.writeText(fullScript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6" id="script-viewer-dashboard">
      
      {/* Script Tools Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 gap-4">
        <div>
          <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Tv className="h-4 w-4 text-orange-500 animate-pulse" />
            Roteiro Estruturado Pronto
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">Copia o texto limpo sem tags, otimizado para o gerador de voz.</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="copy-full-script-btn"
            onClick={copyAllScript}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-green-400">Roteiro Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Tudo</span>
              </>
            )}
          </button>

          <button
            id="launch-teleprompter-btn"
            onClick={onLaunchTeleprompter}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Iniciar Teleprompter</span>
          </button>
        </div>
      </div>

      {/* Blocks Timeline */}
      <div className="relative border-l border-zinc-800 ml-3.5 pl-6 space-y-8" id="script-blocks-timeline">
        {blocks.map((block, idx) => {
          const wordCount = block.texto_narracao.split(/\s+/).filter(Boolean).length;
          
          return (
            <div key={idx} id={`script-block-card-${idx}`} className="relative group">
              
              {/* Timeline marker node */}
              <div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 ring-4 ring-zinc-950 transition-all group-hover:border-zinc-500">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-400" />
              </div>

              {/* Header inside block */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${getBlockColor(block.bloco)}`}>
                    {getBlockLabel(block.bloco)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-450 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-md">
                    {block.tempo_inicio_seg}s - {block.tempo_fim_seg}s ({block.tempo_fim_seg - block.tempo_inicio_seg}s)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {wordCount} palavras
                  </span>
                  
                  <button
                    id={`copy-block-btn-${idx}`}
                    onClick={() => copyBlock(block.texto_narracao, idx)}
                    className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Copiar apenas este bloco"
                  >
                    {copiedBlockIdx === idx ? (
                      <Check className="h-3.5 w-3.5 text-green-450" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-explanation */}
              <p className="text-[11px] text-zinc-500 italic mb-2 px-1">
                {getBlockDesc(block.bloco)}
              </p>

              {/* Narrative Content */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 shadow-sm leading-relaxed text-sm text-zinc-100 font-sans group-hover:border-zinc-700 transition-all select-all">
                {block.texto_narracao}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
