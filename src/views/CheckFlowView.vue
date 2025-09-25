<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

//Element Plus ---------
import { ArrowLeft } from "@element-plus/icons-vue";
//Vue-flow ---------
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Tool  ---------
import { alertElMessage } from "@/tools/tool";
import callApi from "@/tools/api";

import useDragAndDrop from "@/tools/useDnD";
import CustomNode from "@/components/CustomNode.vue";
const { onDrop } = useDragAndDrop();

//i18n ---------
import { useI18n } from "vue-i18n";
const { t } = useI18n();

//以上為import---------------------------------------------------------------------------------
const isMobile = inject("isMobile");
const flowInfoBar = ref(null);
const companyList = ref([]);

// vue-flow: 節點相關----------------------------------------
const nodeTypes = ref({
  start: markRaw(CustomNode),
  approval: markRaw(CustomNode),
  notify: markRaw(CustomNode),
  handle: markRaw(CustomNode),
  end: markRaw(CustomNode),
});

// 點擊 node
const onNodeClick = (event) => {
  flowInfoBar.value?.switchTab("nodeInfo");
  flowStore.changeActiveNode(event.node.id, event.node.type, event.node.data);
};

// ----------------------------------------
// 獲取公司列表
const getCompanyList = () => {
  callApi.getCompany().then((response) => {
    if (response) {
      companyList.value = response.data || [];
    }
  });
};

// 返回流程列表頁面
const backToFlowList = () => {
  flowStore.clearAutoSave();
  router.push({
    name: "flowList",
  });
};

// ----------------------------------------

// 載入流程資訊 （含開啟編輯階段）
onMounted(async () => {
  const flowId = route.query.flow ? atob(route.query.flow) : null;
  try {
    flowStore.initActiveNode();
    // 1. 無flowId，返回流程列表
    if (!flowId) {
      return alertElMessage(t("flowAction.error_unknown"), () =>
        backToFlowList()
      );
    }

    // 2. 載入流程
    if (!(await flowStore.initFlow(flowId))) {
      return alertElMessage(t("flowAction.error_unknown"), () =>
        backToFlowList()
      );
    }
  } catch (error) {
    console.error(error);
    alertElMessage(t("flowAction.error_unknown"), () => backToFlowList());
  }
});
</script>

<template>
  <div id="create-page" class="pageView">
    <div class="pageView-header">
      <el-page-header
        :title="isMobile ? ' ' : ''"
        :icon="ArrowLeft"
        @back="backToFlowList()"
      >
        <template #content>
          <div>
            <el-text
              style="font-weight: bolder; margin-right: 50px"
              :size="isMobile ? 'small' : 'large'"
              >{{ $t("flowList.checkFlow") }}</el-text
            >
            <el-text type="info" :size="isMobile ? 'small' : 'large'">
              {{ flowStore.flowData.name }}</el-text
            >
          </div>
        </template>
        <template #extra>
          <el-text
            style="margin-right: 1rem"
            type="info"
            size="small"
            v-if="isMobile"
          >
            {{
              isMobile
                ? ""
                : `${$t("flow.updateTime")}: ${flowStore.flowData.updateTime}`
            }}
          </el-text>
        </template>
      </el-page-header>
    </div>
    <div class="pageView-counter" @drop="onDrop">
      <div class="vueFlow-counter">
        <VueFlow
          v-model:nodes="flowStore.nodes"
          v-model:edges="flowStore.edges"
          :nodeTypes="nodeTypes"
          @node-click="onNodeClick"
          :key="flowStore.flowData.id"
          :nodes-draggable="false"
          fit-view-on-init
        >
          <Background :size="2" :gap="20" pattern-color="#BDBDBD" />
        </VueFlow>
      </div>

      <!-- <Sidebar /> -->
      <FlowInfobar
        ref="flowInfoBar"
        :nodeType="flowStore.activeNodeType"
        :isEdit="false"
        :key="flowStore.flowData.id"
      ></FlowInfobar>
    </div>
  </div>
  <ControlSetting></ControlSetting>
</template>
<style scoped lang="css">
.vueFlow-counter {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
}
</style>
