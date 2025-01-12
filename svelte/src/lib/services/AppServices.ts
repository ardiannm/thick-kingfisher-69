export class AppService {
	constructor() {}

	static getCharacterPosition = (n: number, node: HTMLElement) => {
		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null)
		let charIndex = 0
		while (walker.nextNode()) {
			const node = walker.currentNode
			const text = node.textContent || ''
			if (charIndex + text.length > n) {
				const localIndex = n - charIndex
				if (localIndex >= text.length) {
					console.error(`Invalid local index: ${localIndex} exceeds node length`)
					return null
				}
				const range = document.createRange()
				range.setStart(node, localIndex)
				range.setEnd(node, localIndex + 1)
				const rect = range.getBoundingClientRect()
				range.detach()
				return rect
			}
			charIndex += text.length
		}
		console.error(`Character position ${n} is out of bounds`)
		return null
	}
}
