import { describe, expect, it, vi } from "vitest";
import { mapdown } from "../src/index.js";
import type { ProgressInfo } from "../src/progress-tracker.js";

// Mock the crawler module
vi.mock("../src/crawler.js", () => ({
	crawlSinglePage: vi.fn().mockImplementation(async (url: string) => {
		// Simulate some delay
		await new Promise((resolve) => setTimeout(resolve, 10));

		if (url.includes("error")) {
			throw new Error("Failed to crawl page");
		}

		return {
			url,
			title: `Page for ${url}`,
			description: `Description for ${url}`,
			content: `Content from ${url}`,
			headings: [],
			crawledAt: new Date().toISOString(),
		};
	}),
}));

// Mock the sitemap parser
vi.mock("../src/sitemap-parser.js", () => ({
	parseSitemapXml: vi
		.fn()
		.mockResolvedValue([
			{ loc: "https://example.com/page1" },
			{ loc: "https://example.com/page2" },
			{ loc: "https://example.com/error-page" },
			{ loc: "https://example.com/page3" },
		]),
}));

// Mock the sitemap loader
vi.mock("../src/sitemap-loader.js", () => ({
	loadSitemapFromUrl: vi.fn().mockResolvedValue("<xml>mock sitemap</xml>"),
}));

describe("Crawl with Progress", () => {
	it("should report progress during crawling", async () => {
		const progressUpdates: ProgressInfo[] = [];

		const result = await mapdown(
			"https://example.com/sitemap.xml",
			(progress) => {
				progressUpdates.push({ ...progress });
			},
		);

		// Should have received progress updates
		expect(progressUpdates.length).toBeGreaterThan(0);

		// First update should be after first page
		expect(progressUpdates[0]).toEqual({
			total: 4,
			completed: 1,
			failed: 0,
			percentage: 25,
		});

		// Final update should show 3 completed, 1 failed
		const lastUpdate = progressUpdates[progressUpdates.length - 1];
		expect(lastUpdate).toEqual({
			total: 4,
			completed: 3,
			failed: 1,
			percentage: 100,
		});

		// Result should contain English text
		expect(result).toContain("Sitemap Crawl Results");
		expect(result).toContain("Table of Contents");
		expect(result).toContain("Content");
		expect(result).toContain("Error Details");
	});
});
