#!/usr/bin/env node

import { mapdown } from "./index.js";
import type { ProgressInfo } from "./progress-tracker.js";

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: mapdown <sitemap-url-or-file>");
		process.exit(1);
	}

	const source = args[0];

	try {
		console.log("🚀 Starting crawl...");
		console.log(`📍 Source: ${source}\n`);

		// Track progress with terminal updates
		let lastProgress = -1;
		const result = await mapdown(source, (progress: ProgressInfo) => {
			// Only update if percentage changed
			if (progress.percentage !== lastProgress) {
				lastProgress = progress.percentage;
				const processed = progress.completed + progress.failed;

				// Clear line and update progress
				process.stdout.write("\r\x1b[K"); // Clear current line
				process.stdout.write(
					`Progress: ${processed}/${progress.total} (${progress.percentage}%) | ✓ ${progress.completed} | ✗ ${progress.failed}`,
				);
			}
		});

		// Clear progress line and print result
		process.stdout.write("\r\x1b[K");
		console.log(result);
		console.log("\n✅ Crawl completed successfully!");
	} catch (error) {
		process.stdout.write("\r\x1b[K"); // Clear progress line
		console.error(
			"❌ Error:",
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	}
}

// Execute main if this file is run directly
main();
