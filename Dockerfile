FROM node

ARG google_maps_api_key

RUN yarn global add forever
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
ENV google_maps_api_key=$google_maps_api_key
ENV port "80"
EXPOSE 80

CMD [ "yarn", "server" ]

