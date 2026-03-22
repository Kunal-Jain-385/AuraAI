# Private Offline AI Chat

A production-ready, privacy-first AI chat web application that runs 100% offline after initial setup.

## Features

- **100% Offline Inference**: Once the model is downloaded, no internet connection is required.
- **Privacy First**: All chat history and models are stored locally in your browser (IndexedDB). No data ever leaves your device.
- **WebGPU Acceleration**: Uses WebGPU for high-performance inference, with WASM fallback for older hardware.
- **No Authentication**: No accounts, no tracking, no telemetry.
- **PWA Support**: Installable as a desktop or mobile app for true offline access.

## How it Works

### 1. Model Download & Caching
On the first launch, the app prompts you to select and download an LLM. We use `@mlc-ai/web-llm` which downloads quantized models (int4/q4f16) from Hugging Face. These models are cached in the browser's **Cache Storage** and **IndexedDB**.

### 2. Offline Mode
The app is a Progressive Web App (PWA). The service worker caches all frontend assets (HTML, JS, CSS, Icons). Once the model is cached, you can turn off your internet and the app will still load and perform AI inference.

### 3. Hardware Detection
The app automatically detects if your browser supports **WebGPU**. If available, it uses GPU acceleration for near-instant responses. If not, it falls back to **WebAssembly (WASM)**, which runs on the CPU (slower but compatible).

## Performance Tips

- **Low-End Devices**: Choose smaller models like **TinyLlama 1.1B** or **Phi-3 Mini**. These require less RAM (2GB - 4GB).
- **High-End Devices**: Use **Llama 3.1 8B** or **Mistral 7B** for better reasoning and knowledge.
- **Browser Support**: Use the latest version of Chrome, Edge, or Arc for the best WebGPU support.

## Security

- **Content Security Policy (CSP)**: Configured to only allow connections to Hugging Face for the initial model download.
- **Local Storage**: All messages are stored in IndexedDB.
- **No External Scripts**: No third-party analytics or tracking scripts are included.

## Setup Instructions

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`
4. Select a model and wait for the download to complete.
5. You can now go offline and chat!
