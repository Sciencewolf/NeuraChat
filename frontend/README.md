# NeuraChat Frontend

Responsive chat interface for NeuraChat, built with React, TypeScript, and
Vite. It supports model selection, optional tools, session-based chat history,
and a multiline auto-resizing message input.

## Local setup

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the development server:

```bash
npm run dev
```

The app is available at `http://localhost:5173` by default.

## Available scripts

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and create a production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

Production files are generated in the `dist` directory and can be deployed to
Vercel or any static hosting provider.
