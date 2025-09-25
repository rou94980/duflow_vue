<script setup>
import { ref } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { Delete } from "@element-plus/icons-vue";
import { usePageStore } from "@/stores/page";
const pageStore = usePageStore();
const instance = useVueFlow();

const newField = ref({
  type: "Stext",
  name: "",
  label: "",
  items: [],
  isRequired: "1",
  width: 10,
});

const fieldOptions = ref([{ label: "", value: "" }]);

watch(
  () => newField.value.type,
  (newType) => {
    newField.value.items =
      newType === "Sselect" || newType === "Mselect" ? fieldOptions.value : [];
  }
);

// 新增選項
const addOption = () => {
  fieldOptions.value.push({ label: "", value: "" });
};
// 刪除選項
const removeOption = (index) => {
  fieldOptions.value.splice(index, 1);
};

// 新增欄位
const addField = () => {
  const pageStore = usePageStore();
  let data = JSON.parse(JSON.stringify(newField.value));
  if (data.type != "Sselect" && data.type != "Mselect") {
    delete data.items;
  }
  if (data.type != "Stext" && data.type != "Mtext") {
    delete data.width;
  }
  if (data.type != "Mtext") {
    delete data.hight;
  }
  pageStore.addFormField(data);

  // 初始化
  newField.value = {
    type: "Stext",
    name: "",
    label: "",
    items: [],
    isRequired: "1",
    width: 300,
  };
};
</script>

<template>
  <section style="display: flex; gap: 3%">
    <div class="template_container">
      <el-form
        label-width="auto"
        label-position="left"
        require-asterisk-position="right"
        class="template_form"
      >
        <div style="display: flex; justify-content: center">
          <img
            src="@/assets/logo-1.png"
            alt=""
            style="width: 40%; height: auto"
          />
        </div>
        <div style="display: flex; flex-direction: column">
          <el-text class="template_title" tag="h3" size="large">{{
            pageStore.createFormPageData.formData.formName ?? "新表單"
          }}</el-text>
          <el-text
            tag="span"
            size="small"
            style="
              align-self: end;
              margin: 0 20px 50px 0;
              border: 1px solid #f56c6c;
              padding: 5px;
              color: #f56c6c;
            "
            >{{
              pageStore.createFormPageData.formData.formurgencyLevel === "3"
                ? "急件"
                : pageStore.createFormPageData.formData.formurgencyLevel === "2"
                ? "速件"
                : pageStore.createFormPageData.formData.formurgencyLevel === "1"
                ? "普件"
                : "未知"
            }}</el-text
          >
        </div>

        <el-form-item
          v-for="(field, index) in pageStore.createFormPageData.formData
            .formFields"
          :key="index"
          :label="field.label"
          :required="field.isRequired == '1' ? true : false"
        >
          <!-- Stext -->
          <el-input
            v-if="field.type == 'Stext'"
            :style="field.width ? `width:${field.width}px;` : ''"
          />
          <!-- Sselect -->
          <el-select v-else-if="field.type == 'Sselect'">
            <el-option
              v-for="(option, index) in field.items"
              :key="index"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <!-- Mselect -->
          <el-checkbox-group v-else-if="field.type == 'Mselect'">
            <el-checkbox
              v-for="(option, index) in field.items"
              :key="index"
              :value="option.value"
              :name="field.name"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
          <!-- Mtext -->
          <el-input v-else="field.type == 'Mtext'" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <aside class="newfield_container">
      <el-form :model="pageStore.createFormPageData.formData">
        <el-form-item label="表單名稱">
          <el-input v-model="pageStore.createFormPageData.formData.formName" />
        </el-form-item>
        <el-form-item label="表單編號">
          <el-input
            v-model="pageStore.createFormPageData.formData.formId"
            readonly
          />
        </el-form-item>
        <el-form-item label="緊急程度">
          <el-select
            v-model="pageStore.createFormPageData.formData.formurgencyLevel"
          >
            <el-option label="普件" value="1" />
            <el-option label="速件" value="2" />
            <el-option label="急件" value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form
        label-position="top"
        style="
          background-color: #d9d9d980;
          padding: 5% 10%;
          border-radius: 5px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 5px 0px,
            rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;
          margin-top: 20px;
        "
      >
        <el-form-item label="欄位名稱">
          <el-input v-model="newField.name" />
        </el-form-item>
        <el-form-item label="顯示名稱">
          <el-input v-model="newField.label" />
        </el-form-item>
        <el-form-item label="類型">
          <el-select v-model="newField.type">
            <el-option label="輸入框" value="Stext" />
            <el-option label="單選" value="Sselect" />
            <el-option label="複選" value="Mselect" />
            <el-option label="Textarea" value="Mtext" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="newField.type == 'Sselect' || newField.type == 'Mselect'"
          label="選項"
        >
          <table style="border-collapse: separate; border-spacing: 5px 0">
            <tr v-for="(option, index) in fieldOptions" :key="index">
              <td>
                <el-input
                  size="small"
                  v-model="option.label"
                  aria-label="label"
                  placeholder="label"
                />
              </td>
              <td>
                <el-input
                  v-model="option.value"
                  size="small"
                  aria-label="value"
                  placeholder="value"
                />
              </td>
              <td>
                <el-button
                  text
                  bg
                  size="small"
                  @click="removeOption(index)"
                  :icon="Delete"
                ></el-button>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <el-button
                  text
                  bg
                  size="small"
                  style="width: 100%"
                  @click="addOption"
                >
                  新增選項
                </el-button>
              </td>
            </tr>
          </table>
        </el-form-item>
        <el-form-item label="必填欄位">
          <el-radio-group v-model="newField.isRequired">
            <el-radio value="1">是</el-radio>
            <el-radio value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-button @click="addField"> 新增 </el-button>
          </el-col>
          <el-col :span="12">
            <el-button> 清空 </el-button>
          </el-col>
        </el-row>
      </el-form>
    </aside>
  </section>

  <!-- <el-button type="primary" style="margin-top: 50px; width: 100%">
    建立表單
  </el-button> -->
</template>
<style scoped lang="css">
.template_container {
  flex-basis: 70%;
}
.template_form {
  border-radius: 5px;
  height: 100%;
  overflow: hidden;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  padding: 3%;
}
.template_title {
  text-align: center;
  line-height: 4;
  font-weight: bolder;
}
.newfield_container {
  flex-basis: 30%;
}
</style>
