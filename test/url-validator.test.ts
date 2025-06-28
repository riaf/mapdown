import { describe, expect, it } from "vitest";
import { isUrl } from "../src/url-validator.js";

describe("URL Validator", () => {
	describe("isUrl", () => {
		it("should return true for valid HTTP URLs", () => {
			expect(isUrl("http://example.com")).toBe(true);
		});

		it("should return true for valid HTTPS URLs", () => {
			expect(isUrl("https://example.com")).toBe(true);
		});

		it("should return true for URLs with paths", () => {
			expect(isUrl("https://example.com/sitemap.xml")).toBe(true);
		});

		it("should return false for relative file paths", () => {
			expect(isUrl("./sitemap.xml")).toBe(false);
		});

		it("should return false for absolute file paths", () => {
			expect(isUrl("/path/to/sitemap.xml")).toBe(false);
		});

		it("should return false for empty string", () => {
			expect(isUrl("")).toBe(false);
		});

		it("should return false for invalid URLs", () => {
			expect(isUrl("not-a-url")).toBe(false);
		});
	});
});
