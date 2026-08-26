# Repository Rules & Development Guidelines

## Development & Build Environment
- To build and launch the application container during development, use:
  ```bash
  docker-compose up -d --build
  ```
- The `Dockerfile` handles dependency installation (`npm ci`), database seed setup, and building the Next.js standalone app (`npm run build`).
