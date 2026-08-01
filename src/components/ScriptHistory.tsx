import React from "react";
import { GeneratedScript } from "../types";
import { History, Calendar, Clock, Trash2 } from "lucide-react";

interface ScriptHistoryProps {
  history: GeneratedScript[];
  onSelect: (script: GeneratedScript) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  activeId?: string;
}

export default function ScriptHistory({ history, onSelect, onDelete, activeId }: ScriptHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl" id="empty-history-placeholder">
        <History className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-zinc-400">Nenhum roteiro salvo</p>
        <p className="text-[11px] text-zinc-550 mt-0.5">Seus roteiros gerados aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" id="history-list-container">
      {history.map((script) => {
        const date = new Date(script.timestamp);
        const formattedDate = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });

        return (
          <div
            key={script.id}
            id={`history-item-${script.id}`}
            onClick={() => onSelect(script)}
            className={`group relative flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              activeId === script.id
                ? "border-zinc-700 bg-zinc-800"
                : "border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900"
            }`}
          >
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-xs font-bold text-zinc-200 truncate mb-1">
                {script.meta.titulo_principal}
              </h4>
              <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {script.meta.duracao_solicitada_min} min
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-300 truncate font-medium border border-zinc-700">
                  {script.meta.categoria || "Notícia"}
                </span>
              </div>
            </div>

            <button
              id={`delete-history-btn-${script.id}`}
              onClick={(e) => onDelete(script.id, e)}
              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-850 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
              title="Excluir roteiro"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
