import { promisify } from "node:util";
import { parseString } from "xml2js";

interface SitemapIndexEntry {
	loc: string | string[];
	lastmod?: string | string[];
}

interface SitemapIndex {
	sitemap: SitemapIndexEntry[];
}

interface SitemapUrlEntry {
	loc: string | string[];
	lastmod?: string | string[];
	changefreq?: string | string[];
	priority?: string | string[];
}

interface SitemapUrlset {
	url: SitemapUrlEntry[];
}

interface ParsedSitemapXml {
	sitemapindex?: SitemapIndex;
	urlset?: SitemapUrlset;
}

const parseXml = promisify(parseString);

export interface SitemapUrl {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority?: number;
}

export async function parseSitemapXml(
	xmlContent: string,
): Promise<SitemapUrl[]> {
	try {
		const result = (await parseXml(xmlContent)) as ParsedSitemapXml;

		// Handle sitemap index format
		if (result.sitemapindex) {
			const sitemaps = result.sitemapindex.sitemap || [];
			const allUrls: SitemapUrl[] = [];

			for (const sitemapEntry of sitemaps) {
				const sitemapUrl = extractValue(sitemapEntry.loc);
				try {
					const response = await fetch(sitemapUrl);
					const sitemapContent = await response.text();
					const urls = await parseSitemapXml(sitemapContent);
					allUrls.push(...urls);
				} catch (_error) {
					console.warn(`Failed to load sitemap: ${sitemapUrl}`);
				}
			}

			return allUrls;
		}

		// Handle regular sitemap format
		if (!result.urlset) {
			throw new Error("Invalid sitemap format: missing urlset or sitemapindex");
		}

		const urls = result.urlset.url || [];

		return urls.map((urlEntry) => extractSitemapUrl(urlEntry));
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Invalid sitemap format")
		) {
			throw error;
		}

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to parse sitemap XML: ${errorMessage}`);
	}
}

function extractSitemapUrl(urlEntry: SitemapUrlEntry): SitemapUrl {
	const url: SitemapUrl = {
		loc: extractValue(urlEntry.loc),
	};

	if (urlEntry.lastmod) {
		url.lastmod = extractValue(urlEntry.lastmod);
	}

	if (urlEntry.changefreq) {
		url.changefreq = extractValue(urlEntry.changefreq);
	}

	if (urlEntry.priority) {
		url.priority = parseFloat(extractValue(urlEntry.priority));
	}

	return url;
}

function extractValue(value: string | string[]): string {
	if (Array.isArray(value)) {
		return value[0];
	}
	return value;
}
