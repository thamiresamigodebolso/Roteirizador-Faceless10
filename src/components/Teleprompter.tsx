import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Type, ChevronLeft, ArrowDown, ArrowUp } from "lucide-react";
import { ScriptBlock } from "../types";

interface TeleprompterProps {
  blocks: ScriptBlock[];
  onClose: () => void;
  title: string;
}

export default function Teleprompter({ blocks, onClose, title }: TeleprompterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 5 speed scale
  const [fontSize, setFontSize] = useState(24); // px size
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Combine script narration texts with blocks indicator
  const fullText = blocks.map((b) => ({
    label: b.bloco.toUpperCase(),
    text: b.texto_narracao,
    duration: `${b.tempo_inicio_seg}s - ${b.tempo_fim_seg}s`
  }));

  useEffect(() => {
    if (isPlaying) {
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        // Simple interval-based smooth scrolling
        const interval = window.setInterval(() => {
          scrollContainer.scrollTop += speed * 0.4;
          
          // Pause if reached bottom
          if (
            scrollContainer.scrollHeight - scrollContainer.scrollTop <=
            scrollContainer.clientHeight + 2
          ) {
            setIsPlaying(false);
          }
        }, 30);
        scrollIntervalRef.current = interval;
      }
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const speedMultiplierLabel = () => {
    switch (speed) {
      case 1: return "Lento";
      case 2: return "Normal";
      case 3: return "Moderado";
      case 4: return "Rápido";
      case 5: return "Muito Rápido";
      default: return "Normal";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100" id="teleprompter-modal">
      
      {/* Teleprompter Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center space-x-3">
          <button
            id="close-teleprompter-btn"
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold truncate max-w-xs md:max-w-md">{title}</h2>
            <p className="text-[10px] opacity-70">Modo Estúdio (Teleprompter) • Leia em voz alta para gravar</p>
          </div>
        </div>

        {/* Configurations bar */}
        <div className="flex items-center space-x-4">
          {/* Font size selectors */}
          <div className="flex items-center space-x-1.5 border-r border-zinc-800 pr-4">
            <button
              id="font-decrease-btn"
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="p-1.5 rounded transition-all hover:bg-zinc-900"
              title="Diminuir texto"
            >
              <Type className="h-4 w-4 transform scale-75" />
            </button>
            <span className="text-xs font-semibold w-8 text-center">{fontSize}px</span>
            <button
              id="font-increase-btn"
              onClick={() => setFontSize(Math.min(48, fontSize + 2))}
              className="p-1.5 rounded transition-all hover:bg-zinc-900"
              title="Aumentar texto"
            >
              <Type className="h-4 w-4 transform scale-125" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Text Stage */}
      <div className="flex-1 relative flex flex-col justify-center items-center">
        {/* Eye line indicator */}
        <div className="absolute top-1/2 left-0 right-0 h-16 pointer-events-none transform -translate-y-1/2 border-y opacity-30 border-orange-500 bg-orange-500/5" />

        <div
          ref={scrollContainerRef}
          id="teleprompter-text-scroll-container"
          className="w-full max-w-4xl h-full overflow-y-auto px-8 py-[30vh] space-y-24 scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {fullText.map((block, idx) => (
            <div key={idx} className="relative group max-w-3xl mx-auto">
              <span className="absolute -top-10 left-0 text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-zinc-900 text-orange-500">
                {block.label} ({block.duration})
              </span>
              <p
                style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
                className="font-serif select-none transition-all duration-300 text-zinc-200"
              >
                {block.text}
              </p>
            </div>
          ))}

          {/* Finished message */}
          <div className="text-center pt-16 pb-32">
            <h3 className="text-xl font-bold opacity-60">Fim do Roteiro</h3>
            <p className="text-xs opacity-40 mt-1">Gostou da leitura? Clique em Reiniciar para ler novamente.</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <footer className="px-6 py-5 border-t flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 border-zinc-900 bg-zinc-950">
        {/* Speed adjustment controls */}
        <div className="flex items-center space-x-3">
          <span className="text-xs opacity-70">Velocidade:</span>
          <div className="flex items-center space-x-1">
            <button
              id="speed-decrease-btn"
              onClick={() => setSpeed(Math.max(1, speed - 1))}
              className="p-1.5 rounded transition-all hover:bg-zinc-900"
              title="Mais lento"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold w-20 text-center">{speedMultiplierLabel()}</span>
            <button
              id="speed-increase-btn"
              onClick={() => setSpeed(Math.min(5, speed + 1))}
              className="p-1.5 rounded transition-all hover:bg-zinc-900"
              title="Mais rápido"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center space-x-4">
          <button
            id="teleprompter-reset-btn"
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border border-zinc-850 text-zinc-300 hover:bg-zinc-900"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar</span>
          </button>

          <button
            id="teleprompter-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md shadow-orange-600/10 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4.5 w-4.5 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5 fill-current" />
                <span>Iniciar Rolagem</span>
              </>
            )}
          </button>
        </div>

        {/* Status Help */}
        <div className="text-[11px] opacity-50 hidden md:block">
          Dica: Posicione os olhos no meio da tela para olhar diretamente para a câmera.
        </div>
      </footer>
    </div>
  );
}
