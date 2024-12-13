export interface Position {
	x: number;
	y: number;
	width: number;
	height: number;
}
export function getPosition(line: number, column: number): Position {
	const div = document.getElementById(`line-${line}`)!;
	let charCount = 0;
	column--;
	const spans = Array.from(div.children);
	for (const span of spans) {
		const spanText = span.textContent || '';
		const spanLength = spanText.length;
		if (charCount + spanLength >= column) {
			const offsetInSpan = column - charCount;
			// Create a range to determine cursor position within this span
			const range = document.createRange();
			range.setStart(span.firstChild!, offsetInSpan);
			range.setEnd(span.firstChild!, offsetInSpan);
			try {
				const rect = range.getBoundingClientRect();
				return positionFromRect(rect);
			} finally {
				range.detach(); // Clean up the range
			}
		}
		charCount += spanLength;
	}
	// Fallback for when the column exceeds the total characters
	const lastElement = div.lastElementChild as HTMLElement;
	const rect = lastElement.getBoundingClientRect();
	return positionFromRect(rect);
}
const positionFromRect = (rect: DOMRect): Position => ({
	x: rect.x,
	y: rect.y,
	width: rect.width,
	height: rect.height
});
