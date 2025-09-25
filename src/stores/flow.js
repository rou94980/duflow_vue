import { defineStore } from "pinia";
import { watch } from "vue";
import { debounce } from "lodash";
// Vue-flow  ---------
import { useVueFlow } from "@vue-flow/core";
const { updateNode } = useVueFlow();

//Tool  ---------
import callApi from "@/tools/api";
import { getNodeInfo } from "@/tools/nodeTool";
import { getDateTimeNow } from "@/tools/tool";

export const useFlowStore = defineStore("flow", {
  state: () => ({
    activeNodeId: "",
    activeNodelabel: "",
    activeNodeType: "",
    activeNodeContent: null,
    //-------------------------
    flowData: {
      id: null,
      name: null,
      status: null,
      updateTime: null,
      owner: null,
      companyName: null,
      companyId: null,
    },
    flow: [],
    nodes: [],
    edges: [],
    lastSaveTime: null,
    timer: null,
  }),
  getters: {},
  actions: {
    async initFlow(flowId = null) {
      // 預設資料
      const defaultData = {
        id: null,
        name: "未命名流程",
        status: -1,
        updateTime: getDateTimeNow(),
        owner: "未知",
        companyName: "",
        companyId: null,
      };

      // 先賦值預設
      this.flowData = defaultData;
      this.flow = null;
      this.edges = [];
      this.nodes = [];

      if (flowId == null) {
        return true;
      }

      try {
        const res = await callApi.getFlow(flowId);
        if (!res) {
          console.error("flow not found or API failed");
          return false;
        }
        const resData = res.data;
        this.flowData = resData;
        this.flow = resData.flow;
        this.edges = resData.flowView.edges || [];
        this.nodes = resData.flowView.nodes || [];

        return true;
      } catch (err) {
        console.error("initFlow error:", err);
        return false;
      }
    },
    initActiveNode() {
      this.activeNodeId = "";
      this.activeNodeType = "";
      this.activeNodelabel = "";
      this.activeNodeContent = null;
    },
    changeActiveNode(id, type, nodeData) {
      this.activeNodeId = id;
      this.activeNodeType = type;
      this.activeNodelabel = nodeData.label;
      this.activeNodeContent = nodeData.content ?? getNodeInfo(type, "content");
    },
    getActiveNodeData() {
      const data = {
        id: this.activeNodeId,
        type: this.activeNodeType,
        label: this.activeNodelabel,
        content: this.activeNodeContent,
      };

      return data;
    },

    //儲存流程.
    async saveFlow() {
      let flowView = {
        nodes: this.nodes,
        edges: this.edges,
      };
      const res = await callApi.saveFlow(
        this.flowData.id,
        this.flowData.name,
        flowView
      );
      if (res) {
        this.lastSaveTime = Date.now();
      }
      //console.log("保存流程");
      return res;
    }, //修改節點.
    updateNodeData() {
      const data = this.getActiveNodeData();
      updateNode(this.activeNodeId, { data: data });
      this.saveFlow();
    },
    // 使用 lodash debounce，確保變更後 1 秒才執行
    debounceSave: debounce(function () {
      const now = Date.now(); // 獲取當前時間（毫秒）
      const diff = Math.abs(now - this.lastSaveTime);
      if (diff > 5000) {
        this.saveFlow();
        //console.log("防抖儲存");
      }
    }, 1000),
    // 5分鐘強制儲存
    autoSave() {
      if (!this.timer) {
        this.timer = setInterval(() => {
          const now = Date.now(); // 獲取當前時間（毫秒）
          const diff = Math.abs(now - this.lastSaveTime);
          if (diff > 10000) {
            this.saveFlow();
            //console.log("自動儲存");
          }
        }, 300000);
      }
    },
    startAutoSave() {
      //console.log("啟動自動儲存機制");
      // 監聽 flowData 的變化，防抖儲存
      watch(
        () => [this.nodes, this.edges],
        ([newNodes, newEdges], [oldNodes, oldEdges]) => {
          //console.log("📝 flowData 變更，1 秒後儲存...");
          this.debounceSave(); // 使用防抖函數儲存
        },
        { deep: true } // 啟用深度監聽
      );
      // 啟動強制儲存計時器
      this.autoSave();
    },
    clearAutoSave() {
      if (this.timer !== null) {
        //console.log("刪除計時器");
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
});
