<script>
	import { Grid } from "../../src";
	import Overlay from "../custom/Overlay.svelte";
	import { getData } from "../data";

	const { columns, data } = getData();

	let showOverlay = $state(true);

	function showData({ show }) {
		if (show) showOverlay = false;
	}
</script>

<div style="padding: 20px;">
	<h4>Overlay as a text</h4>
	<div>
		<Grid
			data={data.slice(0, 5)}
			{columns}
			overlay={"Loading..."}
			footer={true}
		/>
	</div>
	<h4>Overlay as a component</h4>
	<div>
		<Grid
			{data}
			{columns}
			overlay={showOverlay ? Overlay : null}
			footer={true}
			onoverlaybuttonclick={showData}
		/>
	</div>
</div>
