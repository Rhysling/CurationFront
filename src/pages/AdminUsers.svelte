<svelte:options runes={true} />

<script lang="ts">
	import { getUserList, postUser } from "../js/db-ops";
	import Menu from "../components/Menu.svelte";
	import EditUser from "../components/EditUser.svelte";

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

	let userList = $state([] as UserClientRemote[]);
	let isListEditMode = $state(false);
	let editingUserId = $state(0);
	let emptyUserItem = $state(getEmptyUser());

	let userListDisplay: UserClientRemote[] = $derived([
		emptyUserItem,
		...userList,
	]);

	const loadList = async () => {
		try {
			userList = ((await getUserList())?.data || []).sort(
				(a, b) => a.id - b.id,
			);
		} catch (error) {
			console.error(error);
		}
	};

	const setEditMode = (userId: number, isEdit: boolean) => {
		editingUserId = userId;
		isListEditMode = isEdit;
	};

	const saveUser = async (user: UserClientRemote) => {
		let u = userList.find((a) => a.id === user.id);
		if (u) u = user;
		await postUser(user);
	};

	const refreshUserList = (users: UserClientRemote[]) => {
		userList = users.sort((a, b) => a.id - b.id);
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
		/>
	{/each}
</div>

<Menu />

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
