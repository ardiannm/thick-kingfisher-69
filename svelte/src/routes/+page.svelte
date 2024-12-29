<script lang="ts">
	import EditorComponent from '$lib/components/Editor.svelte';

	let text = `A1 :: 1+              
A2 :: A1+2
A3 :: A1+A2

" this assignment should update its observers "

A1 :: 2

`;
</script>

<EditorComponent {text} />
