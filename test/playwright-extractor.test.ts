import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { extractContentWithBrowser } from "../src/content-extractor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempFiles: string[] = [];

describe("Playwright Content Extractor", () => {
	it("should extract dynamically generated content from SPA", async () => {
		const testHtmlPath = path.join(__dirname, "fixtures", "spa-test.html");
		const fileUrl = `file://${testHtmlPath}`;

		const result = await extractContentWithBrowser(fileUrl);

		expect(result.title).toBe("釧路夏の旅ガイド");
		expect(result.description).toBe(
			"北海道釧路の涼しい夏を楽しむための旅行ガイド",
		);
		// Main content should include main and article elements, but exclude header/footer
		expect(result.content).toContain("理想的な避暑地");
		expect(result.content).toContain("宿泊情報");
		expect(result.content).toContain("快適に過ごせます");
		// Should not contain header/footer content when main element exists
		expect(result.content).not.toContain("ナビゲーションメニュー");
		expect(result.content).not.toContain("Footer content");
		expect(result.content).not.toContain("Loading...");
		expect(result.headings).toEqual([
			{ level: 1, text: "釧路夏の旅ガイド" },
			{ level: 2, text: "釧路の気候の特徴" },
			{ level: 2, text: "宿泊情報" },
			{ level: 3, text: "おすすめアクティビティ" },
		]);
	}, 15000);

	it("should handle pages that fail to load dynamic content", async () => {
		const testHtmlPath = path.join(__dirname, "fixtures", "spa-test-slow.html");
		tempFiles.push(testHtmlPath);

		// Create a test file that loads content very slowly
		const slowHtml = `
      <!DOCTYPE html>
      <html>
      <head><title>Slow Loading Page</title></head>
      <body>
        <div id="__next">Loading...</div>
        <script>
          setTimeout(() => {
            document.getElementById('__next').innerHTML = '<h1>Too slow!</h1>';
          }, 5000); // 5 seconds delay - shorter than our wait time
        </script>
      </body>
      </html>
    `;

		fs.writeFileSync(testHtmlPath, slowHtml);

		const fileUrl = `file://${testHtmlPath}`;
		const result = await extractContentWithBrowser(fileUrl);

		// Should get the loading state since we don't wait that long
		expect(result.title).toBe("Slow Loading Page");
		expect(result.content).toContain("Loading...");
	}, 8000);

	afterAll(() => {
		// Clean up temporary files
		tempFiles.forEach((file) => {
			if (fs.existsSync(file)) {
				fs.unlinkSync(file);
			}
		});
	});
});
