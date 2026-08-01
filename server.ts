import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// JSON Schema for response
const scriptResponseSchema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        titulo_principal: { type: Type.STRING },
        categoria: { type: Type.STRING },
        duracao_solicitada_min: { type: Type.INTEGER },
        contagem_palavras_alvo: { type: Type.INTEGER },
        contagem_palavras_real: { type: Type.INTEGER },
        idioma: { type: Type.STRING },
      },
      required: ["titulo_principal", "categoria", "duracao_solicitada_min", "contagem_palavras_alvo", "contagem_palavras_real", "idioma"]
    },
    roteiro: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          bloco: { type: Type.STRING }, // 'gancho' | 'contexto' | 'desenvolvimento' | 'revelacao' | 'fechamento'
          tempo_inicio_seg: { type: Type.INTEGER },
          tempo_fim_seg: { type: Type.INTEGER },
          texto_narracao: { type: Type.STRING }
        },
        required: ["bloco", "tempo_inicio_seg", "tempo_fim_seg", "texto_narracao"]
      }
    },
    fatos_apurados: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    fatos_nao_confirmados: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    fontes_utilizadas: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    prompts_imagem: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          momento_do_video: { type: Type.STRING },
          prompt: { type: Type.STRING }
        },
        required: ["momento_do_video", "prompt"]
      }
    },
    metadata_publicacao: {
      type: Type.OBJECT,
      properties: {
        titulos_sugeridos_youtube: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        descricao_youtube: { type: Type.STRING },
        legenda_instagram_tiktok: { type: Type.STRING },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["titulos_sugeridos_youtube", "descricao_youtube", "legenda_instagram_tiktok", "hashtags"]
    }
  },
  required: ["meta", "roteiro", "fatos_apurados", "fatos_nao_confirmados", "fontes_utilizadas", "prompts_imagem", "metadata_publicacao"]
};

