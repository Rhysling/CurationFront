<svelte:options runes={true} />

<script lang="ts">
	import type { AxiosResponse } from "axios";
	import Modal from "./Modal.svelte";
	import { user, getIsLoggedIn, logOut } from "../stores/user-store.svelte";
	import { getHttpClient as ax } from "../stores/httpclient-store.svelte";

	let { isOpen = $bindable(false) } = $props();

	let userLogin: UserLogin = $state({
		email: "",
		pw: "",
	});

	let isValidEmail: boolean | null = $state(null); // null / true / false
	let emailValidationMessage = $state("");
	let submitErrorMessage = $state("");

	let showLogin = () => {
		isOpen = true;
		setTimeout(() => document.getElementById("login-email")?.focus(), 200);
	};

	let resetUserLogin = () => {
		isValidEmail = null;
		emailValidationMessage = "";
		submitErrorMessage = "";

		userLogin = {
			email: "",
			pw: "",
		};
	};

	let signOut = () => {
		logOut();
	};

	let validateEmail = function () {
		emailValidationMessage = "";
		userLogin.email = userLogin.email.trim();

		if (userLogin.email == "") {
			emailValidationMessage = "Email required.";
			isValidEmail = false;
			return;
		}

		isValidEmail =
			/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
				userLogin.email,
			);

		if (!isValidEmail)
			emailValidationMessage = "Email address doesn't look right.";
	};

	const signInOut = function () {
		if (getIsLoggedIn()) {
			signOut();
			isOpen = false;
			return;
		}

		validateEmail();

		if (!isValidEmail) return;

		ax()
			.post("/api/Users/Login", userLogin)
			.then(function (response: AxiosResponse<UserClientRemote>) {
				if (response.data) user.value = response.data;

				resetUserLogin();
				isOpen = false;
			})
			.catch(function (error) {
				if (error?.response?.status) {
					let s = +error.response.status;
					submitErrorMessage =
						s >= 400 && s < 500
							? "Email/password incorrect."
							: "Something went wrong.";
				} else {
					submitErrorMessage = "Something went wrong.";
				}
			});
	};

	let cancel = function () {
		resetUserLogin();
		isOpen = false;
	};

	let focusEmail = () => document.getElementById("login-email")?.focus();

	$effect(() => {
		if (isOpen && !getIsLoggedIn()) focusEmail();
	});
</script>

<Modal bind:isOpen>
	<div class="sign-in">
		<div class="title">{getIsLoggedIn() ? "Sign Out" : "Sign In"}</div>
		{#if getIsLoggedIn()}
			<div>{user?.value?.fullName} ({user?.value?.email})</div>
		{:else}
			<input
				id="login-email"
				type="email"
				class="signin"
				placeholder="Email"
				bind:value={userLogin.email}
				onblur={validateEmail}
			/>
			<div class="error">{emailValidationMessage}&nbsp;</div>

			<input
				id="login-pw"
				type="password"
				class="signin"
				placeholder="Password"
				bind:value={userLogin.pw}
			/>
		{/if}
		<div>
			<button onclick={signInOut} disabled={isValidEmail === false}>Go</button>
			<button onclick={cancel} class="secondary">Cancel</button>
		</div>
		<div class="error">{submitErrorMessage}&nbsp;</div>
	</div>
</Modal>

<style lang="scss">
	@use "../styles/_custom-variables" as c;
	@use "sass:color";

	.title {
		font-size: 1.75rem;
		font-weight: bold;
		text-align: center;
		text-wrap: balance;
	}

	.sign-in {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: center;
		padding: 1.2rem 0;
		background-color: c.$body-background;
		border: 1px solid c.$secondary-color;
		border-radius: 0.5rem;

		input {
			margin: 1rem 0 0;
			width: 200px;
		}

		button {
			margin: 1rem 0 0;
		}
	}

	.error {
		margin: 0.25rem 0 0;
		color: c.$color-error;
		font-size: 0.85rem;
	}

	@media only screen and (width <= c.$bp-small) {
	}
</style>
