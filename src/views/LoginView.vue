<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const errMsg = ref("");
const router = useRouter();
const form = reactive({
  ac: "",
  pwd: "",
});
const loginFormRef = ref(null);
const rules = {
  ac: [{ required: true, message: "請輸入帳號", trigger: "none" }],
  pwd: [{ required: true, message: "請輸入密碼", trigger: "none" }],
};

const login = async () => {
  if (!loginFormRef.value) return;
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  try {
    const param = {
      ac: form.ac,
      password: form.pwd,
    };
    const config = {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    };

    try {
      const res = await axios.post("/login", param, config);
      localStorage.setItem("accessToken", res.data.data.token);
      router.push({ name: "flowList" });
    } catch (err) {
      ElMessage.error(t("login.login_error"));
    }
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <div id="loginPage">
    <div class="wrap">
      <img src="/logo.png" alt="Logo" class="logo" />
      <el-form
        :model="form"
        :rules="rules"
        ref="loginFormRef"
        label-width="auto"
        labelPosition="top"
        hide-required-asterisk
      >
        <el-form-item :label="$t('login.account')" prop="ac">
          <el-input v-model="form.ac" clearable />
        </el-form-item>
        <el-form-item :label="$t('login.password')" prop="pwd">
          <el-input type="password" v-model="form.pwd" show-password />
        </el-form-item>
      </el-form>

      <el-button type="primary" style="width: 100%" @click="login">{{
        $t("login.login")
      }}</el-button>
    </div>
  </div>
</template>
<style scoped lang="css">
#loginPage {
  width: 100dvw;
  height: 100dvh;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo {
  width: 100%;
  height: auto;
  object-fit: cover;
}
.wrap {
  border-radius: 25px;
  background-color: #f3f3f380;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  width: 300px;
  height: 390px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.title {
  font-size: 3rem;
  font-weight: bolder;
  line-height: 2;
}
</style>
