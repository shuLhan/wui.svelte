<script>
	import { WuiInputIPPort } from './components/index';
	import { WuiInputNumber } from './components/index';
	import { WuiLabelHint } from './components/index';
	import { WuiNotif, WuiPushNotif } from './components/index';

	let n = 0;
	function showNotification() {
		n = n + 1
		WuiPushNotif("test "+n);
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
	<WuiNotif />

	<button class="push-notif" on:click={showNotification}>
		Push notification
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
