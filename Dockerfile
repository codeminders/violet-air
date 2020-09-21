FROM node

RUN yarn global add forever
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

ENV port "80"
EXPOSE 80

CMD [ "yarn", "server" ]

