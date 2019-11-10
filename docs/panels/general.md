[Help](../index.md) / [Toolbox](../toolbox.md) / General panel

# The General panel

![The General panel](general.png 'The General panel')

This panel allows you to configure the generator, the textbox, and contains features that just didn't fit anywhere else.

### Low quality preview

In the live preview, DDDG by default uses assets that are slightly lossy compressed. This is almost unnoticeable, but helps cut down on download times significantly. This has **no** influence on the final render. That will always use the fully quality assets. If you want to use those in the preview too, (and have enough bandwidth) uncheck this box.

### Compare to last download

This shows the last downloaded render in the preview. That can be useful for checking your character positions/poses are correct, e.g.

If clicking the button again or doing changing any rendering option will revert back to the preview.

### Content Packs

Content Packs allow you to load addition content to the tool. Clicking this button opens the [Content Packs](general/content_packs.md) sub-panel

### NSFW mode

If you have played DDLC, (which you really should before using this editor) you know that it contains several disturbing images. Those are are not very often used and not everyone wants to be constantly confronted by those images.

If you enable NSFW mode, you will get access to all those assets.

Disabling NSFW mode will immediately remove all NSFW assets from the scene, by falling back to non-NSFW assets.

## Textbox options

### Textbox visible

Enables or disables the textbox completely.

### Textbox corrupt

Shows a corrupt textbox. Comparison:

![Corrupt textbox on the bottom](general_corrupt.png 'Corrupt textbox on the bottom')

### Person talking

Here, you can select which person should be shown in the namebox on top of the textbox. Select 'No-one' to hide the namebox. Select 'Other' to display the text entered in `Other name`

### Other name

If you want to display another name in the namebox, you can enter it here. If you enter something here, `Person talking` will automatically set to 'Other'.

### Controls visible

The controls are the buttons `History`, `Skip`, `Auto`, `Save`, `Load` and `Settings` at the bottom of the textbox. This option determines if they are rendered at all. Comparison:

![Hidden controls at the bottom](general_controls_visible.png 'Hidden controls at the bottom')

### Able to skip

Displays the `Skip` textbox control as enabled. (Of course, either way, I has no real impact in the generator and is purely cosmetic)

![Not able to skip at the bottom](general_controls_skip.png 'Not able to skip at the bottom')

### Dialog

This is the text that is shown inside the textbox. Keep in mind that the game usually shows quotes around dialog that is not happening internally. DDDG does **not** automate this!

![Dialog](general_dialog.png 'Dialog')

To use the edited text style from the game, write the text in brackets, like this: `["Text"]`

![Edited dialog](general_dialog_edited.png 'Edited dialog')
