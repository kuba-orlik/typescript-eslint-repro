# Sealious playground

A simple todo app written in Sealious with a Hotwire-enhanced, server-side
rendered front-end.

## Running

```
docker-compose up -d db

npm install
npm run watch
```

## Running on a custom port

```
export SEALIOUS_PORT=8888
export SEALIOUS_BASE_URL="https://888.dep.sealcode.org"
npm run watch
```
