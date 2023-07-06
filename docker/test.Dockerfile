FROM node:18-bullseye-slim

ENV HOME=/opt/sealious-app

# Tini will ensure that any orphaned processes get reaped properly.
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN apt update
RUN apt install -y git
RUN apt install -y tmux

RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

VOLUME $HOME
WORKDIR $HOME

RUN npm install -g npm@latest

USER $UID:$GID

EXPOSE 8080

CMD ["/usr/local/bin/node", "."]
