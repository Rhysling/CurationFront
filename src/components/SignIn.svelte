<svelte:options runes={true} />

<script lang="ts">
	import type { AxiosResponse } from "axios";
	import Modal from "./Modal.svelte";
	import { user, getIsLoggedIn } from "../stores/user-store.svelte";
	import { getHttpClient as ax } from "../stores/httpclient-store.svelte";

	let { isOpen = $bindable(false) } = $props();

	//let isShowModal = $derived(isOpen);
	let userLogin: UserLogin = $state({
		email: "",
		pw: "",
	});

	let isValidEmail: boolean | null = $state(null); // null / true / false
	let emailValidationMessage = $state("Test error message here");
	let submitErrorMessage = $state("Test error message here");

	let showLogin = () => {
		isOpen = true;
		setTimeout(() => document.getElementById("login-email")?.focus(), 200);
	};

	let resetUserLogin = () => {
		isValidEmail = null;
		emailValidationMessage = "Test error message here";
		submitErrorMessage = "Test error message here";

		userLogin = {
			email: "",
			pw: "",
		};
	};

	let signOut = () => {
		user.logOut();
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

	let signIn = function () {
		validateEmail();

		if (!isValidEmail) return;

		ax()
			.post("/api/Login", userLogin)
			.then(function (response: AxiosResponse<UserClientRemote>) {
				user.value = response.data;
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
</script>

<Modal bind:isOpen>
	<div class="sign-in">
		<div class="title">Sign In</div>
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
		<div>
			<button onclick={signIn} disabled={isValidEmail === false}>Go</button>
			<button onclick={cancel} class="secondary">Cancel</button>
		</div>
		<div class="error">{submitErrorMessage}&nbsp;</div>
	</div>
</Modal>

<style lang="scss">
	@use "../styles/_custom-variables" as c;
	@use "sass:color";

	.title {
		font-size: 1.5rem;
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
