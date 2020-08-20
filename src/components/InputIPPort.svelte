<script>
	export let value = "";
	let isInvalid = false;
	let error = "";

	function onBlur() {
		if (value === "") {
			isInvalid = false;
			error = "";
			return;
		}
		const ipport = value.split(":");
		if (ipport.length !== 2) {
			isInvalid = true;
			error = "missing port number";
			return;
		}
		const ip = ipport[0];
		const port = parseInt(ipport[1]);
		if (isNaN(port) || port <= 0 || port >= 65535) {
			isInvalid = true;
			error = "invalid port number";
			return;
		}
		isInvalid = false;
		value = ip +":"+ port;
	}
</script>

<style>
	.wui-input-ipport {
		display: inline-block;
		width: 100%;
	}
	.wui-input-ipport input {
		width: 100%;
	}
	.invalid {
		color: red;
	}
	div.invalid {
		font-size: 12px;
	}
</style>

<div class="wui-input-ipport">
	<input
		type="text"
		bind:value={value}
		on:blur={onBlur}
		class:invalid={isInvalid}
		placeholder="127.0.0.1:8080"
	>
	{#if isInvalid}
	<div class="invalid">{error}</div>
	{/if}
</div>
