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
	};

	let {
		picItem,
		isListEditMode,
		editingPicId,
		setEditMode,
		savePic,
		savePicWithImg,
	}: EditPicProps = $props();

	const getEmptyPicItem = () => {
		const p: PictureItem = {
			id: 0,
			fileName: "",
			seq: 0,
			keywords: [],
			description: "",
			isMissing: false,
			isDeleted: false,
		};
		return { ...p };
	};

	let pic: PictureItem = $state({ ...picItem });
	let isEditMode = $state(false);

	const setItemEditMode = (picId: number, isEdit: boolean) => {
		setEditMode(picId, isEdit);

		if (picId === 0) pic = getEmptyPicItem();

		isEditMode = isEdit;
	};
</script>

<div
	class="pic-img"
	style:background-image={pic.fileName ? `url("pics/${pic.fileName}")` : null}
	style="background-color:pink;"
>
	{#if isListEditMode && pic.id === editingPicId}
		<PicDrop bind:picItem={pic} {savePicWithImg} {setItemEditMode} />
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
		<span style:font-style={pic.id === 5 ? "italic" : "normal"}
			>Id: {pic.id === 5 ? "New" : pic.id}</span
		>
		{#if isEditMode}<input
				type="text"
				class="info"
				style:width="4rem"
				bind:value={pic.seq}
			/>
		{:else}<span>Seq: {pic.seq}</span>
		{/if}
		<span>{pic.fileName}</span>
	</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class="info"
				bind:value={pic.description}
				placeholder="Title"
			/>
		{:else}Title: {pic.description}
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
			<input type="checkbox" checked={pic.isDeleted} style="width:auto;" />
		{:else if pic.isDeleted}<span style="font-style:italic;">Deleted</span>{/if}
		{#if pic.isMissing}
			<span style="font-style:italic;font-weight:bold;font-color:red;"
				>Deleted</span
			>
		{/if}
		&nbsp;
	</div>
	<div
		class="cover"
		class:visible={isListEditMode && pic.id !== editingPicId}
	></div>
</div>
<div class="pic-controls">
	{#if isEditMode}
		<div>
			<button
				onclick={() => {
					savePic(pic);
					setEditMode(0, false);
					isEditMode = false;
				}}>Save</button
			>
			<button
				onclick={() => {
					setEditMode(0, false);
					isEditMode = false;
				}}>Cancel</button
			>
		</div>
	{:else}<button
			onclick={() => {
				setEditMode(pic.id, true);
				isEditMode = true;
			}}>Edit</button
		>
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

	@media only screen and (width <= c.$bp-small) {
	}
</style>
