## Title

Hedera Token Service Circulating Supply API 

## Description 

This is a developer tool intended to easily calculate and provide Hedera Token Service ([HTS](https://docs.hedera.com/guides/docs/sdks/tokens)) circulating supply. 

It can be ran as a CLI, local REST API, or through Docker.

Users can provide a HTS Token ID, as well as accounts that should **not** be considered part of circulation. 

Then it provides the following information over a standardized REST API that is easily consumable.

## Technologies

- [Node.js](https://nodejs.org/en/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) 

## How it works

Users can provide a HTS Token ID, as well as accounts that should **not** be considered part of circulation. The tool will query a Hedera Mirror Node (configurable in the .env) and check the current balance of all non-circulating accounts. It will deduct the current balance of non-circulating accounts from the HTS Token's total supply, thus calculating it's circulating supply. This codebase will serve this information over a REST API.

## Example use case

For one example, $CLXY Tokens have 1b in supply, and accounts: 0.0.859877, 0.0.859897, 0.0.859903, 0.0.859906, 0.0.859908, 0.0.859910, 0.0.859911 are considered [publicly disclosed treasury accounts](https://calaxy.medium.com/announcing-clxys-genesis-event-6b625a925c6c), which should not be calculated as part of circulation. The balance of these accounts, deducted from the 1b total supply, will be considered the circulating supply of $CLXY.

### Example output 

```
{
  token: '0.0.859814',
  decimals: 6,
  totalSupply: '1000000000000000',
  circulating: '0',
  treasuryBalances: [
    { treasury: '0.0.849428', balance: '0' },
    { treasury: '0.0.859877', balance: '100000000000000' },
    { treasury: '0.0.859897', balance: '100000000000000' },
    { treasury: '0.0.859903', balance: '349000000000000' },
    { treasury: '0.0.859906', balance: '55000000000000' },
    { treasury: '0.0.859908', balance: '46000000000000' },
    { treasury: '0.0.859910', balance: '200000000000000' },
    { treasury: '0.0.859911', balance: '150000000000000' }
  ],
  timestamp: '1650479537.084000111',
  source: 'mainnet-public.mirrornode.hedera.com'
}
```

## Getting started

This project provides multiple options for invocation and retrieval of information - 
it can be run from the command line or started as a REST API Server. To get started,
download the source code and open a command prompt in the project’s directory:

1.  `git clone https://github.com/the-creators-galaxy/hts-circulating-supply-api.git`
2.  `cd hts-circulating-supply-api`

Next, chose your preferred method for invoking the algorithm:

### Retrieve **$CLXY** info using the CLI

To retrieve the current *mainnet* circulating supply of the `$CLXY`, enter the following in the command line:

```bash
node clxy
```
or
```bash
npm run clxy
```

Something similar to the following should be displayed in the console:

```
{
  token: '0.0.859814',
  decimals: 6,
  totalSupply: '1000000000000000',
  circulating: '0',
  treasuryBalances: [
    { treasury: '0.0.849428', balance: '0' },
    { treasury: '0.0.859877', balance: '100000000000000' },
    { treasury: '0.0.859897', balance: '100000000000000' },
    { treasury: '0.0.859903', balance: '349000000000000' },
    { treasury: '0.0.859906', balance: '55000000000000' },
    { treasury: '0.0.859908', balance: '46000000000000' },
    { treasury: '0.0.859910', balance: '200000000000000' },
    { treasury: '0.0.859911', balance: '150000000000000' }
  ],
  timestamp: '1650479537.084000111',
  source: 'mainnet-public.mirrornode.hedera.com'
}
```

### Retrieve any arbitrary token's circulation using the CLI

To retrieve the current supply of any HTS token in the console, enter the following in the command line:

```bash
node cli <mirror host> <token id> [ <treasury id> ...]
```
or
```bash
npm run cli -- <mirror host> <token id> [ <treasury id> ...]
```

Where:

* <**mirror host**> - is the mirror node dns or ip address to query. 
* <**token id**> - is the ID of the token in HAPI format (0.0.0).
* <**treasury id**> - additional IDs of treasury accounts in HAPI format (0.0.0).

And each is separated by a space.

Something similar to the following will appear in the console:

```text
{
   "token":"0.0.859814",
   "decimals":6,
   "totalSupply":"1000000000000000",
   "circulating":"800000000000000",
   "treasuryBalances":[
      {
         "treasury":"0.0.849428",
         "balance":"0"
      },
      {
         "treasury":"0.0.859877",
         "balance":"100000000000000"
      },
      {
         "treasury":"0.0.859897",
         "balance":"100000000000000"
      }
   ],
   "timestamp":"1650483131.128999949",
   "source":"mainnet-public.mirrornode.hedera.com"
}
```

### Run as a Local REST API Server

This project can be run locally as a REST API server, doing so will require an npm install (unlike the examples above) to facilitate the configuration through environmental variables.  

To start the server enter the folloiwng in the command line:

```bash
cp example.env .env
npm install
npm run start:local
```

Browse to `http://localhost:3000` to view the current circulating supply (the url may vary depending on your .env congiguration).  Please see the `example.env` file for details on how to configure the server to provide circulating supply for various tokens on testnet and mainnet.

(note: this is not the same as `npm start` which can be still used if appropriate environmental variables are set inside the environment, the `.env` file will not be read when started with `npm start`)

### Run in Docker

This project can be run in a docker image.  It includes a docker-compose file `server.yml` and `Dockerfile` providing a basic configuration that can be customized by environmental variables. To start the server in docker enter the folloiwng in the command line:

```bash
cp example.env .env
docker-compose build
docker-compose up
```

Browse to `http://localhost:3000` to view the current circulating supply (the url may vary depending on your .env congiguration). Please see the `example.env` file for details on how to configure the server to provide circulating supply for various tokens on testnet and mainnet.

## Authors

[Jason Fabritz](mailto:jason@calaxy.com)

## License

[MIT](/LICENSE)
