export interface NetworkInterfaceLike {
	address: string;
	family: string | number;
	internal: boolean;
}

const VIRTUAL_INTERFACE_PATTERNS = [
	"radmin",
	"hamachi",
	"zerotier",
	"tailscale",
	"wireguard",
	"openvpn",
	"nordvpn",
	"protonvpn",
	"mullvad",
	"vethernet",
	"wsl",
	"hyper-v",
	"vmware",
	"virtualbox",
	"vbox",
	"docker",
	"podman",
	"teredo",
	"loopback",
	"default switch",
	"bluetooth",
];

const VIRTUAL_INTERFACE_WORD_REGEX = /\b(vpn|tun\d*|tap\d*|bridge)\b/i;
const ETHERNET_INTERFACE_REGEX = /ethernet|\beth\d*\b|локальн/i;
const WIFI_INTERFACE_REGEX = /wi-?fi|wlan|\ben\d+\b|беспровод/i;

/**
 * Checks whether the given string is an RFC1918 private IPv4 address
 * (10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16).
 */
export function isPrivateIpv4(host: string): boolean {
	const parts = host.split(".");
	if (parts.length !== 4) {
		return false;
	}

	const octets: number[] = [];
	for (const part of parts) {
		if (!/^\d{1,3}$/.test(part)) {
			return false;
		}
		const num = Number(part);
		if (num < 0 || num > 255) {
			return false;
		}
		octets.push(num);
	}

	const [a, b] = octets;
	if (a === undefined || b === undefined) {
		return false;
	}

	if (a === 10) {
		return true;
	}
	if (a === 172 && b >= 16 && b <= 31) {
		return true;
	}
	if (a === 192 && b === 168) {
		return true;
	}

	return false;
}

function isVirtualInterface(name: string): boolean {
	const lower = name.toLowerCase();
	if (VIRTUAL_INTERFACE_PATTERNS.some((pattern) => lower.includes(pattern))) {
		return true;
	}
	return VIRTUAL_INTERFACE_WORD_REGEX.test(name);
}

/**
 * Selects the best private LAN IPv4 address from OS network interfaces,
 * filtering out virtual/VPN adapters and preferring physical Ethernet/Wi-Fi adapters.
 */
export function selectLanIpv4(
	interfaces: Record<string, readonly NetworkInterfaceLike[] | undefined>,
): string | null {
	let bestIp: string | null = null;
	let bestScore = -1;

	for (const [name, entries] of Object.entries(interfaces)) {
		if (!entries || isVirtualInterface(name)) {
			continue;
		}

		for (const entry of entries) {
			const isIpv4 = entry.family === "IPv4" || entry.family === 4;
			if (!isIpv4 || entry.internal || !isPrivateIpv4(entry.address)) {
				continue;
			}

			let score = 0;
			if (ETHERNET_INTERFACE_REGEX.test(name)) {
				score += 60;
			} else if (WIFI_INTERFACE_REGEX.test(name)) {
				score += 50;
			}

			if (entry.address.startsWith("192.168.")) {
				score += 30;
			} else if (entry.address.startsWith("172.")) {
				score += 20;
			} else if (entry.address.startsWith("10.")) {
				score += 10;
			}

			if (score > bestScore) {
				bestScore = score;
				bestIp = entry.address;
			}
		}
	}

	return bestIp;
}

/**
 * Checks whether a raw env value is omitted, empty, or set to "auto" (or uses "auto" as URL host).
 */
export function isAutoEnvValue(rawValue: string | undefined): boolean {
	const trimmed = rawValue?.trim();
	if (!trimmed || trimmed.toLowerCase() === "auto") {
		return true;
	}

	try {
		const parsed = new URL(trimmed);
		return parsed.hostname.toLowerCase() === "auto";
	} catch {
		return false;
	}
}

/**
 * Resolves a URL env value when omitted, set to "auto", or using "auto" as its hostname.
 */
export function resolveAutoUrl(
	rawValue: string | undefined,
	host: string,
	defaultPort: number,
	protocol = "http:",
): string {
	const trimmed = rawValue?.trim();
	const normalizedProto = protocol.endsWith(":") ? protocol : `${protocol}:`;

	if (!trimmed || trimmed.toLowerCase() === "auto") {
		return `${normalizedProto}//${host}:${defaultPort}`;
	}

	try {
		const parsed = new URL(trimmed);
		if (parsed.hostname.toLowerCase() === "auto") {
			parsed.hostname = host;
			return parsed.toString().replace(/\/+$/, "");
		}
	} catch {
		// Return trimmed value when not a valid URL (e.g. "*")
	}

	return trimmed.replace(/\/+$/, "");
}
