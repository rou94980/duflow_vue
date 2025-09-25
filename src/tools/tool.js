import { ElMessageBox } from "element-plus";
import router from "@/router/index";
//i18n ---------
import i18n from "../lang/plugins/vue-i18n";
const t = i18n.global.t;

/**
 * 獲取現在時間
 * @return {string}
 */
export function getDateTimeNow() {
  let now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

  return formattedDate;
}

/**
 *
 *
 * @param
 * @return
 */
export function alertElMessage(msg, callback) {
  ElMessageBox.alert("", msg, {
    confirmButtonText: t("common.comfirm"),
    callback,
  });
}

export function findDepartmentById(departments, id) {
  for (const dept of departments) {
    if (dept.id === id) return dept; // 找到就回傳

    const found = dept.children?.length
      ? findDepartmentById(dept.children, id)
      : null;
    if (found) return found; // 找到子部門時回傳
  }
  return null; // 沒找到回傳 null
}

export function logout() {
  localStorage.removeItem("accessToken");
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  // 4. 導回登入頁
  router.push({ name: "login" });
}
