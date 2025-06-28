import { describe, expect, it } from "vitest";
import { convertHtmlToMarkdown } from "../src/markdown-converter.js";

describe("Markdown Converter", () => {
	describe("convertHtmlToMarkdown", () => {
		it("should convert headings to markdown", () => {
			const html = "<h1>Heading 1</h1><h2>Heading 2</h2>";

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe("# Heading 1\n\n## Heading 2");
		});

		it("should convert paragraphs to markdown", () => {
			const html = "<p>First paragraph</p><p>Second paragraph</p>";

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe("First paragraph\n\nSecond paragraph");
		});

		it("should convert links to markdown", () => {
			const html =
				'<p>Visit <a href="https://example.com">example.com</a> for more info</p>';

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe(
				"Visit [example.com](https://example.com) for more info",
			);
		});

		it("should convert images to markdown", () => {
			const html = '<img src="image.jpg" alt="Test image" title="Image title">';

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe('![Test image](image.jpg "Image title")');
		});

		it("should convert lists to markdown", () => {
			const html = `
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;

			const result = convertHtmlToMarkdown(html);

			expect(result).toContain("-   Item 1");
			expect(result).toContain("-   Item 2");
		});

		it("should convert bold and italic to markdown", () => {
			const html =
				"<p>This is <strong>bold</strong> and <em>italic</em> text</p>";

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe("This is **bold** and *italic* text");
		});

		it("should handle empty or whitespace-only HTML", () => {
			expect(convertHtmlToMarkdown("")).toBe("");
			expect(convertHtmlToMarkdown("   ")).toBe("");
			expect(convertHtmlToMarkdown("<p></p>")).toBe("");
		});

		it("should clean up excessive whitespace", () => {
			const html = "<p>First</p>\n\n\n<p>Second</p>";

			const result = convertHtmlToMarkdown(html);

			expect(result).toBe("First\n\nSecond");
		});
	});
});
