<template>
  <div class="notebook-page">
    <!-- 顶部页眉 -->
    <div class="page-header">
      <div class="header-left">DEV LOGS & TRAPS</div>
      <div class="header-right">Page {{ currentPage }}</div>
    </div>

    <!-- 红色装订线 -->
    <div class="margin-line"></div>

    <!-- 内容区域 -->
    <div class="content-area">
      <h1 class="page-title">踩坑路程</h1>
      <p class="page-subtitle">这是第二款地图学习类应用 · 记录从 v1 的崩塌到 v2 的重建</p>

      <!-- ✨ 新增：项目介绍卡片 (卷首语) -->
      <div class="project-intro-card">
        <div class="intro-icon">☀️</div>
        <div class="intro-content">
          <h3 class="intro-title">关于本项目：寻找城市的阳光角落</h3>
          <p class="intro-text">
            这不仅是一个地图应用，更是一次 <strong>高德地图 (Amap)</strong> 与 <strong>通义千问 (Qwen AI)</strong> 的深度碰撞。
          </p>
          <p class="intro-text">
            传统地图只告诉你“在哪里”，而我想告诉你“哪里最温暖”。
            系统通过高德获取周边 POI 数据与实时天气，交由 Qwen AI 进行多维推理（分析建筑遮挡、朝向、时间段），最终为用户精准推荐<strong>附近阳光最好的地点</strong>。
          </p>
          <div class="intro-tags">
            <span class="tech-tag">📍 Amap API</span>
            <span class="tech-tag">🧠 Qwen AI</span>
            <span class="tech-tag">☀️ Sunlight Algo</span>
          </div>
        </div>
      </div>

      <div class="entries-container">
        
        <!-- 文章 1: 重构决策 -->
        <article class="entry-item">
          <div class="entry-date">2026.03.15</div>
          <h3 class="entry-title">告别“屎山”：从 Travel v1 到 v2 的决裂</h3>
          <p class="entry-excerpt">
            第一款 <code>travel</code> 只做了共享定位及地图聊天，但随着功能堆砌，代码逐渐演变成了一座难以维护的“💩山”。
            <br><br>
            <strong>决策：</strong> 拒绝修补，毅然放弃。
            <br>
            <strong>行动：</strong> 开启 v2 版本，从零重构，只保留核心逻辑，确保架构清晰。
          </p>
          <div class="entry-footer">
            <span class="tag">#Refactor</span>
            <span class="tag">#Decision</span>
            <span class="read-more">Read →</span>
          </div>
        </article>

        <hr class="separator" />

        <!-- 文章 2: 定位偏移难题 -->
        <article class="entry-item">
          <div class="entry-date">2026.03.15</div>
          <h3 class="entry-title">微信内核定位偏移：三次尝试与最终解法</h3>
          <p class="entry-excerpt">
            在微信环境中，地图定位经常出现莫名偏移。为了修复它，我尝试了三种方案：
          </p>
          <ul class="handwritten-list">
            <li><span class="fail">❌ 方案一：</span> 延长等待时间至 30 秒。 <em>结果：用户体验太差，放弃。</em></li>
            <li><span class="fail">❌ 方案二：</span> 接入微信 JSSDK。 <em>结果：审核流程过于复杂，周期太长，放弃。</em></li>
            <li><span class="success">✅ 方案三：</span> <strong>UI 层修正</strong>。在获取环境标识后，直接在 UI 层面增加偏移量补偿逻辑。</li>
          </ul>
          <p class="entry-excerpt" style="margin-top:10px;">
            <strong>结论：</strong> 有时候，最简单的“硬编码”补偿反而是最高效的解决方案。
          </p>
          <div class="entry-footer">
            <span class="tag">#WeChat</span>
            <span class="tag">#Location</span>
            <span class="tag">#BugFix</span>
            <span class="read-more">Read →</span>
          </div>
        </article>

        <hr class="separator" />

        <!-- 文章 3: 高德与 Web 的局限 -->
        <article class="entry-item">
          <div class="entry-date">2026.03.15</div>
          <h3 class="entry-title">高德 API 配额之痛：Web 端的无奈</h3>
          <p class="entry-excerpt">
            高德地图 Web 服务升级后，强制要求配额管理，导致部分功能受限：
          </p>
          <ul class="handwritten-list">
            <li><strong>天气服务：</strong> 因配额宝贵，改为接入公开的 API。</li>
            <li><strong>核心地图：</strong> 仅保留高德 Web 端 (JSAPI) 用于基础展示。</li>
            <li><strong>新功能：</strong> 个别频繁报错且无法适配的新增功能，直接砍掉。</li>
          </ul>
          <div class="highlight-box">
            <strong>💡 血泪建议：</strong><br>
            能做 App 就做 App，千万不要吃力不讨好做 Web 地图应用。原生能力的缺失会让开发者举步维艰。
          </div>
          <div class="entry-footer">
            <span class="tag">#Amap</span>
            <span class="tag">#WebLimit</span>
            <span class="tag">#Architecture</span>
            <span class="read-more">Read →</span>
          </div>
        </article>

        <hr class="separator" />

        <!-- 文章 4: 未来规划 -->
        <article class="entry-item">
          <div class="entry-date">Future Plan</div>
          <h3 class="entry-title">下一步路线图 (Roadmap)</h3>
          <p class="entry-excerpt">
            在稳定当前版本后，计划逐步实现以下功能，甚至尝试取代高德的部分体验：
          </p>
          <div class="roadmap-list">
            <div class="roadmap-item">🔵 <span>公共聊天室：打造实时互动的地图社区</span></div>
            <div class="roadmap-item">🔴 <span>热度图：可视化人流与景点热度</span></div>
            <div class="roadmap-item">🟢 <span>景点照片分享：UGC 内容的沉淀</span></div>
         </div>
          <div class="entry-footer">
            <span class="tag">#Roadmap</span>
            <span class="tag">#Future</span>
            <span class="read-more">Stay Tuned →</span>
          </div>
        </article>

      </div>
    </div>

    <!-- 底部页脚 -->
    <div class="page-footer">
      <span>&copy; {{ currentYear }} My Notebook</span>
      <span class="page-number">{{ currentPage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
const currentPage = ref(12) 
</script>

<style scoped>
/* --- 变量定义 --- */
:root {
  --paper-bg: #fdfbf7;
  --line-color: #a2c4e6;
  --margin-line-color: #ff9da4;
  --ink-color: #2c2c2c;
  --highlight-bg: #fff3cd;
  --fail-color: #d9534f;
  --success-color: #5cb85c;
  --intro-bg: #e8f4fd; /* 淡蓝色背景，象征科技与天空 */
  --intro-border: #a2c4e6;
}

.notebook-page {
  min-height: 100vh;
  background-color: #fdfbf7;
  background-image: linear-gradient(var(--line-color) 1px, transparent 1px);
  background-size: 100% 2rem;
  position: relative;
  font-family: "Comic Sans MS", "Chalkboard SE", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--ink-color);
  padding-bottom: 60px;
  box-shadow: inset 0 0 60px rgba(0,0,0,0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  padding: 2rem 3rem 1rem;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #eee;
  margin-bottom: 1rem;
  background: rgba(253, 251, 247, 0.95);
  position: sticky;
  top: 0;
  z-index: 10;
}

.margin-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 80px;
  width: 2px;
  background-color: var(--margin-line-color);
  opacity: 0.6;
  z-index: 1;
}

.content-area {
  padding: 1rem 3rem 3rem 100px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.page-title {
  font-family: "Times New Roman", serif;
  font-size: 32px;
  margin: 1rem 0 0.5rem;
  color: #000;
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--margin-line-color);
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 2rem;
  font-style: italic;
}

/* --- ✨ 新增：项目介绍卡片样式 --- */
.project-intro-card {
  background-color: rgba(232, 244, 253, 0.6); /* 半透明淡蓝 */
  border: 2px dashed var(--intro-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 3rem;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  position: relative;
  backdrop-filter: blur(2px);
  box-shadow: 3px 3px 0 rgba(162, 196, 230, 0.2);
  transition: transform 0.3s ease;
}

.project-intro-card:hover {
  transform: translateY(-2px);
  background-color: rgba(232, 244, 253, 0.8);
}

.intro-icon {
  font-size: 40px;
  flex-shrink: 0;
  animation: spin-slow 10s linear infinite;
}

@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-family: "Times New Roman", serif;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 10px;
  border-bottom: 1px solid rgba(162, 196, 230, 0.3);
  padding-bottom: 5px;
  display: inline-block;
}

.intro-text {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin: 0 0 10px;
  text-align: justify;
}

.intro-tags {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.tech-tag {
  font-size: 11px;
  background: #fff;
  border: 1px solid var(--intro-border);
  color: #2980b9;
  padding: 3px 8px;
  border-radius: 12px;
  font-family: monospace;
  font-weight: bold;
}

/* --- 原有样式保持不变 --- */
.entries-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.entry-item {
  margin-bottom: 2.5rem;
  line-height: 2rem;
}

.entry-date {
  font-size: 12px;
  color: #888;
  font-family: monospace;
  margin-bottom: 0.5rem;
  display: inline-block;
  background: rgba(255,255,255,0.6);
  padding: 0 4px;
  border-radius: 2px;
}

.entry-title {
  font-size: 20px;
  margin: 0 0 0.8rem;
  font-weight: bold;
  color: #000;
}

.entry-excerpt {
  font-size: 15px;
  color: #333;
  margin: 0 0 1rem;
  text-align: justify;
  white-space: pre-wrap;
}

.handwritten-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  background: rgba(255,255,255,0.4);
  padding: 10px;
  border-radius: 4px;
}

.handwritten-list li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.fail { color: var(--fail-color); font-weight: bold; }
.success { color: var(--success-color); font-weight: bold; }

.highlight-box {
  background-color: var(--highlight-bg);
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin: 15px 0;
  font-size: 14px;
  line-height: 1.6;
  border-radius: 0 4px 4px 0;
  color: #856404;
}

.roadmap-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
}

