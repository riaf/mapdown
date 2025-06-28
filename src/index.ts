import { crawlSinglePage, type PageResult } from "./crawler.js";
import { type ProgressCallback, ProgressTracker } from "./progress-tracker.js";
import { loadSitemapFromFile, loadSitemapFromUrl } from "./sitemap-loader.js";
import { parseSitemapXml, type SitemapUrl } from "./sitemap-parser.js";
import { isUrl } from "./url-validator.js";

export interface CrawlResult {
	successCount: number;
	errorCount: number;
	totalCount: number;
	pages: PageResult[];
	errors: Array<{ url: string; error: string; timestamp: string }>;
}

export async function mapdown(
	source: string,
	onProgress?: ProgressCallback,
): Promise<string> {
	// Load sitemap
	const sitemapContent = isUrl(source)
		? await loadSitemapFromUrl(source)
		: await loadSitemapFromFile(source);

	// Parse sitemap URLs
	const urls = await parseSitemapXml(sitemapContent);

	// Crawl all pages
	const crawlResult = await crawlPages(urls, onProgress);

	// Generate markdown output
	return formatResult(crawlResult, source);
}

async function crawlPages(
	urls: SitemapUrl[],
	onProgress?: ProgressCallback,
): Promise<CrawlResult> {
	const pages: PageResult[] = [];
	const errors: Array<{ url: string; error: string; timestamp: string }> = [];

	const tracker = new ProgressTracker(urls.length, onProgress);

	for (const sitemapUrl of urls) {
		try {
			const pageResult = await crawlSinglePage(sitemapUrl.loc);
			pages.push(pageResult);
			tracker.incrementCompleted();
		} catch (error) {
			errors.push({
				url: sitemapUrl.loc,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			});
			tracker.incrementFailed();
		}
	}

	return {
		successCount: pages.length,
		errorCount: errors.length,
		totalCount: urls.length,
		pages,
		errors,
	};
}

function formatResult(result: CrawlResult, source: string): string {
	const timestamp = new Date().toISOString();

	const header = `# Sitemap Crawl Results

**Source**: ${source}
**Generated**: ${timestamp}
**Total Pages**: ${result.totalCount}
**Successful**: ${result.successCount}
**Failed**: ${result.errorCount}`;

	const toc = generateTableOfContents(result.pages, result.errors);
	const pageContents = generatePageContents(result.pages);
	const errorSection =
		result.errors.length > 0 ? generateErrorSection(result.errors) : "";

	return [header, toc, pageContents, errorSection]
		.filter((section) => section.length > 0)
		.join("\n\n---\n\n");
}

function generateTableOfContents(
	pages: PageResult[],
	errors: Array<{ url: string; error: string; timestamp: string }>,
): string {
	if (pages.length === 0 && errors.length === 0) {
		return "## Table of Contents\n\n*No pages were crawled*";
	}

	const tocItems: string[] = [];
	let index = 1;

	// Add successful pages
	pages.forEach((page) => {
		tocItems.push(`${index}. ✅ [${page.title}](#page-${index})`);
		index++;
	});

	// Add error pages
	errors.forEach((error) => {
		tocItems.push(`${index}. ❌ [${error.url}](#error-${index})`);
		index++;
	});

	return `## Table of Contents\n\n${tocItems.join("\n")}`;
}

function generatePageContents(pages: PageResult[]): string {
	return pages
		.map((page, index) => generatePageSection(page, index + 1))
		.join("\n\n---\n\n");
}

function generatePageSection(page: PageResult, pageNumber: number): string {
	const title = page.title || "Untitled Page";
	const header = `## <a id="page-${pageNumber}"></a>${title}`;

	const metadata = [`**URL**: ${page.url}`, `**Crawled**: ${page.crawledAt}`];

	if (page.description) {
		metadata.push(`**Description**: ${page.description}`);
	}

	const structure =
		page.headings.length > 0
			? `### Page Structure\n\n${page.headings.map((h) => `${"  ".repeat(h.level - 1)}- ${h.text}`).join("\n")}`
			: "";

	const content =
		page.content && page.content.trim() !== ""
			? `### Content\n\n${page.content}`
			: "### Content\n\n*No content found*";

	return [header, metadata.join("\n"), structure, content]
		.filter((section) => section.length > 0)
		.join("\n\n");
}

function generateErrorSection(
	errors: Array<{ url: string; error: string; timestamp: string }>,
): string {
	const errorLines = ["## Error Details"];

	errors.forEach((error, index) => {
		errorLines.push(
			`### <a id="error-${index + 1}"></a>Error ${index + 1}`,
			`**URL**: ${error.url}`,
			`**Error**: ${error.error}`,
			`**Occurred**: ${error.timestamp}`,
			"",
		);
	});

	return errorLines.join("\n");
}
