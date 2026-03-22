import { useState, useCallback, useRef, useEffect } from 'react';
import { LLMEngine, engine, AVAILABLE_MODELS } from '../lib/llm';
import { LLMStatus, DownloadProgress, Message, ModelDownloadState, DownloadStatus } from '../types';

export const useLLM = () => {
  const [status, setStatus] = useState<LLMStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [modelDownloads, setModelDownloads] = useState<Record<string, ModelDownloadState>>({});
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);

  const checkDownloaded = useCallback(async () => {
    const downloaded: string[] = [];
    for (const model of AVAILABLE_MODELS) {
      if (await engine.isModelDownloaded(model.id)) {
        downloaded.push(model.id);
      }
    }
    setDownloadedModels(downloaded);
  }, []);

  useEffect(() => {
    checkDownloaded();
  }, [checkDownloaded]);

  const updateDownloadState = useCallback((modelId: string, state: Partial<ModelDownloadState>) => {
    setModelDownloads(prev => ({
      ...prev,
      [modelId]: {
        modelId,
        status: 'idle',
        progress: 0,
        text: '',
        ...prev[modelId],
        ...state
      }
    }));
  }, []);

  const loadModel = useCallback(async (modelId: string) => {
    setStatus('loading');
    setError(null);
    updateDownloadState(modelId, { status: 'downloading', progress: 0, text: 'Initializing...' });

    try {
      await engine.loadModel(modelId, (p) => {
        setProgress(p);
        updateDownloadState(modelId, { status: 'downloading', ...p });
        if (p.progress < 1) setStatus('downloading');
        else {
          setStatus('ready');
          updateDownloadState(modelId, { status: 'completed', progress: 1, text: 'Ready' });
        }
      });
      setStatus('ready');
      await checkDownloaded();
    } catch (err: any) {
      if (err.message === "Download cancelled") {
        setStatus('idle');
        setProgress(null);
        updateDownloadState(modelId, { status: 'cancelled', text: 'Cancelled' });
        return;
      }
      console.error(err);
      setError(err.message || 'Failed to load model');
      setStatus('error');
      updateDownloadState(modelId, { status: 'error', error: err.message || 'Failed' });
    }
  }, [checkDownloaded, updateDownloadState]);

  const downloadModel = useCallback(async (modelId: string) => {
    updateDownloadState(modelId, { status: 'downloading', progress: 0, text: 'Starting download...' });
    try {
      await engine.downloadModel(modelId, (p) => {
        updateDownloadState(modelId, { status: 'downloading', ...p });
      });
      updateDownloadState(modelId, { status: 'completed', progress: 1, text: 'Downloaded' });
      await checkDownloaded();
    } catch (err: any) {
      if (err.message === "Download cancelled") {
        updateDownloadState(modelId, { status: 'cancelled', text: 'Cancelled' });
        return;
      }
      updateDownloadState(modelId, { status: 'error', error: err.message || 'Failed' });
    }
  }, [checkDownloaded, updateDownloadState]);

  const cancelDownload = useCallback(async (modelId: string) => {
    await engine.cancelDownload(modelId);
    updateDownloadState(modelId, { status: 'cancelled', text: 'Cancelled', progress: 0 });
    if (status === 'loading' || status === 'downloading') {
      setStatus('idle');
      setProgress(null);
    }
  }, [updateDownloadState, status]);

  const deleteModel = useCallback(async (modelId: string) => {
    await engine.deleteModel(modelId);
    await checkDownloaded();
    updateDownloadState(modelId, { status: 'idle', progress: 0, text: '' });
    if (status === 'ready') {
      setStatus('idle');
    }
  }, [checkDownloaded, status, updateDownloadState]);

  const generate = useCallback(async (messages: Message[], systemPrompt?: string) => {
    if (status !== 'ready') return;
    setIsGenerating(true);
    setCurrentResponse('');
    try {
      const formattedMessages = messages.map(({ role, content }) => ({ role, content }));
      if (systemPrompt) {
        formattedMessages.unshift({ role: 'system', content: systemPrompt });
      }
      await engine.generate(formattedMessages, (text) => {
        setCurrentResponse(text);
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [status]);

  const stop = useCallback(async () => {
    await engine.interrupt();
    setIsGenerating(false);
  }, []);

  return {
    status,
    progress,
    modelDownloads,
    error,
    isGenerating,
    currentResponse,
    downloadedModels,
    loadModel,
    downloadModel,
    cancelDownload,
    deleteModel,
    checkDownloaded,
    generate,
    stop,
  };
};
