FROM node:13.3.0-alpine3.10 as builder
WORKDIR /home/node/app

ENV NODE_ENV=production

# First stage: install dependencies
RUN apk add --no-cache git python3 make g++
COPY ./package*.json ./
RUN npm install

# Second stage, run app
FROM node:13.3.0-alpine3.10
WORKDIR /home/node/app

COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package*.json ./

COPY src/ /home/node/app/src/

EXPOSE 80
EXPOSE 53

ENTRYPOINT ["node", "src/cli/cli.js"]
