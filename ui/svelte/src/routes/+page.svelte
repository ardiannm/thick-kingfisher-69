<script lang="ts">
	import EditorComponent from '$lib/components/EditorComponent.svelte';

	const text = `A1 :: A4+                      @     
5 :: 2
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+       A5
A3 :: 1

1+          

`;
</script>

<EditorComponent {text} />
