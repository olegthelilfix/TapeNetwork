# PPTX Maker — create a PowerPoint presentation

Create a `.pptx` presentation based on $ARGUMENTS (a topic, outline, URL to extract content from, or pasted text).

## Workflow

### 1. Brief
Summarize: topic, audience, tone, slide count estimate, key messages.
Echo as "Deck brief: <summary>" so the user can correct course.

### 2. Outline
Propose a slide-by-slide outline:
```
1. [title-slide] Title + subtitle
2. [agenda] What we'll cover
3. [content] Key point 1
...
N. [closing] Summary + CTA
```

Wait for user approval before generating.

### 3. Generate with python-pptx

Use `python-pptx` to create the deck. Install if needed: `pip install python-pptx`.

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
```

For each slide:
- Choose appropriate layout (title, content, two-column, image+text)
- Set font sizes: titles 28-36pt, body 18-24pt, captions 14pt
- Use consistent margins and alignment
- Add speaker notes with talking points

### 4. Style guidelines

- **Colors:** use a cohesive palette. Default to professional blues/grays unless specified.
- **Fonts:** stick to 2 fonts max (one for headings, one for body).
- **Images:** if the user provides images, place them with proper sizing. Otherwise use clean layouts.
- **Charts:** use `python-pptx` chart support for data visualization.
- **Less is more:** max 6 bullet points per slide, max 6 words per bullet.

### 5. Save and present

Save to the current directory or user-specified path. Report the file path and slide count.

## Tips

- For URL-based content: fetch the page, extract key points, structure into slides.
- For long text: identify main themes, create one slide per theme.
- For data-heavy decks: prefer charts and tables over text.
- Always include a title slide and a closing/summary slide.

All output in **Russian**.
