<svelte:options runes={true} />

<script lang="ts">
	import { postPic, postPicWithImg, postDestroyPic } from "../js/db-ops";
	import EditPic from "./EditPic.svelte";
	import Modal from "../components/Modal.svelte";

	let {
		isOpen = $bindable(true),
		picItem,
		updatePicItem,
	}: {
		picItem: PictureItem;
		isOpen: boolean;
		updatePicItem: (pi: PictureItem) => void;
	} = $props();

	//svelte-ignore state_referenced_locally
	//let pic = $state({ ...picItem });

	const savePic = async (pic: PictureItem): Promise<boolean> => {
		const savedPic = await postPic(pic);
		if (!savedPic) {
			alert("Failed to save picture. Please try again.");
			return false;
		}

		updatePicItem(savedPic);
		isOpen = false;
		return true;
	};

	const savePicWithImg = async (form: FormData): Promise<boolean> => {
		const savedPic = await postPicWithImg(form);
		if (!savedPic) {
			alert("Failed to save picture. Please try again.");
			return false;
		}

		updatePicItem(savedPic);
		isOpen = false;
		return true;
	};

	const destroyPic = async (pic: PictureItem): Promise<boolean> => {
		const response = await postDestroyPic(pic);
		if (!response?.ok) {
			alert("Failed to destroy picture. Please try again.");
			return false;
		}

		pic.fileName = "";
		pic.isDeleted = true;
		updatePicItem(pic);

		isOpen = false;
		return true;
	};
</script>

<Modal bind:isOpen>
	<div class="wrap">
		<EditPic
			{picItem}
			picList={[]}
			isListEditMode={true}
			isEditOnly={true}
			editingPicId={picItem.id}
			setEditMode={(picId: number, isEditMode: boolean) => {
				if (picId === 0 && !isEditMode) isOpen = false;
			}}
			{savePic}
			{savePicWithImg}
			{destroyPic}
		/>
	</div>
</Modal>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		border-radius: 0.5rem;
		//background-color: rgb(from c.$main-color r g b / 0.5);
		//background-color: hsla(from c.$main-color calc(h + 240) s l / 0.5);
		background-color: rgb(from #fff r g b / 0.5);

		> :global(.pic-info) {
			border: 2px solid c.$main-color;
			border-radius: 0.5rem;
		}
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
