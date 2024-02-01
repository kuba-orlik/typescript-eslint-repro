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

First time after installing the project run this command to download firefox

```
npx playwright install firefox
```

And then

```
./npm.sh run test
```
