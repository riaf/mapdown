export interface ProgressInfo {
	total: number;
	completed: number;
	failed: number;
	percentage: number;
}

export type ProgressCallback = (progress: ProgressInfo) => void;

export class ProgressTracker {
	private total: number;
	private completed: number = 0;
	private failed: number = 0;
	private onProgress?: ProgressCallback;

	constructor(total: number, onProgress?: ProgressCallback) {
		this.total = total;
		this.onProgress = onProgress;
	}

	incrementCompleted(): void {
		this.completed++;
		this.notifyProgress();
	}

	incrementFailed(): void {
		this.failed++;
		this.notifyProgress();
	}

	getProgress(): ProgressInfo {
		const processed = this.completed + this.failed;
		const percentage =
			this.total === 0 ? 100 : Math.round((processed / this.total) * 100);

		return {
			total: this.total,
			completed: this.completed,
			failed: this.failed,
			percentage,
		};
	}

	getProgressMessage(): string {
		const progress = this.getProgress();
		const processed = progress.completed + progress.failed;

		return `Progress: ${processed}/${progress.total} (${progress.percentage}%) | ✓ ${progress.completed} | ✗ ${progress.failed}`;
	}

	private notifyProgress(): void {
		if (this.onProgress) {
			this.onProgress(this.getProgress());
		}
	}
}
