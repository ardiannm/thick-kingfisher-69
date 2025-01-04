<script lang="ts">
	import EditorComponent from '$lib/components/Editor.svelte';

	let text = `A1 :: 0
A2 :: A1+2

\`\`\` this assignment should update its observers

A1 :: 1
A2	\`\`\` should be 3


(1+                          `;
</script>

<EditorComponent {text} />
