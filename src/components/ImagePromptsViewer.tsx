import { useState } from "react";
import { ImagePrompt } from "../types";
import { Copy, Check, MessageSquareCode, Sparkles } from "lucide-react";

interface ImagePromptsViewerProps {
  prompts: ImagePrompt[];
}

export default function ImagePromptsViewer({ prompts }: ImagePromptsViewerProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center py-12 px-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40" id="no-prompts-placeholder">
        <MessageSquareCode className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-zinc-300">Prompts de Imagem Não Solicitados</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Para receber sugestões detalhadas de imagem em inglês prontas para Midjourney ou Leonard AI, marque a opção "Gerar Prompts de Imagem" antes de rodar o gerador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="image-prompts-viewer-list">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-orange-500" />
            Prompts de Imagem para Ilustração (Midjourney / Leonard / Flux)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Utilize os prompts em inglês abaixo para manter consistência de cenas na ferramenta de IA.</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {prompts.map((p, idx) => (
          <div
            key={idx}
            id={`image-prompt-item-${idx}`}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 relative group transition-all hover:bg-zinc-900/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                Momento: {p.momento_do_video || `Cena ${idx + 1}`}
              </span>
              <button
                id={`copy-prompt-btn-${idx}`}
                onClick={() => copyPrompt(p.prompt, idx)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-850 shadow-sm rounded-lg px-2.5 py-1 transition-all cursor-pointer"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Prompt</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-zinc-200 font-mono bg-zinc-900 border border-zinc-800 p-3 rounded-lg leading-relaxed select-all">
              {p.prompt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
