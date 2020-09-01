<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { messages } from "./Notif.store.js"

	export let text = ""
	export let kind = ""
	export let timeout = 5000

	onMount(() => {
		let timerID = setTimeout(()=> {
			messages.update(msgs => {
				msgs.splice(0, 1);
				msgs = msgs
				return msgs
			})
		}, timeout)
	})
</script>

<style>
	.wui-notif-item {
		background-color: white;
		border: 1px solid black;
		box-shadow: 3px 3px;
		padding: 1em;
		margin-bottom: 1em;
		z-index: 1000;
	}
	.wui-notif-item.error {
		border: 1px solid red;
		box-shadow: 3px 3px red;
	}
</style>

<div transition:fade class="wui-notif-item {kind}">
	{text}
</div>
