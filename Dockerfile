FROM node:14 as compiler

WORKDIR /usr/src/msd

COPY package.json tsconfig.json tsconfig.build.json yarn.lock /usr/src/msd/
COPY src/ /usr/src/msd/src

RUN yarn && yarn build

###############################################################
FROM node:14 as dependencies

WORKDIR /usr/src/msd/

COPY package.json /usr/src/msd/

ENV NODE_ENV production
RUN yarn --production

###############################################################
FROM node:14-alpine

ENV NODE_ENV production

COPY package.json /usr/src/msd/

COPY --from=compiler /usr/src/msd/dist /usr/src/msd/dist
COPY --from=dependencies /usr/src/msd/node_modules/ /usr/src/msd/node_modules/

RUN ln -s /usr/src/msd/dist/cli/index.js /usr/bin/mc-stats-daemon \
    && chmod +x /usr/bin/mc-stats-daemon

ENTRYPOINT [ "mc-stats-daemon" ]