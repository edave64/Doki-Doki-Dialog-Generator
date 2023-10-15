# Doki Doki Dialog Generator

This tools allows you to create scenes that look like they are from the game Doki Doki Literature Club.

A desktop version for window and linux is available [here](https://github.com/edave64/dddg-desktop-version/releases).

The web version is hosted [here](https://edave64.github.io/Doki-Doki-Dialog-Generator/release/).

## Project setup

To get all dependencies of the project, run:

```sh
npm install
```

The repository only contains full quality png images. A proper web build contains png and webp both lossless and lossy compressed. To generate these files, run:

```sh
npm run assetConversions
```

This takes a while initialy, but only needs to be repeated when new pngs are added. It also doesn't try to convert files that are already done, so it is faster on subsequent runs.

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build:web
```

## Dependencies

Here, we list the dependencies that are used in the code and what they do. Everything not listed here is not required to contribute.

### [TypeScript](https://www.typescriptlang.org)

All code is written in typescript, an typed variant of javascript. At least basic knowledge is recommend learning for any code changes.

### [Vue](https://vuejs.org)

Used to create and manage the GUI. Everything in the components folder uses this and it is recommended learning for anyone who wants to make UI changes.

### [VueX](https://vuex.vuejs.org)

A state management tool that stores the current state of the application. All of the panels, objects, positions, etc. Basically everything that ends up in a save file.
Recommended it learn for anyone who wants to change the behaviors of objects.
The mayority of code using it is in the "store" folder, although the "components" frequently query and send commands to the stores.

### [Mitt](https://github.com/developit/mitt)

A simple event bus to allow multiple components to communicate without needing to directly connect all components. Generally isn't needed for most tasks, but also trivial enough that learning it isn't a big deal.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) - A free code editor
- [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) - An extension that enables support for vue components
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - An extension that enables automatic prettier formatting on save
