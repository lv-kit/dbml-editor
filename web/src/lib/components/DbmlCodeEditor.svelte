<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, rectangularSelection } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { sql } from '@codemirror/lang-sql';
	import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
	import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
	import { autocompletion, completionKeymap } from '@codemirror/autocomplete';

	interface Props {
		value: string;
		onchange?: (value: string) => void;
	}

	let { value, onchange }: Props = $props();

	let editorContainer: HTMLDivElement | undefined = $state();
	let view: EditorView | undefined = $state();
	let isInternalUpdate = false;

	onMount(() => {
		if (!editorContainer) return;

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				isInternalUpdate = true;
				const newValue = update.state.doc.toString();
				onchange?.(newValue);
				isInternalUpdate = false;
			}
		});

		const state = EditorState.create({
			doc: value,
			extensions: [
				lineNumbers(),
				highlightActiveLineGutter(),
				highlightActiveLine(),
				drawSelection(),
				rectangularSelection(),
				indentOnInput(),
				bracketMatching(),
				foldGutter(),
				history(),
				highlightSelectionMatches(),
				autocompletion(),
				sql(),
				syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
				oneDark,
				keymap.of([
					...defaultKeymap,
					...historyKeymap,
					...searchKeymap,
					...completionKeymap,
					indentWithTab
				]),
				updateListener,
				EditorView.theme({
					'&': { height: '100%' },
					'.cm-scroller': { overflow: 'auto' }
				})
			]
		});

		view = new EditorView({
			state,
			parent: editorContainer
		});

		return () => {
			view?.destroy();
		};
	});

	$effect(() => {
		if (view && !isInternalUpdate) {
			const currentContent = view.state.doc.toString();
			if (value !== currentContent) {
				view.dispatch({
					changes: {
						from: 0,
						to: currentContent.length,
						insert: value
					}
				});
			}
		}
	});
</script>

<div bind:this={editorContainer} class="h-full w-full overflow-hidden"></div>
