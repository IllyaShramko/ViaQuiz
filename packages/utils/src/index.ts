export { UA_MAP, transliterate } from "./translit";
export {
	generateStudentLogin,
	generateRandomDigits,
	generateSimplePassword,
} from "./credentials";
export {
	isPrivateIpv4,
	selectLanIpv4,
	isAutoEnvValue,
	resolveAutoUrl,
	type NetworkInterfaceLike,
} from "./network";
export {
	TYPE_ANSWER_V2_BRACKETS,
	TYPE_ANSWER_V2_MASK_CHAR,
	normalizeTypedAnswerWhitespace,
	isTypeAnswerV2Bracket,
	buildTypeAnswerV2Mask,
	hasTypeAnswerV2InputChars,
	parseTypeAnswerV2Mask,
	assembleTypeAnswerV2Answer,
	applyTypeAnswerV2Paste,
	type TypeAnswerV2Token,
	type TypeAnswerV2WordGroup,
	type ParsedTypeAnswerV2Mask,
} from "./typeAnswerMask";
