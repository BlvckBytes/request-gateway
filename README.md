# request-gateway

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Proxy requests between a common HTTP(S) endpoint using standard ports, and internal services, designated with custom ports. Routing happens based on protocol, domain and path, where paths offer full *regex* support.

## Table of Contents
* [Installation](#installation)
* [Configuration](#configuration)
  * [Common Settings](#common-settings)
  * [Routes](#routes)

## Installation

Just clone this repo, install the dependencies, build and run!

```bash
git clone https://github.com/BlvckBytes/request-gateway.git
cd request-gateway
yarn install
yarn run build
yarn run start
```

## Configuration

Within the `src/` directory, you'll find a `config.ini`.

### Common Settings

```ini
[settings]
upgradeUnknownRequests=True
letsEncryptDir=/etc/letsencrypt/live/blvckbytes.dev
```

`upgradeUnknownRequests` specifies whether or not a unsecure HTTP request will be "upgraded" (redirected to HTTPS protocol), if it has no known path specified.

`letsEncryptDir` needs to point to your lets-encrypt live folder regarding the domain you're looking to attach this gateway to. If you're not using lets-encrypt, either adjust the code, or just create a folder with sym-links having the required filenames.

### Routes

```ini
; DigitalMedic page
[dm.blvckbytes.dev,www.dm.blvckbytes.dev]

; DigitalMedic API
\/api(\/.*)?=127.0.0.1:5004

; Relay other requests to apache SSL site
.*=127.0.0.1:5003
; .*=127.0.0.1:5002
```

Here you can see a pretty standard configuration, which does the following:

* ✅ Listen on the domain `dm.blvckbytes.dev`, or the www-version `www.dm.blvckbytes.dev`. Multiple domains are separated by a comma `,`.
* ✅ Match all paths starting with `/api`, where `(\/.*)?` ensures that only a slash followed by sub-paths may follow, and `api` stays untouched.
* ✅ Re-Route those `api`-requests to `127.0.0.1:5004`, which is an HTTPS endpoint.
* ✅ All remaining requests are relayed to `127.0.0.1:5003`, where I've uncommented the `5002` endpoint, which would be HTTP. HTTP is upgraded automatically (`upgradeUnknownRequests`), so this line can be omitted.

Domain-Sections are interpreted top-down, where the first matching path is used. If you want to have separate endpoints for HTTP and HTTPS, specify the exact same regex twice, where the first entry is HTTPS and the second is HTTP.