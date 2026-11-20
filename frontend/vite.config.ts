import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const backendHost =
    mode === "development" ? "/api/" : env.VITE_APP_BACKEND_HOST || "/api/";

  return {
    define: {
      "import.meta.env.VITE_APP_BACKEND_HOST": JSON.stringify(backendHost),
    },
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/?/, "/").replace(/^\/{2,}/, "/"),
        },
      },
    },
  };
});
