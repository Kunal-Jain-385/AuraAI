import { 
  RunAnywhere, 
  ModelManager, 
  LLMFramework, 
  ModelCategory, 
  ModelStatus,
  CompactModelDef,
  detectCapabilities
} from "@runanywhere/web";
import { LlamaCPP, TextGeneration } from "@runanywhere/web-llamacpp";
import { ModelConfig, DownloadProgress } from "../types";

export interface RunAnywhereModelConfig extends ModelConfig, CompactModelDef {}

export const AVAILABLE_MODELS: RunAnywhereModelConfig[] = [
  {
    id: "llama-3.2-1b-instruct-q4_k_m",
    name: "Llama 3.2 1B Instruct (Q4_K_M)",
    size: "0.7 GB",
    ram: "2 GB",
    description: "Ultra-compact Llama 3.2 model, perfect for mobile and low-resource devices.",
    repo: "bartowski/Llama-3.2-1B-Instruct-GGUF",
    files: ["Llama-3.2-1B-Instruct-Q4_K_M.gguf"],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 1.5,
    low_resource_required: true,
  },
  {
    id: "qwen-2.5-0.5b-instruct-q8_0",
    name: "Qwen 2.5 0.5B Instruct (Q8_0)",
    size: "0.6 GB",
    ram: "1.5 GB",
    description: "Extremely fast and capable small model from Alibaba.",
    repo: "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
    files: ["qwen2.5-0.5b-instruct-q8_0.gguf"],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 1.0,
    low_resource_required: true,
  },
  {
    id: "mistral-7b-instruct-v0.3-q4_k_m",
    name: "Mistral 7B v0.3 (Q4_K_M)",
    size: "4.4 GB",
    ram: "8 GB",
    description: "High-performance Mistral 7B model with great reasoning capabilities.",
    repo: "bartowski/Mistral-7B-Instruct-v0.3-GGUF",
    files: ["Mistral-7B-Instruct-v0.3-Q4_K_M.gguf"],
    framework: LLMFramework.LlamaCpp,
    modality: ModelCategory.Language,
    memoryRequirement: 6.0,
  }
];

export class LLMEngine {
  private initialized = false;
  private currentModelId: string | null = null;

  private async ensureInitialized() {
    if (this.initialized) return;
    await RunAnywhere.initialize();
    await LlamaCPP.register({
      wasmUrl: `${window.location.origin}/wasm/racommons-llamacpp.js`,
      webgpuWasmUrl: `${window.location.origin}/wasm/racommons-llamacpp-webgpu.js`,
    });
    ModelManager.registerModels(AVAILABLE_MODELS);
    this.initialized = true;
  }

  async loadModel(
    modelId: string,
    onProgress: (progress: DownloadProgress) => void
  ) {
    await this.ensureInitialized();
    
    if (ModelManager.getLoadedModelId(ModelCategory.Language) === modelId) {
      this.currentModelId = modelId;
      return;
    }

    const model = ModelManager.getModels().find(m => m.id === modelId);
    if (!model) throw new Error(`Model ${modelId} not found in registry`);

    if (model.status !== ModelStatus.Downloaded) {
      await this.downloadModel(modelId, onProgress);
    }

    onProgress({ progress: 0, text: "Loading model into memory..." });
    const success = await ModelManager.loadModel(modelId);
    if (!success) throw new Error("Failed to load model");
    
    this.currentModelId = modelId;
    onProgress({ progress: 1, text: "Model ready" });
  }

  async downloadModel(
    modelId: string,
    onProgress: (progress: DownloadProgress) => void
  ) {
    await this.ensureInitialized();
    
    const unsubscribe = ModelManager.onChange((models) => {
      const model = models.find(m => m.id === modelId);
      if (model && model.status === ModelStatus.Downloading) {
        onProgress({
          progress: model.downloadProgress || 0,
          text: `Downloading ${model.name}...`,
        });
      }
    });

    try {
      await ModelManager.downloadModel(modelId);
      onProgress({ progress: 1, text: "Download complete" });
    } catch (err: any) {
      if (err.message?.includes("cancelled")) {
        onProgress({ progress: 0, text: "Download cancelled" });
      }
      throw err;
    } finally {
      unsubscribe();
    }
  }

  async cancelDownload(modelId: string) {
    // RunAnywhere ModelManager doesn't have a direct cancelDownload yet in the TS types I saw,
    // but we can try to unload or just let it be. 
    // Actually, we can implement it if the SDK supports it.
    // For now, we'll just mark it as something we want to stop.
    // In a real app, we'd need SDK support for cancelling fetch.
  }

  async isModelDownloaded(modelId: string): Promise<boolean> {
    await this.ensureInitialized();
    const model = ModelManager.getModels().find(m => m.id === modelId);
    return model?.status === ModelStatus.Downloaded;
  }

  async deleteModel(modelId: string) {
    await this.ensureInitialized();
    await ModelManager.deleteModel(modelId);
    if (this.currentModelId === modelId) {
      this.currentModelId = null;
    }
  }

  async generate(
    messages: { role: string; content: string }[],
    onUpdate: (text: string) => void
  ) {
    await this.ensureInitialized();
    
    if (!TextGeneration.isModelLoaded) {
      throw new Error("No model loaded for generation");
    }

    const prompt = this.formatPrompt(messages);
    const { stream } = await TextGeneration.generateStream(prompt, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    let fullText = "";
    for await (const chunk of stream) {
      fullText += chunk;
      onUpdate(fullText);
    }
    return fullText;
  }

  private formatPrompt(messages: { role: string; content: string }[]) {
    if (this.currentModelId?.includes('llama-3.2')) {
      return messages.map(m => {
        const role = m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user');
        return `<|start_header_id|>${role}<|end_header_id|>\n\n${m.content}<|eot_id|>`;
      }).join('') + '<|start_header_id|>assistant<|end_header_id|>\n\n';
    }
    
    if (this.currentModelId?.includes('qwen')) {
      return messages.map(m => {
        const role = m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user');
        return `<|im_start|>${role}\n${m.content}<|im_end|>`;
      }).join('\n') + '\n<|im_start|>assistant\n';
    }

    // Default ChatML-like formatting for GGUF models
    return messages.map(m => {
      const role = m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user');
      return `<|${role}|>\n${m.content}<|end|>`;
    }).join('\n') + '\n<|assistant|>\n';
  }

  async interrupt() {
    TextGeneration.cancel();
  }

  async unload() {
    if (this.currentModelId) {
      await ModelManager.unloadModel(this.currentModelId);
      this.currentModelId = null;
    }
  }

  async getHardwareInfo() {
    try {
      const caps = await detectCapabilities();
      return {
        type: caps.hasWebGPU ? "WebGPU" : "WASM",
        adapter: caps.gpuAdapterInfo?.description || caps.gpuAdapterInfo?.device || (caps.hasWebGPU ? "Generic GPU" : "CPU Fallback"),
        memory: `${caps.deviceMemoryGB}GB`,
        cores: caps.hardwareConcurrency
      };
    } catch (e) {
      return { type: "WASM", adapter: "CPU Fallback" };
    }
  }
}

export const engine = new LLMEngine();

