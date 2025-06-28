import {
	extractContent,
	extractContentWithBrowser,
} from "./content-extractor.js";
import { convertHtmlToMarkdown } from "./markdown-converter.js";

export interface PageResult {
	url: string;
	title: string;
	description?: string;
	content: string;
	headings: Array<{ level: number; text: string }>;
	crawledAt: string;
}

export async function crawlSinglePage(url: string): Promise<PageResult> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const contentType = response.headers.get("content-type") || "";
		if (!contentType.toLowerCase().includes("text/html")) {
			throw new Error("Not HTML content");
		}

		const html = await response.text();

		// Check if this is a SPA that needs browser rendering
		const isSPA =
			html.includes("__next") ||
			html.includes("__NEXT_DATA__") ||
			html.includes('id="root"') ||
			html.includes('id="app"') ||
			html.includes("ng-version") || // Angular
			html.includes("data-reactroot") || // React
			html.includes("v-cloak"); // Vue

		let extracted: import("./content-extractor.js").ContentExtractResult;
		if (isSPA) {
			// Use browser-based extraction for SPAs
			extracted = await extractContentWithBrowser(url);
		} else {
			// Use regular HTML parsing for static content
			extracted = extractContent(html);
		}

		const markdownContent = convertHtmlToMarkdown(extracted.content);

		return {
			url,
			title: extracted.title,
			description: extracted.description,
			content: markdownContent,
			headings: extracted.headings,
			crawledAt: new Date().toISOString(),
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to load sitemap from URL: ${errorMessage}`);
	}
}
