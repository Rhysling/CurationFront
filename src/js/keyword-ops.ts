import { getSlug } from "./utils";

// Extract keywords
const getKeywordsFromFileName = (fileName: string): string[] => {
	return getSlug(fileName.toLowerCase()).split("-");
};

const getKeywordsFromTitle = (title: string): string[] => {
	return title.toLowerCase().replace(/[\[\]~.,!#'*?]/g, "").split(/\s+/).filter((kw) => kw.length > 0);
};

export const mapKeywordsAll = (pi: PictureItem): PictureItem => {
	pi.keywordsAll = [
		...pi.keywords.map((kw) => kw.trim().toLowerCase()),
		...getKeywordsFromFileName(pi.fileName),
		...getKeywordsFromTitle(pi.title || ""),
	].filter((kw) => kw.length > 0)
		.filter((kw) => !"&--_%".includes(kw));
	return pi;
};

export const getKeywordsList = (pil: PictureItem[]): string[] => {
	const kwSet = new Set<string>();
	pil.forEach((pi) => {
		if (pi.keywordsAll) pi.keywordsAll.forEach((kw) => kwSet.add(kw));
	});
	return Array.from(kwSet).sort((a, b) => a.localeCompare(b));
};

// Keyword Summary

export type KeywordSummary = {
	keyword: string;
	fileNameCount: number;
	titleCount: number;
	kwMatchCount: number;
	anyCount: number;
};

const isFileNameMatch = (pi: PictureItem, kw: string): boolean => {
	return getKeywordsFromFileName(pi.fileName).includes(kw);
}

const isTitleMatch = (pi: PictureItem, kw: string): boolean => {
	return getKeywordsFromTitle(pi.title || "").includes(kw);
}

const isKeywordMatch = (pi: PictureItem, kw: string): boolean => {
	return pi.keywords.some((k) => k.trim().toLowerCase() === kw);
}

export const getKeywordsSummary = (pil: PictureItem[]): KeywordSummary[] => {
	const ksl: KeywordSummary[] = [];
	pil = pil.map((pi) => mapKeywordsAll(pi));
	const kwl = getKeywordsList(pil);

	kwl.forEach((k) => {
		ksl.push({
			keyword: k,
			fileNameCount: pil.filter((pi) => isFileNameMatch(pi, k)).length,
			titleCount: pil.filter((pi) => isTitleMatch(pi, k)).length,
			kwMatchCount: pil.filter((pi) => isKeywordMatch(pi, k)).length,
			anyCount: pil.filter((pi) => isFileNameMatch(pi, k) || isTitleMatch(pi, k) || isKeywordMatch(pi, k)).length,
		});
	});

	return ksl;
};