.roadmap-item {
  font-size: 14px;
  padding: 8px;
  background: rgba(0,0,0,0.03);
  border-radius: 4px;
  border: 1px dashed #ccc;
}

.entry-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  margin-top: 10px;
}

.tag {
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
  font-family: sans-serif;
  font-size: 10px;
  text-transform: uppercase;
}

.read-more {
  margin-left: auto;
  color: #d35400;
  font-weight: bold;
  cursor: pointer;
  font-family: sans-serif;
  font-size: 11px;
}

.separator {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0));
  margin: 2.5rem 0;
  opacity: 0.5;
}

.page-footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 3rem;
  box-sizing: border-box;
  font-family: "Times New Roman", serif;
  font-size: 12px;
  color: #999;
  background: rgba(253, 251, 247, 0.95);
  height: 40px;
  align-items: center;
}

.page-number { font-weight: bold; }

/* 移动端适配 */
@media (max-width: 768px) {
  .margin-line { left: 20px; }
  .content-area { padding-left: 40px; padding-right: 20px; }
  .page-header, .page-footer { padding-left: 20px; padding-right: 20px; }
  .page-title { font-size: 24px; }
  .entry-excerpt { font-size: 14px; line-height: 1.6; }
  .highlight-box { font-size: 13px; }
  
  /* 移动端介绍卡片调整 */
  .project-intro-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 15px;
  }
  .intro-icon {
    margin-bottom: 10px;
    font-size: 32px;
  }
  .intro-tags {
    justify-content: center;
  }
  .intro-text {
    text-align: left; /* 移动端保持左对齐易读 */
  }
}
</style>