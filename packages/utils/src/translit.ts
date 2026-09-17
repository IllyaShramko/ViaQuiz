export const UA_MAP: Record<string, string> = {
	а: "a",
	б: "b",
	в: "v",
	г: "h",
	ґ: "g",
	д: "d",
	е: "e",
	є: "ye",
	ж: "zh",
	з: "z",
	и: "y",
	і: "i",
	ї: "yi",
	й: "y",
	к: "k",
	л: "l",
	м: "m",
	н: "n",
	о: "o",
	п: "p",
	р: "r",
	с: "s",
	т: "t",
	у: "u",
	ф: "f",
	х: "kh",
	ц: "ts",
	ч: "ch",
	ш: "sh",
	щ: "shch",
	ь: "",
	ю: "yu",
	я: "ya",
	ы: "y",
	э: "e",
	ё: "yo",
	ъ: "",
	"'": "",
	"`": "",
	"’": "",
};

/**
 * Transliterates Cyrillic text into Latin characters suitable for URLs, logins, and slugs.
 */
export function transliterate(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.split("")
		.map((char) => (char in UA_MAP ? UA_MAP[char] : char))
		.join("")
		.replace(/[^a-z0-9_.-]/g, "")
		.replace(/[._-]{2,}/g, "_")
		.replace(/^[._-]+|[._-]+$/g, "");
}
