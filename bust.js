import fs from "fs-extra";

// console.log("__dirname: ", __dirname);
const baseUrl = "https://polson.com";

const formatNum = function (num, len) {
	let str = num.toString(10);
	let sl = str.length;

	if (sl < len) return "0".repeat(len - sl) + str;

	return str;
};

const d = new Date();
const key =
	formatNum(d.getFullYear(), 4) +
	formatNum(d.getMonth() + 1, 2) +
	formatNum(d.getDate(), 2) +
	"-" +
	formatNum(d.getHours(), 2) +
	formatNum(d.getMinutes(), 2) +
	formatNum(d.getSeconds(), 2);

console.log({ key });

fs.readFile(".\\dist\\index.html", "utf8")
	.then((a) => {
		return a
			.replace(/(<script>\s*var\sbaseURL\s=\s")[^"]+([^<]*<\/script>)/gm, `$1${baseUrl}$2`)
			.replace(/(<script>[^]*var\sappIsProduction\s=\s)false([^<]*<\/script>)/gm, "$1true$2")
			.replace(/var\sappVersionKey\s=\s"[^"]+";/gm, 'var appVersionKey = "' + key + '";');
	})
	.then((a) => {
		fs.writeFile(".\\dist\\index.html", a, "utf8");
	});
