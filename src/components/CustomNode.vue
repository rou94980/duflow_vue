<script setup>
import { ref, onMounted, watch } from "vue";
import { Position, Handle } from "@vue-flow/core";
//Tool  ---------
import callApi from "@/tools/api";
import { getTargetDisplayName } from "@/tools/nodeTool";
//Pinia Store  ---------
import { useFlowStore } from "@/stores/flow";
const flowStore = useFlowStore();
//i18n ---------
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  data: Object,
});

const showContentTarget = ref([]);
// 初始化 簽核/知會/經辦 對象
const initContentTerget = async () => {
  let targetArr = [];
  switch (props.data.type) {
    case "start":
    case "end":
    default:
      break;
    case "notify":
      let notifyTarget = props.data.content.notifyTarget;
      // 待選澤
      if (Array.isArray(notifyTarget) && notifyTarget.length <= 0) {
        targetArr.push(t("node.targetType_unset"));
        break;
      }
      // 填單後指定
      if (notifyTarget == "pending") {
        targetArr.push("填單後指定");
        break;
      }
      // 顯示知會列表
      if (notifyTarget.length > 0) {
        const displayNames = await Promise.all(
          notifyTarget.map(async (t, index) => {
            let displayName = await getTargetDisplayName(
              flowStore.flowData.companyId,
              t.type,
              t.operator
            );

            return `${index + 1}. ${displayName}`;
          })
        );
        targetArr.push(...displayNames);
      }
      break;
    case "approval":
      targetArr = [
        await getTargetDisplayName(
          flowStore.flowData.companyId,
          props.data.content.approvalTarget.type,
          props.data.content.approvalTarget.operator
        ),
      ];
      break;
    case "handle":
      targetArr = [
        await getTargetDisplayName(
          flowStore.flowData.companyId,
          props.data.content.handleTarget.type,
          props.data.content.handleTarget.operator
        ),
      ];

      break;
  }
  showContentTarget.value = targetArr;
};

watch(
  () => props.data.content,
  async (newValue, oldValue) => {
    await initContentTerget();
  },
  { deep: true }
);

onMounted(async () => {
  await initContentTerget();
});
</script>

<template>
  <div style="width: 100%">
    <p style="line-height: 2">{{ data.label }}</p>
    <!-- <p style="line-height: 2">{{ data.id }}</p> -->
    <ol v-if="showContentTarget.length > 0" class="content-ol">
      <li v-for="item in showContentTarget" class="content-li">
        {{ item }}
      </li>
    </ol>

    <!-- targe -->
    <Handle
      v-if="data.type !== 'start'"
      type="target"
      :position="Position.Top"
      class="handle"
    />
    <!-- source -->
    <Handle
      v-if="data.type !== 'end' && data.type !== 'approval'"
      type="source"
      class="handle"
      :position="Position.Bottom"
    />

    <Handle
      v-if="data.type == 'approval'"
      id="pass-handle"
      type="source"
      class="handle"
      :position="Position.Left"
    />
    <Handle
      v-if="data.type == 'approval'"
      id="fail-handle"
      type="source"
      class="handle"
      :position="Position.Right"
    />
  </div>
</template>
<style scoped lang="css">
.handle {
  background-color: #9a9a9a;
  border: 1px #bbb solid;
}
.handle-left {
  transform: rotate(90deg) translate(-50%, -50%);
  transform-origin: left top;
}
.handle-right {
  transform: rotate(90deg) translate(50%, -50%);
  transform-origin: right top;
}

.content-ol {
  background-color: #ffffff90;
  border-radius: 3px;
  padding: 5px 10px;
  text-align: left;
}
.content-li {
  font-size: 9px;
  line-height: 1.5;
  color: #606266;
}
</style>
