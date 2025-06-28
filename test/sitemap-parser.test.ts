import { describe, expect, it } from "vitest";
import { parseSitemapXml } from "../src/sitemap-parser.js";

describe("Sitemap Parser", () => {
	describe("parseSitemapXml", () => {
		it("should parse simple sitemap XML with one URL", async () => {
			const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
</urlset>`;

			const result = await parseSitemapXml(sitemapXml);

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				loc: "https://example.com/",
			});
		});

		it("should parse sitemap XML with multiple URLs and metadata", async () => {
			const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2024-01-02</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

			const result = await parseSitemapXml(sitemapXml);

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				loc: "https://example.com/",
				lastmod: "2024-01-01",
				changefreq: "daily",
				priority: 1.0,
			});
			expect(result[1]).toEqual({
				loc: "https://example.com/about",
				lastmod: "2024-01-02",
				changefreq: "weekly",
				priority: 0.8,
			});
		});

		it("should handle empty sitemap", async () => {
			const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

			const result = await parseSitemapXml(sitemapXml);

			expect(result).toHaveLength(0);
		});

		it("should throw error for invalid XML", async () => {
			const invalidXml = "not valid xml";

			await expect(parseSitemapXml(invalidXml)).rejects.toThrow(
				"Failed to parse sitemap XML",
			);
		});

		it("should throw error for XML without urlset", async () => {
			const invalidSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<invalid>
  <data>test</data>
</invalid>`;

			await expect(parseSitemapXml(invalidSitemapXml)).rejects.toThrow(
				"Invalid sitemap format",
			);
		});
	});
});
