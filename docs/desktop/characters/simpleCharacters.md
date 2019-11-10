[Help](../../index.md) / [Desktop](../../desktop.md) / [Custom characters](../characters.md) / Simple characters

# Simple characters

Simple characters are a form of content pack completely exclusive to the desktop version. They are meant to give you
the ability to add your own custom characters, but without the needing to learn the more complex
[JSON format](json.md).

To see how a simple custom character works, there is `sample` character included in the tool.

A simple custom character is created by just adding a new folder to the `custom_characters` folder. (To access it, select "DDDG" -> "Open background folder in file manager" in the menu).

Into the folder, you can place all the images that make up the character. The tool will just layer these images over top of each other, so they should all be the same size (960x960 pixels)

Images with filenames that start with letters or symbols will be heads.

Images with filenames that start with numbers will be poses.

So a very simple character might look like this:

- a.png
- b.png
- c.png
- 1.png
- 2.png

This will result in the following character:

- 3 available heads (a.png, b.png, c.png)
- No additional styles
- One that doesn't have a name:
- Has 2 static poses (1.png and 2.png)

## Split poses

A file that starts with a number and ends with either l or r will be part of a split pose. Files with l will be used for the left side, files with r for the right.

So with a few split poses, our character might look like this:

- a.png
- b.png
- c.png
- 1.png
- 2.png
- 3l.png
- 3r.png
- 4l.png
- 4r.png

This will result in the following character:

- 3 available heads (a.png, b.png, c.png)
- No additional styles
- One that doesn't have a name:
- Has 2 static poses (1.png and 2.png)
- Has one split pose, with 2 images for the left side (3l.png and 4l.png) and 2 on for the right (3r.png and 4r.png)

# Outfits

Poses can be separated into different styles, representing different outfits.

To do this, just add some text after the number in the pose name. Keep in mind that if there is an l or an r at the
end, that will be interpreted as indicating a split pose, so take care to avoid any conflicts there.

For example, a character folder might look like this:

- a.png
- b.png
- c.png
- 1.png
- 2.png
- 3l.png
- 3r.png
- 4l.png
- 4r.png
- 1b.png
- 2b.png

This will result in the following character:

- 3 available heads (a.png, b.png, c.png)
- 2 Styles:
  - One that doesn't have a name:
    - Has 2 static poses (1.png and 2.png)
    - And one split pose, with 2 images for the left side (3l.png and 4l.png) and 2 on for the right (3r.png and
      4r.png)
  - One with the name "b": - Has 2 static poses (1b.png and 2b.png)
