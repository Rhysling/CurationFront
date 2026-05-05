import { user } from "./user-store.svelte";

const baseRoutes: Route = {
	title: "Home",
	page: "Home",
	path: "/",
	children: [
		{
			title: "Curation",
			page: "Curation",
			path: "/curation",
			children: []
		}, {
			title: "Curation-2",
			page: "Curation2",
			path: "/curation2",
			isAdmin: true,
			children: []
		},
		{
			title: "Admin Pictures",
			page: "AdminPics",
			path: "/admin-pics",
			isAdmin: true,
			children: []
		},
		{
			title: "Admin Users",
			page: "AdminUsers",
			path: "/admin-users",
			isAdmin: true,
			children: []
		},
		{
			title: "Admin Dbs",
			page: "AdminDbs",
			path: "/admin-dbs",
			isAdmin: true,
			children: []
		},
		{
			title: "Picture",
			page: "Picture",
			path: "/picture",
			isAdmin: false,
			isHidden: true,
			children: []
		}
	]
};


const filterAdminRoutes = (node: Route) => {
	if (node.children)
		node.children = node.children.filter(a => a.isAdmin !== true).map(a => filterAdminRoutes(a));

	return node;
};

const findRoute = (routeRoot: Route, path: string): Route => {
	let cr: Route | undefined;

	function traverse(node: Route): Route | undefined {

		if (node.path === path)
			return node;

		let cr: Route | undefined;

		if (node.children && node.children.length) {
			for (let i = 0; i < node.children.length; i += 1) {
				cr = traverse(node.children[i]);

				if (cr)
					return cr;
			}
		}
	}

	cr = traverse(routeRoot);

	return cr || routeRoot;
};


// Stores

export const pageState: PageState = $state({ path: "/", paramObj: {}, isNavFromUrl: false });

let allRoutes = $derived.by(() => {
	let r = { ...baseRoutes };
	if (!user.value?.isAdmin)
		r = filterAdminRoutes(r);
	return <Route>r;
});

let currentRoute = $derived.by(() => findRoute(baseRoutes, pageState.path))

export const routes = {
	get allRoutes() { return allRoutes },
	get currentRoute() { return currentRoute },
};

// Param functions

const paramStringToObj = (inp: string) => {
	let entries = (new URLSearchParams(inp)).entries();
	let p: Record<string, string> = {};
	for (let [key, val] of entries) {
		p[key] = val;
	}
	return p;
};

const objToParamString = (inp: Record<string, string>) => {
	if (!inp) return "";

	let entries = Object.entries(inp);

	if (!entries.length) return "";

	let p = new URLSearchParams();
	for (let [key, val] of entries)
		p.append(key, <string>val);

	return "?" + p.toString();
};

// Public Functions ***

export const navFromUrl = function () {
	const pathName = window.location.pathname;
	const r = findRoute(baseRoutes, pathName);
	const p = paramStringToObj(window.location.search);

	if (r) {
		pageState.path = pathName;
		pageState.paramObj = p;
		pageState.isNavFromUrl = true;
		document.title = `Polson-${r.title}`;
	} else {
		window.location.replace(window.location.origin);
	}
};

export const navTo = function (e: MouseEvent | null, path: string, params?: Record<string, string>) {
	e && e.preventDefault();

	let url = window.location.origin + path;

	if (params && Object.keys(params).length)
		url += objToParamString(params);

	window.history.pushState({}, path, url);
	pageState.path = path;
	pageState.paramObj = params || {};
	pageState.isNavFromUrl = false;
	document.title = `Polson-${routes.currentRoute.title}`;

	window.scroll({
		top: 0,
		left: 0,
		behavior: "smooth",
	});
};

export const updateQueryStringParam = (key: string, value: string | undefined) => {
	const url = new URL(window.location.href);
	if (!value) {
		url.searchParams.delete(key);
		delete pageState.paramObj[key];
	} else {
		url.searchParams.set(key, value);
		pageState.paramObj[key] = value;
	}
	window.history.replaceState({}, "", url);
};

// Back Button

window.onpopstate = () => {
	navFromUrl();
};
