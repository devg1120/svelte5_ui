<script>
	import { getData } from "../data";
	import { Grid, HeaderMenu } from "../../src/";
	import { Willow, Locale } from "wx-svelte-core";

	const { data } = getData();

	const columns = [
		{ id: "id", width: 50 },
		{ id: "city", header: "City", width: 160, hidden: true },
		{ id: "firstName", header: "First Name", flexgrow: 1 },
		{ id: "lastName", header: "Last Name", flexgrow: 1 },
		{ id: "companyName", header: "Company", flexgrow: 1 },
	];

	let api = $state();
</script>

<Willow>
	<Locale>
		<div style="padding: 20px;">
			<div>
				<HeaderMenu
					columns={{ city: true, firstName: true, id: true }}
					{api}
				>
					<Grid {data} {columns} bind:this={api} />
				</HeaderMenu>
			</div>
		</div>
	</Locale>
</Willow>
