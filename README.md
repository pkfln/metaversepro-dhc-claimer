# MetaversePRO DHC Claimer

This is a script to automate the claiming & restaking of wsMeta in the MetaversePRO DHC (6, 6) stake pool.

## Requirements

- Node.js
- yarn
- Staked wsMeta in DHC

## Environment variables

| Variable       | Description                                                           |
|----------------|-----------------------------------------------------------------------|
| PRIVATE_KEY *  | Your wallet's private key                                             |
| RPC_URL        | Binance Smart Chain JSON-RPC Endpoint (default: https://bscrpc.com/)  |
| LOG_LEVEL      | Min. log level - debug, info, warn, error (default: info)             |
| TIMEOUT_OFFSET | Interval offset in seconds (default: 30)                              |
| CLAIM_INTERVAL | Claim interval in seconds (default: 28800)                            |
| RETRY_INTERVAL | Retry interval between failed claim attempts in seconds (default: 5)  |

_* = Required_

## Installation

1. Install dependencies with `yarn`
2. Rename the .env_example file to .env and adjust the variables
3. Run `yarn build` to build the app
4. Run `yarn start` to start the app

## Docker

A Dockerfile is available for this project. You can build the image with `docker build -t metaversepro-dhc-claimer .` and run it with `docker run -te PRIVATE_KEY=<your private key> metaversepro-dhc-claimer`.

## Docker compose example

```Dockerfile
version: '3.9'
services:
  metaversepro-dhc-claimer:
    build: github.com/pkfln/metaversepro-dhc-claimer
    restart: always
    environment:
      - PRIVATE_KEY=<your private key>
```
