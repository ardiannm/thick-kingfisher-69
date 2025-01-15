export const focus = (node: HTMLElement, fire: (event: boolean) => void) => {
	let focus: boolean | undefined = undefined
	const check = (event: MouseEvent) => {
		if (node.contains(event.target as Node)) {
			if (focus !== true) {
				fire(true)
				focus = true
			}
		} else {
			if (focus !== false) {
				fire(false)
				focus = false
			}
		}
		document.removeEventListener('mousedown', check)
	}
	const mousedown = () => document.addEventListener('mousedown', check)
	node.addEventListener('mouseenter', mousedown)
	node.addEventListener('mouseleave', mousedown)
	mousedown()
	return {
		destroy() {
			document.removeEventListener('mousedown', check)
			node.removeEventListener('mouseenter', mousedown)
			node.removeEventListener('mouseleave', mousedown)
		}
	}
}
