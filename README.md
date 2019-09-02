<img alt="WAILto" align="right" src="https://wailto.smessina.com/wailto-social.png" width="400px"/>

# WAILto

WAILto (or What Am I Listening To) is a way to analyze your music listening. Learn about your own music trends and history.

[See it live here!](https://wailto.smessina.com/)

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development](#development)
3. [Contributing](#contributing)
4. [Authors](#authors)
5. [License](#license)

## Introduction

I listen to a lot of music. I thought it would be interesting to break down my music listening habits.

Fortunately, there's [Last.fm](https://www.last.fm/home) and their [scrobbling](https://www.last.fm/about/trackmymusic) feature, which can keep a log of my listening history. Even more fortunately, they have a pretty fantastic [API](https://www.last.fm/api/).

Hooking up to the API, I can answer questions like:

- What time of day do I listen to music the most?
- What's my daily breakdown of music over the last month?

### "Future State"

WAILto is meant to be a living dashboard, built with the ability to write custom modules using the Last.fm API. I've written a few so far, but have lots more in mind.

Specifically:

- [ ] Get more song data through the tracks API.
- [ ] Allow hourly selection

## Development

```
git clone https://github.com/regexpressyourself/wailto.git
cd wailto
```

First, you'll need a `.env` file in the root directory with the following information:

```
LASTFM_KEY={Last.fm API key}
LASTFM_SECRET={Last.fm API secret}
DB_USER={Postgres User}
DB_PW={Postgres Password}
ENVIRONMENT='dev'
```

More on these things below:

### Database

First, you will need a PostgreSQL instance running with a user and password set up.

Once that's ready:

1. Make sure your PostgreSQL username and password are in the .env file (detailed above).
2. Create a database named `wailto`
3. Run the `database.sql` file located in the project root:

```
export PGPASSWORD=<password>
psql -d wailto -U <user_name> -a -w -f database.sql
```

### Server

First, you need a [Last.fm API key and password](https://www.last.fm/api/account/create). Add them to the `.env` file as detailed above.

- Quick note: make sure you save this -- Last.fm doesn't let you access them again.

Next, install and start up the server:

```
yarn
yarn start
```

Your Node server will be running off of [http://localhost:3011](http://localhost:3011).

### Client

The client is a [Create React App](https://github.com/facebook/create-react-app) build.

To run it, just install and start her up!

```
cd front
yarn
yarn start
```

The React server is on [http://localhost:3000](http://localhost:3000).

### Production Build

To create a production build, you'll just need to create a production-ready front end bundle.

```
cd front
yarn build
```

The server is already pointing at the production build location, so opening up the same routes on port `:3011` should show your production app.


## Contributing

I'm always happy to receive pull requests, questions/issues regarding code, and feature requests on all my projects. Please feel free to open an issue or submit a pull request.

## Authors

- **[Sam Messina](https://smessina.com)** - _Sole Developer_

## License

WAILto is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

**[Back to top](#table-of-contents)**
