FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
COPY . .
EXPOSE 5173
CMD ["sh", "-c", "bun install && bun run dev --host 0.0.0.0 --port 5173"]
