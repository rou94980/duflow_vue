<script setup>
import { reactive } from "vue";
defineProps(["isEdit"]);
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//Tool  ---------
import callApi from "@/tools/api";
import { findDepartmentById } from "@/tools/tool";
import { getTargetDisplayName } from "@/tools/nodeTool";
//Element Plus ---------
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
//i18n ---------
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const nodeContent = reactive(flowStore.activeNodeContent);
const editTargetList = ref([]); // 知會人員列表
const deptOpts = ref([]);
const empOpts = ref([]);
const empDept = ref(null);
const getDept = () => {
  callApi.getAllDepts(flowStore.flowData.companyId).then((response) => {
    if (response) {
      deptOpts.value = response.data || [];
    }
  });
};

const getEmp = (deptId = null) => {
  if (!deptId) {
    empOpts.value = [];
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

// 是否指定知會對象
const isAssign = ref(true);

// 指定知會對象，新增對象至列表----------------
const newTarget = reactive({
  type: "",
  operator: "",
  displayName: "",
});

watch(
  () => newTarget.type,
  (newVal) => {
    if (newVal !== 3 && newVal !== 4) {
      newTarget.operator = null;
      newTarget.displayName = "";
    }
    empDept.value = null;
  }
);

//新增知會對象
const addTarget = () => {
  // 1. 檢查必填
  if (newTarget.type == "") {
    return ElMessage.error("請選擇新增對象");
  }
  if (newTarget.type == 3 || newTarget.type == 4) {
    if (!newTarget.operator) {
      return ElMessage.error(t("flowAction.error_empOrDept"));
    }
  }
  // 2. 檢查重複
  const isRepeat = editTargetList.value.some((item) => {
    if (newTarget.type == 1 || newTarget.type == 2) {
      // 當 type 為 1 時，只比較 type
      return item.type == newTarget.type;
    } else if (newTarget.type == 3 || newTarget.type == 4) {
      // 當 type 為 3 時，則同時比較 type 和 operator
      return item.type == newTarget.type && item.operator == newTarget.operator;
    }
    return true;
  });
  if (isRepeat) {
    return ElMessage.error(t("flowAction.error_notifyTargetRepeat"));
  }

  // 3.處理displayName
  let vel = "";
  switch (newTarget.type) {
    case 1:
      vel = t("node.targetType_manager");
      break;
    case 2:
      vel = t("node.targetType_gm");
      break;
    case 3:
      // 部門主管
      const selectedDept = findDepartmentById(
        deptOpts.value,
        newTarget.operator
      );
      vel = selectedDept.name;
      break;
    case 4:
      //特定員工
      const selectedEmp = empOpts.value.find(
        (emp) => emp.id === newTarget.operator
      );
      let deptName = selectedEmp.deptName;
      let empName = selectedEmp.name;
      vel = `${empName}(${deptName})`;
      break;
    default:
      break;
  }

  newTarget.displayName = vel;

  // 4. 放入值
  editTargetList.value.push({ ...newTarget });

  // 5. 初始化值
  initNewTarget();
};

//刪除知會對象
const deleTarget = (index) => {
  editTargetList.value.splice(index, 1);
};

// 初始化NewTarget
function initNewTarget() {
  Object.assign(newTarget, {
    type: "",
    operator: "",
    displayName: "",
  });
}

// 修改知會對象----------------
const submit = () => {
  // 檢查
  // pass

  // 放入值
  flowStore.activeNodeContent.notifyTarget = isAssign.value
    ? editTargetList.value.map(({ type, operator }) => ({ type, operator }))
    : "pending";
  flowStore.updateNodeData();

  // 初始化
  initNewTarget();
  if (!isAssign.value) {
    editTargetList.value = [];
  }

  ElMessage.success(t("common.edit_success"));
};

//初始化編輯資料
const initTargetData = async () => {
  getDept();
  //初始化編輯資料 - 獲取展示名稱
  if (nodeContent.notifyTarget) {
    if (nodeContent.notifyTarget == "pending") {
      //填單後再指定知會對象
      isAssign.value = false;
    } else {
      // 放入已指定的知會對象列表
      // 異步操作,使用for循環逐個等待
      for (const t of nodeContent.notifyTarget) {
        const displayName = await getTargetDisplayName(
          flowStore.flowData.companyId,
          t.type,
          t.operator
        );
        const target = {
          type: t.type,
          operator: t.operator,
          displayName: displayName,
        };
        editTargetList.value.push({ ...target });
      }
    }
  }
};

// DepartmentSelect 組件 -----
const handleUpdateOperator = (newValue) => {
  newTarget.operator = newValue;
};
const handleUpdateEmpDept = (newValue) => {
  empDept.value = newValue;
};

onMounted(() => {
  initTargetData();
});
</script>

<template>
  <el-form :model="newTarget" label-width="auto" label-position="left">
    <!-- 檢視畫面 -->
    <el-form-item :label="$t('flowInfoBar.target')" v-if="!isEdit">
      <el-text v-if="nodeContent.notifyTarget == 'pending'">
        {{ $t("node.targetType_assignLater") }}</el-text
      >
      <div
        v-else
        v-for="(target, index) in editTargetList"
        style="display: flex; width: 95%"
      >
        <el-text> {{ index + 1 }}. {{ target.displayName }} </el-text>
      </div>
    </el-form-item>
    <!-- 編輯畫面 -->
    <div v-else>
      <!-- 是否指定知會對象 -->
      <el-form-item :label="$t('flowInfoBar.target')">
        <el-radio-group
          v-model="isAssign"
          style="display: flex; flex-direction: column; align-items: flex-start"
          @change="newTarget.operator = ''"
        >
          <el-radio :value="true">{{
            $t("node.targetType_assignNow")
          }}</el-radio>
          <el-radio :value="false">
            {{ $t("node.targetType_assignLater") }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 新增知會對象 -->
      <div v-if="isAssign" style="background-color: #f3f3f3ee; padding: 1rem">
        <el-form-item
          :label="`- ${$t('node.notify_list')} -`"
          label-position="top"
        >
          <el-text v-if="editTargetList.length == 0">
            {{ $t("node.targetType_unset") }}</el-text
          >
          <div
            v-else
            v-for="(target, index) in editTargetList"
            style="display: flex; width: 95%"
          >
            <el-text> {{ index + 1 }}. {{ target.displayName }} </el-text>
            <el-button
              :icon="Delete"
              type="primary"
              link
              @click="deleTarget(index)"
              style="margin-left: auto"
            />
          </div>
        </el-form-item>
        <el-form-item label="" v-if="isEdit">
          <div
            style="
              width: 100%;
              background-color: #d9d9d980;
              padding: 15px;
              border-radius: 5px;
            "
          >
            <el-radio-group
              v-model="newTarget.type"
              style="
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              "
              @change="newTarget.operator = ''"
            >
              <el-radio :value="1">
                {{ $t("node.targetType_manager") }}</el-radio
              >
              <el-radio :value="2"> {{ $t("node.targetType_gm") }} </el-radio>
              <el-radio :value="3"> {{ $t("node.targetType_dept") }} </el-radio>
              <div
                v-if="newTarget.type == 3"
                style="margin: 0.3rem 1rem; width: 90%"
              >
                <DepartmentSelect
                  :departments="deptOpts"
                  @updateDepId="handleUpdateOperator"
                />
              </div>

              <el-radio :value="4"> {{ $t("node.targetType_emp") }} </el-radio>
              <div
                style="margin: 0.3rem 1rem; width: 90%"
                v-if="newTarget.type == 4"
              >
                <div>
                  <DepartmentSelect
                    :departments="deptOpts"
                    @updateDepId="handleUpdateEmpDept"
                  />
                </div>
                <el-select
                  style="margin-top: 0.3rem"
                  v-model="newTarget.operator"
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
            <el-button
              style="width: 100%; margin-top: 10px"
              @click="addTarget"
              >{{ $t("common.add") }}</el-button
            >
          </div>
        </el-form-item>
      </div>
      <!-- 修改按鈕 -->
      <el-form-item style="margin-top: 50px">
        <el-button type="primary" @click="submit" style="width: 100%">{{
          $t("common.edit2")
        }}</el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<style scoped lang="css"></style>
