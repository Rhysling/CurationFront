<svelte:options runes={true} />

<script lang="ts">
	import {
		getUserList,
		postSaveUser,
		postDestroyUser,
		postUpdatePw,
	} from "../js/db-ops";
	import { getEmptyUser } from "../js/utils";
	import Menu from "../components/Menu.svelte";
	import EditUser from "../components/EditUser.svelte";
	import EditPw from "../components/EditPw.svelte";

	let userList: UserClientRemote[] = $state([]);
	let isListEditMode = $state(false);
	let editingUserId = $state(0);
	let userListDisplay: UserClientRemote[] = $state([]);
	let isEditPw = $state(false);
	let userSetPw: UserClientRemote | undefined = $state(undefined);

	const loadList = async () => {
		try {
			userList = ((await getUserList()) || []).sort((a, b) => a.id - b.id);
			userListDisplay = [getEmptyUser(), ...userList];
		} catch (error) {
			console.error(error);
		}
	};

	const setEditMode = (userId: number, isEdit: boolean) => {
		editingUserId = userId;
		isListEditMode = isEdit;
	};

	const saveUser = async (user: UserClientRemote) => {
		const result = await postSaveUser(user);

		if (typeof result === "string") {
			alert(result);
			return;
		}

		userListDisplay = [];
		await loadList();
	};

	const destroyUser = async (user: UserClientRemote) => {
		const result = await postDestroyUser(user);

		if (result) {
			alert(result);
			return;
		}

		await loadList();
	};

	const openSetPw = (email: string, isOpen: boolean) => {
		userSetPw = userList.find((u) => u.email === email);
		isEditPw = isOpen;
	};

	const savePw = async (ul: UserLogin) => {
		await postUpdatePw(ul);
		userListDisplay = [];
		await loadList();
	};

	loadList();
</script>

<div class="title">Admin Users</div>

<div class="user-list">
	{#each userListDisplay as user (user.id)}
		<EditUser
			userIn={user}
			{isListEditMode}
			{editingUserId}
			{setEditMode}
			{saveUser}
			{destroyUser}
			{openSetPw}
		/>
	{/each}
</div>

<Menu />

{#if isEditPw}
	<EditPw userIn={userSetPw} {savePw} {openSetPw} />
{/if}

<style lang="scss">
	@use "../styles/custom-variables" as c;

	.title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		margin: 1rem auto;
	}

	.user-list {
		display: grid;
		grid-template-columns: 1fr 7rem;
		gap: 0.5rem 0;
		max-width: 600px;
		margin: 1rem auto;
		// border-top: 1px solid black;
		// border-bottom: 1px solid black;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
