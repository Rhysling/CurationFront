import createAuth0Client, { Auth0Client, type IdToken } from '@auth0/auth0-spa-js';
import { getSettings } from './settings';
import { writable } from 'svelte/store';

interface IUserAuth0 {
	isAuthenticated: boolean;
	idTokenClaims: IdToken | undefined;
	authToken: string;
	fullName: string;
	email: string;
	userId: string;
	subscriptionKey: string;
	isAdmin: boolean;
	isDisabled: boolean;
}

declare var appIsProduction: boolean;

// *** auth0 ***
let auth0: Auth0Client | null = null;

const getEmptyU = () => {
	return {
		isAuthenticated: false,
		idTokenClaims: undefined,
		authToken: "",
		fullName: "",
		email: "",
		userId: "",
		subscriptionKey: "",
		isAdmin: false,
		isDisabled: false
	}
};

const u = writable<IUserAuth0>(getEmptyU());

/**
 * Initializes the Auth0 client
 */
const initAuth0Async = async () => {
	auth0 = await createAuth0Client(getSettings(appIsProduction).auth0);
	let isAuthenticated = await auth0.isAuthenticated();

	if (isAuthenticated) {
		await getIdTokenClaimsAsync();
		await getAuthTokenAsync();
	}

	u.update(a => {
		a.isAuthenticated = isAuthenticated
		return a;
	});
};

/**
 * Starts the authentication flow
 */
const loginAsync = async (targetUrl: string | null | undefined) => {
	try {
		//console.log("Logging in", targetUrl);

		const options = {
			redirect_uri: window.location.origin,
			appState: targetUrl ? { targetUrl } : undefined
		};
		if (auth0)
			await auth0.loginWithRedirect(options);

		// u.update(a => {
		//   a.isAuthenticated = true;
		//   return a;
		// });

	} catch (err) {
		console.error("Login failed", err);
		u.set(getEmptyU());
	}
};

/**
 * Executes the logout flow
 */
const logout = () => {
	try {
		//console.log("Logging out");
		u.set(getEmptyU());

		if (auth0) {
			auth0.logout({
				returnTo: window.location.origin
			});
		}

	} catch (err) {
		console.error("Logout failed", err);
	}
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuthAsync = async (fn: Function, targetUrl: string | null | undefined) => {
	if (!auth0) return;

	let isAuthenticated = await auth0.isAuthenticated();

	u.update(a => {
		a.isAuthenticated = isAuthenticated;
		return a;
	});

	if (isAuthenticated) {
		return fn();
	}

	return await loginAsync(targetUrl);
};

const getIsAuthenticatedAsync = async () => {
	if (!auth0) return false;

	let isAuthenticated = await auth0.isAuthenticated();

	u.update(a => {
		a.isAuthenticated = isAuthenticated;
		return a;
	});

	return isAuthenticated;
};


const getIdTokenClaimsAsync = async () => {
	if (!auth0) {
		u.set(getEmptyU());
		return;
	}

	let idTokenClaims = await auth0.getIdTokenClaims();

	u.update(a => {
		if (!idTokenClaims)
			return a;

		a.idTokenClaims = idTokenClaims;
		a.fullName = idTokenClaims.name || "";
		a.email = idTokenClaims.email || "";
		a.userId = idTokenClaims.sub || "";
		a.isAdmin = (idTokenClaims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []).includes("Admin");
		return a;
	});

	return idTokenClaims;
};

const getAuthTokenAsync = async () => {
	if (!auth0) {
		u.set(getEmptyU());
		return;
	}

	let authToken = await auth0.getTokenSilently();

	u.update(a => {
		a.authToken = authToken;
		return a;
	});

	return authToken;
};

const handleRedirectCallbackAsync = async () => {
	if (auth0)
		return await auth0.handleRedirectCallback();
};

export const user = {
	...u,
	initAuth0Async,
	loginAsync,
	logout,
	requireAuthAsync,
	getIsAuthenticatedAsync,
	getIdTokenClaimsAsync,
	getAuthTokenAsync,
	handleRedirectCallbackAsync
};


