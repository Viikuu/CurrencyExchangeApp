# Description

## Project setup

Setup proper setup environment variables in the `.env` file in both frontend and backend directory. You can use the `.env.example` as a reference.

If you are using Docker, you can start application by running the following command:

### Hot reload mode (does not work on Windows)

```bash
docker compose --profile dev up --build
```

In case if you are using Docker on Windows, you can use docker compose to create and start postgress database using

```bash
docker compose up --build
```

And later on run the application directly in frontend directory:

```bash
npm install
npm run dev
```

And backend directory:

```bash
npm install
npm run start:dev
```

### Near production mode

```bash
docker compose --profile prod up --build
```

### Setup without Docker

Without Docker, you have to set up your own PostgreSQL database and setup its connection in the `.env` file.

### Hot reload mode without Docker

Run the application directly in frontend directory:

```bash
npm install
npm run dev
```

And backend directory:

```bash
npm install
npm run start:dev
```

### Near production mode without Docker

Run the application directly in frontend directory:

```bash
npm install
npm run build
npm run start
```

And backend directory:

```bash
npm install
npm run start
```

To run backend tests use following command in the backend directory:

```bash
npm install
npm run test
```
