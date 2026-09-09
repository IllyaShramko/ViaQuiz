const UA_MAP: Record<string, string> = {
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

export function generateStudentLogin(firstName: string, lastName: string): string {
	const transFirst = transliterate(firstName);
	const transLast = transliterate(lastName);

	if (transLast && transFirst) {
		return `${transLast}.${transFirst}`;
	}
	return transLast || transFirst || `student_${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateRandomDigits(length = 3): string {
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;
	return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function generateSimplePassword(length = 8): string {
	// Simple, readable alphanumeric characters (excluding confusing chars like 0, O, 1, l, I)
	const chars = "23456789abcdefghjkmnpqrstuvwxyz";
	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		password += chars[randomIndex];
	}
	return password;
}

export function generateClassCode(length = 6): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}
	return code;
}
