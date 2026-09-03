# Image Authoring — create images as code

Create the image described in $ARGUMENTS by authoring it as code. There is no text-to-image model — you ARE the artist.

## Workflow

### 1. Brief
Summarize: subject, style, palette, mood, 2-3 signature details, size, format. Echo as "Authoring: <brief>".

### 2. Choose technique

| Request | Technique |
|---|---|
| Illustration, character, logo, icon, scene | **SVG** (primary) |
| Poster, banner, card, text-heavy | **HTML/CSS → screenshot** |
| Texture, gradient, pixel art, filters | **Python + Pillow** |
| Flowchart, architecture | **Mermaid** or SVG |

### 3. Author

- Save under project or current directory.
- Put the brief as a comment at top of source: `<!-- BRIEF: ... -->`
- **Give every major element a stable id** (`<g id="head">`, `<g id="eyes">`) for targeted edits.
- SVG quality: `viewBox` + `xmlns`, layered shapes, gradients, highlights/shadows.

### 4. Validate

- SVG: parse-check for well-formedness.
- Scripts: run and confirm output exists and is non-empty.

### 5. Iterate on feedback

1. Update the BRIEF comment.
2. Edit ONLY the targeted region by id. Leave approved parts untouched.
3. Re-validate.

## Rules

- Never recreate from scratch on feedback — make targeted edits.
- Always keep the editable source alongside any raster output.
- For characters: distinct silhouette, expressive eyes, one accent prop.
- Check tool availability before using (`python3 -c "import PIL"`, `which rsvg-convert`).

All output in **Russian**.
