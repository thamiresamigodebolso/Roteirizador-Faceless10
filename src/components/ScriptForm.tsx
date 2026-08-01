import React, { useState } from "react";
import { Link2, MessageSquare, Image, Loader2, Sparkles, Clock, Flame } from "lucide-react";

interface ScriptFormProps {
  onSubmit: (input: string, duration: number, generatePrompts: boolean, style: string, energy: string) => void;
  isLoading: boolean;
}

const STYLE_OPTIONS = [
  { id: "juridico", label: "Jurídico", icon: "⚖️" },
  { id: "noticias_faceless", label: "Notícias Faceless", icon: "📺" },
  { id: "roteiro_jornalistico", label: "Roteiro Jornalístico", icon: "📰" },
  { id: "ia", label: "Inteligência Artificial", icon: "🤖" },
  { id: "seducao", label: "Sedução", icon: "💋" },
  { id: "motivacao", label: "Motivação", icon: "💪" },
  { id: "riqueza", label: "Riqueza", icon: "💰" },
  { id: "lifestyle", label: "Lifestyle", icon: "👑" },
  { id: "lei_da_atracao", label: "Lei da Atração", icon: "🌌" },
  { id: "poder_manipulacao", label: "Poder e Manipulação", icon: "🧠" },
  { id: "estoicismo", label: "Estoicismo", icon: "🏛️" },
  { id: "relacionamento", label: "Relacionamento", icon: "❤️" },
  { id: "vendas", label: "Vendas", icon: "🛒" },
  { id: "minha_oferta", label: "Minha Oferta", icon: "🎁" },
];

const ENERGY_OPTIONS = [
  { id: "calmo", label: "Calmo", icon: "🧘" },
  { id: "forte", label: "Forte", icon: "💥" },
  { id: "relevante", label: "Relevante", icon: "📌" },
  { id: "agressivo", label: "Agressivo", icon: "🔥" },
  { id: "motivacional", label: "Motivacional", icon: "🚀" },
  { id: "misterioso", label: "Misterioso", icon: "🕵️" },
];

export default function ScriptForm({ onSubmit, isLoading }: ScriptFormProps) {
  const [input, setInput] = useState("");
  const [duration, setDuration] = useState(3);
  const [generatePrompts, setGeneratePrompts] = useState(false);
  const [style, setStyle] = useState("noticias_faceless");
  const [energy, setEnergy] = useState("forte");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input, duration, generatePrompts, style, energy);
  };

  const durations = [1, 2, 3, 5, 8, 10, 15, 20];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="script-generator-form">
      <div>
        <label htmlFor="input-source" className="block text-sm font-semibold text-zinc-300 mb-2">
          Fonte de Informação, Tema ou Link
        </label>
        <div className="relative rounded-xl shadow-sm">
          <textarea
            id="input-source"
            rows={5}
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none transition-all resize-none"
            placeholder="Cole uma notícia completa, insira um link de artigo, ou apenas escreva o tema/ideia livre que deseja transformar em um roteiro..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 flex space-x-2 text-zinc-500">
            {input.startsWith("http") ? (
              <Link2 id="icon-link-active" className="h-5 w-5 text-orange-500" />
            ) : (
              <MessageSquare id="icon-text-active" className="h-5 w-5" />
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-455">
          Aceitamos links de notícias, textos longos ou apenas tópicos soltos. Buscaremos atualizações em tempo real!
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-[11px] font-black text-zinc-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Estilo do Tema / Conteúdo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2.5" id="style-selector-grid">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                id={`style-btn-${s.id}`}
                type="button"
                onClick={() => setStyle(s.id)}
                disabled={isLoading}
                className={`px-3 py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2.5 group cursor-pointer ${
                  style === s.id
                    ? "border-orange-600 bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] ring-1 ring-orange-500"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-zinc-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Energia do Roteiro
          </h3>
          <div className="grid grid-cols-3 gap-2.5" id="energy-selector-grid">
            {ENERGY_OPTIONS.map((e) => (
              <button
                key={e.id}
                id={`energy-btn-${e.id}`}
                type="button"
                onClick={() => setEnergy(e.id)}
                disabled={isLoading}
                className={`px-2 py-4 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer ${
                  energy === e.id
                    ? "border-orange-600 bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] ring-1 ring-orange-500"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <span className="text-lg">{e.icon}</span>
                <span>{e.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-300 mb-3">
          Duração Estimada do Vídeo
        </label>
        <div className="grid grid-cols-4 gap-2" id="duration-selector-grid">
          {durations.map((d) => (
            <button
              key={d}
              id={`duration-btn-${d}`}
              type="button"
              onClick={() => setDuration(d)}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all ${
                duration === d
                  ? "border-orange-900/50 bg-orange-600 text-white shadow-sm"
                  : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-850"
              }`}
            >
              <div className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{d}m</span>
              </div>
              <span className="text-[10px] opacity-70 mt-0.5">~{d * 155} pal.</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="generate-prompts"
                name="generate-prompts"
                type="checkbox"
                checked={generatePrompts}
                onChange={(e) => setGeneratePrompts(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-orange-600 focus:ring-orange-600 cursor-pointer"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="generate-prompts" className="font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5">
                <Image className="h-4 w-4 text-zinc-400" />
                Gerar Prompts de Imagem
              </label>
              <p className="text-zinc-400 text-xs mt-0.5">
                Cria sugestões detalhadas de imagem em inglês para ilustrar cada cena do seu vídeo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        id="submit-generate-btn"
        type="submit"
        disabled={isLoading || !input.trim()}
        className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-base font-semibold shadow-sm transition-all ${
          isLoading || !input.trim()
            ? "bg-zinc-900 text-zinc-650 cursor-not-allowed border border-zinc-850"
            : "bg-orange-600 text-white hover:bg-orange-500 cursor-pointer"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processando & Roteirizando...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Gerar Roteiro de Alta Conversão</span>
          </>
        )}
      </button>
    </form>
  );
}
