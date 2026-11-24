# PortfolioGenie

PortfolioGenie is a GitHub-powered portfolio builder. It imports public repository information and uses Gemini AI to generate portfolio copy and choose a visual template.

## Project structure

- `DEPI-Project/` — React and Vite frontend.
- `Server/` — Express API, MongoDB models, GitHub integration, and Gemini AI endpoints.

## Requirements

- Node.js and npm
- A MongoDB connection string
- A Gemini API key for AI generation

## Configure the server

Create `Server/config.env` locally. Do not commit this file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

The server loads configuration from `Server/config.env` and connects to MongoDB before it starts.

## Run locally

In one terminal:

```bash
cd Server
npm install
npm run dev
```

In a second terminal:

```bash
cd DEPI-Project
npm install
npm run dev
```

Vite prints the frontend URL when it starts. The frontend uses `http://localhost:5000` for the API by default. To use a different API URL, create `DEPI-Project/.env.local` with:

```env
VITE_API_URL=http://localhost:5000
```

## Build the frontend

```bash
cd DEPI-Project
npm run build
```

## AI usage

Portfolio generation and AI writing use the configured Gemini model. Availability and request limits depend on the Gemini API key's quota; free-tier limits may apply.

Keep `Server/config.env` and other files containing credentials private. The repository `.gitignore` excludes environment files and dependency folders; never put real API keys in source code or documentation.
