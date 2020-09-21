# violet-air

## building and running

### prerequisites

You should have NodeJS and `yarn` (preferred) or `npm` installed.
Also, it's recommended to have `forever` installed globally to simplify development.

```
yarn global add forever
```

### building

```
yarn install
```

### running

```
yarn server
```

Then, start ngrok or any other tunnel like

```
ngrok http 8080
```

and adjust agent fullfilment webhook URL to `https://NGROKID.ngrok.io/google-assistant/webhook`