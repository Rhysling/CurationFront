<svelte:options runes={true} />

<script lang="ts">
	type EditUserProps = {
		userIn: UserClientRemote;
		isListEditMode: boolean;
		editingUserId: number;
		setEditMode: (userId: number, isEdit: boolean) => void;
		saveUser: (user: UserClientRemote) => void;
	};

	type ValidationState = boolean | undefined;

	let {
		userIn,
		isListEditMode,
		editingUserId,
		setEditMode,
		saveUser,
	}: EditUserProps = $props();

	const getEmptyUser = () => {
		const u: UserClientRemote = {
			id: 0,
			email: "",
			fullName: "",
			token: "",
			isAdmin: false,
			isDisabled: false,
			isDeleted: false,
		};
		return { ...u };
	};

	// *** State ***
	//svelte-ignore state_referenced_locally
	let userEdited: UserClientRemote = $state({ ...userIn });
	let isEditMode = $state(false);
	let isValidEmail: ValidationState = $state(undefined);
	let isValidFullName: ValidationState = $state(undefined);
	let isValidAll: boolean = $derived(!!isValidEmail && !!isValidFullName);

	// ** Validations **
	const validateEmail = () =>
		(isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEdited.email));
	const validateFullName = () => (isValidFullName = !!userEdited.fullName);
	const validateAll = () => {
		validateEmail();
		validateFullName();
	};

	// ** Edit / Save / Cancel **
	const edit = () => {
		setEditMode(userEdited.id, true);
		isEditMode = true;
	};

	const save = () => {
		validateAll();
		if (isValidAll) {
			saveUser(userEdited);
			setEditMode(0, false);
			isValidEmail = undefined;
			isValidFullName = undefined;
			isEditMode = false;
		}
	};

	const cancel = () => {
		userEdited = { ...userIn };
		setEditMode(0, false);
		isValidEmail = undefined;
		isValidFullName = undefined;
		isEditMode = false;
	};
</script>

<div class="user-info">
	<div style:font-style={userEdited.id === 0 ? "italic" : "normal"}>
		Id: {userEdited.id}
	</div>
	<div style:font-style={userEdited.id === 0 ? "italic" : "normal"}>
		{userEdited.id === 0 ? "New" : ""}
	</div>
	<div>Email:</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class:info={isValidEmail === undefined}
				class:success={isValidEmail === true}
				class:error={isValidEmail === false}
				onblur={validateEmail}
				bind:value={userEdited.email}
				placeholder="Email"
			/>
		{:else}{userEdited.email}
		{/if}
	</div>
	<div>Full Name:</div>
	<div>
		{#if isEditMode}<input
				type="text"
				class:info={isValidFullName === undefined}
				class:success={isValidFullName === true}
				class:error={isValidFullName === false}
				onblur={validateFullName}
				bind:value={
					() => userEdited.fullName,
					(v) => (userEdited.fullName = (v || "").trim())
				}
				placeholder="Full Name"
			/>
		{:else}{userEdited.fullName}
		{/if}
	</div>
	<div>&nbsp;</div>
	<div>
		<span>
			{#if isEditMode}<span>Is Admin</span>
				<input
					type="checkbox"
					bind:checked={userEdited.isAdmin}
					style="width:auto;"
				/>
			{:else if userEdited.isAdmin}<span class="warning">Admin</span>{/if}
		</span>

		<span>
			{#if isEditMode}<span>Is Disabled</span>
				<input
					type="checkbox"
					bind:checked={userEdited.isDisabled}
					style="width:auto;"
				/>
			{:else if userEdited.isDisabled}<span class="warning">Disabled</span>{/if}
		</span>

		<span>
			{#if isEditMode}<span>Is Deleted</span>
				<input
					type="checkbox"
					bind:checked={userEdited.isDeleted}
					style="width:auto;"
				/>
			{:else if userEdited.isDeleted}<span class="warning">Deleted</span>{/if}
		</span>
	</div>
	<div
		class="cover"
		class:visible={isListEditMode && userEdited.id !== editingUserId}
	></div>
</div>

<div class="pic-controls">
	{#if isEditMode}
		<div>
			<button onclick={save}>Save</button><br />
			<button onclick={cancel}>Cancel</button>
		</div>
	{:else}<button onclick={edit}>Edit</button>
	{/if}
	<div
		class="cover"
		class:visible={isListEditMode && userEdited.id !== editingUserId}
	></div>
</div>

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.user-info {
		position: relative;
		display: grid;
		grid-template-columns: 6rem auto;
		padding: 0.5rem;
		line-height: 1.8rem;
		background-color: c.$light-background;

		> div {
			min-height: 1.5rem;
		}

		span {
			display: inline-block;
			margin: 0;
			padding: 0 1rem 0 0;
			min-width: 4rem;

			> span {
				padding: 0 0.25rem 0 0;
			}
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
