<script setup>
import { ref, computed } from "vue";
//Tool  ---------
import { findDepartmentById } from "@/tools/tool";

const props = defineProps({
  departments: Array, // 傳入的部門資料
  selected: Object,
});

const emit = defineEmits(["updateDepId"]);
// 當前選擇的部門 ID
const localDepId = ref(props.selected?.name || null);

// 計算當前選擇部門的子部門
const selectedDepartmentChildren = computed(() => {
  const foundDept = findDepartmentById(props.departments, localDepId.value);
  return foundDept?.children || [];
});

// 變更選擇
const handleChange = (newValue) => {
  localDepId.value = newValue;
  // 發送更新事件給父組件
  emit("updateDepId", newValue);
};

// 處理子層級的更新，這裡將子組件的更新往上傳
const handleChildUpdate = (childValue) => {
  emit("updateDepId", childValue);
};
watch(
  () => props.selected,
  (newSelected) => {
    if (newSelected) {
      localDepId.value = props.selected?.name || null;
    }
  }
);
</script>

<template>
  <el-select
    v-model="localDepId"
    @change="handleChange"
    :placeholder="$t('createFlow.placeholder_dept')"
  >
    <el-option
      v-for="dept in props.departments"
      :key="dept.id"
      :value="dept.id"
      :label="dept.name"
    />
  </el-select>

  <!-- 如果選擇的部門有子部門，則遞迴渲染下一層 -->
  <div v-if="selectedDepartmentChildren.length" style="margin-top: 0.3rem">
    <DepartmentSelect
      :departments="selectedDepartmentChildren"
      @updateDepId="handleChildUpdate"
    />
  </div>
</template>
