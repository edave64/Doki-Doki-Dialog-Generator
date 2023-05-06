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

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
