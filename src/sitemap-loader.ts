import { readFile } from "node:fs/promises";

export async function loadSitemapFromFile(filePath: string): Promise<string> {
	try {
		return await readFile(filePath, "utf-8");
	} catch (error) {
		throw new Error(
			`Failed to load sitemap from file: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function loadSitemapFromUrl(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		return await response.text();
	} catch (error) {
		throw new Error(
			`Failed to load sitemap from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
