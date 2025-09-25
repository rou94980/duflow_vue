<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
import callApi from "@/tools/api";
import {
  generateFlowJSONObj,
  getFlowStatus,
  checkFlowObj,
} from "@/tools/flowTool";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

//以上為import---------------------------------------------------------------------------------

const flowListData = ref([]);
// 分頁控制 －－－－－－－－－－－－－
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);

// 頁碼控制
const handlePageChange = (Page) => {
  currentPage.value = Page;
  initFlowlist();
};
watch(currentPage, (newPage) => {
  handlePageChange(newPage);
});

// 查詢－－－－－－－－－－－－－－－－－－－－－－－－－－
const queryForm = reactive({
  name: "",
  companyId: "",
  status: "",
});
const companyList = ref([]); //select option
const search = () => {
  currentPage.value = 1;
  initFlowlist();
};

// 獲取公司清單
const getCompanyList = async () => {
  const res = await callApi.getCompany();
  if (res) {
    companyList.value = res.data || [];
  }
};

// 撈取流程清單
const initFlowlist = async () => {
  const params = {
    pageSize: pageSize.value,
    pageNo: currentPage.value,
  };
  //搜尋流程名稱
  if (queryForm.name !== "") {
    params["flowName"] = queryForm.name;
  }
  //搜尋流程所屬公司
  if (queryForm.companyId !== "" && queryForm.companyId !== "all") {
    params["companyId"] = queryForm.companyId;
  }
  if (queryForm.status !== "") {
    params["status"] = queryForm.status;
  }

  const res = await callApi.getAllFlows(params);
  if (res) {
    totalCount.value = res.totalCount;
    flowListData.value = res.data;
  }
};

// 創建流程
const addFlow = () => {
  router.push({
    name: "createflow",
  });
};

// 編輯流程
const editFlow = (flowId) => {
  router.push({
    name: "createflow",
    query: {
      flow: btoa(flowId),
    },
  });
};

// 檢視流程
const checkFlow = (flowId) => {
  router.push({
    name: "checkflow",
    query: {
      flow: btoa(flowId),
    },
  });
};

// 啟用流程
const checkNenableFlow = async (flowId) => {
  let elMag = t("flowAction.flowEnable_fail");

  try {
    const getRes = await callApi.getFlow(flowId);
    if (getRes) {
      const flowData = getRes.data;
      let flow = generateFlowJSONObj(
        flowData.flowView.nodes,
        flowData.flowView.edges
      );

      // 檢查流程是否合規
      const [checkRes, errorMsg] = checkFlowObj(flow);
      if (!checkRes) return ElMessage.error(errorMsg);

      // 檢查無誤，啟用流程
      const enableRes = await callApi.enableFlow(
        flowId,
        flow,
        null,
        flowData.flowView
      );
      // 啟用失敗
      if (!enableRes || !enableRes.isSuccess) {
        if (enableRes?.editStatus !== null) {
          // 編輯權限不足，根據 editStatus 給出不同提示訊息
          return ElMessage.error(t(`flowAction.error_${enableRes.editStatus}`));
        }
        return ElMessage.error(t(elMag));
      }

      // 啟用成功
      ElMessage.success(t("flowAction.flowEnable_success"));
      initFlowlist();
    }
  } catch (error) {
    console.error(error);
    return ElMessage.error(elMag);
  }
};

// 停用流程
const disableFlow = async (flowId) => {
  try {
    const response = await callApi.disableFlow(flowId);
    if (response) {
      ElMessage.success(t("flowAction.flowDisable_success"));
    } else {
      ElMessage.error(t("flowAction.flowDisable_fail"));
    }
  } catch (err) {
    console.error("disableFlow error:", err);
    ElMessage.error(t("flowAction.flowDisable_fail"));
  } finally {
    initFlowlist();
  }
};

