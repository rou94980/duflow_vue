<script setup>
import { Position, Handle, useNodeConnections } from "@vue-flow/core";
import { usePageStore } from "@/stores/page";
const pageStore = usePageStore();

defineProps(["data"]);

const formSample = {
  formName: " ",
  formId: crypto.randomUUID(),
  formurgencyLevel: "3",
};
const openFormData = (data) => {
  pageStore.createFormPageData.nodeId = data.id;
  pageStore.createFormPageData.formData =
    data.content && Object.keys(data.content).length > 0
      ? data.content
      : formSample;
  pageStore.createFormPage = true;
};
</script>

<template>
  <div class="vue-flow__node-default vue-flow__node-form">
    <Handle type="target" :position="Position.Top" />
    <p>{{ data.id }}</p>
    <p>{{ data.label }}</p>
    <br />
    <!-- pageStore.createFormPage= true -->
    <el-button @click="openFormData(data)"> 建立表單 </el-button>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
<style scoped lang="css"></style>
