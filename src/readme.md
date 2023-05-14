# Folder structure

## assets

Contains images that get compile-time referenced in vue files. The separation what should be here and in ../public is not yet clearly defined.

## components

Contains all vue.js component files.

## constants

Contains different constant values used for rendering components.

## enviroments

Code for handling different runtime enviroments (Browser, Node) and fixes for specific browsers.

## eventbus

Code used for global communications between objects.

## models

TODO: Contains two files that should probably have a better place.

## plugins

A vuex history extension that currently doesn't do anything. (It's supposed to enable undo/redo at some point)

## render-utils

Helpers for renderer that should probably just be in ./renderer

## renderables

Code that defines how different objects are rendered

## renderer

Generic rendering code

## store

Contains vuex definitions, all mutations of the application state.

Managing panels, content packs, ui options etc.

## styles

Global css.

## util

Generic helper functions.
