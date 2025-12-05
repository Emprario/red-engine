# Red Engine

Red engine is the backend for the Videogame Media Project

## Backend Tech Stack

Node.js version 24.7.0 or more with these extra modules

    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "debug": "~2.6.9",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.15.3"

## How to run

1. Prepare a **MariaDB** database (**the project uses MARIADB specific functions**).
2. Create an empty database
3. Run the SQL script provided (`/script.sql`). It will create necessary tables and populate DB.
4. Create a `/.env` file with the provided template. Default values are given to make an example - consider to change
   them.

```dotenv
SECRET=BadSecretKey4Jwt
DB_PASSWORD=secret
DB_USER=root
DB_NAME=awp_vgm
HOST=localhost
SALT_ROUNDS=10
PORT=3000
```

5. Clone the repo : `git clone https://github.com/Emprario/red-engine.git`
6. Go to repo directory
7. Run as dev (enable debugging):
    + Linux/MacOS: `npm run devel`
    + Windows (require powershell script enabled): `npm run win`
8. Run for production (no debugging logs): `npm run start`