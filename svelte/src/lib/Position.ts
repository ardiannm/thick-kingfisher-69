export interface Position {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function getPosition(line: number, column: number): Position {
	const lineElement = document.getElementById(`line-${line}`)!;
	let charCount = 0;
	column--;
	for (const child of Array.from(lineElement.childNodes)) {
		const range = document.createRange();
		try {
			if (child.nodeType === Node.ELEMENT_NODE) {
				const span = child as HTMLElement;
				const spanText = span.textContent || '';
				const spanLength = spanText.length;
				if (charCount + spanLength >= column) {
					const offsetInSpan = column - charCount;
					range.setStart(span.firstChild!, offsetInSpan);
					range.setEnd(span.firstChild!, offsetInSpan);
					return getCursorPositionFromRange(range);
				}
				charCount += spanLength;
			} else if (child.nodeType === Node.TEXT_NODE) {
				const textNode = child as Text;
				const textLength = textNode.textContent?.length || 0;
				if (charCount + textLength >= column) {
					const offsetInText = column - charCount;
					range.setStart(textNode, offsetInText);
					range.setEnd(textNode, offsetInText);
					return getCursorPositionFromRange(range);
				}
				charCount += textLength;
			}
		} finally {
			range.detach();
		}
	}
	const lastElement = lineElement.lastElementChild as HTMLElement;
	const rect = lastElement.getBoundingClientRect();
	return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function getCursorPositionFromRange(range: Range): Position {
	const rect = range.getBoundingClientRect();
	return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}
