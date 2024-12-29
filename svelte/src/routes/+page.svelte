<script lang="ts">
	import EditorComponent from '$lib/components/Editor.svelte';

	let text = `A1 :: A4
A2 :: A1
A3 :: A1 + A2
A4 :: A1+A2+A3+A2

`;
</script>

<EditorComponent {text} />
