# Sealious app

## Requirements

-   docker
-   docker-compose (version 2.6 or up)

## Installation

```
./npm.sh install
```

Always use ./npm.sh when installing dependencies.

## Running the app in development mode

```
npx sealgen make-env
docker-compose up -d
npm run watch
```

## Testing

```
./npm.sh run test
```
