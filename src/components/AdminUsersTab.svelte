<svelte:options runes={true} />

<script lang="ts">
	import {
		getUserList,
		postSaveUser,
		postDestroyUser,
		postUpdatePw,
	} from "../js/db-ops";
	import { getEmptyUser } from "../js/utils";
	import EditUser from "./EditUser.svelte";
	import EditPw from "./EditPw.svelte";

	let userList: UserClientRemote[] = $state([]);
	let isListEditMode = $state(false);
	let editingUserId = $state(0);
	let isEditPw = $state(false);
	let userSetPw: UserClientRemote | undefined = $state(undefined);

	const loadList = async () => {
		try {
			userList = [
				getEmptyUser(),
				...((await getUserList()) || []).sort((a, b) => a.id - b.id),
			];
		} catch (error) {
			console.error(error);
		}
	};

	const setEditMode = (userId: number, isEdit: boolean) => {
		editingUserId = userId;
		isListEditMode = isEdit;
	};

	const saveUser = async (user: UserClientRemote): Promise<boolean> => {
		const result = await postSaveUser(user);

		if (typeof result === "string") {
			alert(result);
			return false;
		}

		if (!result) {
			alert("Failed to save user. Please try again.");
			return false;
		}

		await loadList();
		return true;
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

	const savePw = async (ul: UserLogin): Promise<boolean> => {
		const ok = await postUpdatePw(ul);
		if (!ok) return false;
		const ix = userList.findIndex(
			(u) => u.email.toLocaleLowerCase() === ul.email.toLocaleLowerCase(),
		);
		if (ix >= 0) userList[ix].hasPw = true;
		return true;
	};

	loadList();
</script>

<div class="user-list">
	{#each userList as user (user.id)}
		<EditUser
			userIn={user}
			{userList}
			{isListEditMode}
			{editingUserId}
			{setEditMode}
			{saveUser}
			{destroyUser}
			{openSetPw}
		/>
	{/each}
</div>

{#if isEditPw}
	<EditPw userIn={userSetPw} {savePw} {openSetPw} />
{/if}

<style lang="scss">
	.user-list {
		display: grid;
		grid-template-columns: 1fr 7rem;
		gap: 0.5rem 0;
		max-width: 600px;
		margin: 1rem auto;
	}
</style>
