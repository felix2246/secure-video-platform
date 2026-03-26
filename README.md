# Video Encryption Platform

A local-first app for encrypting and decrypting video files with password-based protection.

Built with React + TypeScript + Vite for the UI, with optional Electron packaging for desktop distribution.

## Features

- Drag-and-drop video or encrypted `.enc` files.
- Automatic encrypted file detection.
- Encrypt videos with a password and download the encrypted output.
- Decrypt encrypted files in memory for playback (without writing decrypted video to disk).
- Clear status and error messaging for wrong password/tampered data scenarios.

## Security Model

The app encrypts video data using:

- `AES-256-GCM` for authenticated encryption
- `PBKDF2-SHA256` for key derivation from the user password
- 600,000 PBKDF2 iterations
- Random salt and IV per file

Encrypted files are stored in a custom payload format and typically saved with a `.enc` extension.

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Electron (for desktop app shell)

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or compatible npm version)

### Install

```bash
npm install
```

### Run in browser (dev)

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

### Run as Electron app (dev)

```bash
npm run electron:dev
```

This starts the Vite dev server and launches Electron once the app is ready.

## Build Commands

### Build web app

```bash
npm run build
```

### Preview production web build

```bash
npm run preview
```

### Package Electron app (unpacked)

```bash
npm run electron:pack
```

### Build macOS distributables

```bash
npm run electron:dist:mac
```

Artifacts are written to the `release` directory.

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build production web assets
- `npm run preview` - Preview built web assets
- `npm run lint` - Run ESLint
- `npm run electron:dev` - Run Vite + Electron in development
- `npm run electron:pack` - Build and package Electron app directory
- `npm run electron:dist:mac` - Build and create macOS distributables

## Project Structure

```text
src/
  components/   # UI components (drop zone, player, panels)
  lib/          # crypto, format parsing, encrypted-file detection
  App.tsx       # main app flow (detect/encrypt/decrypt/play)
electron/
  main.cjs      # Electron main process entry
  preload.cjs   # Safe preload bridge
```

## Notes

- This app processes files locally on the device; it does not upload video content to any server.
- Use strong, unique passwords and keep backups of originals. If you lose the password, encrypted files cannot be recovered.
