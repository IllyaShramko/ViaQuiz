import os from "node:os";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { selectLanIpv4 } from "@viaquiz/utils/network";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
	const devLanHost =
		command === "serve" ? (selectLanIpv4(os.networkInterfaces()) ?? "") : "";

	return {
		plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
		define: {
			"import.meta.env.VITE_DEV_LAN_HOST": JSON.stringify(devLanHost),
		},
		server: {
			host: true,
			proxy: {
				"/api": {
					target: "http://localhost:3000",
					changeOrigin: true,
				},
			},
		},
	};
});
