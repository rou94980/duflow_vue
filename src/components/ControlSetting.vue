<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Operation } from "@element-plus/icons-vue";
import { logout } from "@/tools/tool";
import { useI18n } from "vue-i18n";
const { locale } = useI18n();

// 控制點擊外部隱藏選單
const contralSettingRef = ref(null);
const isOpenContralSetting = ref(false);
const handleClickOutside = (event) => {
  if (
    contralSettingRef.value &&
    !contralSettingRef.value.contains(event.target)
  ) {
    isOpenContralSetting.value = false;
  }
};
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// 切換語言
const currentLanguage = ref(locale.value);
function changeLanguage() {
  locale.value = currentLanguage.value;
  localStorage.setItem("language", currentLanguage.value);
}
</script>

<template>
  <div id="contralSettingWrap" ref="contralSettingRef" class="setting-wrap">
    <el-icon @click="isOpenContralSetting = !isOpenContralSetting">
      <Operation color="#90939960" class="operation-icon" />
    </el-icon>
    <div v-show="isOpenContralSetting" class="setting-list">
      <el-select
        v-model="currentLanguage"
        @change="changeLanguage"
        size="small"
      >
        <el-option label="English" value="en"></el-option>
        <el-option label="繁體中文" value="zhTw"></el-option>
      </el-select>
      <el-button
        size="small"
        type="primary"
        style="width: 100%"
        @click="logout"
        >{{ $t("login.logout") }}</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="css">
.setting-wrap {
  background-color: #ffffff60;
  z-index: 500;
  width: fit-content;
  padding: 5px;
  border: 1px solid #d9d9d960;
  border-radius: 5px;
  position: fixed;
  right: 0.8rem;
  bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}

.setting-wrap:hover {
  border-color: #d9d9d9;
}

.setting-wrap:hover .operation-icon {
  color: #909399;
}
.setting-list {
  background-color: #ffffffcf;
  width: 90px;
  padding: 12px;
  border: 1px solid #d9d9d960;
  border-radius: 5px;
  position: absolute;
  right: 2.3rem;
  bottom: 0;
  cursor: pointer;
  transition: border-color 0.3s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-wrap:hover .setting-list {
  border-color: #d9d9d9;
}
</style>
