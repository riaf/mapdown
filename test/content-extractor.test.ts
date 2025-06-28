import { describe, expect, it } from "vitest";
import { extractContent } from "../src/content-extractor.js";

describe("Content Extractor", () => {
	describe("extractContent", () => {
		it("should extract title from HTML", () => {
			const html = `
        <html>
          <head>
            <title>Test Page</title>
          </head>
          <body>
            <h1>Main Content</h1>
            <p>Some content here</p>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.title).toBe("Test Page");
		});

		it("should extract main content from body", () => {
			const html = `
        <html>
          <head>
            <title>Test Page</title>
          </head>
          <body>
            <header>Header content</header>
            <main>
              <h1>Main Title</h1>
              <p>Main content paragraph</p>
            </main>
            <footer>Footer content</footer>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.content).toContain("Main Title");
			expect(result.content).toContain("Main content paragraph");
			expect(result.content).not.toContain("Header content");
			expect(result.content).not.toContain("Footer content");
		});

		it("should extract headings with levels", () => {
			const html = `
        <html>
          <body>
            <main>
              <h1>Level 1</h1>
              <h2>Level 2</h2>
              <h3>Level 3</h3>
              <p>Some content</p>
            </main>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.headings).toHaveLength(3);
			expect(result.headings[0]).toEqual({ level: 1, text: "Level 1" });
			expect(result.headings[1]).toEqual({ level: 2, text: "Level 2" });
			expect(result.headings[2]).toEqual({ level: 3, text: "Level 3" });
		});

		it("should extract meta description", () => {
			const html = `
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="This is a test page description">
          </head>
          <body>
            <p>Content</p>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.description).toBe("This is a test page description");
		});

		it("should handle HTML without main element by using body", () => {
			const html = `
        <html>
          <body>
            <h1>Title</h1>
            <p>Content without main element</p>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.content).toContain("Title");
			expect(result.content).toContain("Content without main element");
		});
	});

	describe("SPA content extraction", () => {
		it("should handle Next.js SPA pages with __NEXT_DATA__", () => {
			const html = `
        <!DOCTYPE html>
        <html lang="ja">
          <head>
            <title>北海道釧路は涼しいから夏の滞在にぴったり</title>
            <meta name="description" content="釧路の涼しい夏の気候と快適な滞在について詳しく紹介">
          </head>
          <body>
            <div id="__next"></div>
            <script id="__NEXT_DATA__" type="application/json">
              {"props":{"pageProps":{"content":"釧路は夏でも平均気温が20度前後で、湿度も低くとても過ごしやすい場所です。避暑地として最適です。"}},"page":"/kushiro-summer-guide"}
            </script>
          </body>
        </html>
      `;

			const result = extractContent(html);

			expect(result.title).toBe("北海道釧路は涼しいから夏の滞在にぴったり");
			expect(result.description).toBe(
				"釧路の涼しい夏の気候と快適な滞在について詳しく紹介",
			);
			expect(result.content).toBe(
				"釧路は夏でも平均気温が20度前後で、湿度も低くとても過ごしやすい場所です。避暑地として最適です。",
			);
		});
	});
});
