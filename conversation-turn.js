/**
 * 对话轮次 UI：每轮问答独立 DOM，支持追加不覆盖
 */
(function initConversationTurn(global) {
  function getTurnHtml() {
    return `
      <div class="conversation-turn">
        <div class="user-question result-step" data-result-step="question">
          <div class="user-bubble" data-ref="questionText"></div>
          <span class="intent-badge" data-ref="questionIntentBadge" hidden></span>
          <div class="user-actions">
            <button class="user-action-btn" type="button" data-user-action="copy" title="复制">⧉</button>
          </div>
        </div>
        <p class="answer-source result-step" data-result-step="source">
          <span class="step-thinking">
            <span class="thinking-dots"><i></i><i></i><i></i></span>
            <span class="thinking-text" data-ref="sourceThinkingText">正在匹配业务模型与数据集...</span>
          </span>
          <span class="step-content">模型数据来源于：<strong data-ref="sourceDatasetName"></strong><span class="intent-badge" data-ref="intentBadge" hidden></span></span>
        </p>
        <section class="answer-section result-step" data-result-step="model-list">
          <div class="section-head"><span>1、可用模型与数据集</span><span class="section-head-meta">耗时：96ms</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在读取业务模型目录...</span></div>
            <div class="step-content"><div class="metadata-grid" data-ref="modelListContent"></div></div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="dimension-list">
          <div class="section-head"><span>1、可分析维度</span><span class="section-head-meta">耗时：84ms</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在汇总维度字段...</span></div>
            <div class="step-content"><div class="metadata-grid" data-ref="dimensionListContent"></div></div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="metric-list">
          <div class="section-head"><span>1、可用指标与度量</span><span class="section-head-meta">耗时：88ms</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在汇总指标字段...</span></div>
            <div class="step-content"><div class="metadata-grid" data-ref="metricListContent"></div></div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="definition-list">
          <div class="section-head"><span>1、口径与定义</span><span class="section-head-meta">耗时：72ms</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在检索字段定义...</span></div>
            <div class="step-content" data-ref="definitionListContent"></div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="choice">
          <div class="section-head"><span>需要您确认</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在生成可选项...</span></div>
            <div class="step-content">
              <p class="choice-reason" data-ref="choiceReasonText"></p>
              <div class="choice-panel" data-ref="choicePanelContent"></div>
            </div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="guidance">
          <div class="section-head"><span>智能引导</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在整理操作建议...</span></div>
            <div class="step-content"><div class="guidance-panel" data-ref="guidancePanelContent"></div></div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="sql">
          <div class="section-head"><span>1、SQL生成</span><span class="section-head-meta">耗时：31ms</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在进行语义推理并生成 SQL...</span></div>
            <div class="step-content">
              <div class="sql-narrative-label">语义推理过程</div>
              <div class="sql-narrative" data-ref="sqlNarrative"></div>
              <p class="sql-exec-label" data-ref="sqlExecLabel" hidden>将执行的sql 内容如下:</p>
              <div class="sql-panel-head">
                <span class="sql-file-name">query.sql</span>
                <div class="sql-actions">
                  <button class="sql-link sql-edit-btn" type="button" data-ref="sqlEditBtn">修正 SQL</button>
                  <button class="sql-run-btn" type="button" data-ref="sqlRunBtn" hidden>执行 SQL</button>
                  <button class="sql-link sql-add-example-btn" type="button" data-ref="sqlAddExampleBtn">添加到 SQL 示例</button>
                </div>
              </div>
              <div class="sql-code-wrap" data-ref="sqlCodeWrap">
                <pre class="sql-code" data-ref="sqlCodePre"></pre>
                <textarea class="sql-code-editor" data-ref="sqlCodeEditor" spellcheck="false" hidden aria-label="SQL 编辑器"></textarea>
              </div>
              <button class="sql-expand-btn" data-ref="sqlExpandBtn" type="button">展开 ▾</button>
              <p class="sql-edit-status" data-ref="sqlEditStatus"></p>
            </div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="kpi">
          <div class="section-head"><span data-ref="kpiSectionTitle">核心指标</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在汇总核心指标...</span></div>
            <div class="step-content">
              <div data-ref="kpiPanelContent"></div>
              <div class="semantic-block">
                <div class="semantic-block-title">数据解释</div>
                <table class="semantic-table">
                  <thead><tr><th>业务模型</th><th>数据集</th><th>指标（度量）</th><th>维度</th></tr></thead>
                  <tbody data-ref="semanticTableBody"></tbody>
                </table>
                <div class="filter-row">
                  <span>筛选条件：</span>
                  <div class="date-range">
                    <input class="date-input" data-ref="startDate" type="date" />
                    <span>-</span>
                    <input class="date-input" data-ref="endDate" type="date" />
                    <span>📅</span>
                  </div>
                  <button class="requery-btn" data-ref="requeryBtn" type="button" disabled>重新查询</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="compare">
          <div class="section-head"><span>对比分析</span></div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在生成对比结果...</span></div>
            <div class="step-content">
              <div class="data-table-wrap">
                <table class="data-table compare-table">
                  <thead data-ref="compareTableHead"></thead>
                  <tbody data-ref="compareTableBody"></tbody>
                </table>
              </div>
              <div class="semantic-block">
                <div class="semantic-block-title">数据解释</div>
                <table class="semantic-table">
                  <thead><tr><th>业务模型</th><th>数据集</th><th>指标（度量）</th><th>维度</th></tr></thead>
                  <tbody data-ref="semanticTableBody"></tbody>
                </table>
                <div class="filter-row">
                  <span>筛选条件：</span>
                  <div class="date-range">
                    <input class="date-input" data-ref="startDate" type="date" />
                    <span>-</span>
                    <input class="date-input" data-ref="endDate" type="date" />
                    <span>📅</span>
                  </div>
                  <button class="requery-btn" data-ref="requeryBtn" type="button" disabled>重新查询</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="answer-section result-step" data-result-step="data">
          <div class="section-head">
            <span data-ref="dataSectionTitle">数据查询</span>
            <div class="view-toggle" data-ref="viewToggleWrap">
              <button class="view-toggle-btn active" type="button" data-view="chart">图表</button>
              <button class="view-toggle-btn" type="button" data-view="table">表格</button>
            </div>
          </div>
          <div class="section-body">
            <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在查询并生成图表数据...</span></div>
            <div class="step-content">
              <div class="data-panel" data-ref="chartView">
                <div class="chart-toolbar">
                  <div class="chart-toolbar-left">
                    <span class="chart-toolbar-label">图表类型</span>
                    <div class="chart-type-toggle">
                      <button class="chart-type-btn active" type="button" data-chart-type="bar">柱状图</button>
                      <button class="chart-type-btn" type="button" data-chart-type="hbar">条形图</button>
                      <button class="chart-type-btn" type="button" data-chart-type="line">折线图</button>
                      <button class="chart-type-btn" type="button" data-chart-type="pie">饼图</button>
                      <button class="chart-type-btn" type="button" data-chart-type="donut">环形图</button>
                    </div>
                  </div>
                  <button class="save-chart-btn" data-ref="saveChartBtn" type="button" hidden>保存为图表</button>
                </div>
                <p class="chart-save-notice" data-ref="chartSaveNotice" hidden>
                  <span class="chart-save-notice-icon" aria-hidden="true">✓</span>
                  <span data-ref="chartSaveNoticeText"></span>
                </p>
                <div class="chart-canvas-wrap">
                  <svg class="chart-svg" data-ref="chartSvg" viewBox="0 0 900 280" preserveAspectRatio="xMidYMid meet"></svg>
                </div>
                <div class="chart-legend" data-ref="chartLegend"></div>
              </div>
              <div class="data-panel" data-ref="tableView" hidden>
                <div class="data-table-wrap">
                  <table class="data-table">
                    <thead data-ref="dataTableHead"></thead>
                    <tbody data-ref="dataTableBody"></tbody>
                  </table>
                </div>
              </div>
              <div class="semantic-block">
                <div class="semantic-block-title">数据解释</div>
                <table class="semantic-table">
                  <thead><tr><th>业务模型</th><th>数据集</th><th>指标（度量）</th><th>维度</th></tr></thead>
                  <tbody data-ref="semanticTableBody"></tbody>
                </table>
                <div class="filter-row">
                  <span>筛选条件：</span>
                  <div class="date-range">
                    <input class="date-input" data-ref="startDate" type="date" />
                    <span>-</span>
                    <input class="date-input" data-ref="endDate" type="date" />
                    <span>📅</span>
                  </div>
                  <button class="requery-btn" data-ref="requeryBtn" type="button" disabled>重新查询</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="answer-footer result-step" data-result-step="footer">
          <div class="step-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span class="thinking-text">正在整理反馈...</span></div>
          <div class="step-content">
            <div class="feedback-row answer-action-bar" data-ref="feedbackRow">
              <button class="answer-action-btn" type="button" data-answer-action="copy" title="复制" aria-label="复制">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M6.5 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="answer-action-btn feedback-btn" type="button" data-feedback="correct" title="有用" aria-label="有用">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 11v9H4.8A1.8 1.8 0 0 1 3 18.2V12.8A1.8 1.8 0 0 1 4.8 11H7Zm0 0 3.2-6.2A2.2 2.2 0 0 1 12.2 3.5c.9 0 1.6.8 1.5 1.7L13.2 11H19a2 2 0 0 1 2 2.2l-.8 5.2A2.5 2.5 0 0 1 17.7 20H7" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="answer-action-btn feedback-btn" type="button" data-feedback="incorrect" title="没用" aria-label="没用">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 13V4h2.2A1.8 1.8 0 0 1 21 5.8v5.4A1.8 1.8 0 0 1 19.2 13H17Zm0 0-3.2 6.2A2.2 2.2 0 0 1 11.8 20.5c-.9 0-1.6-.8-1.5-1.7L10.8 13H5a2 2 0 0 1-2-2.2l.8-5.2A2.5 2.5 0 0 1 6.3 4H17" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
              </button>
              <span class="feedback-thanks" data-ref="feedbackThanks" hidden>已经收到反馈，感谢您的建议</span>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  let turnIdCounter = 0;

  function collectRefs(turnEl) {
    const refs = { el: turnEl };
    turnEl.querySelectorAll("[data-ref]").forEach((node) => {
      refs[node.dataset.ref] = node;
    });
    refs.chartTypeBtns = turnEl.querySelectorAll(".chart-type-btn");
    refs.viewToggleBtns = turnEl.querySelectorAll(".view-toggle-btn");
    refs.resultSteps = turnEl.querySelectorAll("[data-result-step]");
    return refs;
  }

  function createTurn() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = getTurnHtml().trim();
    const turnEl = wrapper.firstElementChild;
    const turn = {
      id: `turn-${++turnIdCounter}`,
      el: turnEl,
      refs: collectRefs(turnEl),
      analysis: null,
      chartType: "bar",
      queryDataRows: [],
      revealToken: 0,
    };
    turnEl.dataset.turnId = turn.id;
    turn.refs.resultSteps.forEach((step) => step.classList.add("is-pending"));
    return turn;
  }

  function finalizeTurn(turn) {
    if (!turn) return;
    turn.refs.resultSteps.forEach((step) => {
      if (step.classList.contains("is-pending")) return;
      step.classList.remove("is-thinking");
      step.classList.add("is-revealed");
    });
    turn.refs.sqlCodeWrap?.classList.remove("is-typing");
    turn.refs.chartSvg?.classList.remove("chart-enter");
  }

  function resetTurnSteps(turn) {
    turn.refs.resultSteps.forEach((step) => {
      step.classList.remove("is-revealed", "is-thinking");
      if (!step.classList.contains("is-suppressed")) {
        step.classList.add("is-pending");
      }
    });
    turn.refs.chartSvg?.classList.remove("chart-enter");
    turn.refs.sqlCodeWrap?.classList.remove("is-typing", "expanded");
    if (turn.refs.sqlExpandBtn) turn.refs.sqlExpandBtn.textContent = "展开 ▾";
  }

  function suppressStep(turn, stepKey) {
    const step = getStepEl(turn, stepKey);
    if (!step) return;
    step.classList.add("is-suppressed", "is-pending");
    step.classList.remove("is-revealed", "is-thinking");
    step.setAttribute("aria-hidden", "true");
    step.hidden = true;
  }

  function getStepEl(turn, stepKey) {
    return turn.el.querySelector(`[data-result-step="${stepKey}"]`);
  }

  function setStepThinking(turn, stepKey) {
    const step = getStepEl(turn, stepKey);
    if (!step) return;
    step.classList.remove("is-pending", "is-revealed");
    step.classList.add("is-thinking");
    return step;
  }

  function revealStep(turn, stepKey) {
    const step = getStepEl(turn, stepKey);
    if (!step) return;
    step.classList.remove("is-pending", "is-thinking");
    step.classList.add("is-revealed");
    return step;
  }

  function setStepThinkingText(turn, stepKey, text) {
    const step = getStepEl(turn, stepKey);
    const textEl = step?.querySelector(".step-thinking .thinking-text");
    if (textEl) textEl.textContent = text;
  }

  global.ConversationTurn = {
    createTurn,
    finalizeTurn,
    resetTurnSteps,
    collectRefs,
    getStepEl,
    setStepThinking,
    revealStep,
    setStepThinkingText,
    suppressStep,
  };
})(window);
