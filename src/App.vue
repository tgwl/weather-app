<template>
  <div id="app">
    <!-- 
      路由视图过渡动画 
      v-slot 让我们能访问到当前的 Component 和 route 对象
    -->
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <!-- 
          key 是必须的，确保路由变化时 Vue 知道要重新渲染并触发动画 
          class="view-component" 用于 CSS 定位控制
        -->
        <component :is="Component" :key="route.fullPath" class="view-component" />
      </transition>
    </router-view>

    <!-- 
      底部 Tabbar 
      注意：它必须放在 router-view 外面，且不使用 v-if (除非你确实想隐藏)
    -->
    <TabBar />
  </div>
</template>

<script setup>
import TabBar from './components/TabBar.vue'
// 如果你需要根据路径隐藏 Tabbar，可以取消下面注释并修改逻辑
/*
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const showTabBar = ref(true)

watch(() => route.path, (path) => {
  // 例如：在关于页和随笔页隐藏 Tabbar，获得沉浸式体验
  if (path === '/about' || path === '/essays') {
    showTabBar.value = false
  } else {
    showTabBar.value = true
  }
}, { immediate: true })
*/
</script>

<style>
/* --- 全局基础样式 --- */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #f5f5f5; /* 默认背景色，防止闪烁 */
}

#app {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --- 核心修复：视图组件样式 --- */
.view-component {
  /* 
     关键修复点：
     虽然动画过程中会变成 absolute，但默认状态下保持相对定位或块级元素，
     确保在没有动画或动画结束时，它能撑开空间（如果需要）。
     但在我们的翻页动画中，主要靠下面的 enter/leave 状态控制。
  */
  width: 100%;
  min-height: 100vh; /* 确保每个页面至少占满一屏 */
  background-color: inherit; /* 继承背景，防止透明导致看到后面的内容 */
  box-sizing: border-box;
}

/* --- 翻页动画具体实现 (Page Flip) --- */
.page-flip-enter-active,
.page-flip-leave-active {
  transition: all 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
  position: absolute; /* 动画过程中绝对定位，脱离文档流 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 优化性能，隐藏背面 */
  z-index: 10; /* 确保动画层在普通内容之上 */
}

/* 进入状态：从右侧滑入，带轻微旋转 */
.page-flip-enter-from {
  opacity: 0;
  transform: translateX(100%) perspective(1000px) rotateY(-15deg);
  transform-origin: left center;
}

/* 离开状态：向左侧滑出，带轻微旋转 */
.page-flip-leave-to {
  opacity: 0;
  transform: translateX(-20%) perspective(1000px) rotateY(15deg);
  transform-origin: right center;
}

/* --- 备用淡入淡出动画 (Fade) --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- 强制 Tabbar 层级最高 --- */
/* 假设你的 TabBar 组件根元素类名是 .tab-bar，如果不是请调整选择器 */
.tab-bar, 
div[class*="tabbar"],
div[class*="TabBar"] {
  position: fixed !important; /* 强制固定 */
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999 !important; /* 极高优先级，压住所有页面和动画 */
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05); /* 加点阴影让它更突出 */
}
</style>