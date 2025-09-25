<script setup>
import { reactive, watch } from "vue";
const props = defineProps(["isEdit"]);
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Tool  ---------
import callApi from "@/tools/api";
import { getTargetDisplayName } from "@/tools/nodeTool";
//Element Plus ---------
import { ElMessage } from "element-plus";
//i18n ---------
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const target = reactive({
  type: flowStore.activeNodeContent.handleTarget.type || "",
  operator: flowStore.activeNodeContent.handleTarget.operator || "",
});
const deptOpts = ref([]);
const empOpts = ref([]);
const empDept = ref(null);
const initDept_dept = reactive({});
const initDept_emp = reactive({});
const getDept = () => {
  callApi.getAllDepts(flowStore.flowData.companyId).then((response) => {
    if (response) {
      deptOpts.value = response.data || [];
    }
  });
};

const getEmp = (deptId = null) => {
  if (!deptId) {
    ElMessage.info(t("createFlow.placeholder_dept"));
    return;
  }
  callApi
    .getEmpsOfDept(flowStore.flowData.companyId, deptId)
    .then((response) => {
      if (response) {
        empOpts.value = response.data || [];
      }
    });
};

watch(
  () => target.type,
  (newVal) => {
    if (newVal !== 3 && newVal !== 4) {
      target.operator = "";
    }
    empDept.value = null;
  }
);
// 檢視畫面使用
const targetDisplayName = ref("");

const fetchTargetDisplayName = async () => {
  targetDisplayName.value = await getTargetDisplayName(
    flowStore.flowData.companyId,
    target.type,
    target.operator
  );
};

const submit = () => {
  // 檢查
  flowStore.activeNodeContent.handleTarget.type = target.type;
  flowStore.activeNodeContent.handleTarget.operator = target.operator;
  flowStore.updateNodeData();
  ElMessage.success(t("common.edit_success"));
};

//初始化編輯資料
const initTargetData = () => {
  getDept();
  if (target.type == 3) {
    callApi
      .getDept(flowStore.flowData.companyId, target.operator)
      .then((response) => {
        if (response) {
          Object.assign(initDept_dept, {
            id: response.data.id,
            name: response.data.name,
          });
        }
      });
  }
  if (target.type == 4) {
    callApi
      .getEmpInfo(flowStore.flowData.companyId, target.operator)
      .then((response) => {
        if (response) {
          //處理部門
          empDept.value = response.data.deptId || "";
          Object.assign(initDept_emp, {
            id: response.data.deptId,
            name: response.data.deptName,
          });
          //處理員工
          empOpts.value = [
            {
              id: target.operator,
              name: response.data.name,
            },
          ];
        }
      });
  }
};

// DepartmentSelect 組件 -----
const handleUpdateOperator = (newValue) => {
  target.operator = newValue;
};
const handleUpdateEmpDept = (newValue) => {
  empDept.value = newValue;
};

onMounted(() => {
  initTargetData();
  if (!props.isEdit) {
    fetchTargetDisplayName();
  }
});
</script>

<template>
  <el-form :model="target" label-width="auto" label-position="left">
    <!-- 檢視畫面 -->
    <el-form-item :label="$t('flowInfoBar.target')" v-if="!isEdit">
      <el-text>
        {{ targetDisplayName }}
      </el-text>
    </el-form-item>
    <!-- 編輯畫面 -->
    <div v-else>
      <el-form-item :label="$t('flowInfoBar.target')">
        <el-radio-group
          v-model="target.type"
          style="display: flex; flex-direction: column; align-items: flex-start"
          @change="target.operator = ''"
        >
          <el-radio :value="1"> {{ $t("node.targetType_manager") }}</el-radio>
          <el-radio :value="2"> {{ $t("node.targetType_gm") }} </el-radio>
          <el-radio :value="3"> {{ $t("node.targetType_dept") }} </el-radio>
          <div
            v-if="target.type == 3"
            style="margin: 0.3rem 1rem; min-width: 220px"
          >
            <DepartmentSelect
              :key="initDept_dept.id"
              :selected="initDept_dept"
              :departments="deptOpts"
              @updateDepId="handleUpdateOperator"
            />
          </div>

          <el-radio :value="4"> {{ $t("node.targetType_emp") }} </el-radio>
          <div
            style="margin: 0.3rem 1rem; min-width: 220px"
            v-if="target.type == 4"
          >
            <DepartmentSelect
              :key="initDept_emp.id"
              :selected="initDept_emp"
              :departments="deptOpts"
              @updateDepId="handleUpdateEmpDept"
            />
            <el-select
              style="margin-top: 0.3rem"
              v-model="target.operator"
              :placeholder="$t('createFlow.placeholder_emp')"
              @click="getEmp(empDept)"
            >
              <el-option
                v-for="(option, index) in empOpts"
                :key="option.id"
                :label="option.name"
                :value="option.id"
              />
            </el-select>
          </div>
        </el-radio-group>
      </el-form-item>
      <el-form-item style="margin-top: 50px">
        <el-button type="primary" @click="submit" style="width: 100%">{{
          $t("common.edit2")
        }}</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<style scoped lang="css"></style>
