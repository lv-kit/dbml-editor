export function handlePseudoButtonKeydown(event: KeyboardEvent, action: () => void) {
	if (event.key === 'Enter') {
		event.preventDefault();
		action();
		return;
	}

	if (event.key === ' ') {
		event.preventDefault();
	}
}

export function handlePseudoButtonKeyup(event: KeyboardEvent, action: () => void) {
	if (event.key === ' ') {
		event.preventDefault();
		action();
	}
}
