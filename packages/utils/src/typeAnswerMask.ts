export const TYPE_ANSWER_V2_BRACKETS = new Set(["(", ")", "{", "}", "[", "]"]);

export const TYPE_ANSWER_V2_MASK_CHAR = "w";

export interface TypeAnswerV2Token {
	kind: "input" | "bracket";
	char: string;
	/** Zero-based index among editable character slots, or -1 for fixed bracket delimiters. */
	inputIndex: number;
}

export interface TypeAnswerV2WordGroup {
	wordIndex: number;
	tokens: TypeAnswerV2Token[];
}

export interface ParsedTypeAnswerV2Mask {
	words: TypeAnswerV2WordGroup[];
	inputCount: number;
	/** Maps each editable slot index to the first editable slot index of the following word group (if any). */
	nextWordStartByInputIndex: number[];
}

/**
 * Normalizes whitespace in typed answers to match server-side grading rules.
 */
export function normalizeTypedAnswerWhitespace(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

export function isTypeAnswerV2Bracket(char: string): boolean {
	return TYPE_ANSWER_V2_BRACKETS.has(char);
}

/**
 * Converts a ground-truth answer into a client-safe mask where letters/symbols
 * are replaced with 'w', spaces remain ' ', and bracket delimiters () {} [] stay intact.
 */
export function buildTypeAnswerV2Mask(answer: string): string {
	const normalized = normalizeTypedAnswerWhitespace(answer);
	let mask = "";
	for (const char of normalized) {
		if (char === " " || isTypeAnswerV2Bracket(char)) {
			mask += char;
		} else {
			mask += TYPE_ANSWER_V2_MASK_CHAR;
		}
	}
	return mask;
}

/**
 * Returns true if the answer contains at least one editable character slot.
 */
export function hasTypeAnswerV2InputChars(answer: string): boolean {
	const normalized = normalizeTypedAnswerWhitespace(answer);
	for (const char of normalized) {
		if (char !== " " && !isTypeAnswerV2Bracket(char)) {
			return true;
		}
	}
	return false;
}

/**
 * Parses a mask string (e.g. "wwww w(ww)") into structured word groups and slot indices.
 */
export function parseTypeAnswerV2Mask(mask: string): ParsedTypeAnswerV2Mask {
	const normalized = normalizeTypedAnswerWhitespace(mask);
	if (!normalized) {
		return {
			words: [],
			inputCount: 0,
			nextWordStartByInputIndex: [],
		};
	}

	const rawWords = normalized.split(" ");
	const words: TypeAnswerV2WordGroup[] = [];
	const wordFirstInputIndex: number[] = [];
	const slotWordIndices: number[] = [];
	let inputIndex = 0;

	for (let wordIndex = 0; wordIndex < rawWords.length; wordIndex++) {
		const rawWord = rawWords[wordIndex] ?? "";
		const tokens: TypeAnswerV2Token[] = [];
		let firstSlotInWord = -1;

		for (const char of rawWord) {
			if (isTypeAnswerV2Bracket(char)) {
				tokens.push({
					kind: "bracket",
					char,
					inputIndex: -1,
				});
			} else {
				if (firstSlotInWord === -1) {
					firstSlotInWord = inputIndex;
				}
				tokens.push({
					kind: "input",
					char: TYPE_ANSWER_V2_MASK_CHAR,
					inputIndex,
				});
				slotWordIndices.push(wordIndex);
				inputIndex += 1;
			}
		}

		wordFirstInputIndex.push(firstSlotInWord);
		words.push({ wordIndex, tokens });
	}

	const nextWordStartByInputIndex = slotWordIndices.map((wordIndex) => {
		for (let nextWord = wordIndex + 1; nextWord < wordFirstInputIndex.length; nextWord++) {
			const nextStart = wordFirstInputIndex[nextWord];
			if (nextStart !== undefined && nextStart !== -1) {
				return nextStart;
			}
		}
		return -1;
	});

	return {
		words,
		inputCount: inputIndex,
		nextWordStartByInputIndex,
	};
}

/**
 * Reconstructs the full submission string from the mask and per-slot characters,
 * re-inserting spaces and fixed brackets automatically.
 */
export function assembleTypeAnswerV2Answer(mask: string, values: string[]): string {
	const parsed = parseTypeAnswerV2Mask(mask);
	return parsed.words
		.map((group) =>
			group.tokens
				.map((token) =>
					token.kind === "bracket" ? token.char : (values[token.inputIndex] ?? ""),
				)
				.join(""),
		)
		.join(" ");
}

/**
 * Distributes pasted text across editable slots starting from `startInputIndex`.
 * Aligns fixed spaces/brackets when present in the pasted text so pasting either
 * raw letters ("foobar") or formatted text ("foo (bar)") fills the right slots.
 */
export function applyTypeAnswerV2Paste(
	mask: string,
	currentValues: string[],
	startInputIndex: number,
	pastedText: string,
): { nextValues: string[]; nextFocusIndex: number } {
	const parsed = parseTypeAnswerV2Mask(mask);
	const nextValues = Array.from({ length: parsed.inputCount }, (_, i) => currentValues[i] ?? "");
	if (parsed.inputCount === 0 || startInputIndex >= parsed.inputCount) {
		return { nextValues, nextFocusIndex: Math.max(0, parsed.inputCount - 1) };
	}

	const normalizedMask = normalizeTypedAnswerWhitespace(mask);
	const maskChars = Array.from(normalizedMask);

	// Locate the position inside normalizedMask corresponding to startInputIndex.
	let maskCursor = 0;
	let seenInputs = 0;
	while (maskCursor < maskChars.length) {
		const ch = maskChars[maskCursor];
		if (ch !== undefined && ch !== " " && !isTypeAnswerV2Bracket(ch)) {
			if (seenInputs === startInputIndex) {
				break;
			}
			seenInputs += 1;
		}
		maskCursor += 1;
	}

	let currentSlot = startInputIndex;
	const pastedChars = Array.from(pastedText.replace(/[\r\n]+/g, " "));

	for (const pastedChar of pastedChars) {
		if (currentSlot >= parsed.inputCount || maskCursor >= maskChars.length) {
			break;
		}

		// Advance past any fixed delimiters currently under maskCursor if the pasted character matches them
		// or simply skip fixed delimiters to reach the next editable slot.
		const currentMaskChar = maskChars[maskCursor];
		if (currentMaskChar !== undefined && (currentMaskChar === " " || isTypeAnswerV2Bracket(currentMaskChar))) {
			while (
				maskCursor < maskChars.length &&
				(maskChars[maskCursor] === " " || isTypeAnswerV2Bracket(maskChars[maskCursor] ?? ""))
			) {
				const delimiter = maskChars[maskCursor];
				maskCursor += 1;
				if (delimiter === pastedChar) {
					// Consumed the matching delimiter directly; move to next pasted char.
					break;
				}
			}
			if (pastedChar === " " || isTypeAnswerV2Bracket(pastedChar)) {
				continue;
			}
		}

		if (pastedChar === " " || isTypeAnswerV2Bracket(pastedChar)) {
			// Skip stray delimiters in pasted input if no matching delimiter was active at maskCursor.
			continue;
		}

		nextValues[currentSlot] = pastedChar;
		currentSlot += 1;
		maskCursor += 1;
	}

	return {
		nextValues,
		nextFocusIndex: Math.min(currentSlot, Math.max(0, parsed.inputCount - 1)),
	};
}
