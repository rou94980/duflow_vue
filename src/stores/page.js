import { defineStore } from "pinia";

export const usePageStore = defineStore("page", {
  state: () => ({
    createFormPage: false,
    createFormPageData: {
      nodeId: "",
      formData: [],
    },
  }),
  getters: {},
  actions: {
    addFormField(fieldData) {
      if (this.createFormPageData.formData.formFields) {
        this.createFormPageData.formData.formFields.push(fieldData);
      } else {
        this.createFormPageData.formData["formFields"] = [];
        this.createFormPageData.formData.formFields.push(fieldData);
      }
    },
  },
});
