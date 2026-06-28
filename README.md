# 📝 Markdown Editor

A lightweight, real-time Markdown editor with live preview and export support. Built with HTML, Tailwind CSS, and JavaScript — no frameworks, no build tools, just open and use.

---

## Features

✨ **Real-time Preview** - See your Markdown rendered instantly as you type

📊 **Markdown Support** - Full support for common Markdown syntax:
- Headings (H1-H6)
- Bold, italic, and strikethrough text
- Code blocks and inline code
- Blockquotes
- Unordered and ordered lists
- Tables
- Horizontal rules
- Links

⬇️ **Export Options** - Download your content in 3 formats:
- `.md` — raw Markdown file
- `.html` — full HTML page ready to open in any browser
- `.txt` — plain text with no Markdown symbols

📈 **Live Statistics** - Word count and character count in the footer

🎯 **Clean UI** - Split-pane interface built with Tailwind CSS

⚡ **No Setup Required** - Just open `index.html` with Go Live and start writing

---



## Project Structure

```
├── index.html    # Layout, Tailwind classes, and preview styles
├── main.js       # All logic — Markdown parser, export, stats
└── README.md     # This file
```

---

## How It Works

1. **Editor** - Type Markdown in the left textarea
2. **Parser** - `parseMarkdown()` converts text to HTML line by line
3. **Preview** - Rendered HTML appears instantly on the right
4. **Export** - Click any export button to download your file

---

## Export Details

| Button | File | What's inside |
|--------|------|---------------|
| ⬇️ .md | `document.md` | Your raw Markdown text |
| ⬇️ .html | `document.html` | Styled HTML page |
| ⬇️ .txt | `document.txt` | Plain text, no symbols |

---

## Technologies Used

- **HTML5** - Page structure
- **Tailwind CSS** - Styling via CDN 
- **JavaScript** - Markdown parser and export logic
- **DOM API** - For real-time updates and file downloads

