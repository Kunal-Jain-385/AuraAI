import React, { useState } from 'react';
import { Cpu, Zap, Info, Download, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { AVAILABLE_MODELS } from '../lib/llm';
import { ModelConfig, DownloadProgress, LLMStatus, ModelDownloadState } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface ModelSelectorProps {
  status: LLMStatus;
  progress: DownloadProgress | null;
  modelDownloads: Record<string, ModelDownloadState>;
  error: string | null;
  onSelect: (modelId: string) => void;
  onCancel: (modelId: string) => void;
  onDelete: (modelId: string) => void;
  downloadedModels: string[];
  hardwareInfo: { type: string; adapter: string; memory?: string; cores?: number } | null;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  status,
  progress,
  modelDownloads,
  error,
  onSelect,
  onCancel,
  onDelete,
  downloadedModels,
  hardwareInfo,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDownloadId, setConfirmDownloadId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    const isDownloaded = downloadedModels.includes(id);
    if (isDownloaded) {
      onSelect(id);
    } else {
      setConfirmDownloadId(id);
    }
  };

  const confirmDownloadModel = AVAILABLE_MODELS.find(m => m.id === confirmDownloadId);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4">
          <Cpu size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Select Your Local Brain
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Choose a model to download. All inference happens locally on your device. 
          No data ever leaves your browser.
        </p>
        {hardwareInfo && (
          <div className="flex flex-col items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${hardwareInfo.type === 'WebGPU' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {hardwareInfo.type === 'WebGPU' ? <Zap size={12} /> : <AlertCircle size={12} />}
              {hardwareInfo.type === 'WebGPU' ? `GPU Accelerated: ${hardwareInfo.adapter}` : 'CPU Fallback (WASM)'}
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {hardwareInfo.memory && <span>Memory: {hardwareInfo.memory}</span>}
              {hardwareInfo.cores && <span>Cores: {hardwareInfo.cores}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_MODELS.map((model) => {
          const isDownloaded = downloadedModels.includes(model.id);
          const downloadState = modelDownloads[model.id];
          const isDownloading = downloadState?.status === 'downloading';
          const isQueued = downloadState?.status === 'queued';
          const isError = downloadState?.status === 'error';

          return (
            <div
              key={model.id}
              className={`group relative bg-white border p-6 rounded-2xl transition-all hover:shadow-lg ${
                isDownloading 
                  ? 'border-emerald-500 ring-1 ring-emerald-500' 
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                  {model.low_resource_required ? <Zap size={20} /> : <Cpu size={20} />}
                </div>
                <div className="text-xs font-mono font-bold px-2 py-1 bg-zinc-100 rounded text-zinc-500">
                  {model.size}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-zinc-900">{model.name}</h3>
                {isDownloaded && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} />
                    CACHED
                  </div>
                )}
              </div>
              <p className="text-sm text-zinc-500 mb-6 line-clamp-2">
                {model.description}
              </p>

              {(isDownloading || isQueued || isError) && downloadState && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>{downloadState.status}...</span>
                    {isDownloading && <span>{Math.round(downloadState.progress * 100)}%</span>}
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isError ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${downloadState.progress * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate font-medium">
                    {downloadState.text}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto">
                <div className="text-xs text-zinc-400">
                  Req: <span className="font-bold text-zinc-500">{model.ram} RAM</span>
                </div>
                <div className="flex items-center gap-2">
                  {isDownloaded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(model.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete from cache"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {isDownloading || isQueued ? (
                    <button
                      onClick={() => onCancel(model.id)}
                      className="flex items-center gap-2 bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownload(model.id)}
                      className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
                    >
                      {isDownloaded ? (
                        <>
                          <Zap size={16} />
                          Load
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Download
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        title="Delete Model"
        message={`Are you sure you want to delete this model from your cache? You will need to download it again to use it.`}
        onConfirm={() => {
          if (confirmDeleteId) onDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
        confirmLabel="Delete"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={!!confirmDownloadId}
        title="Download Model"
        message={`Are you sure you want to download ${confirmDownloadModel?.name}? This model is approximately ${confirmDownloadModel?.size} and will be stored in your browser's cache for local use.`}
        onConfirm={() => {
          if (confirmDownloadId) onSelect(confirmDownloadId);
          setConfirmDownloadId(null);
        }}
        onCancel={() => setConfirmDownloadId(null)}
        confirmLabel="Download"
        isDanger={false}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-sm text-red-500">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
