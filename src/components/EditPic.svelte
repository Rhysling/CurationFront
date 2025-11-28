<svelte:options runes={true} />

<script lang="ts">
	import PicDrop from "./PicDrop.svelte";

	type EditPicProps = {
		picItem: PictureItem;
		isListEditMode: boolean;
		editingPicId: number;
		setEditMode: (picId: number, isEdit: boolean) => void;
		savePic: (pic: PictureItem) => void;
		savePicWithImg: (form: FormData) => void;
		destroyPic: (pic: PictureItem) => void;
	};

	type ValidationState = boolean | undefined;

	let {
		picItem,
		isListEditMode,
		editingPicId,
		setEditMode,
		savePic,
		savePicWithImg,
		destroyPic,
	}: EditPicProps = $props();

	const getEmptyPicItem = () => {
		const p: PictureItem = {
			id: 0,
			fileName: "",
			seq: 0,
			ts: 0,
			keywords: [],
			description: "",
			isMissing: false,
			isDeleted: false,
		};
		return { ...p };
	};

	// *** State ***
	let pic: PictureItem = $state({ ...picItem });
	let isEditMode = $state(false);
	let isValidSeq: ValidationState = $state(undefined);
	let isValidFileName: ValidationState = $state(undefined);
	let isValidAll: boolean = $derived(!!isValidSeq && !!isValidFileName);

	// ** Validations **
	const validateSeq = () => (isValidSeq = !isNaN(pic.seq));
	const validateFileName = () => {
		if (!picItem.fileName && !pic.fileName) {
			isValidFileName = true;
			return;
		}

		const rx = /[^A-Za-z0-9\-_\.]/;
		if (rx.test(pic.fileName)) {
			isValidFileName = false;
			return;
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
			return;
		}

		isValidFileName = true;
	};

	const validateAll = () => {
		validateSeq();
		validateFileName();
	};

	// ** Edit / Save / Destroy / Cancel **
	const edit = () => {
		setEditMode(pic.id, true);
		isEditMode = true;
	};

	const save = () => {
		validateAll();
		if (isValidAll) {
			if (pic.description) pic.description = pic.description.trim();
			pic.ts = parseInt(<string>(<unknown>pic.ts)) || 0;
			savePic(pic);
			setEditMode(0, false);
			isValidSeq = undefined;
			isValidFileName = undefined;
			isEditMode = false;
		}
	};

	const destroy = () => {
		let isOk = confirm(
			`Are you sure you want to DESTROY picture Id ${pic.id}? This action cannot be undone.`,
		);

		if (isOk) {
			destroyPic(pic);
			setEditMode(0, false);
			isValidSeq = undefined;
			isValidFileName = undefined;
			isEditMode = false;
		}
	};

	const cancel = () => {
		pic = { ...picItem };
		setEditMode(0, false);
		isValidSeq = undefined;
		isValidFileName = undefined;
		isEditMode = false;
	};

	// ** PicDrop functions **
	const setItemEditMode = (picId: number, isEdit: boolean) => {
		setEditMode(picId, isEdit);

		if (picId === 0) pic = getEmptyPicItem();

		isEditMode = isEdit;
	};

	const savePicWithImgDZ = (form: FormData, newPic: PictureItem) => {
		savePicWithImg(form);
		//setTimeout(() => (pic.fileName = fileName), 600);
		pic = newPic;
	};
</script>

<div
	class="pic-img"
	style:background-image={pic.fileName ? `url("pics/${pic.fileName}")` : null}
	style="background-color:pink;"
>
	{#if isListEditMode && pic.id === editingPicId}
		<PicDrop
			{pic}
			{isValidAll}
			{validateAll}
			{savePicWithImgDZ}
			{setItemEditMode}
		/>
	{:else}
		&nbsp;
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
		{#if isEditMode && pic.fileName}<input
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
		{#if isEditMode}<input type="text" class="plain" bind:value={pic.ts} />
			<button
				class="small"
				onclick={() => (pic.ts = Math.floor(new Date().getTime() / 1000))}
				>Now</button
			>
		{:else}<span style:font-style={pic.ts ? "normal" : "italic"}
				>{pic.ts ? "Ts:" + pic.ts : "No Timestamp"}</span
			>
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
			<button onclick={save}>Save</button>
			<button onclick={cancel}>Cancel</button>
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
		height: 150px;
		width: 150px;
		background-size: cover;
		background-repeat: no-repeat; /* Prevents the image from repeating if it's smaller than the element */
		background-position: center center; /* Centers the image within the element */
	}

	.pic-info {
		position: relative;
		padding: 0.5rem;
		line-height: 1.8rem;
		background-color: c.$light-background;

		span {
			display: inline-block;
			margin: 0;
			padding: 0 0.25rem 0 0;
			min-width: 4rem;
		}

		input {
			// outline: 1px solid c.$color-info;
			// background-color: c.$color-info-bg;
			font-size: 0.9rem;
			width: min(300px, 80%);
			padding: 0.2rem 0.4rem;
		}
	}

	.pic-controls {
		position: relative;
		display: flex;
		align-items: center;

		button {
			margin: 0.3rem 0 0.3rem 0.6rem;
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

	@media only screen and (width <= c.$bp-small) {
	}
</style>
