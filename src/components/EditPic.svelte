<svelte:options runes={true} />

<script lang="ts">
	import { getEmptyPicItem } from "../js/utils";
	import PicDrop from "./PicDrop.svelte";

	type EditPicProps = {
		picItem: PictureItem;
		picList: PictureItem[];
		isListEditMode: boolean;
		editingPicId: number;
		setEditMode: (picId: number, isEdit: boolean) => void;
		savePic: (pic: PictureItem) => Promise<boolean>;
		savePicWithImg: (form: FormData) => Promise<boolean>;
		destroyPic: (pic: PictureItem) => Promise<boolean>;
	};

	let {
		picItem,
		picList,
		isListEditMode,
		editingPicId,
		setEditMode,
		savePic,
		savePicWithImg,
		destroyPic,
	}: EditPicProps = $props();

	// *** State ***
	//svelte-ignore state_referenced_locally
	let pic: PictureItem = $state({ ...picItem });
	let isEditMode = $state(false);
	let isValidSeq: ValidationState = $state(undefined);
	let isValidFileName: ValidationState = $state(undefined);
	let isValidLink: ValidationState = $state(undefined);
	let isValidAll: ValidationState = $derived.by(() => {
		if (
			isValidSeq === undefined &&
			isValidFileName === undefined &&
			isValidLink === undefined
		)
			return undefined;
		if (
			isValidSeq === false ||
			isValidFileName === false ||
			isValidLink === false
		)
			return false;
		return true;
	});

	// ** Validations **
	const validateSeq = () => {
		isValidSeq = !isNaN(pic.seq);
		return isValidSeq;
	};
	const validateFileName = () => {
		// If both old and new file names are empty, consider it valid (for new pics without an image)
		if (!picItem.fileName && !pic.fileName) {
			isValidFileName = true;
			return true;
		}

		const rx = /[^A-Za-z0-9\-_\.]/;
		if (rx.test(pic.fileName)) {
			isValidFileName = false;
			return false;
		}

		const fn = pic.fileName.toLowerCase();
		if (
			!(
				fn.endsWith(".jpeg") ||
				fn.endsWith(".jpg") ||
				fn.endsWith(".png") ||
				fn.endsWith(".gif")
			)
		) {
			isValidFileName = false;
			return false;
		}

		// No duplicate file names allowed (except if it's the same pic being edited)
		const stripExtLower: (str: string) => string = (str) =>
			str.substring(0, str.lastIndexOf(".")).toLowerCase();
		const fnNoExt = fn.substring(0, fn.lastIndexOf("."));

		if (
			picList.some(
				(a) => stripExtLower(a.fileName) === fnNoExt && a.id !== pic.id,
			)
		) {
			isValidFileName = false;
			return false;
		}

		isValidFileName = true;
		return true;
	};

	const validateLink = () => {
		if (!pic.link) {
			isValidLink = true;
			return true;
		}

		const rx = /^https?:\/\/\w+/;
		if (!rx.test(pic.link)) {
			isValidLink = false;
			return false;
		}

		isValidLink = true;
		return true;
	};

	const validateAll = () => {
		const vs = validateSeq();
		const vf = validateFileName();
		const vl = validateLink();
		return vs && vf && vl;
	};

	// ** Edit / Save / Destroy / Cancel **
	const edit = () => {
		setEditMode(pic.id, true);
		isEditMode = true;
	};

	const save = async () => {
		if (validateAll()) {
			if (pic.description) pic.description = pic.description.trim();
			// Clean Link
			if (pic.link) {
				pic.link = pic.link.trim();
				if (pic.link && !/^https?:\/\//.test(pic.link)) {
					pic.link = "https://" + pic.link;
				}
			}

			pic.ts = parseInt(<string>(<unknown>pic.ts)) || 0;
			const ok = await savePic(pic);
			if (!ok) return;
			setEditMode(0, false);
			isValidSeq = undefined;
			isValidFileName = undefined;
			isValidLink = undefined;
			isEditMode = false;
		}
	};

	const destroy = async () => {
		let isOk = confirm(
			`Are you sure you want to DESTROY picture Id ${pic.id}? This action cannot be undone.`,
		);

		if (isOk) {
			const ok = await destroyPic(pic);
			if (!ok) return;
			setEditMode(0, false);
			isValidSeq = undefined;
			isValidFileName = undefined;
			isValidLink = undefined;
			isEditMode = false;
		}
	};

	const cancel = () => {
		pic = { ...picItem };
		setEditMode(0, false);
		isValidSeq = undefined;
		isValidFileName = undefined;
		isValidLink = undefined;
		isEditMode = false;
	};

	// ** PicDrop functions **
	const setItemEditMode = (picId: number, isEdit: boolean) => {
		setEditMode(picId, isEdit);

		if (picId === 0) pic = getEmptyPicItem();

		isEditMode = isEdit;
	};

	const savePicWithImgDZ = async (
		form: FormData,
		newPic: PictureItem,
	): Promise<boolean> => {
		const ok = await savePicWithImg(form);
		if (ok) pic = newPic;
		return ok;
	};
</script>

