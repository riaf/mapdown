# Mapdown

A CLI tool to crawl sitemap.xml and convert all pages to LLM-friendly Markdown.

## Features

- Parse sitemap.xml files from websites
- Extract content from web pages
- Convert HTML content to clean Markdown format
- Optimized for LLM consumption

## Installation

Install globally to use the CLI command:

```bash
npm install -g mapdown
```

Or use directly without installation:

```bash
npx mapdown [sitemap-url-or-file]
```

## Usage

### Basic Usage

```bash
# Using npx (recommended)
npx mapdown https://example.com/sitemap.xml

# If installed globally
mapdown https://example.com/sitemap.xml

# Using local sitemap file
mapdown ./sitemap.xml
```

### Examples

```bash
# Crawl a website's sitemap
npx mapdown https://example.com/sitemap.xml

# Process a local sitemap file
npx mapdown ./my-sitemap.xml
```

The tool will output consolidated Markdown content with:
- Table of contents
- Page metadata (title, description, URL)
- Clean content extracted from each page
- Progress tracking during crawling

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Requirements

- Node.js >= 18.0.0

## License

MIT