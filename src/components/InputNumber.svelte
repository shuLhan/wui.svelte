<script>
	export let min;
	export let max;
	export let value = 0;
	export let unit;

	function onBlur() {
		value = +value
		if (isNaN(value)) {
			value = max
		} else if (value < min) {
			value = min
		} else if (value > max) {
			value = max
		}
	}
</script>

<style>
	.wui-input-number {
		width: 100%;
	}
	.wui-input-number input {
		display: inline-block;
		width: 70%;
	}
	.wui-input-number .suffix {
		width: 30%;
	}
</style>

<div class="wui-input-number">
	<input type="number" on:blur={onBlur} bind:value={value}>
	{#if unit !== ''}
		<span class="suffix">
			{unit}
		</span>
	{/if}
</div>
