import { createRouter, createWebHashHistory } from "vue-router";
import axios from "axios";

const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: {
      title: "登入",
    },
  },
  {
    path: "/flowList",
    name: "flowList",
    component: () => import("@/views/FlowListView.vue"),
    meta: {
      title: "所有流程",
    },
  },
  {
    path: "/createflow",
    name: "createflow",
    component: () => import("@/views/CreateFlowView.vue"),
    meta: {
      title: "創建流程",
    },
  },
  {
    path: "/checkflow",
    name: "checkflow",
    component: () => import("@/views/CheckFlowView.vue"),
    meta: {
      title: "檢視流程",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes, //詳細路由於上方routes定義
  //定義每次切換頁面，scrollbar自動回到 top 0
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from) => {
  // 頁面title
  document.title =
    typeof to.meta?.title === "string"
      ? `${to.meta.title} ｜ DU FLOW`
      : "DU FLOW";
  if (to.name === "login") {
    return true;
  }

  try {
    let res = await checkAuth();
    if (!res) {
      router.push({ name: "login" });
      return false;
    }
  } catch (error) {
    router.push({ name: "login" });
    return false;
  }
});
async function checkAuth() {
  return true;
  try {
    let param = {};
    const response = await axios.post("/api/api_checkAuth.php", param, {
      headers: {
        //'Authorization': 'Bearer'+ localStorage.getItem('token')
        "Content-Type": "application/json",
      },
    });
    if (response.data.status == 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default router;
