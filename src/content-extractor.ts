import * as cheerio from "cheerio";
import { chromium } from "playwright";

export interface Heading {
	level: number;
	text: string;
}

export interface ContentExtractResult {
	title: string;
	description?: string;
	content: string;
	headings: Heading[];
}

export function extractContent(html: string): ContentExtractResult {
	const $ = cheerio.load(html);

	// Check if this is a SPA page that needs JavaScript rendering
	const nextDataScript = $("#__NEXT_DATA__");
	if (nextDataScript.length > 0 || $('div[id="__next"]').length > 0) {
		// For now, extract what we can from static HTML
		// In a real implementation, we would need to use the URL to fetch with Playwright
		return extractStaticContent($);
	}

	const title = extractTitle($);
	const description = extractDescription($);
	const content = extractMainContent($);
	const headings = extractHeadings($);

	return {
		title,
		description,
		content,
		headings,
	};
}

function extractStaticContent($: cheerio.CheerioAPI): ContentExtractResult {
	const title = extractTitle($);
	const description = extractDescription($);

	// Try to extract content from __NEXT_DATA__ script
	const nextDataScript = $("#__NEXT_DATA__");
	let content = "";

	if (nextDataScript.length > 0) {
		try {
			const nextData = JSON.parse(nextDataScript.html() || "{}");
			const pageProps = nextData.props?.pageProps || {};

			// Extract content from various possible fields
			content = pageProps.content || pageProps.body || pageProps.text || "";
		} catch (_error) {
			// Fallback to regular extraction
			content = extractMainContent($);
		}
	} else {
		content = extractMainContent($);
	}

	const headings = extractHeadings($);

	return {
		title,
		description,
		content,
		headings,
	};
}

export async function extractContentWithBrowser(
	url: string,
): Promise<ContentExtractResult> {
	const browser = await chromium.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-dev-shm-usage"],
	});
	const page = await browser.newPage();

	// Disable images and other resources to speed up loading
	await page.route("**/*", (route) => {
		const resourceType = route.request().resourceType();
		if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
			route.abort();
		} else {
			route.continue();
		}
	});

	try {
		await page.goto(url);
		await page.waitForLoadState("networkidle");

		// Wait for dynamic content to load (reduced from 2000ms)
		await page.waitForTimeout(1000);

		const result = await page.evaluate(() => {
			const doc = document;

			// Extract title
			const title =
				doc.title || doc.querySelector("h1")?.textContent || "Untitled Page";

			// Extract description
			const metaDescription = doc
				.querySelector('meta[name="description"]')
				?.getAttribute("content");

			// Extract main content by trying different strategies
			let mainContent = "";

			// Strategy 1: Try main element
			const mainElement = doc.querySelector("main");
			if (mainElement) {
				mainContent = mainElement.innerHTML;
			} else {
				// Strategy 2: Try article element
				const articleElement = doc.querySelector("article");
				if (articleElement) {
					mainContent = articleElement.innerHTML;
				} else {
					// Strategy 3: Try common content selectors
					const contentSelectors = [
						".content",
						"#content",
						".main-content",
						".post-content",
						".entry-content",
						'[role="main"]',
						".container .row",
						".page-content",
					];

					for (const selector of contentSelectors) {
						const element = doc.querySelector(selector);
						if (
							element?.textContent &&
							element.textContent.trim().length > 100
						) {
							mainContent = element.innerHTML;
							break;
						}
					}

					// Strategy 4: Final fallback - get body but clean it up
					if (!mainContent) {
						const bodyClone = doc.body.cloneNode(true) as Element;

						// Remove unwanted elements
						const unwantedSelectors = [
							"nav",
							"header",
							"footer",
							"script",
							"style",
							"noscript",
							".navigation",
							".sidebar",
							".menu",
							".navbar",
							".header",
							".footer",
							'[role="navigation"]',
							'[role="banner"]',
							'[role="contentinfo"]',
							".cookie-banner",
							".social-share",
							".advertisement",
						];

						unwantedSelectors.forEach((selector) => {
							const elements = bodyClone.querySelectorAll(selector);
							elements.forEach((el: Element) => el.remove());
						});

						mainContent = bodyClone.innerHTML;
					}
				}
			}

			// Extract headings
			const headings: Array<{ level: number; text: string }> = [];
			for (let level = 1; level <= 6; level++) {
				const headingElements = doc.querySelectorAll(`h${level}`);
				headingElements.forEach((heading: Element) => {
					const text = heading.textContent?.trim();
					if (text) {
						headings.push({ level, text });
					}
				});
			}

			return {
				title: title.trim(),
				description: metaDescription || undefined,
				content: mainContent,
				headings,
			};
		});

		return result;
	} finally {
		await browser.close();
	}
}

function extractTitle($: cheerio.CheerioAPI): string {
	const titleElement = $("title").first();
	if (titleElement.length > 0) {
		return titleElement.text().trim();
	}

	const h1Element = $("h1").first();
	if (h1Element.length > 0) {
		return h1Element.text().trim();
	}

	return "Untitled Page";
}

function extractDescription($: cheerio.CheerioAPI): string | undefined {
	const metaDescription = $('meta[name="description"]').attr("content");
	if (metaDescription) {
		return metaDescription.trim();
	}

	return undefined;
}

function extractMainContent($: cheerio.CheerioAPI): string {
	// Remove unwanted elements
	$("nav, header, footer, script, style").remove();

	// Try to find main content
	const mainElement = $("main").first();
	if (mainElement.length > 0) {
		return mainElement.html() || "";
	}

	const articleElement = $("article").first();
	if (articleElement.length > 0) {
		return articleElement.html() || "";
	}

	// Fallback to body
	const bodyContent = $("body").html();
	return bodyContent || "";
}

function extractHeadings($: cheerio.CheerioAPI): Heading[] {
	const headings: Heading[] = [];

	for (let level = 1; level <= 6; level++) {
		$(`h${level}`).each((_, element) => {
			const $element = $(element);
			const text = $element.text().trim();

			if (text) {
				headings.push({
					level,
					text,
				});
			}
		});
	}

	// Sort headings by their appearance order in the document
	return headings.sort((a, b) => {
		const aPosition = $(`h${a.level}:contains("${a.text}")`).index();
		const bPosition = $(`h${b.level}:contains("${b.text}")`).index();
		return aPosition - bPosition;
	});
}
