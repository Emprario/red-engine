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

1. Clone the repo : `git clone https://github.com/Emprario/red-engine.git`
2. Go to repo directory
3. Run (enable debugging)
   + Linux/MacOS: `npm run devel`
   + Windows: `npm run win` (require powershell script enabled)
3. Run (production): `npm run start`