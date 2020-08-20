<script context="module">
	import { messages } from "./Notif.store.js"
	import NotifItem from "./NotifItem.svelte"

	export function WuiPushNotif(msg) {
		messages.update(msgs => msgs = [...msgs, msg])
	}
</script>

<style>
	.wui-notif {
		position: fixed;
		top: 5px;
		left: calc((100% - 400px)/2);
		width: 400px;
	}
	@media (max-width: 500px) {
		.wui-notif {
			left: 1em;
			width: calc(100% - 2em);
		}
	}
</style>

<div class="wui-notif">
	{#each $messages as msg}
	<NotifItem text={msg}/>
	{/each}
</div>
