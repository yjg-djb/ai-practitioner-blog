<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Practitioner Blog

This project is a Vite + React site with a small Node production server.

The Node server does two jobs:
- serves the built `dist` assets
- proxies `/api/openai/*` to your OpenAI-compatible upstream so the API key stays on the server

## Local development

Prerequisites: Node.js 22

1. Install dependencies:
   `npm install`
2. Create local env file:
   `cp .env.example .env.local`
3. Fill in `OPENAI_COMPAT_API_KEY` in `.env.local`
4. Start the Vite dev server:
   `npm run dev`

## Production deployment on Ubuntu

1. Clone the repo on your server
2. Create the production env file:
   `cp .env.example .env.production`
3. Edit `.env.production`
   - set `APP_URL` to your public IP or domain
   - set `OPENAI_COMPAT_API_KEY`
4. Run the installer:
   `bash deploy/install-ubuntu.sh`

The installer will:
- install Node.js 22 and Nginx if needed
- run `npm ci`
- build the frontend
- install a `systemd` service
- configure Nginx to proxy port 80 to the Node app

## Production commands

- Build only: `npm run build`
- Start production server: `npm run start`
- Health check: `curl http://127.0.0.1:3000/health`
