<script>
	import { WuiInputIPPort } from './components/index';
	import { WuiInputNumber } from './components/index';
	import { WuiLabelHint } from './components/index';
	import { WuiNotif, WuiPushNotif } from './components/index';

	let n = 0;
	function showNotification(kind) {
		n = n + 1
		if (kind === "error") {
			WuiPushNotif.Error("test "+n);
		} else {
			WuiPushNotif.Info("test "+n);
		}
	}

	let address = "";
	let number = 0;
</script>

<style>
	button.push-notif {
		position: fixed;
		bottom: 1em;
		left: 1em;
	}
	button.push-notif.error {
		position: fixed;
		bottom: 1em;
		left: 12em;
	}

	div.test-label-input {
		margin: 0 0 1em 0;
	}
	label.test-input {
		width: 100%;
		display: inline-flex;
	}
	label.test-input > span {
		display: inline-block;
		width: 200px;
	}
</style>

<main>
	<WuiNotif timeout={1000} />

	<button class="push-notif" on:click={()=>showNotification("")}>
		Push info notification
	</button>

	<button class="push-notif error" on:click={()=>showNotification("error")}>
		Push error notification
	</button>


	<div class="test-label-input">
		<WuiLabelHint
			title="InputIPPort"
			info="Input IP address and port number"
		>
			<WuiInputIPPort bind:value={address}/>
		</WuiLabelHint>
		<div>
			Output: {address}
		</div>
	</div>

	<div class="test-label-input">
		<WuiLabelHint
			title="InputNumber"
			info="Input number with minimum value is 1 and maximum is 10"
		>
			<WuiInputNumber max=10 min=1 bind:value={number} unit="seconds"/>
		</WuiLabelHint>
		<div>
			Output: {number}
		</div>
	</div>

	{#each new Array(1000) as x, idx}
	<div>
		{idx}
	</div>
	{/each}
</main>
