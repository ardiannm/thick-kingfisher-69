import { writable } from 'svelte/store';
import type { Diagnostic } from '../../..';

export let diagnosticsStore = writable<Diagnostic[]>([]);
