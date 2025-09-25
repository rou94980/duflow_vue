<script setup>
import useDragAndDrop from "@/tools/useDnD";
const { onDragStart } = useDragAndDrop();
</script>

<template>
  <aside>
    <div class="sidebar scrollbar">
      <!--
       <div
        class="node vue-flow__node-input"
        :draggable="true"
        @dragstart="onDragStart($event, 'input')"
      >
        開始
      </div> 
            <div
        class="node vue-flow__node-default"
        :draggable="true"
        @dragstart="onDragStart($event, 'default')"
      >
        事件
      </div>
      <div
        class="node vue-flow__node-output"
        :draggable="true"
        @dragstart="onDragStart($event, 'output')"
      >
        結束
      </div>
      -->
      <!-- ---------------------  以上為套件之預設節點，可忽略 --------------------- -->
      <!-- ---------------------  以下為客製節點--------------------- -->
      <div
        class="node vue-flow__node-default vue-flow__node-start"
        :draggable="true"
        @dragstart="onDragStart($event, 'start')"
      >
        {{ $t("node.type_start") }}
      </div>
      <div
        class="node vue-flow__node-default vue-flow__node-approval"
        :draggable="true"
        @dragstart="onDragStart($event, 'approval')"
      >
        {{ $t("node.type_approval") }}
      </div>
      <div
        class="node vue-flow__node-default vue-flow__node-notify"
        :draggable="true"
        @dragstart="onDragStart($event, 'notify')"
      >
        {{ $t("node.type_notify") }}
      </div>
      <div
        class="node vue-flow__node-default vue-flow__node-handle"
        :draggable="true"
        @dragstart="onDragStart($event, 'handle')"
      >
        {{ $t("node.type_handle") }}
      </div>
      <div
        class="node vue-flow__node-default vue-flow__node-end"
        :draggable="true"
        @dragstart="onDragStart($event, 'end')"
      >
        {{ $t("node.type_end") }}
      </div>
    </div>
  </aside>
</template>

<style scoped lang="css">
aside {
  position: absolute;
  top: 10px;
  left: 10px;
  border-radius: 8px;
  background: #f3f3f3;
  box-shadow: 0 5px 10px #0000004d;
  box-sizing: border-box;
  z-index: 200;
  padding: 5px;
}
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-weight: bolder;
  max-height: 65dvh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
}

aside .node {
  cursor: grab;
  font-size: 14px;
  /* -webkit-box-shadow: 5px 5px 10px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 5px 5px 10px 2px #00000040; */
}
</style>
