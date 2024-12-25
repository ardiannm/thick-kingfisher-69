<script lang="ts">
	import EditorComponent from '$lib/components/Editor.svelte';

	let text = `        A1
"moving cell one to the right causes it to break into its tokens"
"Token.hasTrivia isn't working properly"
`;
</script>

<EditorComponent {text} />
