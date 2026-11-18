# Primitive Pinball

A small browser pinball game built with React. Drag the plunger down and release
it to launch the ball. Press **A** to flip the left paddle, **D** to flip the
right paddle, or **Space** to flip both. The on-screen button also flips both.
Score 100 points each time the ball hits a bumper.

## Requirements

- Node.js 22.22.2+, 24.15+, or 26+
- npm

## Run locally

From the project directory:

```sh
npm ci
npm start
```

Open [http://localhost:5173](http://localhost:5173). Leave the terminal running
while you play.

## Test

Run the automated tests once:

```sh
npm test
```

For watch mode while editing:

```sh
npm run test:watch
```

## Build and deploy

Create a production build:

```sh
npm run build
```

The static site is written to `dist/`. Upload the contents of that folder to
any static web host. To check the production build locally, run:

```sh
npm run preview
```

The build uses relative asset paths, so it can also be hosted from a
subdirectory.
