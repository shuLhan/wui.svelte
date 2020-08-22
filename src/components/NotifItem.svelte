<script>
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { messages } from "./Notif.store.js"

	export let text = ""
	export let kind = ""

	onMount(() => {
		let timerID = setTimeout(()=> {
			messages.update(msgs => {
				msgs.splice(0, 1);
				return msgs
			})
		}, 5000)
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
