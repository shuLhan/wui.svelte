<script>
	export let title = "";
	export let info = "";
	export let title_width = "300px";
	let showInfo = false;
</script>

<style>
	.label-hint {
		display: inline-flex;
		margin-top: 1em;
		width: 100%;
	}
	.title {
		margin-bottom: 4px;
	}
	.title {
		display: inline-block;
	}
	.toggle {
		border-radius: 50%;
		border: 1px solid grey;
		cursor: pointer;
		display: inline-block;
		font-size: 12px;
		height: 14px;
		line-height: 14px;
		padding: 2px;
		text-align: center;
		width: 14px;
	}
	.info {
		background-color: #eee;
		margin: 8px 0px;
		padding: 1em;
	}
	@media (max-width: 720px) {
		.label-hint {
			display: block;
		}
	}
</style>

<label class="label-hint">
	<span class="title" style="width:{title_width};">
		{title}
		<span class="toggle" on:click={() => showInfo = !showInfo}>
			?
		</span>
	</span>

	<slot>
	</slot>

</label>

{#if showInfo}
<div class="info">
	{@html info}
</div>
{/if}
