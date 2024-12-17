<script lang="ts">
	import EditorComponent from '$lib/components/EditorComponent.svelte';

	let text = `A1 :: A4+5          @    :: 2

A 2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+       A5
A3 :: 1

1+

`;

	text = `1+2+

`;
</script>

<EditorComponent {text} />
