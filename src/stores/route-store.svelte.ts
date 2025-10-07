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
			title: "Testing",
			page: "Testing",
			path: "/testing",
			isAdmin: true,
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

export const currentPath = $state({ path: "/" });
export const currentParams = $state({ paramObj: {} });

let routes = $derived.by(() => {
	let r = { ...baseRoutes };
	// if (!user.value?.isAdmin)
	// 	r = filterAdminRoutes(r)
	return r;
});

export const getRoutes = () => routes;

let currentRoute = $derived(findRoute(routes, currentPath.path));

export const getCurrentRoute = () => currentRoute;


// Param functions

let paramStringToObj = (inp: string) => {
	let entries = (new URLSearchParams(inp)).entries();
	let p: any = {};
	for (let [key, val] of entries) {
		p[key] = val;
	}
	return p;
};

let objToParamString = (inp: any) => {
	if (!inp) return "";

	let entries = Object.entries(inp);

	if (!entries.length) return "";

	let p = new URLSearchParams();
	for (let [key, val] of entries)
		p.append(key, <string>val);

	return "?" + p.toString();
};

// Public Functions

export const navFromUrl = function () {
	let pathName = window.location.pathname;
	let r = findRoute(routes, pathName);

	let p = paramStringToObj(window.location.search);

	if (r) {
		currentPath.path = pathName;
		currentParams.paramObj = p;
		document.title = `Polson-${r.title}`;
	} else {
		window.location.replace(window.location.origin);
	}
};

export const navTo = function (e: MouseEvent | null, path: string, params?: any) {
	e && e.preventDefault();

	//let pathName = e.currentTarget.dataset.dest;
	let url = window.location.origin + path;

	if (params)
		url += objToParamString(params);

	window.history.pushState({}, path, url);
	currentPath.path = path;
	currentParams.paramObj = params || {};
	document.title = `Polson-${currentRoute.title}`;
};

// Back Button

window.onpopstate = () => {
	let pathName = window.location.pathname;
	let r = findRoute(routes, pathName);

	if (r) {
		currentPath.path = pathName;
	} else {
		window.location.replace(window.location.origin);
	}
};
