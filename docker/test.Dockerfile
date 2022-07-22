FROM node:18-bullseye-slim

ENV UID=node \
    GID=node \
    HOME=/opt/fakturia

# Tini will ensure that any orphaned processes get reaped properly.
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN apt update
RUN apt install -y git

RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

VOLUME $HOME
WORKDIR $HOME

USER $UID:$GID

EXPOSE 8080

CMD ["/usr/local/bin/node", "."]
