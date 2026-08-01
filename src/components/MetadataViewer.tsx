import { useState } from "react";
import { PublicationMetadata } from "../types";
import { Copy, Check, Youtube, Instagram, Tag } from "lucide-react";

interface MetadataViewerProps {
  metadata: PublicationMetadata;
}

export default function MetadataViewer({ metadata }: MetadataViewerProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyHashtags = () => {
    const text = metadata.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    copyToClipboard(text, "hashtags");
  };

  return (
    <div className="space-y-6" id="metadata-publication-viewer">
      
      {/* Sugestões de Título */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
          <Youtube className="h-4.5 w-4.5 text-red-400" />
          Títulos Sugeridos para Alta Conversão (YouTube/Facebook)
        </h3>
        <div className="space-y-2.5">
          {metadata.titulos_sugeridos_youtube.map((title, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-sm text-zinc-100 group"
              id={`suggested-title-${idx}`}
            >
              <span className="font-semibold select-all pr-4">{title}</span>
              <button
                id={`copy-title-btn-${idx}`}
                onClick={() => copyToClipboard(title, `title-${idx}`)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer flex-shrink-0"
                title="Copiar título"
              >
                {copiedSection === `title-${idx}` ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Descrição do Vídeo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Youtube className="h-4.5 w-4.5 text-red-400" />
            Descrição Otimizada do Vídeo (SEO)
          </h3>
          <button
            id="copy-description-btn"
            onClick={() => copyToClipboard(metadata.descricao_youtube, "description")}
            className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 py-1 px-2 rounded-lg hover:bg-zinc-850 transition-all cursor-pointer"
          >
            {copiedSection === "description" ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Descrição</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto leading-relaxed">
          {metadata.descricao_youtube}
        </div>
      </div>

      {/* Legenda Curta */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Instagram className="h-4.5 w-4.5 text-pink-400" />
            Legenda para Reels, Shorts & TikTok
          </h3>
          <button
            id="copy-short-caption-btn"
            onClick={() => copyToClipboard(metadata.legenda_instagram_tiktok, "short")}
            className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 py-1 px-2 rounded-lg hover:bg-zinc-850 transition-all cursor-pointer"
          >
            {copiedSection === "short" ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Legenda</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-[120px] overflow-y-auto leading-relaxed">
          {metadata.legenda_instagram_tiktok}
        </div>
      </div>

      {/* Hashtags Recomendadas */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Tag className="h-4.5 w-4.5 text-zinc-500" />
            Hashtags Recomendadas
          </h3>
          <button
            id="copy-hashtags-btn"
            onClick={copyHashtags}
            className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 py-1 px-2 rounded-lg hover:bg-zinc-850 transition-all cursor-pointer"
          >
            {copiedSection === "hashtags" ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 font-bold">Copiadas!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Todas</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {metadata.hashtags.map((tag, idx) => {
            const displayTag = tag.startsWith("#") ? tag : `#${tag}`;
            return (
              <span
                key={idx}
                id={`hashtag-item-${idx}`}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-all select-all"
              >
                {displayTag}
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );
}
