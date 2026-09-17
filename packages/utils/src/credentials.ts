import { transliterate } from "./translit";

/**
 * Generates a student login in the format 'lastName.firstName' transliterated to Latin.
 */
export function generateStudentLogin(firstName: string, lastName: string): string {
	const transFirst = transliterate(firstName);
	const transLast = transliterate(lastName);

	if (transLast && transFirst) {
		return `${transLast}.${transFirst}`;
	}
	return transLast || transFirst || `student_${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Generates random digit string of specified length.
 */
export function generateRandomDigits(length = 3): string {
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - 1;
	return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Generates a readable alphanumeric password, excluding ambiguous characters (0, O, 1, l, I).
 */
export function generateSimplePassword(length = 8): string {
	const chars = "23456789abcdefghjkmnpqrstuvwxyz";
	let password = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		password += chars[randomIndex];
	}
	return password;
}

/**
 * Generates an uppercase alphanumeric code (e.g. for joining a class or game session).
 */
export function generateClassCode(length = 6): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		code += chars[randomIndex];
	}
	return code;
}
