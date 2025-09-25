import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";
// css-------
import "./styles/style.css";
import "reset-css/reset.css"; //reset
//ElementPlus UI----
import ElementPlus from "element-plus";
import zhTw from "element-plus/es/locale/lang/zh-tw"; //繁體中文
import en from "element-plus/es/locale/lang/en";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/display.css"; //佈局樣式
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; //icon
//i18n----
import i18n from "./lang/plugins/vue-i18n";

const app = createApp(App);
// 根據當前 i18n 語言設置 ElementPlus 語言
const getElementPlusLocale = () => {
  return i18n.global.locale.value === "zhTw" ? zhTw : en;
};
app
  .use(createPinia()) // // Pinia 早於路由訪問 >> 全域狀態較安全
  .use(i18n) // 早於 UI 框架
  .use(ElementPlus, {
    locale: getElementPlusLocale(),
  })
  .use(router)
  .mount("#app");
