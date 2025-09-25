<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

//Element Plus ---------
import { ArrowLeft, UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

//Vue-flow ---------
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
const { onConnect, addEdges, findNode } = useVueFlow();
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Tool  ---------
import { alertElMessage } from "@/tools/tool";
import { generateFlowJSONObj, checkFlowObj } from "@/tools/flowTool";
import callApi from "@/tools/api";

import useDragAndDrop from "@/tools/useDnD";
import CustomNode from "@/components/CustomNode.vue";
const { onDragOver, onDrop, onDragLeave, getNodeDataSample } = useDragAndDrop();

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

// node 透過 edge 連接
onConnect((params) => {
  const { source, sourceHandle, target } = params;
  // 定義edge模版
  const edgeParam = {
    id: `e${source}-${target}`,
    type: "default",
    source,
    target,
    markerEnd: MarkerType.ArrowClosed,
  };
  const sourceNode = findNode(source);
  if (sourceNode?.type === "approval") {
    const existingSourceEdges = flowStore.edges.filter(
      (edge) => edge.source === source
    );
    // 如果已有兩個連接，則不再新增
    if (existingSourceEdges.length >= 2) {
      ElMessage.error(t("flowAction.error_oneConnect"));
      return;
    }
    // 客製化edge內容
    edgeParam["type"] = "smoothstep";
    edgeParam["sourceHandle"] = sourceHandle;
    edgeParam["label"] = sourceHandle
      ? sourceHandle == "pass-handle"
        ? t("node.approval_pass")
        : t("node.approval_fail")
      : "null";
    edgeParam["labelStyle"] = {
      fill: "#7b7f84",
      fontWeight: 500,
      fontSize: "0.8rem",
    };
    edgeParam["labelBgPadding"] = [8, 4];
    addEdges([edgeParam]);
  } else {
    // 其他情況，正常新增 edge
    const existingSourceEdge = flowStore.edges.find(
      (edge) => edge.source === source
    );
    const existingTargetEdge = flowStore.edges.find(
      (edge) => edge.target === target
    );
    if (existingSourceEdge || existingTargetEdge) {
      ElMessage.error(t("flowAction.error_oneConnect"));
      return;
    }
    addEdges([edgeParam]);
  }
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

// 結束編輯
const closeEdit = () => {
  // 移除計時器
  flowStore.clearAutoSave();
  // 結束編輯階段
  callApi.endEditFlow(flowStore.flowData.id);
};

//顯示最新儲存時間
const getLastSaveTime = computed(() => {
  if (flowStore.lastSaveTime == null) {
    return "";
  }
  const now = Date.now(); // 獲取當前時間（毫秒）
  // 獲取年、月、日、時、分、秒
  const date = new Date(now);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份加 1 並補零
  const day = date.getDate().toString().padStart(2, "0"); // 補零
  const hours = date.getHours().toString().padStart(2, "0"); // 補零
  const minutes = date.getMinutes().toString().padStart(2, "0"); // 補零
  const seconds = date.getSeconds().toString().padStart(2, "0"); // 補零

  return `${t(
    "createFlow.lastSaveTime"
  )}：${year}-${month}-${day} ${hours}:${minutes}:${seconds}  `;
});

// 創建流程----------------------------------------
const isOpenNewFlowDialog = ref(false);
const sampleFlow = ref(null);
const newFlow = reactive({
  flowName: "",
  companyId: "",
  sampleFlowId: null,
});
// 獲取流程範本
const initSampleFlow = (companyId = null) => {
  if (companyId == null || companyId == "") {
    ElMessage.error(t("createFlow.placeholder_companyName"));
    return;
  }
  // 獲取公司流程資訊
  const params = {
    companyId: newFlow.companyId,
  };
  callApi.getAllFlows(params).then((response) => {
    if (response) {
      // 把草稿流程排除
      const sampleFlowData = response.data.filter((item) => item.status !== -1);
      sampleFlow.value = sampleFlowData ?? [];
    }
  });
};
// 新增流程
const addNewFlow = async () => {
  try {
    // 檢查
    if (
      !newFlow.flowName.trim() ||
      typeof newFlow.flowName !== "string" ||
      !newFlow.companyId
    ) {
      ElMessage.error(t("flowAction.error_flowName"));
      return;
    }

    isOpenNewFlowDialog.value = false;
    // 初始化flowView
    let flowView = {
      nodes: [getNodeDataSample(1, "start", { x: 450, y: 100 })],
      edges: [],
    };
    const params = {
      flowName: newFlow.flowName.trim(),
      companyId: newFlow.companyId,
    };

    // 檢查是否要透過範本創建
    if (newFlow.sampleFlowId != null && newFlow.sampleFlowId != "") {
      const sampleFlowRes = await callApi.getFlow(newFlow.sampleFlowId);
      const sampleFlowData = sampleFlowRes.data;
      params["flowView"] = sampleFlowData ? sampleFlowData.flowView : flowView;
    } else {
      params["flowView"] = flowView;
    }

    const createRes = await callApi.createFlow(params);

    if (!createRes) {
      ElMessage.error(t("flowAction.flowAdd_fail"));
      return;
    }

    Object.assign(newFlow, {
      flowName: "",
      companyId: "",
      sampleFlowId: null,
    });

    const initRes = await flowStore.initFlow(createRes.data.id);
    router.push({
      name: "createflow",
      query: {
        flow: btoa(createRes.data.id),
      },
    });
  } catch (error) {
    console.error(error);
    ElMessage.error(t("flowAction.flowAdd_fail"));
  }
};
// 取消新增流程
const cancelAddNewFlow = () => {
  isOpenNewFlowDialog.value = false;
  ElMessage.info(t("flowAction.flowAdd_cancel"));
  backToFlowList();
};

// ----------------------------------------

// 啟用流程
const checkNenableFlow = async () => {
  let elMag = t("flowAction.flowEnable_fail");

  try {
    let flow = generateFlowJSONObj(flowStore.nodes, flowStore.edges);

    // 檢查流程是否合規
    const [checkRes, errorMsg] = checkFlowObj(flow);
    if (!checkRes) return ElMessage.error(errorMsg);

    // 檢查無誤，啟用流程
    let flowView = {
      nodes: flowStore.nodes,
      edges: flowStore.edges,
    };
    const enableRes = await callApi.enableFlow(
      flowStore.flowData.id,
      flow,
      null,
      flowView
    );

    // 啟用失敗
    if (!enableRes || !enableRes.isSuccess) {
      if (enableRes?.editStatus !== null) {
        // 編輯權限不足，根據 editStatus 給出不同提示訊息
        return ElMessage.error(t(`flowAction.error_${enableRes.editStatus}`));
      }
      return ElMessage.error(t("flowAction.elMag"));
    }

    // 啟用成功
    ElMessage.success(t("flowAction.flowEnable_success"));
    closeEdit();
    backToFlowList();
  } catch (error) {
    console.error(error);
    ElMessage.error(elMag);
  }
};

// 載入流程資訊 （含開啟編輯階段）
onMounted(async () => {
  const flowId = route.query.flow ? atob(route.query.flow) : null;
  try {
    flowStore.initActiveNode();
    // 1. 載入流程
    const initRes = await flowStore.initFlow(flowId);

    // 2. 開啟創建流程頁面
    if (flowId === null) {
      isOpenNewFlowDialog.value = true;
      getCompanyList();
      return;
    }

    // 3. 如果初始化失敗，跳錯誤訊息
    if (!initRes) {
      alertElMessage(t("flowAction.error_init"), () => backToFlowList());
      return;
    }
    // 4. 啟動編輯權限
    const res = await callApi.startEditFlow(flowId);
    if (!res || !res.isSuccess) {
      if (res?.editStatus !== null) {
        // 編輯權限不足，根據 editStatus 給出不同提示訊息
        return alertElMessage(t(`flowAction.error_${res.editStatus}`), () =>
          backToFlowList()
        );
      }
      alertElMessage(t("flowAction.error_unknown"), () => backToFlowList());
      return;
    }

    // 5. 啟動自動儲存
    flowStore.startAutoSave();
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
        :icon="ArrowLeft"
        :title="isMobile ? ' ' : ''"
        @back="
          closeEdit();
          backToFlowList();
        "
      >
        <template #content>
          <div
            :class="
              isMobile
                ? 'pageheader_content-mobile'
                : 'pageheader_content-desktop'
            "
          >
            <el-text
              style="font-weight: bolder"
              :size="isMobile ? 'small' : 'large'"
              >{{ $t("createFlow.editFlow") }}</el-text
            >
            <el-text type="info" :size="isMobile ? 'small' : 'large'">
              {{ flowStore.flowData.name }}</el-text
            >
          </div>
        </template>
        <template #extra>
          <div style="width: 100%">
            <el-text style="margin-right: 1rem" type="info" size="small">
              {{ isMobile ? "" : getLastSaveTime }}
            </el-text>
            <el-button
              :icon="UploadFilled"
              @click="flowStore.saveFlow"
              :size="isMobile ? 'small' : 'large'"
              >{{ $t("common.save") }}</el-button
            >
            <el-button
              type="primary"
              class="ml-2"
              @click="checkNenableFlow()"
              :size="isMobile ? 'small' : 'large'"
              >{{ $t("createFlow.enableFlow") }}</el-button
            >
          </div>
        </template>
      </el-page-header>
    </div>
    <div class="pageView-counter" @drop="onDrop">
      <div class="vueFlow-counter">
        <VueFlow
          v-model:nodes="flowStore.nodes"
          v-model:edges="flowStore.edges"
          :nodeTypes="nodeTypes"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @node-click="onNodeClick"
          :key="flowStore.flowData.id"
          fit-view-on-init
        >
          <Background :size="2" :gap="20" pattern-color="#BDBDBD" />
        </VueFlow>
      </div>
      <Sidebar />
      <FlowInfobar
        ref="flowInfoBar"
        :nodeType="flowStore.activeNodeType"
        :isEdit="true"
        :key="flowStore.flowData.id"
      ></FlowInfobar>
    </div>
  </div>

  <!-- 創建流程畫面 -->
  <el-dialog
    v-model="isOpenNewFlowDialog"
    destroy-on-close
    align-center
    :before-close="cancelAddNewFlow"
    :title="$t('createFlow.addNewFlow')"
    :width="isMobile ? '90%' : '30%'"
  >
    <el-form :model="newFlow" label-position="top">
      <el-form-item :label="$t('flow.name')">
        <el-input
          v-model="newFlow.flowName"
          :placeholder="t('createFlow.placeholder_flowName')"
        ></el-input>
      </el-form-item>

      <el-form-item :label="t('flow.companyName')">
        <el-select
          v-model="newFlow.companyId"
          :placeholder="t('createFlow.placeholder_companyName')"
          @change="sampleFlow = null"
        >
          <el-option
            v-for="company in companyList"
            :key="company.id"
            :label="`${company.name}(${company.idno ?? ''})`"
            :value="company.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-button
          type="primary"
          @click="initSampleFlow(newFlow.companyId)"
          size="small"
          >{{ t("createFlow.btn_sampleFlow") }}</el-button
        >
      </el-form-item>
      <el-form-item
        :label="t('createFlow.addBySampleFlow')"
        v-if="sampleFlow != null"
      >
        <el-select
          v-model="newFlow.sampleFlowId"
          :placeholder="t('createFlow.placeholder_sampleFlow')"
        >
          <el-option
            key="-1"
            :label="t('createFlow.option_noSampleFlow')"
            value=""
          />
          <el-option
            v-for="flow in sampleFlow"
            :key="flow.id"
            :label="flow.name"
            :value="flow.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelAddNewFlow">{{
          t("common.cancel")
        }}</el-button>
        <el-button type="primary" @click="addNewFlow">{{
          t("common.add")
        }}</el-button>
      </span>
    </template>
  </el-dialog>

  <ControlSetting></ControlSetting>
</template>
<style scoped lang="css">
.pageheader_content-desktop {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.pageheader_content-mobile {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.vueFlow-counter {
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
}
</style>
