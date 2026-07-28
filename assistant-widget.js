/**
 * 智能问数助理组件（仅在 index 宿主页挂载）
 * - 默认不显示图标；助理设置中存在「启用」助理后才出现
 * - 业务场景 = 已绑定的业务模型列表（首页直接展示）
 */
(function initAssistantWidget(global) {
  const FAB_POS_KEY = "assistant-fab-pos-v1";
  const THEME_KEY = "assistant-widget-theme-v1";
  const PANEL_DEFAULT_WIDTH = 420;
  const PANEL_MIN_WIDTH = 360;
  const PANEL_MAX_WIDTH_RATIO = 0.72;
  const SCENARIO_ICONS = ["📊", "📋", "🗂️", "⚡", "📦", "🏪", "📈", "🧾", "🏗️", "🔗"];
  const DEFAULT_WELCOME = "智能问数依托 AI 对话能力，用日常说话就能快速获取数据、生成可视化报表，可对接现有系统，轻松帮您高效自助查数分析~";

  let root = null;
  let els = {};
  let chat = null;
  let currentAssistant = null;
  let scenarios = [];
  let getAssistants = () => [];
  let onOpenSettings = null;
  let recommendCursor = 0;
  let panelToastTimer = null;
  let desktopDrawerPinned = false;

  function $(id) {
    return root ? root.querySelector("#" + id) : null;
  }

  function getTemplate() {
    return `
<button class="assistant-fab" id="awFab" type="button" hidden aria-label="打开问数助理">
  <span class="assistant-fab-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H12l-3.8 3.2c-.5.4-1.2.1-1.2-.5V15H7.5A2.5 2.5 0 0 1 5 12.5v-6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M8.5 9h7M8.5 12h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  </span>
  <span id="awFabLabel">问数助理</span>
</button>
<div class="assistant-backdrop" id="awBackdrop"></div>
<aside class="assistant-panel" id="awPanel" aria-label="问数助理">
  <div class="panel-resize-handle" id="awResizeHandle" role="separator" aria-label="拖拽调整面板宽度" tabindex="0"></div>
  <header class="panel-header">
    <button class="panel-icon-btn" id="awDrawerBtn" type="button" aria-label="会话列表" title="历史与收藏">
      <svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
    <h1 class="panel-title" id="awPanelTitle">智能问数助理</h1>
    <div class="panel-header-actions">
      <button class="panel-icon-btn" id="awExpandBtn" type="button" aria-label="放大全屏" title="切换到电脑端布局" aria-pressed="false">
        <svg class="expand-btn-icon-expand" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M21 15v6h-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <svg class="expand-btn-icon-collapse" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 9H3V3M15 9h6V3M9 15H3v6M21 15v6h-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 9l6-6M21 9l-6-6M3 15l6 6M21 15l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="panel-icon-btn" id="awThemeBtn" type="button" aria-label="切换主题" title="切换深蓝主题" aria-pressed="false">
        <svg class="theme-btn-icon-light" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
        <svg class="theme-btn-icon-dark" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <button class="panel-icon-btn" id="awSettingsBtn" type="button" aria-label="助理设置" title="助理设置">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 13.5v-3l1.6-1.2-1.5-2.6-1.9.4a7.2 7.2 0 0 0-1.5-.9l-.4-2H9.3l-.4 2c-.5.2-1 .5-1.5.9l-1.9-.4L4 9.3 5.6 10.5v3L4 14.7l1.5 2.6 1.9-.4c.5.4 1 .7 1.5.9l.4 2h3.4l.4-2c.5-.2 1-.5 1.5-.9l1.9.4 1.5-2.6-1.6-1.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <button class="panel-icon-btn" id="awNewChatBtn" type="button" aria-label="新建对话" title="新建对话">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="panel-icon-btn" id="awCloseBtn" type="button" aria-label="关闭">
        <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
  </header>
  <div class="panel-body">
    <div class="session-drawer" id="awSessionDrawer">
      <div class="session-drawer-overlay" id="awDrawerOverlay"></div>
      <div class="session-drawer-sheet">
        <div class="drawer-head">
          <button class="drawer-new-btn" id="awDrawerNewChatBtn" type="button">+ 新建对话</button>
          <div class="drawer-tabs">
            <button class="drawer-tab active" type="button" data-drawer-tab="history">历史会话</button>
            <button class="drawer-tab" type="button" data-drawer-tab="favorite">收藏会话</button>
          </div>
        </div>
        <div class="drawer-toolbar" id="awHistoryToolbar">
          <button class="drawer-toolbar-btn" id="awBatchToggleBtn" type="button">批量管理</button>
          <button class="drawer-toolbar-btn danger" id="awBatchDeleteBtn" type="button" disabled>删除所选</button>
        </div>
        <div class="drawer-toolbar" id="awFavoriteToolbar" hidden>
          <span style="font-size:12px;color:#98a2b3">支持重命名与取消收藏</span>
        </div>
        <div class="drawer-body">
          <div class="drawer-panel" id="awHistoryPanel" data-drawer-panel="history"><div id="awHistoryList"></div></div>
          <div class="drawer-panel" id="awFavoritePanel" data-drawer-panel="favorite" hidden><div id="awFavoriteList"></div></div>
        </div>
      </div>
    </div>
    <main class="chat-main">
      <div class="chat-scroll" id="awPanelScroll">
        <div class="content-wrap">
          <div class="welcome-wrap" id="awWelcomeView">
            <div class="welcome-hero" aria-hidden="true">
              <span class="welcome-blob welcome-blob-a"></span>
              <span class="welcome-blob welcome-blob-b"></span>
              <span class="welcome-blob welcome-blob-c"></span>
            </div>
            <div class="welcome-brand">
              <div class="welcome-brand-row">
                <div class="robot-icon" aria-hidden="true">
                  <span class="robot-icon-face">🤖</span>
                  <span class="robot-icon-ring"></span>
                </div>
                <h1 class="welcome-brand-name" id="awWelcomeBrandName">智能问数助理</h1>
              </div>
              <p class="welcome-message" id="awWelcomeMessage">智能问数依托 AI 对话能力，用日常说话就能快速获取数据、生成可视化报表，可对接现有系统，轻松帮您高效自助查数分析~</p>
            </div>
            <section class="welcome-scenario-section" aria-label="业务场景">
              <p class="welcome-scenario-section-title"><span class="welcome-section-emoji" aria-hidden="true">✨</span>业务场景</p>
              <div class="welcome-scenario-scroll" id="awWelcomeScenarioScroll">
                <div class="welcome-scenario-row" id="awWelcomeScenarioRow"></div>
              </div>
            </section>
            <section class="welcome-guide-section" aria-label="问询方式">
              <p class="guide-title"><span class="welcome-section-emoji" aria-hidden="true">💡</span>您可以尝试使用下面几种问询方式进行问数：</p>
              <div class="guide-list">
                <div class="guide-item" style="--guide-i:0"><span class="guide-text"><strong>看模型/数据集</strong>：有哪些模型？有哪些数据集？</span></div>
                <div class="guide-item" style="--guide-i:1"><span class="guide-text"><strong>看维度/指标/度量</strong>：有哪些维度？有哪些指标？</span></div>
                <div class="guide-item" style="--guide-i:2"><span class="guide-text"><strong>看数值</strong>：按【维度】统计【指标】，如各部门合同额？</span></div>
                <div class="guide-item" style="--guide-i:3"><span class="guide-text"><strong>看明细</strong>：如列出全部销售明细、合同明细</span></div>
                <div class="guide-item guide-item-full" style="--guide-i:4"><span class="guide-text"><strong>看趋势/排名/占比/对比</strong>：销售趋势、Top10 排名、占比分析、A与B对比</span></div>
              </div>
            </section>
          </div>
          <div class="result-wrap" id="awResultView" hidden>
            <div id="awConversationList"></div>
          </div>
        </div>
      </div>
      <div class="composer-wrap">
        <div class="panel-toast" id="awPanelToast" role="status" aria-live="polite"></div>
        <div class="composer-inner">
          <div class="recommend-strip-wrap" id="awRecommendStripWrap">
            <div class="recommend-strip-bar">
              <div class="recommend-strip" id="awRecommendStrip"></div>
              <button class="recommend-refresh-btn" id="awRecommendRefresh" type="button">换一批 ↻</button>
            </div>
          </div>
          <div class="composer-box">
            <textarea class="composer-input" id="awChatInput" placeholder="可以问我数据相关的问题，我来帮您整理数据" rows="3"></textarea>
            <div class="composer-foot">
              <div class="composer-foot-left">
                <label class="composer-select-wrap" title="切换已绑定的业务模型">
                  <span class="composer-select-label">模型</span>
                  <select class="composer-select" id="awScenarioSelect" aria-label="业务模型"></select>
                </label>
                <label class="composer-select-wrap" title="切换大模型">
                  <span class="composer-select-label">模型</span>
                  <select class="composer-select" id="awModelSelect" aria-label="大模型">
                    <option value="AceGPT">AceGPT</option>
                    <option value="DeepSeek">DeepSeek</option>
                    <option value="gpt-4o">gpt-4o</option>
                  </select>
                </label>
              </div>
              <div class="composer-foot-right">
                <button class="send-btn" id="awSendBtn" type="button" disabled aria-label="发送">
                  <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M4.5 10.2 19.2 4.8c.6-.2 1.2.4 1 1L18.2 18.8c-.1.6-.8.9-1.3.6l-4.6-3-2.8 2.7c-.5.5-1.4.1-1.4-.6v-3.9L4.9 11.5c-.6-.4-.5-1.3.6-1.3Z" fill="currentColor"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <div class="assistant-feedback-root" id="awFeedbackRoot" aria-hidden="true"></div>
</aside>`;
  }

  function cacheEls() {
    els = {
      fab: $("awFab"),
      fabLabel: $("awFabLabel"),
      backdrop: $("awBackdrop"),
      panel: $("awPanel"),
      title: $("awPanelTitle"),
      welcomeBrandName: $("awWelcomeBrandName"),
      welcomeMessage: $("awWelcomeMessage"),
      welcomeView: $("awWelcomeView"),
      resultView: $("awResultView"),
      conversationList: $("awConversationList"),
      panelScroll: $("awPanelScroll"),
      chatInput: $("awChatInput"),
      sendBtn: $("awSendBtn"),
      scenarioSelect: $("awScenarioSelect"),
      modelSelect: $("awModelSelect"),
      recommendStrip: $("awRecommendStrip"),
      recommendRefresh: $("awRecommendRefresh"),
      recommendWrap: $("awRecommendStripWrap"),
      welcomeScenarioRow: $("awWelcomeScenarioRow"),
      welcomeScenarioScroll: $("awWelcomeScenarioScroll"),
      sessionDrawer: $("awSessionDrawer"),
      historyList: $("awHistoryList"),
      favoriteList: $("awFavoriteList"),
      historyPanel: $("awHistoryPanel"),
      favoritePanel: $("awFavoritePanel"),
      historyToolbar: $("awHistoryToolbar"),
      favoriteToolbar: $("awFavoriteToolbar"),
      toast: $("awPanelToast"),
      feedbackRoot: $("awFeedbackRoot"),
    };
  }

  function showToast(message, duration) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(panelToastTimer);
    panelToastTimer = setTimeout(() => {
      els.toast.classList.remove("is-visible");
      panelToastTimer = null;
    }, duration || 2200);
  }

  function pickActiveAssistant(list) {
    const enabled = (list || []).filter((a) => a && a.enabled === "on");
    if (!enabled.length) return null;
    if (currentAssistant) {
      const still = enabled.find((a) => a.id === currentAssistant.id);
      if (still) return still;
    }
    return enabled[0];
  }

  function getBoundModels(asst) {
    const all = global.QueryEngine?.getAllModels?.() || [];
    const ids = (asst?.models || []).length
      ? asst.models
      : (asst?.defaultModel ? [asst.defaultModel] : []);
    return ids.map((id) => all.find((m) => m.id === id)).filter(Boolean);
  }

  function buildRecommendPoolForDataset(ds, model) {
    const pool = [];
    const dims = ds.dimensions || [];
    const metrics = [...(ds.metrics || []), ...(ds.measures || [])];
    if (dims.length) pool.push(`${ds.name}有哪些维度？`);
    if (metrics.length) pool.push(`${ds.name}有哪些指标？`);
    const d0 = dims[0]?.name;
    const m0 = metrics[0]?.name;
    if (d0 && m0) pool.push(`按${d0}统计${m0}`);
    if (m0) pool.push(`${ds.name}的${m0}合计是多少`);
    return pool;
  }

  function buildRecommendPoolForModel(model) {
    const pool = [];
    const datasets = model.datasets || [];
    pool.push(`「${model.name}」有哪些数据集？`);
    pool.push(`${model.name}可以分析什么？`);
    datasets.slice(0, 4).forEach((ds) => {
      pool.push(...buildRecommendPoolForDataset(ds, model).slice(0, 2));
    });
    const keys = [model.name, ...datasets.map((d) => d.name)].filter(Boolean);
    const globalPool = global.QueryEngine?.RECOMMEND_QUESTION_POOL || [];
    globalPool.forEach((q) => {
      if (pool.includes(q)) return;
      if (keys.some((k) => k && q.includes(k))) pool.push(q);
    });
    return [...new Set(pool)].slice(0, 12);
  }

  function buildScenariosFromAssistant(asst) {
    return getBoundModels(asst).map((model, mi) => {
      const datasets = model.datasets || [];
      const dsNames = datasets.map((d) => d.name).filter(Boolean);
      return {
        id: model.id,
        name: model.name,
        description: model.description || (dsNames.length ? `含 ${dsNames.length} 个数据集：${dsNames.slice(0, 3).join("、")}${dsNames.length > 3 ? "…" : ""}` : "暂无数据集"),
        icon: SCENARIO_ICONS[mi % SCENARIO_ICONS.length],
        hotTag: `${datasets.length} 个数据集`,
        modelId: model.id,
        recommendPool: buildRecommendPoolForModel(model),
      };
    });
  }

  function pickDefaultScenarioId(asst, list) {
    const defaultModel = asst?.defaultModel || (asst?.models || [])[0];
    if (defaultModel && list.some((s) => s.id === defaultModel)) return defaultModel;
    return list[0]?.id || "";
  }

  function ensureFabInViewport() {
    const fab = els.fab;
    if (!fab || fab.hidden) return;
    const margin = 8;
    const rect = fab.getBoundingClientRect();
    const w = Math.max(rect.width || 0, 48);
    const h = Math.max(rect.height || 0, 48);
    const maxLeft = Math.max(margin, window.innerWidth - w - margin);
    const maxTop = Math.max(margin, window.innerHeight - h - margin);
    // 未拖拽过：保持 CSS 的 right/bottom
    const hasCustomPos = fab.style.left && fab.style.left !== "auto";
    if (!hasCustomPos) return;
    let left = rect.left;
    let top = rect.top;
    // 宽高曾为 0 时可能被夹到贴边外侧，重新钳制
    left = Math.min(maxLeft, Math.max(margin, left));
    top = Math.min(maxTop, Math.max(margin, top));
    fab.style.left = left + "px";
    fab.style.top = top + "px";
    fab.style.right = "auto";
    fab.style.bottom = "auto";
  }

  function setFabVisible(visible) {
    if (!els.fab) return;
    els.fab.hidden = !visible;
    if (visible) {
      // 下一帧按真实尺寸校正，避免 hidden 时 width=0 导致图标飞出屏幕
      requestAnimationFrame(() => ensureFabInViewport());
    }
  }

  function applyAssistantConfig(asst) {
    currentAssistant = asst;
    if (!asst) {
      scenarios = [];
      setFabVisible(false);
      closePanel();
      return;
    }
    setFabVisible(true);
    if (els.fabLabel) els.fabLabel.textContent = asst.name || "问数助理";
    if (els.title) els.title.textContent = asst.name || "智能问数助理";
    if (els.welcomeBrandName) els.welcomeBrandName.textContent = asst.name || "智能问数助理";
    const welcome = (asst.welcome || "").trim();
    if (els.welcomeMessage) {
      els.welcomeMessage.textContent = welcome || DEFAULT_WELCOME;
    }

    try {
      scenarios = buildScenariosFromAssistant(asst);
      initScenarioSelect();
      const sid = pickDefaultScenarioId(asst, scenarios);
      if (els.scenarioSelect && sid) els.scenarioSelect.value = sid;

      const theme = asst.theme === "deep-blue" ? "deep-blue" : "light";
      setTheme(theme, false);

      if (els.modelSelect) {
        const llm = asst.llm || "AceGPT";
        if ([...els.modelSelect.options].some((o) => o.value === llm)) els.modelSelect.value = llm;
      }

      const allowSwitch = asst.modelSwitch !== "deny";
      if (els.scenarioSelect) els.scenarioSelect.disabled = scenarios.length === 0 || !allowSwitch;
      recommendCursor = 0;
      renderWelcomeScenarios();
      renderRecommendStrip();
      if (asst.refreshRec === "off" && els.recommendRefresh) els.recommendRefresh.hidden = true;
      else if (els.recommendRefresh) els.recommendRefresh.hidden = false;
    } catch (err) {
      console.warn("[AssistantWidget] applyAssistantConfig", err);
    }
  }

  function syncFromStore() {
    if (!els.fab) {
      // init 未完成时忽略，避免抛错中断保存流程
      return;
    }
    const list = typeof getAssistants === "function" ? getAssistants() : [];
    const active = pickActiveAssistant(list);
    applyAssistantConfig(active);
  }

  function setTheme(theme, persist) {
    const deep = theme === "deep-blue";
    els.panel.dataset.theme = deep ? "deep-blue" : "light";
    if (root) root.classList.toggle("is-theme-deep-blue", deep);
    const btn = $("awThemeBtn");
    if (btn) {
      btn.setAttribute("aria-pressed", deep ? "true" : "false");
      btn.title = deep ? "切换浅色主题" : "切换深蓝主题";
    }
    if (persist !== false) {
      try { localStorage.setItem(THEME_KEY, deep ? "deep-blue" : "light"); } catch (e) { /* ignore */ }
    }
    chat?.refreshChartsForTheme?.();
  }

  function toggleTheme() {
    const next = els.panel.dataset.theme === "deep-blue" ? "light" : "deep-blue";
    setTheme(next, true);
    if (currentAssistant) currentAssistant.theme = next;
  }

  function openPanel() {
    if (!currentAssistant) {
      showToast("请先在「助理设置」中配置并启用问数助理");
      return;
    }
    els.panel.classList.add("is-open");
    els.backdrop.classList.add("is-open");
    if (els.panel.classList.contains("is-desktop")) els.backdrop.classList.add("is-desktop-open");
    setFabVisible(false);
  }

  function closePanel() {
    exitDesktopMode();
    els.panel.classList.remove("is-open");
    els.backdrop.classList.remove("is-open", "is-desktop-open");
    if (currentAssistant) setFabVisible(true);
    closeDrawer(true);
    chat?.closeIncorrectFeedbackModal?.();
  }

  function openDrawer() {
    els.sessionDrawer.classList.add("is-open");
    renderSessionLists();
  }
  function closeDrawer(force) {
    if (!force && els.panel.classList.contains("is-desktop") && desktopDrawerPinned) return;
    els.sessionDrawer.classList.remove("is-open");
  }
  function toggleDrawer() {
    if (els.sessionDrawer.classList.contains("is-open")) closeDrawer(true);
    else openDrawer();
  }

  function enterDesktopMode() {
    if (els.panel.classList.contains("is-desktop")) return;
    els.panel.dataset.panelWidthBackup = String(Math.round(els.panel.getBoundingClientRect().width) || PANEL_DEFAULT_WIDTH);
    els.panel.classList.add("is-desktop");
    els.panel.style.width = "";
    els.backdrop.classList.add("is-desktop-open");
    const btn = $("awExpandBtn");
    if (btn) {
      btn.setAttribute("aria-pressed", "true");
      btn.title = "还原为贴边助理";
    }
    desktopDrawerPinned = true;
    openDrawer();
  }

  function exitDesktopMode() {
    if (!els.panel.classList.contains("is-desktop")) return;
    els.panel.classList.remove("is-desktop");
    els.backdrop.classList.remove("is-desktop-open");
    const backup = parseInt(els.panel.dataset.panelWidthBackup, 10);
    applyPanelWidth(Number.isFinite(backup) ? backup : PANEL_DEFAULT_WIDTH, false);
    const btn = $("awExpandBtn");
    if (btn) {
      btn.setAttribute("aria-pressed", "false");
      btn.title = "切换到电脑端布局";
    }
    desktopDrawerPinned = false;
    closeDrawer(true);
  }

  function toggleDesktopMode() {
    if (els.panel.classList.contains("is-desktop")) exitDesktopMode();
    else enterDesktopMode();
  }

  function applyPanelWidth(width, persist) {
    const max = Math.floor(window.innerWidth * PANEL_MAX_WIDTH_RATIO);
    const w = Math.min(max, Math.max(PANEL_MIN_WIDTH, width));
    els.panel.style.width = w + "px";
    return w;
  }

  function updateSendBtn() {
    els.sendBtn.disabled = !(els.chatInput.value || "").trim() || !!chat?.isGenerating?.();
  }

  function showWelcome() {
    els.welcomeView.hidden = false;
    els.resultView.hidden = true;
  }

  function showResult() {
    els.welcomeView.hidden = true;
    els.resultView.hidden = false;
  }

  function currentScenario() {
    const id = els.scenarioSelect?.value || currentAssistant?.scenario || scenarios[0]?.id;
    return scenarios.find((s) => s.id === id) || scenarios[0] || { id: "", name: "", recommendPool: [] };
  }

  function renderWelcomeScenarios() {
    if (!els.welcomeScenarioRow) return;
    if (!scenarios.length) {
      els.welcomeScenarioRow.classList.remove("is-overflow");
      if (els.welcomeScenarioScroll) els.welcomeScenarioScroll.classList.remove("is-overflow");
      els.welcomeScenarioRow.innerHTML = '<div class="model-bind-empty" style="padding:12px;color:#98a2b3;font-size:12px;">暂无业务模型，请先在助理设置中绑定</div>';
      return;
    }
    const activeId = els.scenarioSelect?.value || scenarios[0].id;
    const allowSwitch = currentAssistant?.modelSwitch !== "deny";
    const overflow = scenarios.length > 6;
    els.welcomeScenarioRow.classList.toggle("is-overflow", overflow);
    if (els.welcomeScenarioScroll) els.welcomeScenarioScroll.classList.toggle("is-overflow", overflow);
    els.welcomeScenarioRow.innerHTML = scenarios.map((s, i) => `
      <button type="button" class="scenario-card${s.id === activeId ? " is-active" : ""}" data-scenario="${s.id}" title="${s.name}" style="--card-i:${i}" ${!allowSwitch && s.id !== activeId ? "disabled" : ""}>
        <span class="scenario-card-icon">${s.icon}</span>
        <span class="scenario-card-name">${s.name}</span>
      </button>`).join("");
  }

  function renderRecommendStrip() {
    if (!els.recommendStrip) return;
    const pool = currentScenario().recommendPool || [];
    if (!pool.length) {
      els.recommendStrip.innerHTML = "";
      return;
    }
    const items = [];
    for (let i = 0; i < Math.min(3, pool.length); i += 1) {
      items.push(pool[(recommendCursor + i) % pool.length]);
    }
    els.recommendStrip.innerHTML = items.map((t) =>
      `<button type="button" class="recommend-chip" data-prompt="${t.replace(/"/g, "&quot;")}">${t}</button>`
    ).join("");
  }

  function fillAndSend(text) {
    els.chatInput.value = text;
    updateSendBtn();
    sendMessage();
  }

  function sendMessage() {
    const text = (els.chatInput.value || "").trim();
    if (!text || chat?.isGenerating?.()) return;
    showResult();
    els.chatInput.value = "";
    updateSendBtn();
    chat.appendQuestion(text);
    els.panelScroll.scrollTop = els.panelScroll.scrollHeight;
  }

  function resetChat() {
    chat?.startNewSession?.();
    showWelcome();
    renderSessionLists();
  }

  function renderSessionLists() {
    const sessions = chat?.getSessions?.() || [];
    const currentId = chat?.getCurrentSessionId?.();
    if (els.historyList) {
      els.historyList.innerHTML = sessions.length
        ? sessions.map((s) => `
          <div class="session-item${s.id === currentId ? " active" : ""}" data-session-id="${s.id}">
            <div class="session-item-body">
              <button type="button" class="session-item-title" data-session-action="open" style="border:0;background:transparent;padding:0;text-align:left;cursor:pointer;width:100%;">${s.title || "未命名会话"}</button>
            </div>
          </div>`).join("")
        : `<div class="drawer-empty" style="padding:24px;text-align:center;color:#98a2b3;font-size:12px;">暂无历史会话</div>`;
    }
    if (els.favoriteList) {
      const fav = sessions.filter((s) => s.favorited);
      els.favoriteList.innerHTML = fav.length
        ? fav.map((s) => `
          <div class="session-item${s.id === currentId ? " active" : ""}" data-session-id="${s.id}">
            <div class="session-item-body">
              <button type="button" class="session-item-title" data-session-action="open" style="border:0;background:transparent;padding:0;text-align:left;cursor:pointer;width:100%;">${s.title || "未命名会话"}</button>
            </div>
          </div>`).join("")
        : `<div class="drawer-empty" style="padding:24px;text-align:center;color:#98a2b3;font-size:12px;">暂无收藏会话</div>`;
    }
  }

  function initScenarioSelect() {
    if (!els.scenarioSelect) return;
    if (!scenarios.length) {
      els.scenarioSelect.innerHTML = '<option value="">暂无业务模型</option>';
      return;
    }
    els.scenarioSelect.innerHTML = scenarios.map((s) =>
      `<option value="${s.id}">${s.name}</option>`
    ).join("");
  }

  function initFabDrag() {
    const fab = els.fab;
    if (!fab) return;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    function clamp(left, top) {
      const margin = 8;
      const rect = fab.getBoundingClientRect();
      // hidden 时 getBoundingClientRect 宽高为 0，需用占位尺寸避免夹到屏外
      const w = rect.width > 0 ? rect.width : 120;
      const h = rect.height > 0 ? rect.height : 48;
      return {
        left: Math.min(Math.max(margin, window.innerWidth - w - margin), Math.max(margin, left)),
        top: Math.min(Math.max(margin, window.innerHeight - h - margin), Math.max(margin, top)),
      };
    }
    function apply(left, top, persist) {
      const pos = clamp(left, top);
      fab.style.left = pos.left + "px";
      fab.style.top = pos.top + "px";
      fab.style.right = "auto";
      fab.style.bottom = "auto";
      if (persist) {
        try { localStorage.setItem(FAB_POS_KEY, JSON.stringify(pos)); } catch (e) { /* ignore */ }
      }
    }

    try {
      const saved = JSON.parse(localStorage.getItem(FAB_POS_KEY) || "null");
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) apply(saved.left, saved.top, false);
    } catch (e) { /* ignore */ }

    window.addEventListener("resize", () => {
      if (!fab.hidden) ensureFabInViewport();
    });

    fab.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const rect = fab.getBoundingClientRect();
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      originLeft = rect.left;
      originTop = rect.top;
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      fab.classList.add("is-dragging");
      apply(originLeft + dx, originTop + dy, false);
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      fab.classList.remove("is-dragging");
      try { fab.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (moved) {
        const rect = fab.getBoundingClientRect();
        apply(rect.left, rect.top, true);
      }
    };
    fab.addEventListener("pointerup", end);
    fab.addEventListener("pointercancel", end);
    fab.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopImmediatePropagation();
        moved = false;
        return;
      }
      openPanel();
    });
  }

  function initResize() {
    const handle = $("awResizeHandle");
    if (!handle) return;
    let resizing = false;
    let startX = 0;
    let startW = 0;
    handle.addEventListener("pointerdown", (e) => {
      if (els.panel.classList.contains("is-desktop")) return;
      resizing = true;
      startX = e.clientX;
      startW = els.panel.getBoundingClientRect().width;
      handle.setPointerCapture(e.pointerId);
      els.panel.classList.add("is-resizing");
    });
    handle.addEventListener("pointermove", (e) => {
      if (!resizing) return;
      applyPanelWidth(startW + (startX - e.clientX), false);
    });
    const end = (e) => {
      if (!resizing) return;
      resizing = false;
      els.panel.classList.remove("is-resizing");
      try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    applyPanelWidth(PANEL_DEFAULT_WIDTH, false);
  }

  function bindUi() {
    $("awCloseBtn")?.addEventListener("click", closePanel);
    els.backdrop.addEventListener("click", () => {
      if (els.panel.classList.contains("is-desktop")) return;
      closePanel();
    });
    $("awDrawerBtn")?.addEventListener("click", toggleDrawer);
    $("awDrawerOverlay")?.addEventListener("click", () => closeDrawer(true));
    $("awDrawerNewChatBtn")?.addEventListener("click", () => { resetChat(); closeDrawer(); });
    $("awNewChatBtn")?.addEventListener("click", resetChat);
    $("awExpandBtn")?.addEventListener("click", toggleDesktopMode);
    $("awThemeBtn")?.addEventListener("click", toggleTheme);
    $("awSettingsBtn")?.addEventListener("click", () => {
      if (typeof onOpenSettings === "function") onOpenSettings();
      else showToast("请到系统设置 → 助理设置中配置");
    });
    els.sendBtn.addEventListener("click", sendMessage);
    els.chatInput.addEventListener("input", updateSendBtn);
    els.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    els.scenarioSelect.addEventListener("change", () => {
      renderWelcomeScenarios();
      renderRecommendStrip();
    });
    els.recommendRefresh.addEventListener("click", () => {
      recommendCursor += 3;
      renderRecommendStrip();
    });
    els.recommendStrip.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-prompt]");
      if (btn) fillAndSend(btn.dataset.prompt);
    });
    els.welcomeScenarioRow.addEventListener("click", (e) => {
      const card = e.target.closest("[data-scenario]");
      if (!card) return;
      els.scenarioSelect.value = card.dataset.scenario;
      renderWelcomeScenarios();
      renderRecommendStrip();
    });
    root.querySelectorAll(".drawer-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        root.querySelectorAll(".drawer-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const isHistory = tab.dataset.drawerTab === "history";
        els.historyPanel.hidden = !isHistory;
        els.favoritePanel.hidden = isHistory;
        els.historyToolbar.hidden = !isHistory;
        els.favoriteToolbar.hidden = isHistory;
      });
    });
    els.historyList.addEventListener("click", (e) => {
      const item = e.target.closest("[data-session-id]");
      if (!item) return;
      chat?.loadSession?.(item.dataset.sessionId);
      showResult();
      renderSessionLists();
      closeDrawer();
    });
    els.favoriteList.addEventListener("click", (e) => {
      const item = e.target.closest("[data-session-id]");
      if (!item) return;
      chat?.loadSession?.(item.dataset.sessionId);
      showResult();
      renderSessionLists();
      closeDrawer();
    });
  }

  function initChat() {
    if (typeof global.createChatController !== "function") {
      console.warn("[AssistantWidget] createChatController 不可用");
      return;
    }
    chat = global.createChatController({ storageKey: "assistant-panel-sessions-v1" });
    chat.init({
      hideSqlPresentation: true,
      feedbackModalRoot: els.feedbackRoot,
      conversationListEl: els.conversationList,
      welcomeViewEl: els.welcomeView,
      resultViewEl: els.resultView,
      chatScrollEl: els.panelScroll,
      fillComposerPrompt(text) {
        els.chatInput.value = text;
        updateSendBtn();
      },
      sendMessage,
      insertIntoComposer(text) {
        els.chatInput.value = ((els.chatInput.value || "") + text).trim();
        updateSendBtn();
      },
      getTermDescription(name) {
        const field = global.QueryEngine?.getAllFields?.().find((f) => f.name === name);
        return field?.description || "可用于当前业务模型下的数据分析。";
      },
      onGuidanceAction(action) {
        if (action.type === "prompt" && action.prompt) fillAndSend(action.prompt);
      },
      onSessionsLoaded: renderSessionLists,
      onSessionCreated: renderSessionLists,
      onSessionUpdated: renderSessionLists,
      onSessionActivated() {
        renderSessionLists();
        showWelcome();
      },
      onSessionDeleted: renderSessionLists,
      onSessionRenamed: renderSessionLists,
      onTurnComplete() {
        els.panelScroll.scrollTop = els.panelScroll.scrollHeight;
      },
    });
  }

  function mount() {
    if (root) return;
    root = document.createElement("div");
    root.className = "assistant-widget-root";
    root.id = "assistantWidgetRoot";
    root.innerHTML = getTemplate();
    document.body.appendChild(root);
    cacheEls();
    initScenarioSelect();
    initFabDrag();
    initResize();
    bindUi();
    initChat();
    showWelcome();
    updateSendBtn();
    syncFromStore();
  }

  global.AssistantWidget = {
    init(options) {
      options = options || {};
      getAssistants = options.getAssistants || getAssistants;
      onOpenSettings = options.onOpenSettings || null;
      mount();
      syncFromStore();
      return global.AssistantWidget;
    },
    syncFromStore,
    open: openPanel,
    close: closePanel,
    getActiveAssistant: () => currentAssistant,
  };
})(window);
