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
  EyeOff
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
  const [activeTab, setActiveTab] = useState<"roteiro" | "imagens" | "publicacao" | "apuracao">("roteiro");
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  
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

  // Rotating loading messages to keep user relaxed and entertained during deep grounding search and script compilation
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
      setActiveTab("roteiro");
    } catch (err: any) {
      alert(`Erro de Geração: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
    if (activeScript?.id === id) {
      setActiveScript(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSelectHistory = (script: GeneratedScript) => {
    setActiveScript(script);
    setActiveTab("roteiro");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col" id="faceless-main-app">
      
      {/* Header Bar */}
      <header className="border-b border-zinc-850 bg-zinc-900 sticky top-0 z-10 px-6 py-4" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
              <p className="text-xs text-zinc-400 font-medium">Motor de Roteirização de Notícias e Mistérios com Ganchos de Alta Conversão</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-zinc-400 font-medium hidden md:block">
              Para canais no YouTube, Facebook, Reels & TikTok
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8" id="workspace-grid">
        
        {/* Left Column (Inputs and History) */}
        <section className="lg:col-span-4 space-y-8" id="left-sidebar-controls">
          
          {/* Gemini API Key Configuration block */}
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-orange-500" />
                Chave API do Gemini
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold border border-zinc-700">
                Opcional
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Insira sua chave pessoal do Gemini se quiser usar seus próprios créditos ou se a chave padrão falhar.
            </p>
            <div className="relative rounded-xl shadow-sm">
              <input
                type={showApiKey ? "text" : "password"}
                placeholder="Cole sua AIzaSy... aqui"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {apiKey ? (
              <p className="text-[11px] text-orange-500 font-medium flex items-center gap-1">
                ✓ Usando sua chave API pessoal.
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 italic">
                Deixando em branco, o app usa a chave padrão do servidor.
              </p>
            )}
          </div>
          
          {/* Main generator block */}
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-zinc-450" />
              Configurar Criação
            </h2>
            <ScriptForm onSubmit={handleGenerateScript} isLoading={isLoading} />
          </div>

          {/* History collection list */}
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-zinc-450" />
              Seus Roteiros Salvos ({history.length})
            </h3>
            <ScriptHistory
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              activeId={activeScript?.id}
            />
          </div>

        </section>

        {/* Right Column (Results & Dynamic Dashboard) */}
        <section className="lg:col-span-8 flex flex-col min-h-[500px]" id="right-workspace-panel">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              
              /* Beautiful active loading stage */
              <motion.div
                key="loading-stage"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm"
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
                
                <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed max-w-sm">
                  Utilizamos pesquisa de ponta baseada em inteligência factual para garantir que os dados de notícias, datas e links sejam 100% corretos.
                </p>
              </motion.div>

            ) : activeScript ? (
              
              /* Display Generated Script Dashboard */
              <motion.div
                key="result-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col space-y-6"
                id="active-script-dashboard"
              >
                {/* Stats Header Panel */}
                <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1.5">
                      {activeScript.meta.categoria || "Notícias"}
                    </span>
                    <h2 className="text-xl font-black text-zinc-50 leading-tight">
                      {activeScript.meta.titulo_principal}
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium mt-1">
                      Gerado em: {new Date(activeScript.timestamp).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • Idioma: {activeScript.meta.idioma}
                    </p>
                  </div>

                  {/* Top indicators */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 border-t pt-4 md:border-t-0 md:pt-0 border-zinc-800">
                    <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-center min-w-[100px]">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Duração</span>
                      <span className="text-base font-extrabold text-zinc-200">{activeScript.meta.duracao_solicitada_min} min</span>
                    </div>
                    <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-center min-w-[100px]">
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Palavras</span>
                      <span className="text-base font-extrabold text-zinc-200">{activeScript.meta.contagem_palavras_real}</span>
                    </div>
                  </div>
                </div>

                {/* Tab selector bar */}
                <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-1.5 rounded-xl gap-1" id="tab-nav-bar">
                  <button
                    id="tab-btn-roteiro"
                    onClick={() => setActiveTab("roteiro")}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "roteiro"
                        ? "bg-zinc-800 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-450 hover:text-zinc-100"
                    }`}
                  >
                    <Tv className="h-4 w-4" />
                    <span>Roteiro de Voz</span>
                  </button>

                  <button
                    id="tab-btn-imagens"
                    onClick={() => setActiveTab("imagens")}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "imagens"
                        ? "bg-zinc-800 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-450 hover:text-zinc-100"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Prompts de Imagem</span>
                  </button>

                  <button
                    id="tab-btn-publicacao"
                    onClick={() => setActiveTab("publicacao")}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "publicacao"
                        ? "bg-zinc-800 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-450 hover:text-zinc-100"
                    }`}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Publicação & Redes</span>
                  </button>

                  <button
                    id="tab-btn-apuracao"
                    onClick={() => setActiveTab("apuracao")}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "apuracao"
                        ? "bg-zinc-800 text-orange-500 shadow-sm border border-orange-900/40"
                        : "text-zinc-450 hover:text-zinc-100"
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Checagem Factual</span>
                  </button>
                </div>

                {/* Tab content stage */}
                <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm min-h-[300px]" id="tab-content-container">
                  <AnimatePresence mode="wait">
                    {activeTab === "roteiro" && (
                      <motion.div
                        key="tab-roteiro"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <ScriptViewer 
                          blocks={activeScript.roteiro} 
                          onLaunchTeleprompter={() => setShowTeleprompter(true)}
                        />
                      </motion.div>
                    )}

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
                      >
                        <MetadataViewer metadata={activeScript.metadata_publicacao} />
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
              </motion.div>
            ) : (
              
              /* Beautiful welcome default empty state with detailed workflow guidelines */
              <motion.div
                key="welcome-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between"
                id="welcome-placeholder-panel"
              >
                <div>
                  <div className="h-12 w-12 bg-indigo-950/40 border border-indigo-900 text-indigo-400 flex items-center justify-center rounded-2xl mb-6">
                    <Tv className="h-6 w-6" />
                  </div>
                  
                  <h2 className="text-xl font-black text-zinc-50 tracking-tight">Crie Conteúdos Virais que Prendem no Sofá</h2>
                  <p className="text-sm text-zinc-450 mt-1 max-w-xl font-medium">
                    Preparamos um motor especializado para converter notícias secas, links ou temas de nicho em narrativas dramáticas estruturadas para prender retenção orgânica.
                  </p>

                  {/* Structure explanations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8" id="workflow-cards-grid">
                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-950 text-[10px] font-bold text-rose-400 uppercase border border-rose-900/50">
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
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-950 text-[10px] font-bold text-amber-400 uppercase border border-amber-900/50">
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
                        <h4 className="text-xs font-bold text-zinc-200">Apuração de Grounding</h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Se o tema for de última hora ou baseado em fatos históricos, nosso motor executa buscas integradas em tempo real na web para ratificar dados.
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
                  <div>
                    <span>Insira um tema à esquerda para começar.</span>
                  </div>
                </div>
              </motion.div>

            )}
          </AnimatePresence>

        </section>

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
      <footer className="border-t border-zinc-850 bg-zinc-900 py-6 px-6 text-center text-xs text-zinc-400" id="main-footer">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Roteirizador Faceless • Projetado com foco em retenção orgânica de canais multiplataforma.</p>
          <p className="font-semibold text-zinc-300">Alvo: 155 Palavras/Minuto • Estrutura Hook & Reveal</p>
        </div>
      </footer>

    </div>
  );
}
