# ---- deps: install dependencies only (cached separately from source changes) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: build the Next.js app ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy values so `next build` (which touches process.env for type-checking
# and static analysis, but never needs real secrets at build time) doesn't
# fail if these aren't passed as build args. Real values are supplied at
# container run time via docker-compose's environment section instead -
# secrets never get baked into image layers.
ENV NEXTAUTH_SECRET=build-placeholder
ENV MONGODB_URI=mongodb://placeholder:27017/placeholder
ENV GROQ_API_KEY=build-placeholder
RUN npm run build

# ---- runner: minimal production image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output already contains a trimmed node_modules and a
# server.js entrypoint - no npm install needed in the final image.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
