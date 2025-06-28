export function isUrl(source: string): boolean {
	try {
		new URL(source);
		return true;
	} catch {
		return false;
	}
}