app.post("/api/generate-script", async (req, res) => {
  try {
    const { input, duration, generatePrompts, apiKey, style, energy } = req.body;

    if (!input || typeof input !== "string" || input.trim() === "") {
      res.status(400).json({ error: "O campo de entrada (link, tema ou texto) é obrigatório." });
      return;
    }

    // Determine Gemini API Client to use
    let clientToUse = ai;
    const userApiKey = apiKey && typeof apiKey === "string" ? apiKey.trim() : "";
    if (userApiKey) {
      clientToUse = new GoogleGenAI({
        apiKey: userApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else if (!process.env.GEMINI_API_KEY) {
      res.status(400).json({
        error: "Chave de API do Gemini não configurada no servidor. Por favor, insira sua chave pessoal no painel lateral do aplicativo."
      });
      return;
    }

    const durationMin = Math.max(1, Math.min(20, Number(duration) || 3));
    const targetWordCount = durationMin * 155;

    const systemInstruction = `Você é o motor de roteirização de um canal de notícias faceless multiplataforma (YouTube, Facebook, Instagram, TikTok). Sua função é transformar um link, um texto ou uma informação/tema livre em um roteiro de vídeo narrado em PORTUGUÊS DO BRASIL, pronto para gravação, seguindo uma estrutura fixa de "gancho de mistério + revelação no final".

DIRETRIZES DE ESTILO E ENERGIA (MUITO IMPORTANTE):
- Estilo do Tema/Conteúdo: ${style || "noticias_faceless"}. Adapte o vocabulário, o tom e a profundidade do conteúdo para este nicho específico.
- Energia do Roteiro: ${energy || "forte"}. Este é o ritmo da narração. Se for "agressivo", use frases curtas e impacto. Se for "misterioso", use pausas dramáticas implícitas e suspense. Se for "calmo", use um tom mais explicativo e sereno.

INSTRUÇÕES DE PESQUISA E APURAÇÃO:
- Utilize a pesquisa integrada para buscar mais contexto, atualizações e detalhes sobre o tema.
- Confirme datas, nomes, números e declarações (não invente dados não confirmados).
- Busque reações, desdobramentos ou contexto histórico relevante que enriqueça a narrativa, especialmente para roteiros mais longos (8+ min).
- Se for um tema em tempo real (algo acontecendo agora), priorize as informações mais recentes encontradas.
- Se a busca não trouxer confirmação suficiente sobre algum ponto, coloque esse ponto como não confirmado no campo 'fatos_nao_confirmados', ao invés de apresentar como fato certo no roteiro.
- Você pode dramatizar a FORMA (ordem, suspense, tom), mas NUNCA o conteúdo factual.

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
1. Gancho (~8-12% do tempo total): abre com uma pergunta, fato intrigante ou cena de curiosidade, SEM entregar o desfecho. O espectador precisa querer saber o final. Ex: "o que aconteceu depois surpreendeu até os especialistas", "ninguém esperava o que veio a seguir", ancorado na realidade.
2. Contexto (~15-20%): situa quem, onde, quando, por que importa, segurando a revelação central.
3. Desenvolvimento (a maior parte do vídeo): constrói com detalhes, personagens, números, cronologia, múltiplos ângulos. Se for longo (8+ min), aprofunde em antecedentes, consequências, etc.
4. Revelação/virada: perto do final. Clímax informativo. O porquê do gancho.
5. Fechamento (~5-8%): conclusão curta, reflexão, chamada para ação (comentar, curtir, seguir). Sem fatos novos.

CÁLCULO DE PALAVRAS:
- Ritmo natural: ~155 palavras por minuto.
- Duração solicitada: ${durationMin} minutos.
- Alvo de palavras total: ${targetWordCount} palavras (tolerância de ±10%).
- Você deve preencher o campo 'contagem_palavras_real' com a contagem total real das palavras do seu campo 'texto_narracao' somados em todos os blocos.
- Distribua esse total proporcionalmente entre os blocos (Gancho ~10%, Contexto ~18%, Desenvolvimento ~60%, Revelação ~7%, Fechamento ~5%).

TOM E ESTILO:
- Português do Brasil, coloquial-jornalístico (sério para credibilidade, dinâmico para prender atenção).
- Frases curtas e diretas, estruturadas para leitura em voz alta.
- Sem jargões técnicos não explicados. Sem enrolação.

PROMPTS DE IMAGEM:
- Se 'generatePrompts' for falso, retorne a lista 'prompts_imagem' como vazia.
- Se 'generatePrompts' for verdadeiro, gere aproximadamente 1 prompt a cada 15-20 segundos de vídeo.
- Descreva os prompts EM INGLÊS. Formato cinematográfico: sujeito, ação, ambiente, ângulo, luz, atmosfera, estilo (ex: photorealistic, documentary style, cinematic lighting, dramatic mood).
- Mantenha consistência de personagens e estilo em todos os prompts.
- Indique no campo 'momento_do_video' o trecho correspondente.`;

    const userPrompt = `Crie o roteiro completo com base no seguinte input do usuário:
Tema/Notícia/Link: "${input}"
Duração solicitada: ${durationMin} minutos (alvo de aproximadamente ${targetWordCount} palavras).
Gerar prompts de imagem: ${generatePrompts ? "Sim" : "Não"}.`;

    const response = await clientToUse.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: scriptResponseSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("O modelo não retornou nenhum texto.");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("Erro ao analisar o JSON retornado pelo modelo:", responseText);
      throw new Error("Erro de formatação na resposta do modelo.");
    }

    // Capture grounding URLs to complement sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks
      .map((c: any) => c.web?.uri)
      .filter(Boolean) as string[];

    if (searchSources.length > 0) {
      const existingSources = new Set(parsedData.fontes_utilizadas || []);
      searchSources.forEach(src => existingSources.add(src));
      parsedData.fontes_utilizadas = Array.from(existingSources);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Erro ao processar roteiro:", error);
    res.status(500).json({ error: error.message || "Ocorreu um erro interno no servidor." });
  }
});

// Setup Vite Dev Server / Static files middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
