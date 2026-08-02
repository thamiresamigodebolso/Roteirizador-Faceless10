export interface ScriptBlock {
  bloco: "gancho" | "contexto" | "desenvolvimento" | "revelacao" | "fechamento";
  tempo_inicio_seg: number;
  tempo_fim_seg: number;
  texto_narracao: string;
}

export interface ImagePrompt {
  momento_do_video: string;
  prompt: string;
}

export interface PublicationMetadata {
  titulos_sugeridos_youtube: string[];
  descricao_youtube: string;
  legenda_instagram_tiktok: string;
  hashtags: string[];
  tags_youtube?: string[];
  prompt_thumbnail?: string;
}

export interface ScriptMeta {
  titulo_principal: string;
  categoria: string;
  duracao_solicitada_min: number;
  contagem_palavras_alvo: number;
  contagem_palavras_real: number;
  idioma: string;
}

export interface GeneratedScript {
  id: string; // generated locally for history
  timestamp: string; // date of generation
  meta: ScriptMeta;
  roteiro: ScriptBlock[];
  fatos_apurados: string[];
  fatos_nao_confirmados: string[];
  fontes_utilizadas: string[];
  prompts_imagem: ImagePrompt[];
  metadata_publicacao: PublicationMetadata;
}
