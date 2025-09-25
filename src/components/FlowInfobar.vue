<script setup>
//Element Plus ---------
import { DArrowLeft, DArrowRight } from "@element-plus/icons-vue";
//Pinia Store ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Tool ---------
import { getNodeInfo } from "@/tools/nodeTool";
import { getFlowStatus } from "@/tools/flowTool";

defineProps(["nodeType", "isEdit"]);
const isMobile = inject("isMobile");
//FlowInfoBar
const isShowFlowInfoBar = ref(isMobile.value ? false : true);
const toggleFlowInfoBar = () => {
  isShowFlowInfoBar.value = !isShowFlowInfoBar.value;
};

//Tab
const activeTab = ref("flowInfo");
const switchTab = (tab) => {
  activeTab.value = tab;
  if (!isShowFlowInfoBar.value) {
    isShowFlowInfoBar.value = true;
  }
};

//流程資訊
const submitFlowData = () => {
  flowStore.saveFlow();
};

defineExpose({
  switchTab,
});
</script>

<template>
  <aside :class="{ 'aside-open': isShowFlowInfoBar }">
    <div class="toggleFlowInfoBar-btn">
      <el-icon @click="toggleFlowInfoBar" isShowFlowInfoBar color="#909399">
        <!-- <Operation color="#90939960" class="operation-icon" /> -->
        <DArrowRight v-if="isShowFlowInfoBar"></DArrowRight>
        <DArrowLeft v-else></DArrowLeft>
      </el-icon>

      <!-- <el-button
        :icon="isShowFlowInfoBar ? DArrowRight : DArrowLeft"
        isShowFlowInfoBar
        text
        @click="toggleFlowInfoBar"
      /> -->
    </div>

    <el-tabs
      style="height: 100%"
      v-model="activeTab"
      v-show="isShowFlowInfoBar"
    >
      <el-tab-pane
        class="tab scrollbar"
        :label="$t('flowInfoBar.flowInfo')"
        name="flowInfo"
      >
        <el-form
          :model="flowStore.flowData"
          label-width="auto"
          label-position="left"
        >
          <el-form-item :label="$t('flow.name')">
            <el-input v-model="flowStore.flowData.name" :disabled="!isEdit" />
          </el-form-item>
          <!-- <el-form-item label="擁有者">
            <el-text>{{ flowStore.flowData.owner }}</el-text>
          </el-form-item> -->
          <el-form-item :label="$t('flow.status')">
            <el-text>{{
              getFlowStatus(flowStore.flowData.status, "label")
            }}</el-text>
          </el-form-item>
          <el-form-item :label="$t('flow.companyName')">
            <el-text>{{ flowStore.flowData.companyName }}</el-text>
          </el-form-item>
          <!-- <el-form-item label="更新時間">
            <el-text>{{ flowStore.flowData.updateTime }}</el-text>
          </el-form-item> -->
          <el-form-item style="margin-top: 50px">
            <el-button
              v-if="isEdit"
              type="primary"
              @click="submitFlowData"
              style="width: 100%"
              >{{ $t("common.edit2") }}</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane
        class="tab scrollbar"
        :label="$t('flowInfoBar.nodeInfo')"
        name="nodeInfo"
      >
        <el-form label-width="auto" label-position="left">
          <el-form-item :label="$t('node.type')">
            <el-text>{{ getNodeInfo(nodeType, "label") }}</el-text>
          </el-form-item>
          <el-form-item :label="$t('node.id')">
            <el-text>{{ flowStore.activeNodeId }}</el-text>
          </el-form-item>
        </el-form>
        <el-divider style="margin-top: 30px"></el-divider>
        <div style="width: 100%">
          <StartNodeData
            v-if="nodeType == 'start'"
            :key="flowStore.flowData.id"
            :isEdit="isEdit"
          ></StartNodeData>
          <ApprovalNodeData
            v-if="nodeType == 'approval'"
            :key="flowStore.activeNodeId"
            :isEdit="isEdit"
          ></ApprovalNodeData>
          <NotifyNodeData
            v-if="nodeType == 'notify'"
            :key="flowStore.activeNodeId"
            :isEdit="isEdit"
          ></NotifyNodeData>
          <HandleNodeData
            v-if="nodeType == 'handle'"
            :key="flowStore.activeNodeId"
            :isEdit="isEdit"
          ></HandleNodeData>
        </div>
      </el-tab-pane>
    </el-tabs>
  </aside>
</template>

<style scoped lang="css">
aside {
  width: 0px;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  padding: 0;
  box-sizing: border-box;
  border-left: 1px solid #d9d9d990;
  z-index: 200;
}
.aside-open {
  width: 20dvw;
  min-width: 350px;
  padding: 1rem 1.5rem;
}

.toggleFlowInfoBar-btn {
  border: 1px solid #d9d9d9;
  padding: 0.3rem 0.5rem;
  border-radius: 5px;
  background-color: #ffffffdd;
  position: absolute;
  right: 15px;
  top: 20px;
  z-index: 100;
  cursor: pointer;
}

.aside-open .toggleFlowInfoBar-btn {
  border: 0;
}
.tab {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px;
}
</style>
