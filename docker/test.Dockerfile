FROM node:18-bullseye-slim

ENV HOME=/opt/sealious-app

# Tini will ensure that any orphaned processes get reaped properly.
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN apt update
RUN apt install -y git
RUN apt install -y tmux

# playwright deps
RUN apt-get update&& apt-get install -y --no-install-recommends libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libwayland-client0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 xvfb fonts-noto-color-emoji fonts-unifont libfontconfig1 libfreetype6 xfonts-cyrillic xfonts-scalable fonts-liberation fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf fonts-freefont-ttf libcairo-gobject2 libdbus-glib-1-2 libgdk-pixbuf-2.0-0 libgtk-3-0 libharfbuzz0b libpangocairo-1.0-0 libx11-xcb1 libxcb-shm0 libxcursor1 libxi6 libxrender1 libxtst6 gstreamer1.0-libav gstreamer1.0-plugins-bad gstreamer1.0-plugins-base gstreamer1.0-plugins-good libegl1 libenchant-2-2 libepoxy0 libevdev2 libgles2 libglx0 libgstreamer-gl1.0-0 libgstreamer-plugins-base1.0-0 libgstreamer1.0-0 libgudev-1.0-0 libharfbuzz-icu0 libhyphen0 libicu67 libjpeg62-turbo liblcms2-2 libmanette-0.2-0 libnotify4 libopengl0 libopenjp2-7 libopus0 libpng16-16 libproxy1v5 libsecret-1-0 libsoup2.4-1 libwayland-egl1 libwayland-server0 libwebp6 libwebpdemux2 libwoff1 libxml2 libxslt1.1 libatomic1 libevent-2.1-7

RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

VOLUME $HOME
WORKDIR $HOME

RUN npm install -g npm@7
RUN npm install -g @sealcode/sealgen

USER $UID:$GID

EXPOSE 8080

CMD ["/usr/local/bin/node", "."]
