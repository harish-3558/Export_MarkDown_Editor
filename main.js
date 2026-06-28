// Step 1: Grab all our HTML elements
const editor     = document.getElementById("editor");
const preview    = document.getElementById("preview");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");

// Export buttons
const exportMdBtn   = document.getElementById("export-md");
const exportHtmlBtn = document.getElementById("export-html");
const exportTxtBtn  = document.getElementById("export-txt");


// ── EXPORT FUNCTIONS ──────────────────────────────────────
// These 3 functions let users download their content as files

// Helper: creates a file and downloads it automatically
function downloadFile(filename, content, type) {
  // Create a hidden link element
  const link = document.createElement("a");

  // Create a "blob" — a file-like object in the browser
  const blob = new Blob([content], { type: type });

  // Turn the blob into a URL the browser can download
  link.href = URL.createObjectURL(blob);

  // Set the filename for the download
  link.download = filename;

  // Click it automatically (invisible to the user)
  link.click();

  // Clean up the URL from memory
  URL.revokeObjectURL(link.href);
}

// Export 1: Download as .md (raw Markdown text)
exportMdBtn.addEventListener("click", () => {
  const content = editor.value; // just the raw text the user typed
  downloadFile("document.md", content, "text/markdown");
});

// Export 2: Download as .html (full HTML page with styles)
exportHtmlBtn.addEventListener("click", () => {
  // We wrap the preview HTML inside a full HTML page
  // so it looks good when opened in a browser
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Document</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #222; line-height: 1.75; }
    h1 { font-size: 26px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
    h2 { font-size: 20px; margin-top: 24px; }
    h3 { font-size: 17px; margin-top: 18px; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; color: #c0392b; font-family: monospace; }
    pre  { background: #1e1e2e; color: #cdd6f4; padding: 14px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #6c63ff; padding: 8px 14px; background: #f4f3ff; border-radius: 0 6px 6px 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f5f5f5; }
    a { color: #6c63ff; }
  </style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`;
  downloadFile("document.html", content, "text/html");
});

// Export 3: Download as .txt (plain text, no Markdown symbols)
exportTxtBtn.addEventListener("click", () => {
  // preview.innerText strips all HTML tags and gives plain text
  const content = preview.innerText;
  downloadFile("document.txt", content, "text/plain");
});


// ── MARKDOWN PARSER ───────────────────────────────────────
// Converts Markdown text → HTML, line by line

// Escape HTML — prevents < > & from breaking the output
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Inline formatting — bold, italic, code, links, strikethrough
function inlineFormat(text) {
  text = escapeHtml(text);
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

// Check if a line is a special Markdown line (not a paragraph)
function isSpecialLine(line) {
  return (
    line.startsWith("#") ||
    line.startsWith(">") ||
    line.startsWith("```") ||
    /^[-*+]\s/.test(line) ||
    /^\d+\.\s/.test(line) ||
    /^[-*]{3,}$/.test(line.trim())
  );
}

// Main parser — goes through each line and builds HTML
function parseMarkdown(text) {
  const lines = text.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (``` ... ```)
    if (line.startsWith("```")) {
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += escapeHtml(lines[i]) + "\n";
        i++;
      }
      html += `<pre><code>${code}</code></pre>`;
      i++;
      continue;
    }

    // Horizontal rule (--- or ***)
    if (/^[-*]{3,}$/.test(line.trim())) {
      html += "<hr>";
      i++;
      continue;
    }

    // Headings (# ## ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html += `<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // Heading with no text yet (just # alone — avoids freeze)
    if (/^#{1,6}$/.test(line.trim())) {
      html += `<h1></h1>`;
      i++;
      continue;
    }

    // Blockquote (> text)
    if (line.startsWith("> ")) {
      let quote = "";
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote += lines[i].slice(2) + " ";
        i++;
      }
      html += `<blockquote>${inlineFormat(quote.trim())}</blockquote>`;
      continue;
    }

    // Unordered list (- item or * item)
    if (/^[-*+]\s/.test(line)) {
      html += "<ul>";
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        html += `<li>${inlineFormat(lines[i].slice(2))}</li>`;
        i++;
      }
      html += "</ul>";
      continue;
    }

    // Ordered list (1. item)
    if (/^\d+\.\s/.test(line)) {
      html += "<ol>";
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        html += `<li>${inlineFormat(lines[i].replace(/^\d+\.\s/, ""))}</li>`;
        i++;
      }
      html += "</ol>";
      continue;
    }

    // Table (| col | col |)
    if (line.includes("|") && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
      const headers = line.split("|").map(c => c.trim()).filter(Boolean);
      html += "<table><thead><tr>";
      html += headers.map(h => `<th>${inlineFormat(h)}</th>`).join("");
      html += "</tr></thead><tbody>";
      i += 2;
      while (i < lines.length && lines[i].includes("|")) {
        const cells = lines[i].split("|").map(c => c.trim()).filter(Boolean);
        html += "<tr>" + cells.map(c => `<td>${inlineFormat(c)}</td>`).join("") + "</tr>";
        i++;
      }
      html += "</tbody></table>";
      continue;
    }

    // Blank line → skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (normal text)
    let paragraph = "";
    while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i])) {
      paragraph += lines[i] + " ";
      i++;
    }
    if (paragraph.trim()) {
      html += `<p>${inlineFormat(paragraph.trim())}</p>`;
    } else {
      i++; // safety: always move forward
    }
  }

  return html;
}


// ── STATS ─────────────────────────────────────────────────
// Count words and characters and show in footer
function updateStats(text) {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  charCountEl.textContent = `${chars} character${chars !== 1 ? "s" : ""}`;
}


// ── LISTEN FOR TYPING ─────────────────────────────────────
// Every time the user types, update the preview + stats
editor.addEventListener("input", () => {
  const markdown = editor.value;
  preview.innerHTML = parseMarkdown(markdown);
  updateStats(markdown);
});


// ── DEFAULT TEXT ──────────────────────────────────────────
// Show an example when the page first loads
const defaultText = `# Hello, Markdown! 👋

Welcome to your **Markdown Editor** with export support.

## What you can do

- Write *italic* and **bold** text
- Add \`inline code\` easily
- Export as **.md**, **.html**, or **.txt**

## Code block

\`\`\`
function greet(name) {
  return "Hello, " + name;
}
\`\`\`

> This is a blockquote — great for quotes!

## Table

| Name  | Role     |
|-------|----------|
| Alice | Designer |
| Bob   | Dev      |

---

[Visit Markdown Guide](https://www.markdownguide.org)
`;

editor.value = defaultText;
preview.innerHTML = parseMarkdown(defaultText);
updateStats(defaultText);
