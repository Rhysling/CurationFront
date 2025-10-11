<svelte:options runes={true} />

<script lang="ts">
	import Dropzone from "svelte-file-dropzone";

	type DropzoneFile = {
		path: string; //"sitting-duck.jpg"
		lastModified: number; //1667602703000
		lastModifiedDate: string; //Fri Nov 04 2022 15:58:23 GMT-0700 (Pacific Daylight Time) {}
		name: string; //"sitting-duck.jpg"
		size: number; //52274
		type: string; //"image/jpeg"
	};

	type PicDropProps = {
		picItem: PictureItem;
		savePicWithImg: (form: FormData) => void;
		setItemEditMode: (picId: number, isEdit: boolean) => void;
	};

	let {
		picItem = $bindable(),
		savePicWithImg,
		setItemEditMode,
	}: PicDropProps = $props();

	const handlePicDropped = (e: CustomEvent) => {
		const {
			acceptedFiles,
			fileRejections,
		}: { acceptedFiles: DropzoneFile[]; fileRejections: DropzoneFile[] } =
			e.detail;

		if (fileRejections.length) {
			alert("Can only take gif/jpeg/jpg/png files.");
			return;
		}

		if (!picItem.description) {
			alert("Need a title first.");
			return;
		}

		if (acceptedFiles.length) {
			picItem.fileName = acceptedFiles[0].name;
			//console.log($state.snapshot(picItem));
			const formData = new FormData();
			formData.append("file", acceptedFiles[0] as any);
			formData.append("picItemJSON", JSON.stringify(picItem));
			savePicWithImg(formData);
			setItemEditMode(0, false);
		}

		//console.log({ acceptedFiles, fileRejections });
	};

	const stopProp = (e: Event) => e.stopPropagation();
</script>

<div class="dz-frame">
	<Dropzone
		on:drop={handlePicDropped}
		on:click={stopProp}
		containerClasses={"dz-wrap"}
		accept=".gif,.jpg,.jpeg,.png"
	>
		<p>Drop new picture here or click to search for file.</p>
	</Dropzone>
</div>

<style lang="scss">
	@use "../styles/_custom-variables" as c;

	.dz-frame {
		display: flex;
		box-sizing: border-box;
		height: 150px;
		width: 150px;
		border: 2px solid c.$main-color;
		margin: 0;
	}

	:global(.dropzone.dz-wrap) {
		box-sizing: border-box;
		margin: 0;
		padding: 1.3rem 0.65rem !important;
		font-size: 0.9rem;
		font-weight: bold;
		color: c.$main-darker !important;
		background-color: rgba(255, 255, 255, 0.8) !important;
		border: none !important;
		border-radius: 0 !important;

		&:hover {
			box-shadow: 0 0 6px 6px c.$main-color inset;
		}
	}
</style>
