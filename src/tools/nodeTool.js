//定義節點內容，若有新增節點請於此檔案加入資訊
//Tool  ---------
import callApi from "@/tools/api";
//i18n ---------
import i18n from "../lang/plugins/vue-i18n";
const t = i18n.global.t;

/**
 * 獲取 Node 資訊
 *
 * @param {string} type
 * @return {Object} 回傳包含label等節點資訊
 */
export function getNodeInfo(type, returnValue = null) {
  const node = {
    label: t("node.type_unknown"),
    element: null,
    content: null, //Node content 預設模板資訊
  };

  switch (type) {
    case "input": // 目前不使用
      node["label"] = "輸入";
      node["elementId"] = null;
      node["content"] = null;
      break;
    case "output": // 目前不使用
      node["label"] = "輸出";
      node["elementId"] = null;
      node["content"] = null;
      break;
    case "start":
      node["label"] = t("node.type_start");
      node["elementId"] = 1;
      node["content"] = {
        description: "", //string
      };
      break;
    case "end":
      node["label"] = t("node.type_end");
      node["elementId"] = 5;
      node["content"] = null;
      break;
    case "approval":
      node["label"] = t("node.type_approval");
      node["elementId"] = 2;
      node["content"] = {
        approvalTarget: {
          type: "",
          operator: "",
        },
      };
      break;
    case "notify":
      node["label"] = t("node.type_notify");
      node["elementId"] = 3;
      node["content"] = {
        notifyTarget: [],
      };
      break;
    case "handle":
      node["label"] = t("node.type_handle");
      node["elementId"] = 4;
      node["content"] = {
        handleTarget: {
          type: "",
          operator: "",
        },
      };
      break;
    default:
      break;
  }
  if (!returnValue) {
    return node;
  }
  return node[returnValue];
}

export function nodeElementToLabel(element, returnValue = null) {
  const node = {
    label: t("node.type_unknown"),
  };

  switch (element) {
    case 1:
      node["label"] = t("node.type_start");
      break;
    case 5:
      node["label"] = t("node.type_end");
      break;
    case 2:
      node["label"] = t("node.type_approval");
      break;
    case 3:
      node["label"] = t("node.type_notify");
      break;
    case 4:
      node["label"] = t("node.type_handle");
      break;
    default:
      break;
  }
  if (!returnValue) {
    return node;
  }
  return node[returnValue];
}

export async function getTargetDisplayName(companyId, type, operator) {
  let vel;
  let deptName = t("node.targetType_unknownDept");
  let empName = t("node.targetType_unknownEmp");
  try {
    switch (Number(type)) {
      case 1:
        vel = t("node.targetType_manager");
        break;
      case 2:
        vel = t("node.targetType_gm");
        break;
      case 3:
        // 部門主管
        let getDeptRes = await callApi.getDept(companyId, operator);
        if (getDeptRes) {
          deptName = getDeptRes.data.name;
        }
        vel = deptName;
        break;
      case 4:
        //特定員工
        let empRes = await callApi.getEmpInfo(companyId, operator);
        if (empRes) {
          empName = empRes.data.name;
          deptName = empRes.data.deptName;
        }
        vel = `${empName}(${deptName})`;
        break;
      default:
        vel = t("node.targetType_unset");
        break;
    }
  } catch (error) {
    vel = t("flowAction.error");
  }
  return vel;
}
