<script lang="ts">
	type Tab = { id: number; label: string };

	let tabs: Tab[] = $state([
		{ id: 1, label: 'Alpha' },
		{ id: 2, label: 'Bravo' },
		{ id: 3, label: 'Charlie' },
		{ id: 4, label: 'Delta' }
	]);

	function handle_reorder(next: Tab[]) {
		tabs = next;
	}
</script>

<!-- <SortableFlex items={tabs} on_reorder={handle_reorder} /> -->

<!-- Optional: constrain row width to see edge clamping -->
<!-- <div style="width: fit; border: 1px solid #444; padding: 8px; margin-top: 12px;">
	<SortableFlex items={tabs} on_reorder={handle_reorder} />
</div> -->
