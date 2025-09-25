// 此檔案未使用
export const envData = {};

export const version = {
  //取環境變數
  async getEnv() {
    try {
      const ver = await version.getVersion();
      const getEnvDataRes = await version.fetchJsonSetEnvData(ver);
      if (!getEnvDataRes) {
        alert("環境變數有誤，請通知系統管理員查看console");
      }
    } catch (error) {
      alert("環境變數有誤，請通知系統管理員查看console");
    }
  },
  // 獲取當前環境
  async getVersion() {
    // 若查無匹配環境，預設為production
    const defaultVer = "production";
    try {
      //  以domain作為判斷環境
      const domain = window.location.hostname;
      const response = await fetch("/flowtool/json/version.json");
      if (!response.ok) {
        console.error("無法fetch version.json");
        return defaultVer;
      }
      const verObj = await response.json();
      return this.findKeyByValue(verObj, domain) || defaultVer;
    } catch (error) {
      return defaultVer;
    }
  },
  // 獲取當前環境的設定檔案
  async fetchJsonSetEnvData(version) {
    let res = false;
    try {
      const fetchJsonRes = await fetch(`/flowtool/json/${version}.json`);
      if (!fetchJsonRes.ok) {
        console.error("fetch環境json檔案失敗，請於json資料夾中設定");
      }
      const data = await fetchJsonRes.json();
      Object.assign(envData, data);
      res = true;
    } catch (error) {
      console.error("getVersion error", error);
    }
    return res;
  },
  findKeyByValue(obj, value) {
    for (const key of Object.keys(obj)) {
      if (obj[key] === value) {
        return key;
      }
    }
    console.error("查無對應環境，請於version.json中設定");
    return null;
  },
};

export const { getEnv } = version; // 解構賦值，只將getEnv導出
