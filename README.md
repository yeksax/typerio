# Typer

> Web app de troca de mensagens e compartilhamento de ideias &lt;3

![](header.png)

## Uso

Instale com seu gerenciador de pacotes favorito

```bash
npm install
#ou
yarn
#ou
pnpm install
```

Agora crie um arquivo `.env` com as seguintes variáveis

```env
DATABASE_URL=********

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=********

# Para auth com Github https://next-auth.js.org/providers/github
GITHUB_ID=********
GITHUB_SECRET=********

# Para auth com Google https://next-auth.js.org/providers/google
GOOGLE_ID=********
GOOGLE_SECRET=********

# Pusher docs https://pusher.com/docs
PUSHER_APP_ID=********
NEXT_PUBLIC_PUSHER_APP_KEY=********
PUSHER_APP_SECRET=********

# Uploadthing docs https://docs.uploadthing.com/
UPLOADTHING_SECRET=********
UPLOADTHING_APP_ID=********

# Gere VAPID Keys em https://vapidkeys.com/
WEB_PUSH_EMAIL=user@example.com
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=<vapid-private-key>
WEB_PUSH_PRIVATE_KEY=<vapid-public-key>
```

Inicie o servidor de desenvolvimento

```bash
npm run dev
#ou
yarn dev
#ou
pnpm dev
```
