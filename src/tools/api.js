import axios from "axios";
import { logout } from "@/tools/tool";

const config = {
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 讓 cookie (refresh token) 自動帶
};

const api = axios.create(config);

// axios 請求攔截器
api.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${
      localStorage.getItem("accessToken") || ""
    }`;
    return config;
  },
  (error) => {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);

// axios 響應攔截器
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    // 401 且尚未重試過
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // refresh token
          const refreshRes = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/refresh`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = refreshRes.data.data.token;

          // 更新 localStorage
          localStorage.setItem("accessToken", newAccessToken);

          // 更新原本請求的 Authorization
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 重新發送原本的請求
          return api(originalRequest);
        } catch (refreshErr) {
          logout();
          return Promise.reject(refreshErr);
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

const callApi = {
  async getAllFlows(param) {
    try {
      const res = await api.get(`flows`, { params: param });
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async getFlow(flowId) {
    try {
      const res = await api.get(`flows/${flowId}`);
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async createFlow(param) {
    try {
      const res = await api.post(`flows`, param);
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async saveFlow(id, flowName = null, flowView = null) {
    try {
      const param = {};
      if (flowName) param.flowName = flowName;
      if (flowView) param.flowView = flowView;
      await api.patch(`flows/${id}/save`, param);
      return true;
    } catch (err) {
      return false;
    }
  },
  async enableFlow(id, flow, flowName = null, flowView = null) {
    try {
      const param = { flow };
      if (flowName) param.flowName = flowName;
      if (flowView) param.flowView = flowView;
      const res = await api.patch(`flows/${id}/enable`, param);
      return { isSuccess: true, editStatus: res.status };
    } catch (err) {
      const status = err.response?.status || null;
      return {
        isSuccess: false,
        editStatus: [403, 423].includes(status) ? status : null,
      };
    }
  },
  async disableFlow(id) {
    try {
      await api.patch(`flows/${id}/disable`);
      return true;
    } catch (err) {
      return false;
    }
  },
  async startEditFlow(id) {
    try {
      const res = await api.patch(`flows/${id}/startEdit`);
      return { isSuccess: true, editStatus: res.status };
    } catch (err) {
      const status = err.response?.status || null;
      return {
        isSuccess: false,
        editStatus: [403, 423].includes(status) ? status : null,
      };
    }
  },
  async endEditFlow(id) {
    try {
      await api.patch(`flows/${id}/endEdit`);
      return true;
    } catch (err) {
      return false;
    }
  },
  // company相關
  async getCompany() {
    try {
      const res = await api.get("org/companies");
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async getAllDepts(companyId) {
    try {
      const res = await api.get(`org/companies/${companyId}/departments`);
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async getDept(companyId, deptId) {
    try {
      const res = await api.get(
        `org/companies/${companyId}/departments/${deptId}`
      );
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async getEmpsOfDept(companyId, deptId) {
    try {
      const res = await api.get(
        `org/companies/${companyId}/departments/${deptId}/employees`
      );
      return res.data;
    } catch (err) {
      return false;
    }
  },
  async getEmpInfo(companyId, empId) {
    try {
      const res = await api.get(
        `org/companies/${companyId}/employees/${empId}`
      );
      return res.data;
    } catch (err) {
      return false;
    }
  },
};

export default callApi;
