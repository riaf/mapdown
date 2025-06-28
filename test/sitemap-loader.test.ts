import { describe, expect, it, vi } from "vitest";
import {
	loadSitemapFromFile,
	loadSitemapFromUrl,
} from "../src/sitemap-loader.js";

// Mock fetch for URL tests
global.fetch = vi.fn();

describe("Sitemap Loader", () => {
	describe("loadSitemapFromFile", () => {
		it("should load sitemap content from file", async () => {
			const result = await loadSitemapFromFile("./test/fixtures/sitemap.xml");
			expect(result).toBe(
				'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n  </url>\n</urlset>',
			);
		});

		it("should throw error when file does not exist", async () => {
			await expect(loadSitemapFromFile("./non-existent.xml")).rejects.toThrow(
				"Failed to load sitemap from file",
			);
		});
	});

	describe("loadSitemapFromUrl", () => {
		it("should load sitemap content from URL", async () => {
			const mockXmlContent = '<?xml version="1.0"?><urlset></urlset>';
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(mockXmlContent),
			} as Response);

			const result = await loadSitemapFromUrl(
				"https://example.com/sitemap.xml",
			);
			expect(result).toBe(mockXmlContent);
		});

		it("should throw error when URL request fails", async () => {
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 404,
			} as Response);

			await expect(
				loadSitemapFromUrl("https://example.com/sitemap.xml"),
			).rejects.toThrow("Failed to load sitemap from URL");
		});
	});
});
