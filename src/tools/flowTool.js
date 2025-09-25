//定義流程相關函式，若有新增節點請同步更新
//Tool  ---------
import { getNodeInfo, nodeElementToLabel } from "@/tools/nodeTool";
//i18n ---------
import i18n from "../lang/plugins/vue-i18n";

const t = i18n.global.t;
// 獲取流程狀態資訊
export function getFlowStatus(status, returnValue = null) {
  const statusInfo = {
    label: t("flow.status_unknown"),
    type: "danger",
  };
  switch (Number(status)) {
    case -1:
      statusInfo["label"] = t("flow.status_draft");
      statusInfo["type"] = "warning";
      break;
    case 1:
      statusInfo["label"] = t("flow.status_active");
      statusInfo["type"] = "success";
      break;
    case 0:
      statusInfo["label"] = t("flow.status_unactive");
      statusInfo["type"] = "info";
      break;
    default:
      break;
  }
  if (!returnValue) {
    return statusInfo;
  }
  return statusInfo[returnValue];
}

// 產生流程JSON
export function generateFlowJSONObj(nodes, edges) {
  //建立togo對應
  const edgeMap = {};
  edges.forEach((edgeObj) => {
    const sourceId = Number(edgeObj.source);
    const targetId = Number(edgeObj.target);
    // 當 label 為空或只有空白時，預設 key 為 "true"
    let approvalOption = "true";
    if (edgeObj.sourceHandle) {
      if (edgeObj.sourceHandle == "fail-handle") {
        approvalOption = "false";
      }
    }

    if (!edgeMap[sourceId]) {
      edgeMap[sourceId] = {};
    }
    edgeMap[sourceId][approvalOption] = targetId;
  });
  const result = nodes.map((nodeObj) => {
    const id = Number(nodeObj.id);
    // 取得節點 type，優先取 node.data.type，否則取 node.type
    const type =
      nodeObj.data && nodeObj.data.type ? nodeObj.data.type : nodeObj.type;
    return {
      id,
      goto: edgeMap[id] || null,
      // 將 content 直接取自 node.data.content，若不存在則為 null
      content:
        nodeObj.data && nodeObj.data.content ? nodeObj.data.content : null,
      element: getNodeInfo(type, "elementId") || null,
    };
  });
  return result;
}

// 檢查是否為獨一流程
const isSingleFlow = (nodes) => {
  let errMsg = `${t("flowAction.invalidFlow")}！${t(
    "flowAction.checkFlowSetting"
  )}`;
  if (nodes.length === 0) return [false, errMsg];
  // 建立 id -> togo 映射表
  const nodeMap = new Map();
  nodes.forEach((node) => nodeMap.set(node.id, node));
  // //檢查是否有開始節點 (id=1)
  if (!nodeMap.has(1))
    return [
      false,
      `${t("flowAction.invalidFlow")}！${t("flowAction.error_startLost")}`,
    ];
  // 使用 BFS 從 "1" 開始遍歷
  const visited = new Set();
  const queue = [1];

  while (queue.length) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    // 取得下一個節點（遍歷所有 goto 的值）
    const nextNodes = nodeMap.get(current)?.goto;
    if (nextNodes) {
      Object.values(nextNodes).forEach((next) => {
        if (nodeMap.has(next) && !visited.has(next)) {
          queue.push(next);
        }
      });
    }
  }
  // 檢查是否所有節點都能從 "1" 遍歷到
  const res = visited.size === nodes.length;
  return [res, res ? "ok" : errMsg];
};

//檢查節點 comtent 及 goto
const checkNodeData = (nodes) => {
  let resArr = [false, null, null];
  for (const node of nodes) {
    resArr = [false, node.id, node.element];
    switch (Number(node.element)) {
      case 1: // 開始 －－－－－－－－－－－－－－－－－－－－－－－
        //content
        if (!node.content?.description) return resArr;
        // goto
        if (!node.goto || !node.goto.true) return resArr;
        break;

      case 2: // 簽核 －－－－－－－－－－－－－－－－－－－－－－－
        //content
        const approvalTarget = node.content?.approvalTarget;
        const approvalType = approvalTarget?.type;
        const approvalOperator = approvalTarget?.operator;

        if (
          !approvalTarget ||
          !approvalType ||
          ((approvalType === 3 || approvalType === 4) && !approvalOperator)
        ) {
          return resArr;
        }
        // goto
        if (!node.goto || !node.goto.true || !node.goto.false) return resArr;
        // 如果是 approval，則 true 和 false 都必須有值
        break;
      case 4: // 經辦 －－－－－－－－－－－－－－－－－－－－－－－
        //content
        const handleTarget = node.content?.handleTarget;
        const handleType = handleTarget?.type;
        const handleOperator = handleTarget?.operator;
        if (
          !handleTarget ||
          !handleType ||
          ((handleType === 3 || handleType === 4) && !handleOperator)
        ) {
          return resArr;
        }
        // goto
        if (!node.goto || !node.goto.true) return resArr;
        break;
      case 3: // 知會 －－－－－－－－－－－－－－－－－－－－－－－
        //content
        const notifyTarget = node.content?.notifyTarget;
        if (
          !notifyTarget ||
          (notifyTarget !== "pending" && notifyTarget.length <= 0)
        ) {
          return resArr;
        }
        //檢查target
        if (notifyTarget !== "pending") {
          for (const t of notifyTarget) {
            if (
              !t.type ||
              t.type == "" ||
              ((t.type === 3 || t.type === 4) && !t.operator)
            ) {
              return resArr;
            }
          }
        }

        // goto
        if (!node.goto || !node.goto.true) return resArr;
        break;
      case 5: // 結束 －－－－－－－－－－－－－－－－－－－－－－－
        if (node.goto !== null) return resArr;
        break;
      default:
        return resArr;
    }
  }
  return [true, null, null];
};

// 檢查flowJson
export function checkFlowObj(flowJsonObj) {
  try {
    // 檢查是否為有效Json
    if (!flowJsonObj)
      return [
        false,
        ,
        `${t("flowAction.error")}！${t("flowAction.checkFlowSetting")}`,
      ];
    //檢查是否有結束節點
    if (!flowJsonObj.some((item) => item.element === 5)) {
      return [
        false,
        `${t("flowAction.invalidFlow")}！${t("flowAction.error_endLost")}`,
      ];
    }
    // 檢查是否為獨一且唯一流程
    const [checkFlowRes, checkFlowElMsg] = isSingleFlow(flowJsonObj);
    if (!checkFlowRes) return [false, checkFlowElMsg];

    // 檢查node裡面的content和goto
    const [checkNodeRes, errorNodeid, errorNodeElement] =
      checkNodeData(flowJsonObj);
    if (!checkNodeRes)
      return [
        false,
        `${t("flowAction.invalidFlow")}！ ${t(
          "flowAction.checkNodeSetting"
        )} （${nodeElementToLabel(errorNodeElement, "label")}${t(
          "node.node"
        )}：${errorNodeid}）`,
      ];
    return [true, t("flowAction.flowEnable_success")];
  } catch (error) {
    console.error(error);
    return [
      false,
      ,
      `${t("flowAction.error")}！${t("flowAction.checkFlowSetting")}`,
    ];
  }
}
