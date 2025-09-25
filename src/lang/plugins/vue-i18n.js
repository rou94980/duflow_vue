import { createI18n } from "vue-i18n";
import { locale as en } from "@/lang/config/i18n/en";
import { locale as zhTw } from "@/lang/config/i18n/zhTw";

const messages = {
  en,
  zhTw,
};

// 檢查 localStorage 中的語言設定，預設使用繁體中文
const lang = localStorage.getItem("language") || "zhTw";

// 使用 createI18n 來初始化 i18n
const i18n = createI18n({
  legacy: false, // 禁用 Legacy API，啟用 Composition API
  locale: lang, // 預設語言
  messages, // 語系對應表
});

export default i18n;
