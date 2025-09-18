<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Button, DateField, Dialog, SelectField, TextField, type MenuOption } from 'svelte-ux';
	import { z } from 'zod';
	import { ModalTitle, ImageUpload } from '$lib';
	import { fetch_api, handle_keydown } from '$lib/helpers';

	let open = $state(false);
	let image_file: File | null = $state(null);
	let main_broadcast_search:
		| ((text: string, options: MenuOption<any>[]) => Promise<MenuOption<any>[]>)
		| undefined = $state(undefined);

	let { invalidate_all }: { invalidate_all: () => void } = $props();

	const schema = z.object({
		name: z.union([z.string(), z.null()]),
		region: z.union([z.string(), z.null()]),
		start_date: z.union([z.date(), z.null()]),
		start_time: z.union([z.string(), z.null()]),
		end_date: z.union([z.date(), z.null()]),
		end_time: z.union([z.string(), z.null()]),
		main_broadcast: z.union([z.string(), z.null()])
	});

	type SchemaDataType = z.infer<typeof schema>;

	let schema_data: SchemaDataType = $state({
		name: null,
		region: null,
		start_date: null,
		start_time: null,
		end_date: null,
		end_time: null,
		main_broadcast: null
	});

	let data_stringified = $derived(JSON.stringify(schema_data));

	function close_form() {
		open = false;
		reset_schema_data();
	}

	function reset_schema_data() {
		schema_data = {
			name: null,
			region: null,
			start_date: null,
			start_time: null,
			end_date: null,
			end_time: null,
			main_broadcast: null
		};
	}

	let regions: MenuOption[] = $state([]);

	onMount(async () => {
		let res = await fetch_api('/select/region');
		regions = res.data;
	});

	$inspect(main_broadcast_search);
</script>

<div
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		handle_keydown(e, () => {
			open = true;
		});
	}}
	onclick={() => {
		open = true;
	}}
	class="group grid h-24 cursor-pointer place-content-center rounded-md bg-zinc-800/90 hover:bg-zinc-800"
>
	<i class="fa-light fa-plus group-hover:fa-normal text-2xl text-green-300"></i>
</div>

<Dialog
	bind:open
	class="m-6 max-h-[calc(100%_-_5rem)] w-full mobile:max-w-[600px]"
	classes={{ backdrop: 'bg-white/30' }}
	persistent
>
	<div slot="title" class="flex items-center justify-between">
		<ModalTitle title="Create Event" {close_form} />
	</div>
	<hr class="my-2 border-zinc-600/50" />
	<form
		class="space-y-3 pb-6"
		method="POST"
		action="/organize?/create"
		enctype="multipart/form-data"
		use:enhance={({ cancel }) => {
			try {
				close_form();
			} catch (error) {
				console.log(error);
			}

			return async ({ result }) => {
				// handle_form_result(result);
				invalidate_all();
			};
		}}
	>
		<input type="hidden" name="data" value={data_stringified} />
		<div class="space-y-3 px-6 py-2">
			<div class="grid grid-cols-[1fr_auto] gap-2">
				<TextField
					required
					label="Name"
					labelPlacement="top"
					placeholder="Event name..."
					classes={{ input: 'text-zinc-400' }}
					bind:value={schema_data.name}
				/>
				<ImageUpload bind:value={image_file} />
			</div>
			<div class="grid grid-cols-2 gap-2">
				<SelectField
					required
					bind:value={schema_data.region}
					label="Region"
					labelPlacement="top"
					placeholder="No selection"
					classes={{
						options: 'max-h-[200px] text-zinc-400',
						field: {
							input: 'text-zinc-400'
						}
					}}
					options={regions}
					clearable={false}
				/>
				<TextField
					required
					label="Main Broadcast"
					labelPlacement="top"
					placeholder="Twitch handle..."
					classes={{ input: 'text-zinc-400' }}
					bind:value={schema_data.main_broadcast}
				/>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<DateField
					required={false}
					bind:value={schema_data.start_date}
					classes={{
						field: {
							input: 'text-zinc-400'
						}
					}}
					label="Start Date"
					labelPlacement="top"
					picker
					clearable
				/>
				<div class="flex flex-col gap-[5px]">
					<h1 class="text-[13px] font-medium text-[#8D8D90]">Start Time</h1>
					<input
						bind:value={schema_data.start_time}
						type="time"
						class="h-[37px] rounded-[4px] border border-zinc-600 bg-zinc-800 px-2 text-sm text-zinc-400 focus:outline-none"
					/>
				</div>
				<DateField
					required={false}
					bind:value={schema_data.end_date}
					classes={{
						field: {
							input: 'text-zinc-400'
						}
					}}
					label="End Date"
					labelPlacement="top"
					picker
					clearable
				/>
				<div class="flex flex-col gap-[5px]">
					<h1 class="text-[13px] font-medium text-[#8D8D90]">End Time</h1>
					<input
						bind:value={schema_data.end_time}
						type="time"
						class="h-[37px] rounded-[4px] border border-zinc-600 bg-zinc-800 px-2 text-sm text-zinc-400 focus:outline-none"
					/>
				</div>
			</div>
		</div>
		<hr class="my-2 border-zinc-600/50" />
		<div class="px-6">
			<div class="mt-6 grid grid-cols-2 gap-3">
				<Button
					onclick={close_form}
					classes={{ root: 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300' }}>Cancel</Button
				>
				<Button type="submit" class="bg-red-400 font-normal text-zinc-800 hover:bg-red-400/90"
					>Create</Button
				>
			</div>
		</div>
	</form>
</Dialog>
