# rollup-plugin-zxp
A Rollup wrapper of [zxp-sign-cmd](https://www.npmjs.com/package/zxp-sign-cmd) to bundle your Rollup output into a signed `.zxp` file, made for Adobe CEP extensions.


# Installation
```js
npm install rollup-plugin-zxp
```

# Setup
With Vite (vite.config.js):
```js
import { defineConfig } from 'vite';
import zxp from 'rollup-plugin-zxp';

export default defineConfig({
    build: {
        rollupOptions: {
            plugins: [
                zxp(), // Options required, see below
            ],
        },
    }
});
```

With Rollup (rollup.config.js):
```js
import zxp from 'rollup-plugin-zxp';

export default {
    plugins: [
        zxp(), // Options required, see below
    ],
};
```
<br><br>



# Recommended Use
Create a `.env` in your project root and add the following variables:
```js
CERT_COUNTRY=US
CERT_PROVINCE=CA 
CERT_ORG=My Company
CERT_NAME=My Name
CERT_PASSWORD=myPassword
CERT_EMAIL=myEmail@email.com
```

Install the [dotenv](https://www.npmjs.com/package/dotenv) package to load the variables from the `.env` file:
```js
npm install dotenv --save
```

At the top of your `rollup.config.js` or `vite.config.js` file import and initialize dotenv
```js
import * as dotenv from 'dotenv';
dotenv.config();
```
Later on inside the same file, pass your information to the plugin:
```js
zxp({
    selfSignedCert: {
        country: process.env.CERT_COUNTRY,
        province: process.env.CERT_PROVINCE,
        org: process.env.CERT_ORG,
        name: process.env.CERT_NAME,
        email: process.env.CERT_EMAIL,
        password: process.env.CERT_PASSWORD
    },
    sign: {
        password: process.env.CERT_PASSWORD
    },
    gitIgnore: [`.env`, `*.p12`]
})
```
To build and sign your extension, run `npm run build`.

<br><br>
# What and When?
To create a certificate only:

```js
zxp({
    selfSignedCert: {
        country: process.env.CERT_COUNTRY,
        province: process.env.CERT_PROVINCE,
        org: process.env.CERT_ORG,
        name: process.env.CERT_NAME,
        email: process.env.CERT_EMAIL,
        password: process.env.CERT_PASSWORD,
        output: 'path/to/cert.p12'
    },
})
```

To sign with an existing certificate:

```js
zxp({
    sign: {
        cert: 'path/to/cert.p12',
        password: process.env.CERT_PASSWORD
    }
})
```

To create a certificate and use it for signing (recommended).
```js
zxp({
    selfSignedCert: {
        country: process.env.CERT_COUNTRY,
        province: process.env.CERT_PROVINCE,
        org: process.env.CERT_ORG,
        name: process.env.CERT_NAME,
        email: process.env.CERT_EMAIL,
        password: process.env.CERT_PASSWORD // Password must match
    },
    sign: {
        password: process.env.CERT_PASSWORD // Password must match
    }
})
```

Since we're dealing with personal information in your .env file, it is recommended that you instruct the plugin to create or edit a .gitignore file with the following keys:

```js
zxp({
    gitIgnore: [`.env`, `*.p12`]
})
```
Now, the `.env` file and the `.p12` certificate file will be ignored by Git.


<br><br>
# Options

`overrideCert?` - If true, it will override the certificate file if it already exists (default: true)

`overrideZXP?` - If true, it will override the `.zxp` file if it already exists (default: true)

## selfSignedCert

Type: `object`

- `country` - The country of the certificate owner.
- `province` - The province of the certificate owner.
- `org` - The organization of the certificate owner.
- `name` - The name of the certificate owner.
- `email` - The email of the certificate owner.
- `password` - The password of the certificate owner.
- `state?` - The state of the certificate owner.
- `city?` - The city of the certificate owner.
- `output?` - The path to the `.p12` certificate file (default: `.secret/cert.p12`)

## sign

Type: `object`

- `password` - The password of the certificate owner.
- `input?` - The dist folder to be signed (default: `dist`)
- `output?` - The path to the `.zxp` file to be signed (default: working directory)
- `cert?` - The path to the `.p12` certificate file (default: certOptions.output)

# License
MIT