<script>
	import { uid } from "wx-lib-dom";

	let {
		id = uid(),
		label = "",
		value = $bindable(""),
		name = "",
		inputValue = "",
		disabled = false,
		onchange,
	} = $props();

	function handlerChange(ev) {
		value = ev.target.checked;
		if (value) onchange && onchange({ value: true, inputValue });
	}
</script>

<div class="wx-radio">
	<input
		type="radio"
		{id}
		{disabled}
		{name}
		value={inputValue}
		checked={value}
		onchange={handlerChange}
	/>
	<label for={id}>
		<span></span>
		{#if label}<span>{label}</span>{/if}
	</label>
</div>

<style>
	.wx-radio {
		position: relative;
		display: inline-block;
		vertical-align: top;
		max-width: var(--wx-input-width);
	}
	input {
		appearance: none;
		width: 0;
		height: 0;
		opacity: 0;
		position: absolute;
		left: 0;
		top: 0;
		margin: 0;
		padding: 0;
	}
	label {
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		font-family: var(--wx-checkbox-font-family);
		font-size: var(--wx-checkbox-font-size);
		line-height: var(--wx-checkbox-line-height);
		font-weight: var(--wx-checkbox-font-weight);
		color: var(--wx-checkbox-font-color);
		cursor: pointer;
	}
	span {
		display: block;
	}
	span + span {
		margin-left: 8px;
		padding-top: calc(
			(var(--wx-checkbox-height) - var(--wx-checkbox-line-height)) / 2
		);
		padding-bottom: calc(
			(var(--wx-checkbox-height) - var(--wx-checkbox-line-height)) / 2
		);
	}
	span:first-child {
		position: relative;
		flex-shrink: 0;
		padding-top: calc(
			(var(--wx-checkbox-height) - var(--wx-checkbox-size)) / 2
		);
		padding-bottom: calc(
			(var(--wx-checkbox-height) - var(--wx-checkbox-size)) / 2
		);
	}
	span:first-child:before {
		content: "";
		display: block;
		width: var(--wx-checkbox-size);
		height: var(--wx-checkbox-size);
		border: var(--wx-checkbox-border-width) solid
			var(--wx-checkbox-border-color);
		border-radius: 50%;
		background: var(--wx-input-background);
	}
	span:first-child:after {
		content: "";
		position: absolute;
		display: none;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: calc(
			var(--wx-checkbox-size) - var(--wx-checkbox-border-width) * 2
		);
		height: calc(
			var(--wx-checkbox-size) - var(--wx-checkbox-border-width) * 2
		);
		border-style: solid;
		border-color: var(--wx-input-background);
		border-width: calc(var(--wx-checkbox-size) * 0.2);
		border-radius: 50%;
	}
	input:checked ~ label span:first-child:before {
		background: var(--wx-color-primary);
		border-color: transparent;
	}
	input:checked ~ label span:first-child:after {
		display: block;
	}
	input[disabled] ~ label {
		color: var(--wx-checkbox-border-color-disabled);
		cursor: not-allowed;
	}
	input[disabled]:not(:global(:checked)) ~ label span:first-child:before {
		border-color: var(--wx-checkbox-border-color-disabled);
	}
	input[disabled]:checked ~ label span:first-child:before {
		background: var(--wx-checkbox-border-color-disabled);
	}
</style>