<div style="background-color:white;position:relative;" id="pcid-{pic.id}">
	{#if isListEditMode && pic.id === editingPicId}
		<PicDrop {pic} {validateAll} {savePicWithImgDZ} {setItemEditMode} />
	{:else}
		<img
			id={"pic-" + pic.id}
			class="pic-img"
			src={pic.fileName
				? `/pics/${pic.fileName}`
				: "/assets/img/zzzzz-no-picture.png"}
			alt={pic.description}
			title={`ID: ${pic.id} | ${pic.description}`}
		/>
	{/if}
	<div
		class="cover"
		class:visible={isListEditMode && pic.id !== editingPicId}
	></div>
</div>
<div class="pic-info">
	<div>
		<span style:font-style={pic.id === 0 ? "italic" : "normal"}
			>Id: {pic.id === 0 ? "New" : pic.id}</span
		>
		{#if isEditMode}<input
				type="text"
				class:info={isValidSeq === undefined}
				class:success={isValidSeq === true}
				class:error={isValidSeq === false}
				style:width="4rem"
				onblur={validateSeq}
				bind:value={pic.seq}
			/>
		{:else}<span>Seq: {pic.seq}</span>
		{/if}
		{#if isEditMode && picItem.fileName}<input
				type="text"
				class:info={isValidFileName === undefined}
				class:success={isValidFileName === true}
				class:error={isValidFileName === false}
				onblur={validateFileName}
				bind:value={pic.fileName}
			/>
		{:else}<span style:font-style={pic.fileName ? "normal" : "italic"}
				>{pic.fileName || "No Filename"}</span
			>
		{/if}
	</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class="plain"
				bind:value={() => pic.description, (v) => (pic.description = v)}
				placeholder="Title"
			/>
		{:else}<span style:font-style={pic.description ? "normal" : "italic"}
				>{pic.description || "No Title"}</span
			>
		{/if}
	</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class:info={isValidLink === undefined}
				class:success={isValidLink === true}
				class:error={isValidLink === false}
				onblur={validateLink}
				bind:value={() => pic.link, (v) => (pic.link = v)}
				placeholder="Link URL"
			/>
		{:else}<span style:font-style={pic.link ? "normal" : "italic"}
				>{pic.link || "No Link URL"}</span
			>
		{/if}
	</div>
	<div>
		{#if isEditMode}<input type="text" class="plain" bind:value={pic.ts} />
			<button
				class="small"
				style="margin:0 0.25rem 0.5rem;"
				onclick={() => (pic.ts = Math.floor(new Date().getTime() / 1000))}
				>Now</button
			>
		{:else if pic.ts}
			<span>{`Ts:${pic.ts.toLocaleString()}`}</span>
			<span style="font-size:0.8rem;"
				>{`(${new Date(pic.ts * 1000).toLocaleString()})`}</span
			>
		{:else}
			<span style="font-style:italic;">No Timestamp</span>
		{/if}
	</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class="plain"
				bind:value={
					() => pic.keywords.join(","),
					(v) => (pic.keywords = v.split(",").map((a) => a.trim()))
				}
				placeholder="key,words,here"
			/>
		{:else}Keywords: {pic.keywords.join(",")}
		{/if}
	</div>
	<div>
		{#if isEditMode}<span>Is Deleted</span>
			<input type="checkbox" bind:checked={pic.isDeleted} style="width:auto;" />
			{#if pic.id}<button class="small" onclick={destroy}>Destroy</button>{/if}
		{:else}
			{#if pic.isDeleted}<span class="warning">Deleted</span>{/if}
			{#if pic.isMissing}<span class="error">Missing</span>{/if}
			{#if !pic.seq && pic.id != 0}<span class="error">Orphan</span>{/if}
		{/if}
	</div>
	<div
		class="cover"
		class:visible={isListEditMode && pic.id !== editingPicId}
	></div>
</div>
<div class="pic-controls">
	{#if isEditMode}
		<div>
			<button onclick={save} disabled={isValidAll === false}>Save</button>
			<button onclick={cancel} class="secondary">Cancel</button>
		</div>
	{:else}<button onclick={edit}>Edit</button>
	{/if}
	<div
		class="cover"
		class:visible={isListEditMode && pic.id !== editingPicId}
	></div>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.pic-img {
		position: relative;
		display: block;
		width: 100%;
		max-width: 150px;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		object-position: center center;
	}

	.pic-info {
		position: relative;
		padding: 0.5rem;
		line-height: 1.8rem;
		background-color: c.$light-background;
		min-width: 0;
		overflow-wrap: anywhere;

		span {
			display: inline-block;
			margin: 0;
			padding: 0 0.25rem 0 0;
			min-width: 4rem;
			max-width: 100%;
			overflow-wrap: anywhere;
		}

		input {
			// outline: 1px solid c.$color-info;
			// background-color: c.$color-info-bg;
			font-size: 0.9rem;
			width: min(300px, 70%);
			padding: 0.2rem 0.4rem;

			@media only screen and (width <= c.$bp-small) {
				font-size: 0.8rem;
			}
		}

		@media only screen and (width <= c.$bp-small) {
			line-height: 1.2rem;
		}
	}

	.pic-controls {
		position: relative;
		display: flex;
		align-items: center;

		button {
			margin: 0.3rem 0.6rem;

			@media only screen and (width <= c.$bp-small) {
				display: block;
				font-size: 0.85rem;
				padding: 0.25rem 0.5rem;
			}
		}
	}

	.cover {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.4);
		z-index: 10;
		display: none;

		&.visible {
			display: block;
		}
	}

	span {
		&.error {
			font-style: italic;
			font-weight: bold;
			color: c.$color-error;
			margin: 0 1rem 0 0;
		}

		&.warning {
			font-style: italic;
			font-weight: bold;
			color: c.$color-warning;
			margin: 0 1rem 0 0;
		}
	}
</style>
