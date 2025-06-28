import TurndownService from "turndown";

const turndownService = new TurndownService({
	headingStyle: "atx",
	bulletListMarker: "-",
	codeBlockStyle: "fenced",
	fence: "```",
	emDelimiter: "*",
	strongDelimiter: "**",
	linkStyle: "inlined",
});

export function convertHtmlToMarkdown(html: string): string {
	if (!html || html.trim() === "") {
		return "";
	}

	const markdown = turndownService.turndown(html);

	return cleanupMarkdown(markdown);
}

function cleanupMarkdown(markdown: string): string {
	return markdown
		.replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
		.replace(/^\s+|\s+$/g, "") // Trim whitespace from start and end
		.replace(/^[\s\n]*/, "") // Remove leading whitespace/newlines
		.replace(/[\s\n]*$/, ""); // Remove trailing whitespace/newlines
}
