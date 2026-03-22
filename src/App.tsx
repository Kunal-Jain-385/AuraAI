import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ModelSelector } from './components/ModelSelector';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useChat } from './hooks/useChat';
import { useLLM } from './hooks/useLLM';
import { usePreferences } from './hooks/usePreferences';
import { Message, LearningStyle } from './types';
import { Settings, Trash2, X, User, Zap, Shield, Moon, Sun } from 'lucide-react';
import { AVAILABLE_MODELS } from './lib/llm';

export default function App() {
  const {
    sessions,
    currentSession,
    createNewSession,
    selectSession,
    addMessage,
    updateSessionContext,
    removeSession,
    clearData,
  } = useChat();

  const {
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
  } = useLLM();

  const {
    preferences,
    updatePreferences,
    updateLearningProfile,
    trackInteraction,
  } = usePreferences();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<{ type: string; adapter: string; memory?: string; cores?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'planner'>('chat');
  const [confirmDeleteModelId, setConfirmDeleteModelId] = useState<string | null>(null);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  useEffect(() => {
    const checkHardware = async () => {
      const { engine } = await import('./lib/llm');
      const info = await engine.getHardwareInfo();
      setHardwareInfo(info);
    };
    checkHardware();
    checkDownloaded();
  }, [checkDownloaded]);

  const handleSend = async (content: string, image?: string) => {
    let session = currentSession;
    if (!session) {
      if (selectedModelId) {
        session = await createNewSession(selectedModelId);
      } else {
        const { AVAILABLE_MODELS } = await import('./lib/llm');
        session = await createNewSession(AVAILABLE_MODELS[0].id);
      }
    }

    if (!session) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    await addMessage(session.id, userMsg);
    await trackInteraction(content);
    
    const { learningProfile } = preferences;
    let systemPrompt = `You are Aura, a personalized learning assistant. 
    Current user learning style: ${learningProfile.style}. 
    User has shown confusion ${learningProfile.confusionCount} times. 
    Adjust your verbosity and complexity accordingly. 
    For 'beginner', be very detailed and use simple analogies. 
    For 'advanced', be concise and use technical terminology.`;

    let prompt = content;
    if (session.context) {
      prompt = `Context from uploaded PDF:\n${session.context}\n\nUser Question: ${content}`;
    }

    if (image) {
      prompt = `[IMAGE ATTACHED]
      Please analyze the visual content of the provided image. 
      Identify key elements, text, or diagrams present.
      Relate your findings to the following query: ${prompt}
      Provide a detailed explanation or insights based on both the image and the query.`;
    }

    const history = [...session.messages, userMsg];
    // We replace the last message content with the enriched prompt for the AI
    const historyWithContext = history.map((m, i) => 
      i === history.length - 1 ? { ...m, content: prompt } : m
    );

    await generate(historyWithContext, systemPrompt);
  };

  useEffect(() => {
    if (!isGenerating && currentResponse && currentSession) {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: currentResponse,
        timestamp: Date.now(),
      };
      addMessage(currentSession.id, assistantMsg);
    }
  }, [isGenerating, currentResponse, currentSession, addMessage]);

  const handleModelSelect = async (modelId: string) => {
    setSelectedModelId(modelId);
    await loadModel(modelId);
  };

  const currentModelName = selectedModelId 
    ? AVAILABLE_MODELS.find(m => m.id === selectedModelId)?.name || 'AURA ENGINE'
    : 'AURA ENGINE';

  const renderContent = () => {
    if (activeTab === 'dashboard') return <Dashboard />;
    if (activeTab === 'planner') return <StudyPlanner />;

    if (status !== 'ready') {
      return (
        <div className="h-full overflow-y-auto bg-zinc-50/50">
          <ModelSelector
            status={status}
            progress={progress}
            modelDownloads={modelDownloads}
            error={error}
            onSelect={handleModelSelect}
            onCancel={cancelDownload}
            onDelete={deleteModel}
            downloadedModels={downloadedModels}
            hardwareInfo={hardwareInfo}
          />
        </div>
      );
    }

    return (
      <ChatArea
        session={currentSession || { id: 'temp', title: 'New Chat', messages: [], createdAt: Date.now(), updatedAt: Date.now(), modelId: selectedModelId || 'default' }}
        isGenerating={isGenerating}
        currentResponse={currentResponse}
        onSend={handleSend}
        onStop={stop}
        onClear={() => currentSession && removeSession(currentSession.id)}
        onExport={() => {}}
        onContextUpdate={(context) => currentSession && updateSessionContext(currentSession.id, context)}
        modelName={currentModelName}
      />
    );
  };

  return (
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden font-sans">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelect={selectSession}
        onNew={async () => {
          if (selectedModelId) {
            await createNewSession(selectedModelId);
          } else {
            const { AVAILABLE_MODELS } = await import('./lib/llm');
            await createNewSession(AVAILABLE_MODELS[0].id);
          }
          setActiveTab('chat');
        }}
        onDelete={removeSession}
        onClearAll={clearData}
        onSettings={() => setShowSettings(true)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          privacyMode={preferences.privacyMode}
          onTogglePrivacy={() => updatePreferences({ privacyMode: !preferences.privacyMode })}
          onLogout={() => window.location.reload()}
        />

        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Personalized Learning Section */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} />
                  Learning Profile
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as LearningStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateLearningProfile({ style })}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                        preferences.learningProfile.style === style
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg scale-[1.02]'
                          : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'
                      }`}
                    >
                      <div className="uppercase tracking-widest mb-1">{style}</div>
                      <div className="text-[10px] font-normal opacity-70">
                        {style === 'beginner' ? 'Detailed explanations' : style === 'intermediate' ? 'Balanced depth' : 'Concise & technical'}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Model Management Section */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Model Management</h3>
                <div className="space-y-3">
                  {AVAILABLE_MODELS.map(model => {
                    const isDownloaded = downloadedModels.includes(model.id);
                    const downloadState = modelDownloads[model.id];
                    const isDownloading = downloadState?.status === 'downloading';
                    const isQueued = downloadState?.status === 'queued';
                    const isError = downloadState?.status === 'error';

                    return (
                      <div key={model.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm truncate">{model.name}</span>
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{model.size}</span>
                            {isDownloaded && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">CACHED</span>
                            )}
                          </div>
                          {(isDownloading || isQueued || isError) && downloadState && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className={`uppercase tracking-wider ${isError ? 'text-red-500' : 'text-zinc-400'}`}>
                                  {downloadState.status}
                                </span>
                                {isDownloading && (
                                  <span className="text-zinc-900">{Math.round(downloadState.progress * 100)}%</span>
                                )}
                              </div>
                              <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${isError ? 'bg-red-500' : 'bg-zinc-900'}`} 
                                  style={{ width: `${downloadState.progress * 100}%` }} 
                                />
                              </div>
                              <div className="text-[10px] text-zinc-500 font-medium truncate">{downloadState.text}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isDownloaded ? (
                            <button
                              onClick={() => setConfirmDeleteModelId(model.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                              title="Delete Model"
                            >
                              <Trash2 size={18} />
                              <span className="text-xs font-bold">Delete</span>
                            </button>
                          ) : isDownloading || isQueued ? (
                            <button
                              onClick={() => cancelDownload(model.id)}
                              className="px-3 py-1.5 bg-zinc-200 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-300 transition-colors"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              onClick={() => downloadModel(model.id)}
                              className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Data & Privacy</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowClearDataConfirm(true)}
                    className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-left flex items-center justify-between"
                  >
                    Clear All Local Data
                    <Settings size={18} />
                  </button>
                </div>
              </section>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 px-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={!!confirmDeleteModelId}
        title="Delete Model"
        message="Are you sure you want to delete this model? This will remove the model weights from your device."
        onConfirm={() => confirmDeleteModelId && deleteModel(confirmDeleteModelId)}
        onCancel={() => setConfirmDeleteModelId(null)}
        confirmLabel="Delete"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={showClearDataConfirm}
        title="Clear All Data"
        message="Are you sure you want to delete all your local chats and preferences? This action cannot be undone."
        onConfirm={() => {
          clearData();
          setShowSettings(false);
        }}
        onCancel={() => setShowClearDataConfirm(false)}
        confirmLabel="Clear All"
        isDanger={true}
      />
    </div>
  );
}
