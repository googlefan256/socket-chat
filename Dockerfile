FROM oven/bun:latest AS build
WORKDIR /work
COPY . .
RUN bun i && bun run build
FROM oven/bun:distroless AS runtime
WORKDIR /work
COPY --from=build /work/dist /work
CMD ["run", "index.js"]