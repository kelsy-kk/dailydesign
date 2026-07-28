/**
 * 智能问数 - 多轮对话控制器（追加模式，不覆盖历史回答）
 */
(function initChatController(global) {
  const PRODUCT_TYPES = () => global.QueryEngine.MOCK_ENUMS.products;
  const MONTHS = () => global.QueryEngine.MOCK_ENUMS.months;
  const CHART_COLORS = ["#bae0ff", "#91caff", "#69b1ff", "#4096ff", "#1677d2", "#d6e8ff"];
  const CHART_COLORS_DARK = ["#5b9fd4", "#3d8fd9", "#2b7de0", "#4dabff", "#69b1ff", "#91caff"];

  function isDeepBlueTheme() {
    const openPanel = document.querySelector(".assistant-panel.is-open");
    if (openPanel?.dataset?.theme) return openPanel.dataset.theme === "deep-blue";
    if (document.querySelector(".assistant-widget-root.is-theme-deep-blue")) return true;
    return !!document.querySelector('.assistant-panel[data-theme="deep-blue"]');
  }

  function getChartTheme() {
    if (isDeepBlueTheme()) {
      return {
        bg: "#123258",
        grid: "#2a5280",
        axis: "#8eb0d4",
        label: "#b7d0ea",
        text: "#e0ebf8",
        muted: "#8aa4c0",
        pointFill: "#123258",
        heading: "#e8f1fc",
        colors: CHART_COLORS_DARK,
      };
    }
    return {
      bg: "#ffffff",
      grid: "#e6f0fa",
      axis: "#7a96b5",
      label: "#5b7c99",
      text: "#344054",
      muted: "#667085",
      pointFill: "#f0f7ff",
      heading: "#1f2d3d",
      colors: CHART_COLORS,
    };
  }

  function createChatController(instanceOptions) {
    instanceOptions = instanceOptions || {};
    const STORAGE_KEY = instanceOptions.storageKey || "smart-query-sessions-v1";
    const TITLE_ADJECTIVES = ["智慧", "敏捷", "深度", "精准", "全景", "核心", "多维", "经营", "数据", "业务"];
  const TITLE_NOUNS = ["问数", "探查", "分析", "洞察", "研判", "会话", "查询", "复盘", "专题"];
  const TITLE_TOPICS = ["销售", "合同", "库存", "客户", "指标", "维度", "趋势", "咖啡", "门店"];

  let sessions = [];
  let currentSessionId = null;

  function loadSessionsFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      sessions = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(sessions)) sessions = [];
    } catch {
      sessions = [];
    }
  }

  function persistSessions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  function generateRandomSessionTitle() {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const patterns = [
      () => `${pick(TITLE_ADJECTIVES)}${pick(TITLE_NOUNS)}`,
      () => `${pick(TITLE_TOPICS)}${pick(TITLE_NOUNS)}`,
      () => `${pick(TITLE_ADJECTIVES)}${pick(TITLE_TOPICS)}${pick(TITLE_NOUNS)}`,
      () => `问数${Math.floor(Math.random() * 900) + 100}`,
      () => `${pick(TITLE_TOPICS)}洞察${Math.floor(Math.random() * 90) + 10}`,
    ];
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }

  function ensureUniqueTitle(title) {
    const existing = new Set(sessions.map((s) => s.title));
    if (!existing.has(title)) return title;
    let index = 2;
    while (existing.has(`${title}${index}`)) index += 1;
    return `${title}${index}`;
  }

  function createSession() {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const title = ensureUniqueTitle(generateRandomSessionTitle());
    const session = { id, title, html: "", updatedAt: Date.now() };
    sessions.unshift(session);
    currentSessionId = id;
    persistSessions();
    deps.onSessionCreated?.(session);
    return session;
  }

  function saveCurrentSession() {
    if (!currentSessionId) return;
    const session = sessions.find((s) => s.id === currentSessionId);
    if (!session) return;
    session.html = deps.conversationListEl.innerHTML;
    session.updatedAt = Date.now();
    sessions = [session, ...sessions.filter((s) => s.id !== currentSessionId)];
    persistSessions();
    deps.onSessionUpdated?.(session);
  }

  function rehydrateTurnsFromDom() {
    conversationTurns = [];
    deps.conversationListEl.querySelectorAll(".conversation-turn").forEach((el) => {
      const turn = {
        id: el.dataset.turnId || `turn-${Math.random().toString(36).slice(2, 9)}`,
        el,
        refs: global.ConversationTurn.collectRefs(el),
        analysis: null,
        chartType: "bar",
        queryDataRows: [],
        revealToken: 0,
      };
      el.dataset.turnId = turn.id;
      conversationTurns.push(turn);
    });
    activeTurn = conversationTurns[conversationTurns.length - 1] || null;
  }

  function ensureSession() {
    if (!currentSessionId) createSession();
  }

  let deps = {};
  let conversationTurns = [];
  let activeTurn = null;
  let pendingResolveContext = null;
  let globalRevealToken = 0;
  let isGenerating = false;

  const STEP_THINKING_TEXT = {
    source: { default: "正在匹配业务模型与数据集..." },
    semantic: "正在理解您的问题语义...",
    data: { default: "正在查询并生成结果..." },
    sql: "正在进行语义推理并生成 SQL...",
    "model-list": "正在读取业务模型目录...",
    "dimension-list": "正在汇总维度字段...",
    "metric-list": "正在汇总指标与度量...",
    "definition-list": "正在检索字段定义...",
    choice: "正在生成可选项...",
    guidance: "正在整理操作建议...",
    kpi: "正在汇总核心指标...",
    compare: "正在生成对比结果...",
    footer: "正在整理反馈...",
  };

  function isHideSqlPresentation() {
    return Boolean(deps.hideSqlPresentation);
  }

  function getPresentationPipeline(pipeline) {
    if (!isHideSqlPresentation()) return pipeline;
    return pipeline.filter((step) => step !== "sql");
  }

  function suppressSqlPresentation(turn) {
    if (!isHideSqlPresentation()) return;
    global.ConversationTurn.suppressStep(turn, "sql");
  }

  function sleep(ms, shouldContinue) {
    if (!shouldContinue) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (!shouldContinue()) {
          resolve(false);
          return;
        }
        if (Date.now() - start >= ms) {
          resolve(true);
          return;
        }
        window.setTimeout(tick, 40);
      };
      tick();
    });
  }

  function setGeneratingState(generating) {
    isGenerating = generating;
    deps.onGenerationStateChange?.(generating);
  }

  function stopGeneration() {
    if (!isGenerating || !activeTurn) return;
    activeTurn.revealToken += 1;
    setGeneratingState(false);
  }

  function markTurnStopped(turn) {
    if (!turn || turn.el.querySelector(".generation-stopped-tip")) return;
    turn.refs.resultSteps.forEach((step) => {
      if (step.classList.contains("is-thinking")) {
        step.classList.remove("is-thinking", "is-revealed");
        step.classList.add("is-pending");
      }
    });
    turn.el.classList.add("is-generation-stopped");
    const tip = document.createElement("p");
    tip.className = "generation-stopped-tip";
    tip.textContent = "已完成答案生成";
    turn.el.appendChild(tip);
  }

  function r(turn) {
    return turn.refs;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("zh-CN");
  }

  function hashSeed(text) {
    let hash = 0;
    for (let i = 0; i < String(text).length; i += 1) {
      hash = (hash << 5) - hash + String(text).charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 1;
  }

  function createSeededRandom(seed) {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return () => {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  function generateQueryData(seedText, options = {}) {
    const random = createSeededRandom(hashSeed(seedText + (options.stable ? "" : Date.now())));
    const rows = [];
    MONTHS().forEach((month) => {
      PRODUCT_TYPES().forEach((productType) => {
        rows.push({
          month,
          productType,
          salesVolume: Math.floor(random() * 7200) + 800,
          region: ["华北", "华东", "华南", "西南"][Math.floor(random() * 4)],
          orderAmount: Math.floor(random() * 180000) + 20000,
        });
      });
    });
    if (options.rank) {
      rows.sort((a, b) => b.salesVolume - a.salesVolume);
      return rows.slice(0, options.limit || 10);
    }
    return rows;
  }

  function getStepThinkingText(stepKey) {
    const config = STEP_THINKING_TEXT[stepKey];
    if (!config) return "正在处理...";
    if (typeof config === "string") return config;
    return config.default || "正在处理...";
  }

  function scrollToStep(step) {
    if (!step) return;
    requestAnimationFrame(() => {
      step.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function renderFieldDataTypeBadge(field) {
    const dataType = global.QueryEngine.resolveFieldDataType(field);
    const iconText = global.QueryEngine.getFieldTypeIcon(dataType);
    const title = dataType === "string" ? "字符串" : dataType === "number" ? "数值型" : "日期";
    return `<span class="field-data-type field-data-type-${dataType}" title="${title}">${iconText}</span>`;
  }

  function renderModelList(turn, analysis) {
    const models = analysis?.models || global.QueryEngine.getAllModels?.() || [global.QueryEngine.BUSINESS_MODEL];
    r(turn).modelListContent.innerHTML = models.map((model) => {
      const joinFieldCount = model.datasets.reduce((sum, ds) => {
        const joinDims = ds.dimensions.filter((d) => d.isJoinKey || d.joins?.length);
        return sum + joinDims.length;
      }, 0);
      const relationsHtml = (model.relations || []).length
        ? `<div class="metadata-relations">
            <span class="metadata-relations-title">关联关系（${model.relations.length}）</span>
            <ul class="metadata-relations-list">
              ${model.relations.slice(0, 5).map((rel) => `
                <li>${rel.from.datasetName}.${rel.from.field} ↔ ${rel.to.datasetName}.${rel.to.field}</li>
              `).join("")}
              ${model.relations.length > 5 ? `<li>…共 ${model.relations.length} 条</li>` : ""}
            </ul>
          </div>`
        : "";
      return `
        <article class="metadata-card metadata-card-model">
          <h3 class="metadata-card-title">${model.name}</h3>
          <p class="metadata-card-desc">${model.description}</p>
          ${joinFieldCount ? `<p class="metadata-card-desc metadata-card-join-tip">含 ${joinFieldCount} 个可关联查询字段，支持跨数据集联合分析。</p>` : ""}
          ${relationsHtml}
        </article>
        ${model.datasets.map((ds) => {
          const joinDims = ds.dimensions.filter((d) => d.isJoinKey || d.joins?.length);
          return `
            <article class="metadata-card">
              <h3 class="metadata-card-title">${ds.name}</h3>
              <p class="metadata-card-desc">${ds.description}</p>
              <div class="metadata-card-meta metadata-card-meta-tags">
                <span class="metadata-tag dim">${ds.dimensions.length} 个维度</span>
                <span class="metadata-tag measure">${ds.measures.length} 个度量</span>
                <span class="metadata-tag metric">${ds.metrics.length} 个指标</span>
                ${joinDims.length ? `<span class="metadata-tag join">${joinDims.length} 个关联字段</span>` : ""}
              </div>
              ${joinDims.length ? `<p class="metadata-card-join-fields">关联键：${joinDims.map((d) => d.name).join("、")}</p>` : ""}
            </article>
          `;
        }).join("")}
      `;
    }).join("");
  }

  function renderDimensionList(turn) {
    const fields = global.QueryEngine.getAllFields(["dim"]);
    r(turn).dimensionListContent.innerHTML = fields.length
      ? fields.map((field) => `
          <article class="metadata-card">
            <h3 class="metadata-card-title">${field.name}</h3>
            <p class="metadata-card-desc">${field.description || deps.getTermDescription(field.name)}</p>
            <div class="metadata-card-meta">
              ${renderFieldDataTypeBadge(field)}
              <span class="metadata-card-desc">所属：${field.model} / ${field.dataset}</span>
              ${field.joinHint ? `<span class="metadata-card-desc metadata-card-join-hint" title="${field.joinHint}">关联：${field.joinHint}</span>` : ""}
              <button class="metadata-insert-btn" type="button" data-insert-label="${field.name}">插入到输入框</button>
              <span class="metadata-tag ${field.tag}">${field.tagText}</span>
              ${field.isJoinKey ? '<span class="metadata-tag join">关联</span>' : ""}
            </div>
          </article>
        `).join("")
      : `<p class="metadata-empty">当前模型下暂无可分析维度。</p>`;
  }

  function renderMetricList(turn, intent) {
    const types = intent === "metadata_measure" ? ["measure"] : ["measure", "metric"];
    const fields = global.QueryEngine.getAllFields(types);
    r(turn).metricListContent.innerHTML = fields.length
      ? fields.map((field) => `
          <article class="metadata-card">
            <h3 class="metadata-card-title">${field.name}</h3>
            <p class="metadata-card-desc">${field.description || deps.getTermDescription(field.name)}</p>
            <div class="metadata-card-meta">
              ${renderFieldDataTypeBadge(field)}
              <span class="metadata-card-desc">所属：${field.model} / ${field.dataset}</span>
              ${field.joinHint ? `<span class="metadata-card-desc metadata-card-join-hint" title="${field.joinHint}">关联：${field.joinHint}</span>` : ""}
              <button class="metadata-insert-btn" type="button" data-insert-label="${field.name}">插入到输入框</button>
              <span class="metadata-tag ${field.tag}">${field.tagText}</span>
              ${field.isJoinKey ? '<span class="metadata-tag join">关联</span>' : ""}
            </div>
          </article>
        `).join("")
      : `<p class="metadata-empty">当前模型下暂无指标或度量。</p>`;
  }

  function renderDefinitionList(turn, definitions) {
    r(turn).definitionListContent.innerHTML = definitions.map((field) => `
      <div class="definition-item">
        <div class="metadata-card-meta" style="margin-top:0;margin-bottom:6px;">
          ${renderFieldDataTypeBadge(field)}
          <strong>${field.name}</strong>
          <span class="metadata-card-desc">${field.model} / ${field.dataset}</span>
          <span class="metadata-tag ${field.tag}">${field.tagText}</span>
        </div>
        <p class="metadata-card-desc">${field.description || deps.getTermDescription(field.name)}</p>
      </div>
    `).join("");
  }

  function renderGuidancePanel(turn, guidance) {
    if (!guidance) return;
    r(turn).guidancePanelContent.innerHTML = `
      <h3 class="guidance-title">${guidance.title}</h3>
      <p class="guidance-message">${guidance.message}</p>
      <div class="guidance-actions">
        ${(guidance.actions || []).map((action, index) => `
          <button class="guidance-action-btn" type="button" data-guidance-index="${index}">${action.label}</button>
        `).join("")}
      </div>
    `;
  }

  function renderChoicePanel(turn, analysis) {
    r(turn).choiceReasonText.textContent = analysis.reason || "请选择一个选项以继续：";
    r(turn).choicePanelContent.innerHTML = (analysis.choices || []).map((choice, index) => `
      <button class="choice-card" type="button" data-choice-index="${index}">
        <p class="choice-card-title">${choice.label}</p>
        <p class="choice-card-desc">${choice.description || ""}</p>
      </button>
    `).join("");
  }

  function renderKpiPanel(turn, kpiData, schema) {
    const displayValue = kpiData.unit === "%" ? kpiData.value : formatNumber(kpiData.value);
    r(turn).kpiPanelContent.innerHTML = `
      <div class="kpi-panel">
        <div>
          <div class="kpi-value">${displayValue}</div>
          <div class="kpi-label">${kpiData.label}</div>
          <div class="kpi-meta">数据来源：${schema?.dataset || ""}</div>
        </div>
      </div>
    `;
  }

  function renderCompareTable(turn, compareData) {
    const metric = compareData.metric;
    r(turn).compareTableHead.innerHTML = `<tr><th>对比项</th><th>${metric}</th></tr>`;
    r(turn).compareTableBody.innerHTML = compareData.rows.map((row) => `
      <tr>
        <td class="compare-highlight">${row["对比项"]}</td>
        <td class="num">${formatNumber(row[metric])}</td>
      </tr>
    `).join("");
  }

  function renderSemanticTable(turn, rows) {
    const html = rows.map((row) => `
      <tr>
        <td>${row.model}</td>
        <td>${row.dataset}</td>
        <td>${row.metric}</td>
        <td>${row.dimension}</td>
      </tr>
    `).join("");
    turn.el.querySelectorAll("[data-ref=\"semanticTableBody\"]").forEach((el) => {
      el.innerHTML = html;
    });
  }

  function updateSourcePresentation(turn, analysis) {
    const refs = r(turn);
    const intent = analysis.intent;
    const labels = global.QueryEngine.INTENT_LABELS;
    const isMetadata = intent.startsWith("metadata_");
    refs.sourceThinkingText.textContent = isMetadata ? "正在读取业务模型元数据..." : "正在匹配业务模型与数据集...";
    refs.sourceDatasetName.textContent = isMetadata
      ? global.QueryEngine.BUSINESS_MODEL.name
      : (analysis.schema?.dataset || analysis.dataset?.name || global.QueryEngine.BUSINESS_MODEL.name);
    refs.intentBadge.hidden = false;
    refs.intentBadge.textContent = analysis.intentLabel || labels[intent] || "智能问数";
    refs.questionIntentBadge.hidden = false;
    refs.questionIntentBadge.textContent = analysis.intentLabel || labels[intent] || "智能问数";
    if (analysis.intentLabel === "SQL 修正执行") {
      refs.sourceThinkingText.textContent = "正在按修正后的 SQL 重新匹配数据集...";
    }
  }

  function configureDataViewForIntent(turn, analysis) {
    const refs = r(turn);
    const intent = analysis.intent;
    const isDetail = intent === "analytical_detail";
    const isRatio = intent === "analytical_ratio";
    const hideChart = isDetail || isRatio;
    refs.viewToggleWrap.hidden = hideChart;
    refs.chartView.hidden = hideChart;
    refs.tableView.hidden = !hideChart;
    refs.viewToggleBtns.forEach((btn) => {
      btn.classList.toggle("active", hideChart ? btn.dataset.view === "table" : btn.dataset.view === "chart");
    });
    refs.dataSectionTitle.textContent = isDetail ? "明细数据" : isRatio ? "占比分析" : "数据查询";
    if (refs.saveChartBtn) refs.saveChartBtn.hidden = true; // 暂时隐藏「保存为图表」
    if (hideChart && refs.chartSaveNotice) refs.chartSaveNotice.hidden = true;
  }

  function renderDataTableFromSchema(turn, rows, schema) {
    r(turn).dataTableHead.innerHTML = `<tr>${schema.columns.map((col) => `<th>${col.label}</th>`).join("")}</tr>`;
    r(turn).dataTableBody.innerHTML = rows.map((row) => `
      <tr>
        ${schema.columns.map((col) => {
          const value = row[col.label] ?? row[col.key] ?? "—";
          const isNum = col.numeric && typeof value === "number";
          return `<td${isNum ? ' class="num"' : ""}>${isNum ? formatNumber(value) : value}</td>`;
        }).join("")}
      </tr>
    `).join("");
  }

  function renderChartLegend(turn) {
    const colors = getChartTheme().colors;
    r(turn).chartLegend.innerHTML = PRODUCT_TYPES().map((name, index) => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${colors[index % colors.length]}"></span>
        <span>${name}</span>
      </span>
    `).join("");
  }

  function getSeriesData(rows) {
    const colors = getChartTheme().colors;
    return PRODUCT_TYPES().map((productType, index) => ({
      name: productType,
      color: colors[index % colors.length],
      values: MONTHS().map((month) => {
        const hit = rows.find((row) => row.month === month && row.productType === productType);
        return hit ? hit.salesVolume : 0;
      }),
    }));
  }

  function renderBarChart(turn, rows) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 42, left: 56 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const series = getSeriesData(rows);
    const maxValue = Math.max(...rows.map((row) => row.salesVolume), 1);
    const groupWidth = chartWidth / MONTHS().length;
    const barGap = 6;
    const barWidth = (groupWidth - barGap * (PRODUCT_TYPES().length + 1)) / PRODUCT_TYPES().length;
    const yTicks = 5;
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    for (let tick = 0; tick <= yTicks; tick += 1) {
      const value = (maxValue / yTicks) * tick;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${theme.grid}"></line>`;
      svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="${theme.axis}" font-size="11">${Math.round(value)}</text>`;
    }
    MONTHS().forEach((month, monthIndex) => {
      const groupX = padding.left + monthIndex * groupWidth;
      svg += `<text x="${groupX + groupWidth / 2}" y="${height - 14}" text-anchor="middle" fill="${theme.label}" font-size="11">${month}</text>`;
      series.forEach((item, seriesIndex) => {
        const value = item.values[monthIndex];
        const barHeight = (value / maxValue) * chartHeight;
        const x = groupX + barGap + seriesIndex * (barWidth + barGap);
        const y = padding.top + chartHeight - barHeight;
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2" fill="${item.color}" opacity="0.88" data-bar="true" style="animation-delay:${(monthIndex * series.length + seriesIndex) * 28}ms"><title>${month} ${item.name}: ${formatNumber(value)}</title></rect>`;
      });
    });
    svgEl.innerHTML = svg;
  }

  function renderLineChart(turn, rows) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 42, left: 56 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const series = getSeriesData(rows);
    const maxValue = Math.max(...rows.map((row) => row.salesVolume), 1);
    const yTicks = 5;
    const stepX = MONTHS().length > 1 ? chartWidth / (MONTHS().length - 1) : chartWidth;
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    for (let tick = 0; tick <= yTicks; tick += 1) {
      const value = (maxValue / yTicks) * tick;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${theme.grid}"></line>`;
      svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="${theme.axis}" font-size="11">${Math.round(value)}</text>`;
    }
    MONTHS().forEach((month, index) => {
      const x = padding.left + index * stepX;
      svg += `<text x="${x}" y="${height - 14}" text-anchor="middle" fill="${theme.label}" font-size="11">${month}</text>`;
    });
    series.forEach((item, seriesIndex) => {
      const points = item.values.map((value, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        return { x, y, value };
      });
      const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
      svg += `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" data-line="true" style="animation-delay:${seriesIndex * 120}ms"></path>`;
      points.forEach((point, index) => {
        svg += `<circle cx="${point.x}" cy="${point.y}" r="4" fill="${theme.pointFill}" stroke="${item.color}" stroke-width="2" data-point="true" style="animation-delay:${seriesIndex * 120 + index * 40 + 400}ms"><title>${MONTHS()[index]} ${item.name}: ${formatNumber(point.value)}</title></circle>`;
      });
    });
    svgEl.innerHTML = svg;
  }

  function getSimpleChartSlices(rows, schema) {
    const colors = getChartTheme().colors;
    const labelKey = schema.columns[0].label;
    const valueKey = schema.columns.find((c) => c.numeric)?.label || schema.columns[1]?.label;
    return rows.map((row, index) => ({
      label: String(row[labelKey] ?? "—"),
      value: Number(row[valueKey] ?? 0),
      color: colors[index % colors.length],
    }));
  }

  function getMultiSeriesPieSlices(rows) {
    return getSeriesData(rows).map((item) => ({
      label: item.name,
      value: item.values.reduce((sum, v) => sum + v, 0),
      color: item.color,
    }));
  }

  function renderSlicesLegend(turn, slices) {
    r(turn).chartLegend.innerHTML = slices.map((slice) => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${slice.color}"></span>
        <span>${slice.label}</span>
      </span>
    `).join("");
  }

  function renderSimpleBarChart(turn, rows, schema) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 42, left: 72 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const labelKey = schema.columns[0].label;
    const valueKey = schema.columns.find((c) => c.numeric)?.label || schema.columns[1].label;
    const values = rows.map((row) => Number(row[valueKey] ?? 0));
    const maxValue = Math.max(...values, 1);
    const barGap = 12;
    const barWidth = Math.max(24, (chartWidth - barGap * (rows.length + 1)) / rows.length);
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    rows.forEach((row, index) => {
      const label = row[labelKey];
      const value = Number(row[valueKey] ?? 0);
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding.left + barGap + index * (barWidth + barGap);
      const y = padding.top + chartHeight - barHeight;
      svg += `<text x="${x + barWidth / 2}" y="${height - 14}" text-anchor="middle" fill="${theme.label}" font-size="11">${label}</text>`;
      const barColor = theme.colors[index % theme.colors.length];
      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="2" fill="${barColor}" opacity="0.92" data-bar="true"><title>${label}: ${formatNumber(value)}</title></rect>`;
    });
    svgEl.innerHTML = svg;
    renderSlicesLegend(turn, getSimpleChartSlices(rows, schema));
  }

  function renderSimpleLineChart(turn, rows, schema) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 20, right: 20, bottom: 42, left: 56 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const labelKey = schema.columns[0].label;
    const valueKey = schema.columns.find((c) => c.numeric)?.label || schema.columns[1].label;
    const points = rows.map((row) => Number(row[valueKey] ?? 0));
    const maxValue = Math.max(...points, 1);
    const stepX = rows.length > 1 ? chartWidth / (rows.length - 1) : chartWidth;
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    rows.forEach((row, index) => {
      const x = padding.left + index * stepX;
      svg += `<text x="${x}" y="${height - 14}" text-anchor="middle" fill="${theme.label}" font-size="11">${row[labelKey]}</text>`;
    });
    const coords = points.map((value, index) => {
      const x = padding.left + index * stepX;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
      return { x, y, value, label: rows[index][labelKey] };
    });
    const path = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    svg += `<path d="${path}" fill="none" stroke="${theme.colors[0]}" stroke-width="2.5" stroke-linecap="round"></path>`;
    coords.forEach((p) => {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${theme.bg}" stroke="${theme.colors[0]}" stroke-width="2"><title>${p.label}: ${formatNumber(p.value)}</title></circle>`;
    });
    svgEl.innerHTML = svg;
    renderSlicesLegend(turn, getSimpleChartSlices(rows, schema));
  }

  function renderHBarChart(turn, rows, schema) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 16, right: 24, bottom: 16, left: 120 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const labelKey = schema.columns[0].label;
    const valueKey = schema.columns.find((c) => c.numeric)?.label || schema.columns[1].label;
    const maxValue = Math.max(...rows.map((row) => Number(row[valueKey] ?? 0)), 1);
    const barGap = 8;
    const barHeight = Math.max(14, (chartHeight - barGap * (rows.length + 1)) / rows.length);
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    rows.forEach((row, index) => {
      const label = String(row[labelKey] ?? "—");
      const value = Number(row[valueKey] ?? 0);
      const barLen = (value / maxValue) * chartWidth;
      const y = padding.top + barGap + index * (barHeight + barGap);
      const color = theme.colors[index % theme.colors.length];
      svg += `<text x="${padding.left - 8}" y="${y + barHeight / 2 + 4}" text-anchor="end" fill="${theme.label}" font-size="11">${label.length > 10 ? `${label.slice(0, 9)}…` : label}</text>`;
      svg += `<rect x="${padding.left}" y="${y}" width="${barLen}" height="${barHeight}" rx="2" fill="${color}" opacity="0.92" data-bar="true"><title>${label}: ${formatNumber(value)}</title></rect>`;
      svg += `<text x="${padding.left + barLen + 6}" y="${y + barHeight / 2 + 4}" fill="${theme.text}" font-size="11">${formatNumber(value)}</text>`;
    });
    svgEl.innerHTML = svg;
    renderSlicesLegend(turn, getSimpleChartSlices(rows, schema));
  }

  function renderMultiSeriesHBarChart(turn, rows) {
    const theme = getChartTheme();
    const slices = getMultiSeriesPieSlices(rows);
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const padding = { top: 16, right: 24, bottom: 16, left: 100 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...slices.map((s) => s.value), 1);
    const barGap = 10;
    const barHeight = Math.max(16, (chartHeight - barGap * (slices.length + 1)) / slices.length);
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    slices.forEach((slice, index) => {
      const barLen = (slice.value / maxValue) * chartWidth;
      const y = padding.top + barGap + index * (barHeight + barGap);
      svg += `<text x="${padding.left - 8}" y="${y + barHeight / 2 + 4}" text-anchor="end" fill="${theme.label}" font-size="11">${slice.label}</text>`;
      svg += `<rect x="${padding.left}" y="${y}" width="${barLen}" height="${barHeight}" rx="2" fill="${slice.color}" opacity="0.92"><title>${slice.label}: ${formatNumber(slice.value)}</title></rect>`;
    });
    svgEl.innerHTML = svg;
    renderSlicesLegend(turn, slices);
  }

  function escapeSvgText(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncateChartLabel(label, maxLen) {
    const s = String(label ?? "—");
    return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
  }

  function pieLabelAnchor(midAngle) {
    const c = Math.cos(midAngle);
    if (c > 0.2) return "start";
    if (c < -0.2) return "end";
    return "middle";
  }

  /** 标签固定在饼图外侧，引导线连接扇区 */
  function buildPieSliceLabelSvg(slice, midAngle, pctText, cx, cy, outerR) {
    const theme = getChartTheme();
    const elbowR = outerR + 10;
    const labelR = outerR + 36;
    const cos = Math.cos(midAngle);
    const sin = Math.sin(midAngle);
    const edgeX = cx + (outerR + 2) * cos;
    const edgeY = cy + (outerR + 2) * sin;
    const elbowX = cx + elbowR * cos;
    const elbowY = cy + elbowR * sin;
    const lx = cx + labelR * cos;
    const ly = cy + labelR * sin;
    const anchor = pieLabelAnchor(midAngle);
    const name = escapeSvgText(truncateChartLabel(slice.label, 12));
    const pct = escapeSvgText(pctText);
    let labelSvg = `<polyline points="${edgeX},${edgeY} ${elbowX},${elbowY} ${lx},${ly}" fill="none" stroke="${theme.muted}" stroke-width="1"></polyline>`;
    labelSvg += `<text data-pie-label="true" x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" fill="${theme.text}" font-size="11" font-weight="500">`;
    labelSvg += `<tspan x="${lx}" dy="-0.35em">${name}</tspan>`;
    labelSvg += `<tspan x="${lx}" dy="1.25em" font-size="10" font-weight="600" fill="${theme.muted}">${pct}</tspan>`;
    labelSvg += "</text>";
    return labelSvg;
  }

  function renderPieOrDonutChart(turn, slices, chartType) {
    const theme = getChartTheme();
    const svgEl = r(turn).chartSvg;
    const width = 900;
    const height = 280;
    const cx = width / 2;
    const cy = height / 2 - 8;
    const outerR = Math.min(width, height) * 0.26;
    const innerR = chartType === "donut" ? outerR * 0.55 : 0;
    const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
    let svg = `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.bg}"></rect>`;
    let startAngle = -Math.PI / 2;
    const labelParts = [];
    slices.forEach((slice) => {
      const angle = (slice.value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      let path;
      if (innerR > 0) {
        const ix1 = cx + innerR * Math.cos(endAngle);
        const iy1 = cy + innerR * Math.sin(endAngle);
        const ix2 = cx + innerR * Math.cos(startAngle);
        const iy2 = cy + innerR * Math.sin(startAngle);
        path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
      } else {
        path = `M ${cx} ${cy} L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      const pct = ((slice.value / total) * 100).toFixed(1);
      const pctText = `${pct}%`;
      svg += `<path d="${path}" fill="${slice.color}" opacity="0.9" data-bar="true"><title>${escapeSvgText(slice.label)}: ${formatNumber(slice.value)} (${pctText})</title></path>`;
      if (angle > 0.02) {
        labelParts.push(buildPieSliceLabelSvg(slice, midAngle, pctText, cx, cy, outerR));
      }
      startAngle = endAngle;
    });
    if (chartType === "donut") {
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="${theme.heading}" font-size="13" font-weight="600">合计</text>`;
      svg += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="${theme.muted}" font-size="11">${formatNumber(total)}</text>`;
    }
    svg += labelParts.join("");
    svgEl.innerHTML = svg;
    renderSlicesLegend(turn, slices);
  }

  function syncChartTypeButtons(turn, chartType) {
    r(turn).chartTypeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.chartType === chartType);
    });
  }

  function renderChart(turn, rows, chartType, schema, animate = false) {
    const safeType = ["bar", "hbar", "line", "pie", "donut"].includes(chartType) ? chartType : "bar";
    turn.chartType = safeType;
    if (schema) schema.chartType = safeType;
    syncChartTypeButtons(turn, safeType);
    r(turn).chartSvg.classList.remove("chart-enter");

    const isSimple = schema?.chartMode === "simple";

    if (isSimple) {
      if (safeType === "hbar") renderHBarChart(turn, rows, schema);
      else if (safeType === "pie" || safeType === "donut") renderPieOrDonutChart(turn, getSimpleChartSlices(rows, schema), safeType);
      else if (safeType === "line") renderSimpleLineChart(turn, rows, schema);
      else renderSimpleBarChart(turn, rows, schema);
    } else if (safeType === "line") {
      renderLineChart(turn, rows);
      renderChartLegend(turn);
    } else if (safeType === "pie" || safeType === "donut") {
      renderPieOrDonutChart(turn, getMultiSeriesPieSlices(rows), safeType);
    } else if (safeType === "hbar") {
      renderMultiSeriesHBarChart(turn, rows);
    } else {
      renderBarChart(turn, rows);
      renderChartLegend(turn);
    }

    if (animate) {
      requestAnimationFrame(() => {
        r(turn).chartSvg.classList.add("chart-enter");
        window.setTimeout(() => r(turn).chartSvg.classList.remove("chart-enter"), 1400);
      });
    }
  }

  function resolveChartType(analysis) {
    const { schema, intent, question, dataset } = analysis;
    if (schema?.chartType) return schema.chartType;
    if (global.QueryEngine.inferChartType) {
      return global.QueryEngine.inferChartType(intent, question, schema, dataset);
    }
    return intent === "analytical_trend" ? "line" : "bar";
  }

  function refreshChartsForTheme() {
    conversationTurns.forEach((turn) => {
      if (turn?.analysis) refreshQueryResult(turn, false);
    });
  }

  function refreshQueryResult(turn, animateChart = false) {
    const analysis = turn.analysis;
    if (!analysis?.schema || !analysis?.mockData) return;
    const { schema, mockData, intent } = analysis;
    if (mockData.type === "kpi") {
      renderKpiPanel(turn, mockData, schema);
      return;
    }
    if (mockData.type === "compare") {
      renderCompareTable(turn, mockData);
      return;
    }
    turn.queryDataRows = mockData.tableRows || mockData.rows || [];
    renderDataTableFromSchema(turn, turn.queryDataRows, schema);
    const chartType = resolveChartType(analysis);
    schema.chartType = chartType;
    turn.chartType = chartType;

    if (schema.chartMode === "simple") {
      renderChart(turn, turn.queryDataRows, chartType, schema, animateChart);
    } else if (schema.chartMode === "line" || schema.chartMode === "multi-series") {
      const chartRows = mockData.chartRows || generateQueryData(analysis.question, { stable: true });
      renderChart(turn, chartRows, chartType, schema, animateChart);
    }
  }

  function updateRequeryState(turn) {
    turn.el.querySelectorAll(".semantic-block").forEach((block) => {
      const startDate = block.querySelector("[data-ref=\"startDate\"]");
      const endDate = block.querySelector("[data-ref=\"endDate\"]");
      const requeryBtn = block.querySelector("[data-ref=\"requeryBtn\"]");
      if (!requeryBtn) return;
      requeryBtn.disabled = !(startDate?.value && endDate?.value);
    });
  }

  function escapeHtmlText(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureSqlNarrative(analysis) {
    if (!analysis) return null;
    if (analysis.sqlNarrative?.html) return analysis.sqlNarrative;
    if (!analysis.schema || !analysis.dataset || !global.QueryEngine.buildSqlNarrative) return analysis.sqlNarrative || null;
    analysis.sqlNarrative = global.QueryEngine.buildSqlNarrative(
      analysis.question,
      analysis.schema,
      analysis.intent,
      analysis.dataset,
    );
    return analysis.sqlNarrative;
  }

  function renderSqlSection(turn, analysis) {
    const refs = r(turn);
    const narrative = ensureSqlNarrative(analysis);
    if (refs.sqlNarrative) {
      if (narrative?.html) {
        refs.sqlNarrative.innerHTML = narrative.html;
      } else if (narrative?.paragraphs?.length) {
        refs.sqlNarrative.innerHTML = narrative.paragraphs
          .map((p) => `<p>${escapeHtmlText(p)}</p>`)
          .join("");
      } else {
        refs.sqlNarrative.innerHTML = "";
      }
    }
    if (refs.sqlExecLabel) {
      const showSql = Boolean(analysis?.sql);
      refs.sqlExecLabel.hidden = !showSql;
      refs.sqlExecLabel.textContent = narrative?.sqlIntro || "将执行的sql 内容如下:";
    }
    if (analysis?.sql) setSqlContent(turn, analysis.sql);
  }

  function getTurnPlainSql(turn, refs = r(turn)) {
    return String(turn.analysis?.sql || refs.sqlCodePre?.textContent || "").trim();
  }

  function renderSqlCodeDisplay(turn, sql) {
    const refs = r(turn);
    if (!refs.sqlCodePre) return;
    const plain = String(sql || "");
    if (refs.sqlCodeWrap?.classList.contains("is-editing")) {
      refs.sqlCodePre.textContent = plain;
      return;
    }
    if (global.QueryEngine?.highlightSql) {
      refs.sqlCodePre.innerHTML = global.QueryEngine.highlightSql(plain);
    } else {
      refs.sqlCodePre.textContent = plain;
    }
  }

  function setSqlContent(turn, sql) {
    const refs = r(turn);
    const plain = String(sql || "");
    if (refs.sqlCodeEditor) refs.sqlCodeEditor.value = plain;
    if (turn.analysis) turn.analysis.sql = plain;
    renderSqlCodeDisplay(turn, plain);
  }

  function setSqlEditStatus(turn, message, type = "") {
    const el = r(turn).sqlEditStatus;
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("is-success", "is-error");
    if (type) el.classList.add(type === "error" ? "is-error" : "is-success");
  }

  function resetSqlEditor(turn) {
    const refs = r(turn);
    if (!refs.sqlCodeWrap) return;
    turn._sqlEditOriginal = "";
    refs.sqlCodeWrap.classList.remove("is-editing", "expanded");
    if (refs.sqlCodeEditor) refs.sqlCodeEditor.hidden = true;
    if (refs.sqlRunBtn) {
      refs.sqlRunBtn.hidden = true;
      refs.sqlRunBtn.disabled = false;
    }
    if (refs.sqlEditBtn) refs.sqlEditBtn.textContent = "修正 SQL";
    if (refs.sqlExpandBtn) refs.sqlExpandBtn.hidden = false;
    setSqlEditStatus(turn, "");
  }

  function enterSqlEditMode(turn) {
    const refs = r(turn);
    if (!refs.sqlCodeEditor || !refs.sqlCodePre) return;
    turn._sqlEditOriginal = getTurnPlainSql(turn, refs);
    refs.sqlCodeEditor.value = turn._sqlEditOriginal;
    refs.sqlCodePre.textContent = turn._sqlEditOriginal;
    refs.sqlCodeWrap.classList.add("is-editing", "expanded");
    refs.sqlCodeEditor.hidden = false;
    refs.sqlEditBtn.textContent = "取消修正";
    refs.sqlRunBtn.hidden = false;
    refs.sqlExpandBtn.hidden = true;
    setSqlEditStatus(turn, "编辑模式：修改 SQL 后点击「执行 SQL」重新查询");
    refs.sqlCodeEditor.focus();
  }

  function exitSqlEditMode(turn, options = {}) {
    const refs = r(turn);
    if (!refs.sqlCodeWrap) return;
    if (options.restore && turn._sqlEditOriginal !== undefined) {
      setSqlContent(turn, turn._sqlEditOriginal);
    } else if (options.keepValue !== false && refs.sqlCodeEditor) {
      setSqlContent(turn, refs.sqlCodeEditor.value.trim());
    }
    refs.sqlCodeWrap.classList.remove("is-editing");
    refs.sqlCodeEditor.hidden = true;
    refs.sqlEditBtn.textContent = "修正 SQL";
    refs.sqlRunBtn.hidden = true;
    refs.sqlExpandBtn.hidden = false;
    renderSqlCodeDisplay(turn, getTurnPlainSql(turn, refs));
    if (options.message) setSqlEditStatus(turn, options.message, options.status || "success");
    else if (!options.keepStatus) setSqlEditStatus(turn, "");
  }

  function toggleSqlEditMode(turn) {
    const refs = r(turn);
    if (refs.sqlCodeWrap?.classList.contains("is-editing")) {
      exitSqlEditMode(turn, { restore: true });
      return;
    }
    enterSqlEditMode(turn);
  }

  async function executeTurnSql(parentTurn) {
    const refs = r(parentTurn);
    if (!refs.sqlCodeEditor) return;
    const sql = refs.sqlCodeEditor.value.trim();
    const question = refs.questionText.textContent.trim();

    if (!sql) {
      setSqlEditStatus(parentTurn, "SQL 不能为空", "error");
      return;
    }

    refs.sqlRunBtn.disabled = true;
    setSqlEditStatus(parentTurn, "正在执行 SQL，即将生成新的回答...");

    await sleep(420);

    const built = global.QueryEngine.buildAnalysisFromSqlExecution(sql, {
      ...(parentTurn.analysis || {}),
      question,
    });

    if (!built.ok) {
      setSqlEditStatus(parentTurn, built.error || "SQL 执行失败", "error");
      refs.sqlRunBtn.disabled = false;
      return;
    }

    exitSqlEditMode(parentTurn, { restore: true });
    global.ConversationTurn.finalizeTurn(parentTurn);

    ensureSession();
    const newTurn = global.ConversationTurn.createTurn();
    conversationTurns.push(newTurn);
    activeTurn = newTurn;
    deps.conversationListEl.appendChild(newTurn.el);
    deps.welcomeViewEl.hidden = true;
    deps.resultViewEl.hidden = false;

    await revealTurn(newTurn, question, {
      prebuiltAnalysis: built,
      displayQuestion: question,
    });

    saveCurrentSession();
    requestAnimationFrame(() => {
      deps.chatScrollEl.scrollTop = deps.chatScrollEl.scrollHeight;
    });
  }

  function prepareTurnContent(turn, analysis) {
    turn.analysis = analysis;
    updateSourcePresentation(turn, analysis);
    const intent = analysis.intent;
    if (intent === "metadata_model" || intent === "metadata_dataset") renderModelList(turn, analysis);
    else if (intent === "metadata_dimension") renderDimensionList(turn);
    else if (intent === "metadata_metric" || intent === "metadata_measure") renderMetricList(turn, intent);
    else if (intent === "metadata_definition") renderDefinitionList(turn, analysis.definitions || []);
    else if (intent === "needs_clarification") renderChoicePanel(turn, analysis);
    else if (["out_of_scope", "greeting", "help_usage", "guidance"].includes(intent)) renderGuidancePanel(turn, analysis.guidance);
    else if (analysis.semanticRows) {
      renderSemanticTable(turn, analysis.semanticRows);
      resetSqlEditor(turn);
      if (!isHideSqlPresentation()) {
        renderSqlSection(turn, analysis);
      } else if (analysis?.sql) {
        setSqlContent(turn, analysis.sql);
      }
      configureDataViewForIntent(turn, analysis);
    }
  }

  async function revealTurn(turn, question, options = {}) {
    const token = ++globalRevealToken;
    turn.revealToken = token;
    const shouldContinue = () => token === turn.revealToken;
    const displayQuestion = options.displayQuestion ?? question;
    const resolveContext = { ...pendingResolveContext, ...(options.resolveContext || {}) };
    const analysis = options.prebuiltAnalysis
      || global.QueryEngine.analyzeQuery(question, resolveContext);
    const pipeline = getPresentationPipeline(
      analysis.pipeline || global.QueryEngine.RESULT_PIPELINES.analytical_aggregate,
    );

    global.ConversationTurn.resetTurnSteps(turn);
    suppressSqlPresentation(turn);
    prepareTurnContent(turn, analysis);
    r(turn).questionText.textContent = displayQuestion;
    updateRequeryState(turn);
    resetSqlEditor(turn);
    if (r(turn).sqlExecLabel) r(turn).sqlExecLabel.hidden = true;
    r(turn).sqlCodeWrap.classList.remove("expanded", "is-typing");
    r(turn).sqlExpandBtn.textContent = "展开 ▾";

    setGeneratingState(true);
    let completed = false;

    const stepDelays = {
      question: 280,
      source: { think: 400, reveal: 200 },
      semantic: { think: 600, reveal: 240 },
      data: { think: 900, reveal: 300 },
      sql: { think: 720, reveal: 280 },
      footer: { think: 360, reveal: 0 },
      "model-list": { think: 440, reveal: 220 },
      "dimension-list": { think: 440, reveal: 220 },
      "metric-list": { think: 440, reveal: 220 },
      "definition-list": { think: 400, reveal: 200 },
      choice: { think: 340, reveal: 200 },
      guidance: { think: 380, reveal: 220 },
      kpi: { think: 760, reveal: 240 },
      compare: { think: 800, reveal: 260 },
    };

    try {
      for (let i = 0; i < pipeline.length; i += 1) {
        const stepKey = pipeline[i];
        if (!shouldContinue()) break;

        if (stepKey === "question") {
          const step = global.ConversationTurn.revealStep(turn, stepKey);
          scrollToStep(step);
          if (!(await sleep(stepDelays.question, shouldContinue))) break;
          continue;
        }

        global.ConversationTurn.setStepThinkingText(turn, stepKey, getStepThinkingText(stepKey));
        const thinkingStep = global.ConversationTurn.setStepThinking(turn, stepKey);
        scrollToStep(thinkingStep);
        const timing = stepDelays[stepKey] || { think: 400, reveal: 220 };
        if (!(await sleep(timing.think, shouldContinue))) break;

        if (["data", "kpi", "compare"].includes(stepKey)) refreshQueryResult(turn, true);
        if (stepKey === "sql") {
          renderSqlSection(turn, turn.analysis);
          r(turn).sqlCodeWrap.classList.add("is-typing");
        }

        const revealed = global.ConversationTurn.revealStep(turn, stepKey);
        scrollToStep(revealed);
        if (timing.reveal && !(await sleep(timing.reveal, shouldContinue))) break;
      }

      if (shouldContinue()) {
        if (["data", "kpi", "compare"].includes(stepKey)) updateRequeryState(turn);
        pendingResolveContext = null;
        global.ConversationTurn.finalizeTurn(turn);
        completed = true;
        deps.onTurnComplete?.(turn, turn.analysis);
      }
    } finally {
      if (!completed) {
        markTurnStopped(turn);
        global.ConversationTurn.finalizeTurn(turn);
        pendingResolveContext = null;
      }
      setGeneratingState(false);
    }
  }

  async function appendQuestion(question, options = {}) {
    ensureSession();
    if (activeTurn) global.ConversationTurn.finalizeTurn(activeTurn);
    const turn = global.ConversationTurn.createTurn();
    conversationTurns.push(turn);
    activeTurn = turn;
    suppressSqlPresentation(turn);
    deps.conversationListEl.appendChild(turn.el);
    deps.welcomeViewEl.hidden = true;
    deps.resultViewEl.hidden = false;
    await revealTurn(turn, question, options);
    saveCurrentSession();
    requestAnimationFrame(() => {
      deps.chatScrollEl.scrollTop = deps.chatScrollEl.scrollHeight;
    });
    return turn;
  }

  function startNewSession() {
    if (activeTurn && isGenerating) activeTurn.revealToken += 1;
    globalRevealToken += 1;
    conversationTurns = [];
    activeTurn = null;
    pendingResolveContext = null;
    currentSessionId = null;
    deps.conversationListEl.innerHTML = "";
    setGeneratingState(false);
  }

  function loadSession(sessionId) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    if (activeTurn && isGenerating) activeTurn.revealToken += 1;
    globalRevealToken += 1;
    setGeneratingState(false);
    currentSessionId = session.id;
    deps.conversationListEl.innerHTML = session.html || "";
    rehydrateTurnsFromDom();
    if (isHideSqlPresentation()) {
      conversationTurns.forEach((turn) => suppressSqlPresentation(turn));
    }
    deps.welcomeViewEl.hidden = Boolean(session.html);
    deps.resultViewEl.hidden = !session.html;
    deps.onSessionActivated?.(session);
    requestAnimationFrame(() => {
      deps.chatScrollEl.scrollTop = deps.chatScrollEl.scrollHeight;
    });
    return true;
  }

  function deleteSession(sessionId) {
    sessions = sessions.filter((s) => s.id !== sessionId);
    persistSessions();
    if (currentSessionId === sessionId) {
      startNewSession();
      deps.welcomeViewEl.hidden = false;
      deps.resultViewEl.hidden = true;
      currentSessionId = null;
    }
    deps.onSessionDeleted?.(sessionId);
  }

  function renameSession(sessionId, title) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !title) return;
    session.title = title;
    persistSessions();
    deps.onSessionRenamed?.(session);
  }

  function getSessions() {
    return [...sessions];
  }

  function getCurrentSessionId() {
    return currentSessionId;
  }

  function getCurrentSessionTitle() {
    if (!currentSessionId) return "未命名仪表盘";
    const session = sessions.find((s) => s.id === currentSessionId);
    return session?.title || "未命名仪表盘";
  }

  const CHART_TYPE_LABELS = {
    bar: "柱状图",
    hbar: "条形图",
    line: "折线图",
    pie: "饼图",
    donut: "环形图",
  };

  function getChartTypeLabel(turn) {
    const type = turn.chartType || "bar";
    return CHART_TYPE_LABELS[type] || "柱状图";
  }

  function saveChartAsDashboard(turn) {
    if (!turn || r(turn).chartView?.hidden) return;
    ensureSession();
    const dashboardTitle = getCurrentSessionTitle();
    const question = r(turn).questionText.textContent.trim();
    const chartType = turn.chartType || "bar";

    turn.savedChart = {
      group: "智能分析",
      dashboardTitle,
      sessionId: currentSessionId,
      question,
      chartType,
      savedAt: Date.now(),
    };

    const notice = r(turn).chartSaveNotice;
    const noticeText = r(turn).chartSaveNoticeText;
    if (notice && noticeText) {
      noticeText.innerHTML = [
        "该图表已经保存到",
        '<button type="button" class="chart-save-link" data-save-link="group">【智能分析】</button>',
        "分组下",
        `<button type="button" class="chart-save-link" data-save-link="dashboard">【${escapeHtml(dashboardTitle)}】</button>`,
        "仪表盘，",
        '<button type="button" class="chart-save-link chart-save-edit-link" data-save-link="edit">前往编辑</button>',
      ].join("");
      notice.hidden = false;
    }

    if (r(turn).saveChartBtn) {
      r(turn).saveChartBtn.textContent = "已保存为图表";
      r(turn).saveChartBtn.disabled = true;
    }

    deps.onChartSavedToDashboard?.({
      turn,
      group: "智能分析",
      dashboardTitle,
      sessionId: currentSessionId,
      question,
      chartType,
      chartTypeLabel: getChartTypeLabel(turn),
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openSavedChartEditor(turn) {
    if (!turn?.savedChart) return;
    deps.onOpenAnalysisDashboard?.({
      turn,
      ...turn.savedChart,
      chartTypeLabel: getChartTypeLabel(turn),
    });
  }

  function getTurnFromEl(el) {
    const turnEl = el.closest(".conversation-turn");
    if (!turnEl) return null;
    return conversationTurns.find((t) => t.el === turnEl) || null;
  }

  const INCORRECT_FEEDBACK_REASONS = [
    { value: "data_wrong", label: "数据不对" },
    { value: "misunderstanding", label: "理解有误" },
    { value: "caliber_mismatch", label: "口径不符" },
    { value: "chart_mismatch", label: "图表不合适" },
    { value: "scope_error", label: "权限或范围错误" },
  ];

  let incorrectFeedbackUi = null;
  let pendingIncorrectFeedbackTurn = null;
  let incorrectFeedbackCloseTimer = null;

  function ensureIncorrectFeedbackModal() {
    if (incorrectFeedbackUi) return incorrectFeedbackUi;

    const overlay = document.createElement("div");
    overlay.className = "feedback-incorrect-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="feedback-incorrect-modal" role="dialog" aria-modal="true" aria-labelledby="feedbackIncorrectTitle">
        <div class="feedback-incorrect-head">
          <h3 id="feedbackIncorrectTitle">结果反馈</h3>
          <button class="feedback-incorrect-close" type="button" aria-label="关闭">×</button>
        </div>
        <div class="feedback-incorrect-body">
          <form class="feedback-incorrect-form">
            <fieldset class="feedback-reason-group">
              <legend>请选择问题类型</legend>
              ${INCORRECT_FEEDBACK_REASONS.map(
                (item) => `
                  <label class="feedback-reason-option">
                    <input type="radio" name="feedbackReason" value="${item.value}" />
                    <span>${item.label}</span>
                  </label>
                `,
              ).join("")}
            </fieldset>
            <div class="feedback-incorrect-desc">
              <label for="feedbackIncorrectDesc">补充描述</label>
              <textarea id="feedbackIncorrectDesc" placeholder="选填，可补充说明具体情况" maxlength="500"></textarea>
            </div>
            <p class="feedback-incorrect-error" hidden>请选择问题类型</p>
          </form>
          <div class="feedback-incorrect-success" hidden>
            <span class="feedback-incorrect-success-icon" aria-hidden="true">✓</span>
            <p>已经收到反馈，感谢您的建议</p>
          </div>
        </div>
        <div class="feedback-incorrect-foot">
          <button class="feedback-incorrect-submit" type="button">提交</button>
        </div>
      </div>
    `;
    const mountRoot = deps.feedbackModalRoot || document.body;
    if (deps.feedbackModalRoot) {
      overlay.classList.add("feedback-incorrect-overlay--in-panel");
    }
    mountRoot.appendChild(overlay);

    const modal = overlay.querySelector(".feedback-incorrect-modal");
    const formEl = overlay.querySelector(".feedback-incorrect-form");
    const successEl = overlay.querySelector(".feedback-incorrect-success");
    const errorEl = overlay.querySelector(".feedback-incorrect-error");
    const descEl = overlay.querySelector("#feedbackIncorrectDesc");
    const footEl = overlay.querySelector(".feedback-incorrect-foot");
    const submitBtn = overlay.querySelector(".feedback-incorrect-submit");
    const closeBtn = overlay.querySelector(".feedback-incorrect-close");

    function resetForm() {
      formEl.reset();
      descEl.value = "";
      errorEl.hidden = true;
      formEl.hidden = false;
      successEl.hidden = true;
      footEl.hidden = false;
    }

    function closeModal() {
      if (incorrectFeedbackCloseTimer) {
        clearTimeout(incorrectFeedbackCloseTimer);
        incorrectFeedbackCloseTimer = null;
      }
      overlay.hidden = true;
      if (mountRoot !== document.body) {
        mountRoot.setAttribute("aria-hidden", "true");
      }
      pendingIncorrectFeedbackTurn = null;
      resetForm();
    }

    function openModal(turn) {
      if (incorrectFeedbackCloseTimer) {
        clearTimeout(incorrectFeedbackCloseTimer);
        incorrectFeedbackCloseTimer = null;
      }
      pendingIncorrectFeedbackTurn = turn;
      resetForm();
      overlay.hidden = false;
      if (mountRoot !== document.body) {
        mountRoot.setAttribute("aria-hidden", "false");
      }
      const firstRadio = formEl.querySelector('input[name="feedbackReason"]');
      if (firstRadio) firstRadio.focus();
    }

    function showSuccessThenClose() {
      formEl.hidden = true;
      footEl.hidden = true;
      successEl.hidden = false;
      incorrectFeedbackCloseTimer = setTimeout(closeModal, 1600);
    }

    submitBtn.addEventListener("click", () => {
      const turn = pendingIncorrectFeedbackTurn;
      if (!turn) return;
      const selected = formEl.querySelector('input[name="feedbackReason"]:checked');
      if (!selected) {
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;
      const reasonLabel = INCORRECT_FEEDBACK_REASONS.find((item) => item.value === selected.value)?.label || "";
      submitAnswerFeedback(turn, "incorrect", {
        reason: selected.value,
        reasonLabel,
        description: descEl.value.trim(),
      });
      showSuccessThenClose();
    });

    formEl.addEventListener("change", (event) => {
      if (event.target.name === "feedbackReason") errorEl.hidden = true;
    });

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });
    modal.addEventListener("click", (event) => event.stopPropagation());

    incorrectFeedbackUi = { overlay, openModal, closeModal };
    return incorrectFeedbackUi;
  }

  function closeIncorrectFeedbackModal() {
    if (incorrectFeedbackUi && !incorrectFeedbackUi.overlay.hidden) {
      incorrectFeedbackUi.closeModal();
    }
  }

  function openIncorrectFeedbackModal(turn) {
    const row = r(turn).feedbackRow;
    if (!row || row.dataset.submitted === "1") return;
    ensureIncorrectFeedbackModal().openModal(turn);
  }

  function submitAnswerFeedback(turn, feedbackType, extra = {}) {
    const row = r(turn).feedbackRow;
    if (!row || row.dataset.submitted === "1") return;

    row.dataset.submitted = "1";
    row.classList.add("is-submitted");
    row.querySelectorAll(".feedback-btn").forEach((btn) => {
      btn.disabled = true;
      btn.classList.toggle("is-selected", btn.dataset.feedback === feedbackType);
    });
    if (r(turn).feedbackThanks) r(turn).feedbackThanks.hidden = false;

    deps.onAnswerFeedback?.({
      turn,
      type: feedbackType,
      question: r(turn).questionText.textContent.trim(),
      sessionId: currentSessionId,
      ...extra,
    });
  }

  function bindEvents() {
    deps.conversationListEl.addEventListener("click", (event) => {
      const feedbackBtn = event.target.closest(".feedback-btn");
      if (feedbackBtn && !feedbackBtn.disabled) {
        const turn = getTurnFromEl(feedbackBtn);
        const feedbackType = feedbackBtn.dataset.feedback;
        if (turn && feedbackType === "correct") {
          submitAnswerFeedback(turn, "correct");
        } else if (turn && feedbackType === "incorrect") {
          openIncorrectFeedbackModal(turn);
        }
        return;
      }

      const choiceCard = event.target.closest(".choice-card");
      if (choiceCard) {
        const turn = getTurnFromEl(choiceCard);
        const index = Number(choiceCard.dataset.choiceIndex);
        const choice = turn?.analysis?.choices?.[index];
        if (choice) {
          pendingResolveContext = choice.resolve || {};
          appendQuestion(choice.prompt || r(turn).questionText.textContent.trim(), {
            resolveContext: pendingResolveContext,
          });
        }
        return;
      }

      const guidanceBtn = event.target.closest(".guidance-action-btn");
      if (guidanceBtn) {
        const turn = getTurnFromEl(guidanceBtn);
        const index = Number(guidanceBtn.dataset.guidanceIndex);
        const action = turn?.analysis?.guidance?.actions?.[index];
        if (action?.type === "prompt") deps.fillComposerPrompt(action.prompt);
        else if (action?.type === "action") deps.onGuidanceAction?.(action);
        if (action?.type === "prompt") deps.sendMessage();
        return;
      }

      const insertBtn = event.target.closest(".metadata-insert-btn");
      if (insertBtn) deps.insertIntoComposer(insertBtn.dataset.insertLabel);

      const viewBtn = event.target.closest(".view-toggle-btn");
      if (viewBtn) {
        const turn = getTurnFromEl(viewBtn);
        if (!turn) return;
        turn.refs.viewToggleBtns.forEach((btn) => btn.classList.toggle("active", btn === viewBtn));
        const isChart = viewBtn.dataset.view === "chart";
        r(turn).chartView.hidden = !isChart;
        r(turn).tableView.hidden = isChart;
        return;
      }

      const saveChartBtn = event.target.closest(".save-chart-btn");
      if (saveChartBtn && !saveChartBtn.disabled) {
        const turn = getTurnFromEl(saveChartBtn);
        if (turn) saveChartAsDashboard(turn);
        return;
      }

      const chartSaveLink = event.target.closest(".chart-save-link");
      if (chartSaveLink) {
        const turn = getTurnFromEl(chartSaveLink);
        if (turn?.savedChart) openSavedChartEditor(turn);
        return;
      }

      const chartBtn = event.target.closest(".chart-type-btn");
      if (chartBtn) {
        const turn = getTurnFromEl(chartBtn);
        if (!turn?.analysis?.schema) return;
        const chartType = chartBtn.dataset.chartType;
        const schema = turn.analysis.schema;
        const rows = schema.chartMode === "simple"
          ? (turn.queryDataRows.length ? turn.queryDataRows : turn.analysis.mockData?.tableRows || [])
          : (turn.analysis.mockData?.chartRows
            || generateQueryData(r(turn).questionText.textContent.trim(), { stable: true }));
        renderChart(turn, rows, chartType, schema);
        return;
      }

      const sqlExpandBtn = event.target.closest(".sql-expand-btn");
      if (sqlExpandBtn) {
        const turn = getTurnFromEl(sqlExpandBtn);
        if (!turn) return;
        const expanded = r(turn).sqlCodeWrap.classList.toggle("expanded");
        r(turn).sqlExpandBtn.textContent = expanded ? "收起 ▴" : "展开 ▾";
        return;
      }

      const sqlEditBtn = event.target.closest(".sql-edit-btn");
      if (sqlEditBtn) {
        const turn = getTurnFromEl(sqlEditBtn);
        if (turn) toggleSqlEditMode(turn);
        return;
      }

      const sqlRunBtn = event.target.closest(".sql-run-btn");
      if (sqlRunBtn && !sqlRunBtn.hidden && !sqlRunBtn.disabled) {
        const turn = getTurnFromEl(sqlRunBtn);
        if (turn) executeTurnSql(turn);
        return;
      }

      const sqlAddExampleBtn = event.target.closest(".sql-add-example-btn");
      if (sqlAddExampleBtn) {
        const turn = getTurnFromEl(sqlAddExampleBtn);
        if (!turn) return;
        const sql = r(turn).sqlCodeWrap?.classList.contains("is-editing")
          ? r(turn).sqlCodeEditor.value.trim()
          : getTurnPlainSql(turn);
        const question = r(turn).questionText.textContent.trim();
        const domain = turn.analysis?.schema?.model
          || turn.analysis?.model?.name
          || global.QueryEngine.BUSINESS_MODEL.name;

        if (!sql) {
          setSqlEditStatus(turn, "当前没有可添加的 SQL", "error");
          return;
        }
        if (!question) {
          setSqlEditStatus(turn, "缺少用户提问内容，无法添加到 SQL 示例库", "error");
          return;
        }

        const result = deps.onAddSqlExample?.({
          question,
          sql,
          domain,
          recommend: true,
        });

        if (result?.ok) {
          setSqlEditStatus(turn, result.message || "已添加到 SQL 示例库", "success");
        } else {
          setSqlEditStatus(turn, result?.error || "添加到 SQL 示例库失败", "error");
        }
        return;
      }

      const requeryBtn = event.target.closest(".requery-btn");
      if (requeryBtn && !requeryBtn.disabled) {
        const turn = getTurnFromEl(requeryBtn);
        if (!turn) return;
        const block = requeryBtn.closest(".semantic-block");
        const startDate = block?.querySelector("[data-ref=\"startDate\"]");
        const endDate = block?.querySelector("[data-ref=\"endDate\"]");
        const q = r(turn).questionText.textContent.trim();
        const withFilter = `${q}（${startDate?.value || ""} 至 ${endDate?.value || ""}）`;
        turn.revealToken += 1;
        revealTurn(turn, withFilter, { displayQuestion: withFilter }).then(() => saveCurrentSession());
      }
    });

    deps.conversationListEl.addEventListener("change", (event) => {
      if (event.target.matches(".date-input")) {
        const turn = getTurnFromEl(event.target);
        if (turn) updateRequeryState(turn);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !incorrectFeedbackUi || incorrectFeedbackUi.overlay.hidden) return;
      incorrectFeedbackUi.closeModal();
    });
  }

    let eventsBound = false;
    return {
      init(options) {
        deps = options;
        loadSessionsFromStorage();
        if (!eventsBound) {
          bindEvents();
          eventsBound = true;
        }
        deps.onSessionsLoaded?.(getSessions());
      },
      appendQuestion,
      stopGeneration,
      isGenerating: () => isGenerating,
      startNewSession,
      loadSession,
      deleteSession,
      renameSession,
      getSessions,
      getCurrentSessionId,
      getCurrentSessionTitle,
      saveCurrentSession,
      getActiveTurn: () => activeTurn,
      openSavedChartEditor,
      closeIncorrectFeedbackModal,
      refreshChartsForTheme,
    };
  }

  global.createChatController = createChatController;
  global.ChatController = createChatController({ storageKey: "smart-query-sessions-v1" });
})(window);
