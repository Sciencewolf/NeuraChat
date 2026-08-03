# NeuraChat

NeuraChat is a full-stack AI chat application with selectable OpenAI and Google
models, optional web search, and a responsive chat interface. The project uses
a React and TypeScript frontend, a Flask API, and Supabase for chatbot settings.

[Open the live application](https://neurachatui.vercel.app)

## Features

- Switch between supported OpenAI and Google models
- Use optional web search with compatible OpenAI models
- Preserve chat messages during the browser session
- Automatically resize the multiline message input
- Manage the active model and chatbot settings through Supabase
- Use a responsive interface on desktop and mobile devices

## Project documentation

- [Frontend setup and documentation](./frontend/README.md)
- [Backend setup, API endpoints, and Supabase schema](./backend/README.md)

## Technology stack

- **Frontend:** React, TypeScript, Vite, Vercel Analytics
- **Backend:** Python, Flask, OpenAI API, Google GenAI
- **Database:** Supabase
- **Deployment:** Vercel-compatible frontend and Flask-compatible backend
