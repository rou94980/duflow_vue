<script setup>
import { reactive } from "vue";
const props = defineProps(["isEdit"]);
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Element Plus ---------
import { ElMessage } from "element-plus";
//i18n ---------
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const form = reactive({ description: "" });
const submit = () => {
  if (!form.description) {
    return ElMessage.info(t("flowInfoBar.description_alert"));
  }
  flowStore.activeNodeContent.description = form.description;
  // 檢查
  flowStore.updateNodeData();
  ElMessage.success(t("common.edit_success"));
};
const displayDescription = computed(() => {
  return form.description ? form.description.replace(/\n/g, "<br>") : "無";
});

onMounted(() => {
  form.description = flowStore.activeNodeContent.description;
});
</script>
<template>
  <el-form :model="form" label-width="auto" label-position="left">
    <!-- 檢視畫面 -->
    <el-form-item
      :label="$t('flowInfoBar.description')"
      v-if="!isEdit"
      label-position="top"
      ><el-tooltip :content="$t('flowInfoBar.tooltip_description')">
        <el-text v-html="displayDescription" class="textBox"></el-text>
      </el-tooltip>
    </el-form-item>
    <!-- 編輯畫面 -->
    <div v-else>
      <el-form-item :label="$t('flowInfoBar.description')" label-position="top">
        <el-input
          v-model="form.description"
          type="textarea"
          :autosize="{ minRows: 8 }"
          :placeholder="$t('flowInfoBar.placeholder_description')"
          style="white-space: pre-wrap"
        />
      </el-form-item>
      <el-form-item style="margin-top: 50px">
        <el-button type="primary" @click="submit" style="width: 100%">{{
          $t("common.edit2")
        }}</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<style scoped lang="css">
.textBox {
  border: 1px solid #d9d9d9;
  padding: 1rem;
  width: 100%;
  border-radius: 5px;
  min-height: 50px;
}
</style>
