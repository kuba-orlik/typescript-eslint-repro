# Sealious app

## Requirements

-   docker
-   docker-compose (version 2.6 or up)

## Installation

```
npm install
```

Always use ./npm.sh when installing dependencies.

## Running the app in development mode

```
npx sealgen make-env
docker-compose up -d db mailcatcher
npm run watch
```

## Adding a component

```
npx sealgen add-component
```

And then go to `localhost:8080/components` to preview your custom component

## Testing

First time after installing the project run this command to download firefox

```
npx playwright install firefox
```

And then

```
./npm.sh run test
```
