import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapdown } from "../src/index.js";

// Mock fetch for integration tests
global.fetch = vi.fn();

describe("Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("mapdown", () => {
		it("should crawl sitemap and generate markdown from file", async () => {
			// Mock page fetch
			const mockPageHtml = `
        <html>
          <head>
            <title>Example Page</title>
            <meta name="description" content="Example description">
          </head>
          <body>
            <main>
              <h1>Welcome</h1>
              <p>This is an example page</p>
            </main>
          </body>
        </html>
      `;

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(mockPageHtml),
				headers: { get: () => "text/html" },
			} as Response);

			const result = await mapdown("./test/fixtures/sitemap.xml");

			expect(result).toContain("# Sitemap Crawl Results");
			expect(result).toContain("## Table of Contents");
			expect(result).toContain("✅ [Example Page]");
			expect(result).toContain("# Welcome");
			expect(result).toContain("This is an example page");
			expect(result).toContain("https://example.com/");
		});

		it("should crawl sitemap from URL", async () => {
			const mockSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page1</loc>
  </url>
</urlset>`;

			const mockPageHtml = `
        <html>
          <head><title>Page 1</title></head>
          <body>
            <main><h1>Page 1 Content</h1></main>
          </body>
        </html>
      `;

			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					text: () => Promise.resolve(mockSitemap),
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					text: () => Promise.resolve(mockPageHtml),
					headers: { get: () => "text/html" },
				} as Response);

			const result = await mapdown("https://example.com/sitemap.xml");

			expect(result).toContain("# Sitemap Crawl Results");
			expect(result).toContain("✅ [Page 1]");
			expect(result).toContain("# Page 1 Content");
		});

		it("should handle crawl errors gracefully", async () => {
			// Mock page fetch failure
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 404,
				statusText: "Not Found",
			} as Response);

			const result = await mapdown("./test/fixtures/sitemap.xml");

			expect(result).toContain("# Sitemap Crawl Results");
			expect(result).toContain("❌");
			expect(result).toContain("## Error Details");
		});
	});
});
