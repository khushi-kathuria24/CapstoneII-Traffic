FROM node:22-alpine AS client-build
WORKDIR /app
COPY package.json ./
COPY client/package.json client/package.json
RUN npm install --prefix client
COPY client client
RUN npm run build --prefix client

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json server/package.json
RUN npm install --omit=dev --prefix server
COPY server server
COPY --from=client-build /app/client/dist client/dist
EXPOSE 5000
CMD ["npm", "start", "--prefix", "server"]
