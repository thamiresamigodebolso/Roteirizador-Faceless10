import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  HelpCircle, 
  History, 
  Tv, 
  Image as ImageIcon, 
  Share2, 
  CheckSquare, 
  BookOpen, 
  Play, 
  MessageSquare,
  Compass,
  FileText,
  AlertTriangle,
  Flame,
  Globe,
  Key,
  Eye,
  EyeOff,
  Settings,
  X,
  Trash2
} from "lucide-react";
import ScriptForm from "./components/ScriptForm";
import ScriptHistory from "./components/ScriptHistory";
import ScriptViewer from "./components/ScriptViewer";
import ImagePromptsViewer from "./components/ImagePromptsViewer";
import MetadataViewer from "./components/MetadataViewer";
import FactCheckViewer from "./components/FactCheckViewer";
import Teleprompter from "./components/Teleprompter";
import { GeneratedScript } from "./types";

export default function App() {
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  const [activeScript, setActiveScript] = useState<GeneratedScript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"imagens" | "publicacao" | "apuracao">("imagens");
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);

  const handleGenerateMetadata = async (platform: "youtube" | "reels" | "completo") => {
    if (!activeScript) return;
    setIsGeneratingMetadata(true);

    try {
      const scriptText = activeScript.roteiro
        .map((b) => `[${b.bloco.toUpperCase()}]\n${b.texto_narracao}`)
        .join("\n\n");

      const res = await fetch("/api/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptText, apiKey, platform }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Ocorreu um erro ao gerar os metadados.");
      }

      const rawMetadata = await res.json();

      const updatedScript = {
        ...activeScript,
        metadata_publicacao: rawMetadata
      };

      setActiveScript(updatedScript);

      const updatedHistory = history.map((item) => 
        item.id === activeScript.id ? updatedScript : item
      );
      saveHistory(updatedHistory);
    } catch (err: any) {
      alert(`Erro ao Gerar Metadados: ${err.message}`);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };
  
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("gemini_user_api_key") || "";
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // Save apiKey to localStorage
  useEffect(() => {
    localStorage.setItem("gemini_user_api_key", apiKey);
  }, [apiKey]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("faceless_scripts_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          if (parsed.length > 0) {
            setActiveScript(parsed[0]);
            setIsConfigOpen(false); // Fecha a gaveta se já tivermos um histórico ativo
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar histórico local:", e);
    }
  }, []);

  // Save history to localStorage when changed
  const saveHistory = (newHistory: GeneratedScript[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("faceless_scripts_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Erro ao salvar histórico local:", e);
    }
  };

  const loadingSteps = [
    "Iniciando os rastreadores web factuais...",
    "Buscando as notícias e atualizações mais recentes sobre o tema...",
    "Cruzando dados das fontes para validar os fatos...",
    "Formatando a linha cronológica de acontecimentos...",
    "Estruturando o Gancho de Mistério irresistível...",
    "Construindo o roteiro e otimizando o ritmo de leitura...",
    "Aprofundando a Revelação no final para prender atenção...",
    "Criando prompts de imagens cinematográficas sob medida...",
    "Gerando títulos magnéticos, tags de SEO e descrição final..."
  ];

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setLoadingStep(0);
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleGenerateScript = async (input: string, duration: number, generatePrompts: boolean, style: string, energy: string) => {
    setIsLoading(true);
    setActiveScript(null);
    setIsConfigOpen(false); // Fecha a gaveta para que o usuário veja a tela de carregamento

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, duration, generatePrompts, apiKey, style, energy }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Ocorreu um erro ao gerar o roteiro.");
      }

      const rawData = await res.json();
      
      const newScript: GeneratedScript = {
        ...rawData,
        id: `script_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [newScript, ...history];
      saveHistory(updatedHistory);
      setActiveScript(newScript);
      setActiveTab("imagens");
    } catch (err: any) {
      alert(`Erro de Geração: ${err.message}`);
      setIsConfigOpen(true); // Abre a gaveta de volta para o usuário corrigir dados
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (activeScript?.id === id) {
      const nextActive = updated.length > 0 ? updated[0] : null;
      setActiveScript(nextActive);
      if (!nextActive) {
        setIsConfigOpen(true);
      }
    }
  };

  const handleSelectHistory = (script: GeneratedScript) => {
    setActiveScript(script);
    setActiveTab("imagens");
    setIsConfigOpen(false); // Fecha a gaveta ao selecionar
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col relative overflow-x-hidden" id="faceless-main-app">
      
      {/* Header Bar */}
      <header className="border-b border-zinc-850 bg-zinc-900 sticky top-0 z-10 px-6 py-4" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-zinc-800 text-white flex items-center justify-center rounded-xl shadow-sm border border-zinc-700">
              <Sparkles className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-zinc-50 flex items-center gap-1.5 pl-3 border-l-4 border-orange-600">
                Roteirizador Faceless
                <span className="px-2 py-0.5 rounded-full bg-orange-950/30 border border-orange-900/50 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  Estúdio Pro
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium hidden md:block mt-0.5">Motor de Roteirização de Notícias e Mistérios com Ganchos de Alta Conversão</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 mr-2 border-r border-zinc-800 pr-4 hidden md:flex">
              <a
                href="https://ai33.pro/app/buy-credits"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-300 shadow-sm transition-all"
                title="Criar Voz (AI33 - ElevenLabs)"
              >
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                <span>Gerar Voz (AI33)</span>
              </a>
              <a
                href="https://app.heygen.com/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold text-zinc-300 shadow-sm transition-all"
                title="Criar Vídeo com HeyGen"
              >
                <Play className="h-3.5 w-3.5 text-emerald-450 animate-pulse" />
                <span>Vídeo (HeyGen)</span>
              </a>
            </div>
            {activeScript && (
              <button
                onClick={() => {
                  setActiveScript(null);
                  setIsConfigOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 rounded-xl text-xs font-bold text-zinc-300 shadow transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-zinc-400" />
                <span>Limpar Tela</span>
              </button>
            )}
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-650 hover:bg-orange-600 border border-orange-500 rounded-xl text-xs font-bold text-white shadow transition-all cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span>Configurar Roteiro</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Panel (Drawer) */}
      <AnimatePresence>
        {isConfigOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="fixed inset-0 bg-black/70 z-40"
            />
            {/* Slide-in container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full sm:w-[450px] bg-zinc-900 border-r border-zinc-800 z-50 p-6 overflow-y-auto flex flex-col space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  <h2 className="text-base font-bold text-zinc-100">Painel de Geração</h2>
                </div>
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Gemini API Key Configuration */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-orange-500" />
                    Chave API do Gemini
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 font-bold border border-zinc-800">
                    Opcional
                  </span>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Cole sua AIzaSy... aqui"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 pr-9 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Form Generator */}
              <div className="flex-1">
                <ScriptForm onSubmit={handleGenerateScript} isLoading={isLoading} />
              </div>

              {/* History */}
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico de Roteiros ({history.length})
                </h3>
                <ScriptHistory
                  history={history}
                  onSelect={handleSelectHistory}
                  onDelete={handleDeleteHistory}
                  activeId={activeScript?.id}
                />
              </div>

              {/* Portais de Notícias (Fontes) */}
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  Portais de Notícias (Fontes)
                </h3>
                <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
                  Acesse em um clique as tendências e portais locais de Lorena, do Vale do Paraíba, de SP e nacionais para buscar notícias:
                </p>
                <div className="grid grid-cols-2 gap-2" id="news-portals-links-grid">
                  <a
                    href="https://trends.google.com/trends/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    📈 Google Trends
                  </a>
                  <a
                    href="https://g1.globo.com/sp/vale-do-paraiba-regiao/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🔴 G1 Vale (Lorena)
                  </a>
                  <a
                    href="http://jornalatos.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    📰 Jornal Atos (Lorena)
                  </a>
                  <a
                    href="https://www.ovale.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🦅 O Vale
                  </a>
                  <a
                    href="https://g1.globo.com/sp/sao-paulo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🌆 G1 São Paulo
                  </a>
                  <a
                    href="https://www.metropoles.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🔥 Metrópoles
                  </a>
                  <a
                    href="https://noticias.uol.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🌐 UOL Notícias
                  </a>
                  <a
                    href="https://www.cnnbrasil.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    📺 CNN Brasil
                  </a>
                  <a
                    href="https://noticias.r7.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🔵 R7 Notícias
                  </a>
                  <a
                    href="https://g1.globo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    🇧🇷 G1 Brasil
                  </a>
                  <a
                    href="https://portalleodias.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    👑 Léo Dias (Fofocas)
                  </a>
                  <a
                    href="https://nacaojuridica.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    ⚖️ Nação Jurídica
                  </a>
                  <a
                    href="https://g1.globo.com/globonews/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    📺 GloboNews (24h)
                  </a>
                  <a
                    href="https://bandnewstv.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-lg text-[10.5px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    📺 BandNews (24h)
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col" id="workspace-container">
        <AnimatePresence mode="wait">
          {isLoading ? (
            
            /* Beautiful active loading stage */
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm my-auto min-h-[400px]"
              id="loading-stage-panel"
            >
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-orange-600 animate-spin" />
                <Sparkles className="h-6 w-6 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              
              <h3 className="text-lg font-black text-zinc-50 mb-1.5">Estruturando Seu Roteiro Viral</h3>
              <p className="text-sm text-zinc-300 font-medium max-w-md mx-auto h-8 animate-pulse text-orange-500">
                {loadingSteps[loadingStep]}
              </p>

              <div className="w-full max-w-xs bg-zinc-950 rounded-full h-1.5 mt-6 overflow-hidden">
                <motion.div 
                  className="bg-white h-full rounded-full"
                  animate={{ width: ["10%", "35%", "65%", "90%"] }}
                  transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

          ) : activeScript ? (
            
            /* Display Split Screen Result Dashboard */
            <motion.div
              key="result-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              id="active-script-dashboard"
            >
              {/* Left Column - Always show the structured script (7/12 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Stats Header Panel */}
                <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1.5">
                      {activeScript.meta.categoria || "Notícias"}
                    </span>
                    <h2 className="text-lg font-black text-zinc-550 leading-tight">
                      {activeScript.meta.titulo_principal}
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-medium mt-1">
                      Gerado em: {new Date(activeScript.timestamp).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Top indicators */}
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-xl text-center min-w-[85px]">
                      <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Duração</span>
                      <span className="text-sm font-extrabold text-zinc-200">{activeScript.meta.duracao_solicitada_min} min</span>
                    </div>
                    <div className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-xl text-center min-w-[85px]">
                      <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Palavras</span>
                      <span className="text-sm font-extrabold text-zinc-200">{activeScript.meta.contagem_palavras_real}</span>
                    </div>
                  </div>
                </div>

                {/* Script Viewer Content */}
                <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
                  <ScriptViewer 
                    blocks={activeScript.roteiro} 
                    onLaunchTeleprompter={() => setShowTeleprompter(true)}
                  />
                </div>
              </div>

              {/* Right Column - Tabs for Cenas/Prompts, Publicação & Redes, Apuração (5/12 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                
                {/* Tab selector bar */}
                <div className="flex border border-zinc-800 bg-zinc-900 p-1 rounded-xl gap-1" id="tab-nav-bar">
                  <button
                    id="tab-btn-imagens"
                    onClick={() => setActiveTab("imagens")}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "imagens"
                        ? "bg-zinc-850 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Cenas / Prompts</span>
                  </button>

                  <button
                    id="tab-btn-publicacao"
                    onClick={() => setActiveTab("publicacao")}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "publicacao"
                        ? "bg-zinc-850 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Publicação</span>
                  </button>

                  <button
                    id="tab-btn-apuracao"
                    onClick={() => setActiveTab("apuracao")}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "apuracao"
                        ? "bg-zinc-850 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Apuração</span>
                  </button>
                </div>

                {/* Tab content stage */}
                <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm min-h-[300px]" id="tab-content-container">
                  <AnimatePresence mode="wait">
                    {activeTab === "imagens" && (
                      <motion.div
                        key="tab-imagens"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <ImagePromptsViewer prompts={activeScript.prompts_imagem} />
                      </motion.div>
                    )}

                    {activeTab === "publicacao" && (
                      <motion.div
                        key="tab-publicacao"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-full flex flex-col justify-center"
                      >
                        {activeScript.metadata_publicacao ? (
                          <MetadataViewer metadata={activeScript.metadata_publicacao} />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
                            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-400">
                              <Share2 className="h-8 w-8 text-orange-500 animate-pulse" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-200">Metadados de Publicação</h3>
                            <p className="text-xs text-zinc-400 max-w-sm">
                              Gostou do roteiro gerado? Escolha para qual plataforma deseja gerar os metadados de publicação (SEO, copies e tags):
                            </p>
                            
                            <div className="flex flex-col gap-3 w-full max-w-sm mt-2">
                              {isGeneratingMetadata ? (
                                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                  <div className="h-7 w-7 border-2 border-zinc-750 border-t-orange-500 rounded-full animate-spin" />
                                  <span className="text-xs font-bold text-zinc-400 animate-pulse">Criando metadados de publicação...</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleGenerateMetadata("youtube")}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white shadow border border-red-500/30 bg-red-950/40 hover:bg-red-900/60 hover:text-red-300 transition-all cursor-pointer"
                                  >
                                    <Youtube className="h-4 w-4 text-red-500" />
                                    <span>Gerar Apenas para YouTube</span>
                                  </button>

                                  <button
                                    onClick={() => handleGenerateMetadata("reels")}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white shadow border border-pink-500/30 bg-pink-950/40 hover:bg-pink-900/60 hover:text-pink-300 transition-all cursor-pointer"
                                  >
                                    <Instagram className="h-4 w-4 text-pink-500" />
                                    <span>Gerar Apenas para Reels / TikTok</span>
                                  </button>

                                  <button
                                    onClick={() => handleGenerateMetadata("completo")}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white shadow border border-orange-500 bg-orange-650 hover:bg-orange-600 transition-all cursor-pointer"
                                  >
                                    <Sparkles className="h-4 w-4" />
                                    <span>Gerar Completo (Todas as Redes)</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "apuracao" && (
                      <motion.div
                        key="tab-apuracao"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <FactCheckViewer
                          confirmed={activeScript.fatos_apurados}
                          unconfirmed={activeScript.fatos_nao_confirmados}
                          sources={activeScript.fontes_utilizadas}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            
            /* Welcome default empty state */
            <motion.div
              key="welcome-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between max-w-4xl mx-auto w-full my-6"
              id="welcome-placeholder-panel"
            >
              <div>
                <div className="h-12 w-12 bg-indigo-950/40 border border-indigo-900 text-indigo-400 flex items-center justify-center rounded-2xl mb-6">
                  <Tv className="h-6 w-6" />
                </div>
                
                <h2 className="text-xl font-black text-zinc-50 tracking-tight">Crie Conteúdos Virais que Prendem no Sofá</h2>
                <p className="text-sm text-zinc-400 mt-1 max-w-xl font-medium">
                  Preparamos um motor especializado para converter notícias secas, links ou temas de nicho em narrativas dramáticas estruturadas para prender retenção orgânica.
                </p>

                {/* Structure explanations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8" id="workflow-cards-grid">
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-950 text-[10px] font-bold text-rose-450 uppercase border border-rose-900/50">
                        Hk
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200">Gancho de Mistério (Hook)</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Inicia com uma afirmação dramática ou pergunta intrigante. Retém o clímax informativo para manter os olhos presos nos primeiros segundos cruciais.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-950 text-[10px] font-bold text-amber-450 uppercase border border-amber-900/50">
                        Rv
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200">Revelação no Final (Climax)</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      O fechamento entrega a revelação principal no momento perfeito perto do fim do vídeo, entregando o valor real da narrativa.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4.5 w-4.5 text-blue-400" />
                      <h4 className="text-xs font-bold text-zinc-200">Segurança Factual</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Busca dados, notícias recentes e informações corretas em tempo real na web para compor o roteiro com segurança factual.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4.5 w-4.5 text-emerald-400" />
                      <h4 className="text-xs font-bold text-zinc-200">Cenas Cinematográficas</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Gera detalhadamente prompts em inglês prontos para criar as mídias visuais ilustrativas do vídeo faceless.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-zinc-500" />
                  <span>Controle de ritmo: ~155 palavras por minuto.</span>
                </div>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white rounded-lg transition-all"
                >
                  Abrir Painel de Criação
                </button>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </main>

      {/* Teleprompter Overlay Modal */}
      <AnimatePresence>
        {showTeleprompter && activeScript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Teleprompter
              title={activeScript.meta.titulo_principal}
              blocks={activeScript.roteiro}
              onClose={() => setShowTeleprompter(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer bar */}
      <footer className="border-t border-zinc-850 bg-zinc-900 py-6 px-6 text-center text-xs text-zinc-400 mt-auto" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Roteirizador Faceless • Projetado com foco em retenção orgânica de canais multiplataforma.</p>
          <p className="font-semibold text-zinc-300">Alvo: 155 Palavras/Minuto • Estrutura Hook & Reveal</p>
        </div>
      </footer>

    </div>
  );
}