function formatDateTime(row, column, cellValue) {
  if (!cellValue) return "";
  const date = new Date(cellValue);
  // YYYY-MM-DD HH:mm:ss
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

onMounted(async () => {
  initFlowlist();
  getCompanyList();
});
</script>

<template>
  <div id="flowList-page" class="pageView">
    <div class="pageView-counter counter">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        "
      >
        <img
          src="/logo.png"
          alt="Logo"
          style="object-fit: cover; min-width: 180px; width: 15%"
        />
        <div style="margin-left: auto">
          <el-button type="primary" @click="addFlow" size="default">
            {{ $t("flowList.addNewFlow") }}
          </el-button>
        </div>
      </div>
      <div class="search-form" style="display: flex; gap: 5%; flex-wrap: wrap">
        <el-form
          :model="queryForm"
          label-width="auto"
          style="width: 500px"
          labelPosition="left"
          size="default"
        >
          <el-form-item :label="$t('flow.name')">
            <el-input v-model="queryForm.name" clearable />
          </el-form-item>
          <el-form-item :label="$t('flow.companyName')">
            <el-select
              v-model="queryForm.companyId"
              :placeholder="$t('flowList.placeholder_companyName')"
            >
              <el-option :label="$t('common.all')" value="all" />
              <el-option
                v-for="(company, index) in companyList"
                :key="company.id"
                :label="`${company.name}(${company.idno ?? ''})`"
                :value="company.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('flow.status')">
            <el-radio-group v-model="queryForm.status">
              <el-radio value="">{{ $t("common.all") }}</el-radio>
              <el-radio value="-1">{{ $t("flow.status_draft") }}</el-radio>
              <el-radio value="1">{{ $t("flow.status_active") }}</el-radio>
              <el-radio value="0">{{ $t("flow.status_unactive") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div>
          <el-button @click="search" size="default">{{
            $t("common.search")
          }}</el-button>
        </div>
      </div>
      <el-table :data="flowListData" border>
        <el-table-column prop="id" :label="$t('flow.id')" width="60" />
        <el-table-column
          prop="name"
          :label="$t('flow.name')"
          width="auto"
          min-width="180"
        />
        <el-table-column
          prop="companyName"
          :label="$t('flow.companyName')"
          width="auto"
          min-width="130"
        />
        <el-table-column
          prop="status"
          :label="$t('flow.status')"
          max-width="100"
        >
          <template #default="scope">
            <el-tag
              :type="getFlowStatus(scope.row.status, 'type')"
              disable-transitions
              >{{ getFlowStatus(scope.row.status, "label") }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          :label="$t('flow.updateTime')"
          width="auto"
          min-width="130"
          :formatter="formatDateTime"
        />
        <el-table-column
          fixed="right"
          :label="$t('flowList.operate')"
          width="140"
        >
          <template #default="scope">
            <div style="display: flex; justify-content: flex-start">
              <!-- 編輯或檢視 -->
              <el-button
                v-if="scope.row.status == -1"
                size="small"
                @click="editFlow(scope.row.id)"
              >
                {{ t("common.edit") }}
              </el-button>

              <el-button v-else size="small" @click="checkFlow(scope.row.id)">
                {{ t("common.view") }}
              </el-button>

              <!-- 啟用或關閉 -->
              <el-button
                v-if="scope.row.status == -1"
                size="small"
                type="success"
                @click="checkNenableFlow(scope.row.id)"
              >
                {{ t("flow.status_active") }}
              </el-button>
              <el-button
                v-if="scope.row.status == 1"
                size="small"
                type="danger"
                @click="disableFlow(scope.row.id)"
              >
                {{ t("flow.status_close") }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          size="default"
          layout="prev, pager, next, jumper"
          :total="totalCount"
          @current-change=""
        />
      </div>
    </div>
  </div>
  <ControlSetting></ControlSetting>
</template>
<style scoped lang="css">
.pageView {
  padding: 0;
  max-width: 1400px;
  margin: auto;
}
.header {
  display: flex;
  justify-content: space-between;
  padding: 2%;
  display: none;
}
.counter {
  padding: 2%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5rem;
}
.search-wrap {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}
.search-title {
  line-height: 2.5;
  font-size: 1.2rem;
  font-weight: bolder;
}
.search-form {
  background-color: #f3f3f380;
  padding: 1.5rem 2rem 1rem;
  border-radius: 12px;
}
</style>
