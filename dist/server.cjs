var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT || 3e3;
console.log(`[Server] Configurando rotas... PORT=${PORT}`);
app.use(import_express.default.json());
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: process.env.NODE_ENV,
    hasGeminiKey: !!process.env.GEMINI_API_KEY
  });
});
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var scriptResponseSchema = {
  type: import_genai.Type.OBJECT,
  properties: {
    meta: {
      type: import_genai.Type.OBJECT,
      properties: {
        titulo_principal: { type: import_genai.Type.STRING },
        categoria: { type: import_genai.Type.STRING },
        duracao_solicitada_min: { type: import_genai.Type.INTEGER },
        contagem_palavras_alvo: { type: import_genai.Type.INTEGER },
        contagem_palavras_real: { type: import_genai.Type.INTEGER },
        idioma: { type: import_genai.Type.STRING }
      },
      required: ["titulo_principal", "categoria", "duracao_solicitada_min", "contagem_palavras_alvo", "contagem_palavras_real", "idioma"]
    },
    roteiro: {
      type: import_genai.Type.ARRAY,
      items: {
        type: import_genai.Type.OBJECT,
        properties: {
          bloco: { type: import_genai.Type.STRING },
          // 'gancho' | 'contexto' | 'desenvolvimento' | 'revelacao' | 'fechamento'
          tempo_inicio_seg: { type: import_genai.Type.INTEGER },
          tempo_fim_seg: { type: import_genai.Type.INTEGER },
          texto_narracao: { type: import_genai.Type.STRING }
        },
        required: ["bloco", "tempo_inicio_seg", "tempo_fim_seg", "texto_narracao"]
      }
    },
    fatos_apurados: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    fatos_nao_confirmados: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    fontes_utilizadas: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    prompts_imagem: {
      type: import_genai.Type.ARRAY,
      items: {
        type: import_genai.Type.OBJECT,
        properties: {
          momento_do_video: { type: import_genai.Type.STRING },
          prompt: { type: import_genai.Type.STRING }
        },
        required: ["momento_do_video", "prompt"]
      }
    }
  },
  required: ["meta", "roteiro", "fatos_apurados", "fatos_nao_confirmados", "fontes_utilizadas", "prompts_imagem"]
};
var metadataResponseSchema = {
  type: import_genai.Type.OBJECT,
  properties: {
    titulos_sugeridos_youtube: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    descricao_youtube: { type: import_genai.Type.STRING },
    legenda_instagram_tiktok: { type: import_genai.Type.STRING },
    hashtags: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    tags_youtube: {
      type: import_genai.Type.ARRAY,
      items: { type: import_genai.Type.STRING }
    },
    prompt_thumbnail: { type: import_genai.Type.STRING }
  },
  required: ["titulos_sugeridos_youtube", "descricao_youtube", "legenda_instagram_tiktok", "hashtags", "tags_youtube", "prompt_thumbnail"]
};
app.post("/api/generate-script", async (req, res) => {
  try {
    const { input, duration, generatePrompts, apiKey, style, energy } = req.body;
    if (!input || typeof input !== "string" || input.trim() === "") {
      res.status(400).json({ error: "O campo de entrada (link, tema ou texto) \xE9 obrigat\xF3rio." });
      return;
    }
    let clientToUse = ai;
    const userApiKey = apiKey && typeof apiKey === "string" ? apiKey.trim() : "";
    if (userApiKey) {
      clientToUse = new import_genai.GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } else if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        error: "Chave de API do Gemini n\xE3o configurada no servidor. Por favor, insira sua chave pessoal no painel lateral do aplicativo."
      });
      return;
    }
    const durationMin = Math.max(1, Math.min(20, Number(duration) || 3));
    const targetWordCount = durationMin * 155;
    const currentDateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" });
    const systemInstruction = `Voc\xEA \xE9 o motor de roteiriza\xE7\xE3o de um canal de not\xEDcias faceless multiplataforma (YouTube, Facebook, Instagram, TikTok). Sua fun\xE7\xE3o \xE9 transformar um link, um texto ou uma informa\xE7\xE3o/tema livre em um roteiro de v\xEDdeo narrado em PORTUGU\xCAS DO BRASIL, pronto para grava\xE7\xE3o, seguindo uma estrutura fixa de "gancho de mist\xE9rio + revela\xE7\xE3o no final".

DIRETRIZES DE DATA E \xC2NCORA TEMPORAL (CR\xCDTICO):
- A DATA ATUAL HOJE \xC9: ${currentDateStr} (ano de 2026). Use este ano de 2026 como refer\xEAncia temporal do presente. Not\xEDcias que acabaram de acontecer s\xE3o de 2026, n\xE3o de anos anteriores como 2024. Nunca confunda a data das not\xEDcias recentes.

DIRETRIZES DE ESTILO E ENERGIA (MUITO IMPORTANTE):
- Estilo do Tema/Conte\xFAdo: ${style || "noticias_faceless"}. Adapte o vocabul\xE1rio, o tom e a profundidade do conte\xFAdo para este nicho espec\xEDfico.
- Energia do Roteiro: ${energy || "forte"}. Este \xE9 o ritmo da narra\xE7\xE3o. Se for "agressivo", use frases curtas e impacto. Se for "misterioso", use pausas dram\xE1ticas impl\xEDcitas e suspense. Se for "calmo", use um tom mais explicativo e sereno.

INSTRU\xC7\xD5ES DE PESQUISA E APURA\xC7\xC3O:
- Utilize o contexto e a busca para validar datas, nomes, n\xFAmeros e declara\xE7\xF5es.
- NUNCA invente declara\xE7\xF5es, depoimentos em aspas ou falas de figuras p\xFAblicas (como o Presidente Lula) que n\xE3o estejam documentadas de forma verific\xE1vel nas fontes reais. N\xE3o crie falsas cita\xE7\xF5es de podcasts ou pronunciamentos.
- Se precisar citar valores espec\xEDficos (multas, quantias de dinheiro, estat\xEDsticas exatas) e a fonte de entrada n\xE3o deixar o n\xFAmero claro e confirmado, N\xC3O chute nem invente um valor. Use termos seguros como "uma multa financeira", "uma penalidade definida por lei" ou simplesmente mencione que o valor foi estabelecido pela Justi\xE7a. A precis\xE3o dos n\xFAmeros \xE9 de extrema import\xE2ncia para a credibilidade do canal.
- Busque rea\xE7\xF5es, desdobramentos ou contexto hist\xF3rico relevante que enrique\xE7a a narrativa, especialmente para roteiros mais longos (8+ min).
- Se for um tema em tempo real (algo acontecendo agora), priorize as informa\xE7\xF5es mais recentes encontradas.
- Se a busca n\xE3o trouxer confirma\xE7\xE3o suficiente sobre algum ponto, coloque esse ponto como n\xE3o confirmado no campo 'fatos_nao_confirmados', ao inv\xE9s de apresentar como fato certo no roteiro.
- Voc\xEA pode dramatizar a FORMA (ordem, suspense, tom), mas NUNCA o conte\xFAdo factual.

ESTRUTURA OBRIGAT\xD3RIA DO ROTEIRO:
1. Gancho (~8-12% do tempo total): abre com uma pergunta, fato intrigante ou cena de curiosidade, SEM entregar o desfecho. O espectador precisa querer saber o final. Ex: "o que aconteceu depois surpreendeu at\xE9 os especialistas", "ningu\xE9m esperava o que veio a seguir", ancorado na realidade.
2. Contexto (~15-20%): situa quem, onde, quando, por que importa, segurando a revela\xE7\xE3o central.
3. Desenvolvimento (a maior parte do v\xEDdeo): constr\xF3i com detalhes, personagens, n\xFAmeros, cronologia, m\xFAltiplos \xE2ngulos. Se for longo (8+ min), aprofunde em antecedentes, consequ\xEAncias, etc.
4. Revela\xE7\xE3o/virada: perto do final. Cl\xEDmax informativo. O porqu\xEA do gancho.
5. Fechamento (~5-8%): conclus\xE3o curta, reflex\xE3o e uma chamada para a\xE7\xE3o (CTA) obrigat\xF3ria e natural pedindo para seguir e compartilhar. O texto DEVE conter uma varia\xE7\xE3o natural e envolvente da seguinte ideia: "Fique ligado para as pr\xF3ximas not\xEDcias. Siga o canal e compartilhe este v\xEDdeo. N\xF3s estamos sempre apurando os fatos para trazer as informa\xE7\xF5es em primeira m\xE3o no momento em que acontecem." Sem apresentar fatos novos nesse bloco.

C\xC1LCULO DE PALAVRAS:
- Ritmo natural: ~155 palavras por minuto.
- Dura\xE7\xE3o solicitada: ${durationMin} minutos.
- Alvo de palavras total: ${targetWordCount} palavras (toler\xE2ncia de \xB110%).
- Voc\xEA deve preencher o campo 'contagem_palavras_real' com a contagem total real das palavras do seu campo 'texto_narracao' somados em todos os blocos.
- Distribua esse total proporcionalmente entre os blocos (Gancho ~10%, Contexto ~18%, Desenvolvimento ~60%, Revela\xE7\xE3o ~7%, Fechamento ~5%).

TOM E ESTILO:
- Portugu\xEAs do Brasil, coloquial-jornal\xEDstico (s\xE9rio para credibilidade, din\xE2mico para prender aten\xE7\xE3o).
- Frases curtas e diretas, estruturadas para leitura em voz alta.
- Sem jarg\xF5es t\xE9cnicos n\xE3o explicados. Sem enrola\xE7\xE3o.

PROMPTS DE IMAGEM:
- Se 'generatePrompts' for falso, retorne a lista 'prompts_imagem' como vazia.
- Se 'generatePrompts' for verdadeiro, gere aproximadamente 1 prompt a cada 15-20 segundos de v\xEDdeo.
- Descreva os prompts EM INGL\xCAS. Formato cinematogr\xE1fico: sujeito, a\xE7\xE3o, ambiente, \xE2ngulo, luz, atmosfera, estilo (ex: photorealistic, documentary style, cinematic lighting, dramatic mood).
- Mantenha consist\xEAncia de personagens e estilo em todos os prompts.
- Indique no campo 'momento_do_video' o trecho correspondente.`;
    const userPrompt = `Crie o roteiro completo com base no seguinte input do usu\xE1rio:
Tema/Not\xEDcia/Link: "${input}"
Dura\xE7\xE3o solicitada: ${durationMin} minutos (alvo de aproximadamente ${targetWordCount} palavras).
Gerar prompts de imagem: ${generatePrompts ? "Sim" : "N\xE3o"}.`;
    const response = await clientToUse.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: scriptResponseSchema,
        temperature: 0.7
      }
    });
    const responseText = response.text;
    if (!responseText) {
      throw new Error("O modelo n\xE3o retornou nenhum texto.");
    }
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("Erro ao analisar o JSON retornado pelo modelo:", responseText);
      throw new Error("Erro de formata\xE7\xE3o na resposta do modelo.");
    }
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks.map((c) => c.web?.uri).filter(Boolean);
    if (searchSources.length > 0) {
      const existingSources = new Set(parsedData.fontes_utilizadas || []);
      searchSources.forEach((src) => existingSources.add(src));
      parsedData.fontes_utilizadas = Array.from(existingSources);
    }
    res.json(parsedData);
  } catch (error) {
    console.error("Erro ao processar roteiro:", error);
    res.status(500).json({ error: error.message || "Ocorreu um erro interno no servidor." });
  }
});
app.post("/api/generate-metadata", async (req, res) => {
  try {
    const { scriptText, apiKey } = req.body;
    if (!scriptText || typeof scriptText !== "string" || scriptText.trim() === "") {
      res.status(400).json({ error: "O texto do roteiro \xE9 obrigat\xF3rio para gerar os metadados." });
      return;
    }
    let clientToUse = ai;
    const userApiKey = apiKey && typeof apiKey === "string" ? apiKey.trim() : "";
    if (userApiKey) {
      clientToUse = new import_genai.GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } else if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        error: "Chave de API do Gemini n\xE3o configurada no servidor. Por favor, insira sua chave pessoal no painel lateral do aplicativo."
      });
      return;
    }
    const currentDateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" });
    const systemInstruction = `Voc\xEA \xE9 um especialista em SEO e Marketing para YouTube, Instagram, TikTok e Facebook. Sua fun\xE7\xE3o \xE9 analisar o ROTEIRO de v\xEDdeo fornecido e gerar metadados otimizados para publica\xE7\xE3o.
    
    DIRETRIZES DE DATA E \xC2NCORA TEMPORAL (CR\xCDTICO):
    - A DATA ATUAL HOJE \xC9: ${currentDateStr} (ano de 2026). Use este ano de 2026 como refer\xEAncia temporal do presente. Not\xEDcias que acabaram de acontecer s\xE3o de 2026, n\xE3o de anos anteriores como 2024. Nunca confunda a data das not\xEDcias recentes. NUNCA invente declara\xE7\xF5es, depoimentos ou cita\xE7\xF5es que n\xE3o estejam documentadas.
    
    Voc\xEA DEVE preencher os seguintes campos seguindo as diretrizes:
    1. 'titulos_sugeridos_youtube': Uma lista com 3 a 5 t\xEDtulos altamente persuasivos (clickbait de curiosidade baseados no mist\xE9rio/gancho do roteiro).
    2. 'descricao_youtube': Uma descri\xE7\xE3o de 2 a 3 par\xE1grafos rica em palavras-chave sobre o tema do v\xEDdeo, acompanhada de cap\xEDtulos/timestamps sugeridos se achar pertinente.
    3. 'legenda_instagram_tiktok': Uma legenda curta, envolvente e chamativa para redes de v\xEDdeo r\xE1pido.
    4. 'hashtags': Uma lista de 5 a 8 hashtags relevantes em formato de string (sem o s\xEDmbolo # no in\xEDcio, apenas a palavra).
    5. 'tags_youtube': Uma lista de 10 a 15 palavras-chave relevantes para SEO no YouTube.
    6. 'prompt_thumbnail': Um prompt de gera\xE7\xE3o de imagem detalhado em ingl\xEAs focado em criar uma miniatura altamente clic\xE1vel e chamativa (clickbait style, high contrast, dramatic details, expressive characters, text space) para Midjourney ou Leonardo AI.`;
    const userPrompt = `Gere os metadados de publica\xE7\xE3o para o seguinte roteiro de v\xEDdeo:
    "${scriptText}"`;
    const response = await clientToUse.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: metadataResponseSchema,
        temperature: 0.7
      }
    });
    const responseText = response.text;
    if (!responseText) {
      throw new Error("O modelo n\xE3o retornou nenhum texto.");
    }
    const parsedData = JSON.parse(responseText.trim());
    res.json(parsedData);
  } catch (error) {
    console.error("Erro ao processar metadados:", error);
    res.status(500).json({ error: error.message || "Ocorreu um erro interno no servidor." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const listenPort = isNaN(Number(PORT)) ? PORT : Number(PORT);
  app.listen(listenPort, () => {
    console.log(`Server running on port ${listenPort}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
