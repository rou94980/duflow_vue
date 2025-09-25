import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
//vue自動導入
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        dirs: ["src/components"], //全局註冊組件
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      }),
    ],
    // base: "/flowtool/",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
        @use "@/styles/elementplus-variable.scss" as *;
      `,
        },
      },
    },
    //本機開發時，以下註解需拿掉，啟用server 本機才可以取用capi，否則會有跨域問題
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          //secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      port: 5006,
    },
    preview: {
      port: 5006,
    },
  };
});
