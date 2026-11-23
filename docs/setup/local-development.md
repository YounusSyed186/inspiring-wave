# Local Development Setup Guide

## System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **Node.js**: v22+ (v24 recommended)
- **Python**: 3.11 with virtual environment support
- **FFmpeg & FFprobe**: Version 6.0+ (9.1+ verified)
- **Google Chrome**: For headless rendering
- **RAM**: 16 GB+ recommended

## Step-by-Step Installation

### 1. System Binaries
Ensure Node.js and FFmpeg are in your system PATH:
```bash
node -v
ffmpeg -version
```

### 2. Python Environment
Create the dedicated `~/video-tools` virtual environment:
```bash
python -m venv ~/video-tools
~/video-tools/Scripts/pip install torch torchaudio librosa demucs kokoro-onnx soundfile transformers numpy
```

### 3. Whisper.cpp Setup
The studio uses `whisper-cli` with the `ggml-large-v3` model:
- Binary: `~/whisper.cpp/Release/whisper-cli.exe`
- Model: `~/whisper.cpp/models/ggml-large-v3.bin`
Verify by running:
```bash
~/whisper.cpp/Release/whisper-cli.exe -m ~/whisper.cpp/models/ggml-large-v3.bin --help
```

### 4. Lemo Opuscar Library
Ensure the library is cloned at `~/lemo-opuscar`:
```bash
git clone https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar
cd ~/lemo-opuscar && npm install
```

### 5. Running the Next.js Studio
From the repository root:
```bash
npm install
npm run dev --prefix apps/web
```
Access the studio at `http://localhost:3000`.

### 6. Executing Automated Tests
```bash
node tests/e2e/studio_test.mjs
```
All 5 test suites must return green checks.
