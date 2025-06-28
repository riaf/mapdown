import { describe, expect, it, vi } from "vitest";
import { ProgressTracker } from "../src/progress-tracker.js";

describe("ProgressTracker", () => {
	it("should track progress for crawling operations", () => {
		const onProgress = vi.fn();
		const tracker = new ProgressTracker(10, onProgress);

		expect(tracker.getProgress()).toEqual({
			total: 10,
			completed: 0,
			failed: 0,
			percentage: 0,
		});

		tracker.incrementCompleted();
		expect(onProgress).toHaveBeenCalledWith({
			total: 10,
			completed: 1,
			failed: 0,
			percentage: 10,
		});

		tracker.incrementFailed();
		expect(onProgress).toHaveBeenCalledWith({
			total: 10,
			completed: 1,
			failed: 1,
			percentage: 20,
		});
	});

	it("should calculate percentage correctly", () => {
		const tracker = new ProgressTracker(5);

		tracker.incrementCompleted();
		tracker.incrementCompleted();
		tracker.incrementFailed();

		const progress = tracker.getProgress();
		expect(progress.percentage).toBe(60); // 3 out of 5 = 60%
	});

	it("should handle edge cases", () => {
		const tracker = new ProgressTracker(0);

		const progress = tracker.getProgress();
		expect(progress.percentage).toBe(100); // 0 out of 0 = 100%
	});

	it("should format progress message", () => {
		const tracker = new ProgressTracker(100);

		for (let i = 0; i < 45; i++) {
			tracker.incrementCompleted();
		}
		for (let i = 0; i < 5; i++) {
			tracker.incrementFailed();
		}

		const message = tracker.getProgressMessage();
		expect(message).toBe("Progress: 50/100 (50%) | ✓ 45 | ✗ 5");
	});
});
