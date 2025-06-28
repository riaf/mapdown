import { beforeEach, describe, expect, it, vi } from "vitest";
import { crawlSinglePage } from "../src/crawler.js";

// Mock fetch for URL tests
global.fetch = vi.fn();

describe("Crawler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("crawlSinglePage", () => {
		it("should crawl a single page and extract content", async () => {
			const mockHtml = `
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <main>
              <h1>Main Heading</h1>
              <p>Main content paragraph</p>
            </main>
          </body>
        </html>
      `;

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(mockHtml),
				headers: { get: () => "text/html" },
			} as Response);

			const result = await crawlSinglePage("https://example.com/test");

			expect(result.url).toBe("https://example.com/test");
			expect(result.title).toBe("Test Page");
			expect(result.description).toBe("Test description");
			expect(result.content).toContain("# Main Heading");
			expect(result.content).toContain("Main content paragraph");
			expect(result.headings).toHaveLength(1);
			expect(result.headings[0]).toEqual({ level: 1, text: "Main Heading" });
			expect(result.crawledAt).toBeDefined();
		});

		it("should handle HTTP errors", async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 404,
				statusText: "Not Found",
			} as Response);

			await expect(crawlSinglePage("https://example.com/404")).rejects.toThrow(
				"Failed to load sitemap from URL",
			);
		});

		it("should handle network errors", async () => {
			vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

			await expect(
				crawlSinglePage("https://example.com/error"),
			).rejects.toThrow("Failed to load sitemap from URL");
		});

		it("should handle non-HTML content", async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve("Not HTML"),
				headers: { get: () => "application/json" },
			} as Response);

			await expect(crawlSinglePage("https://example.com/json")).rejects.toThrow(
				"Not HTML content",
			);
		});
	});
});
