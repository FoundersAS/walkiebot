# Walkiebot



Some articles about Walkie:
* https://blog.founders.as/walkie-bloggie-postie-ff1938668605
* https://blog.founders.as/walkie-announcement-sign-in-with-slack-and-more-56427dad9059
* https://blog.founders.as/walkie-two-point-ooh-snap-5cef2bb8f274

# Configuration

This project uses [`load-environment`](https://www.npmjs.com/package/load-environment) to load config

These are the available environment variables walkie uses:

* `NGROK_SUBDOMAIN` only required locally with slack login enabled
* `MONGODB_URI` a mongodb uri
* `NPM_CONFIG_PRODUCTION` when deploying to heroku this should be false so `devDepencies` are installed
* `JWT_PUBLIC` You can generate a keypair using the instructions here: https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9
* `JWT_SECRET` For local development keep these files in your `local.json` file
* `APP_HOST` used only locally and for generating some redirection urls related to logging in with slack
* `HEROKU_APP_NAME` used only on heroku, it should be the same value as your heroku app name
* `SLACK_CLIENT_ID` if this is not provided the sign in with slack button will not be shown in walkie
* `SLACK_CLIENT_SECRET`
* `SLACK_LOGIN_REDIRECT_URL`

# Production

Use the deploy to heroku button to easily deploy to heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/FoundersAS/walkiebot)

Or if you're more into docker you can use `docker-compose`, the `docker-compose.yml` file is set up to build Walkie from the `Dockerfile` in the project root.

# Development

    $ yarn
    $ yarn dev

Open:
* http://localhost:8005 for webpack
* http://localhost:8000 for production server/api
