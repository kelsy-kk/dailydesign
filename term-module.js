/**
 * 业务建模 · 术语设置（导入 / 上线 / 详情）
 */
(function (global) {
  const STORAGE_KEY = "biz-modeling-terms-v3";
  const FIELD_TERM_KEY = "biz-modeling-field-terms-v1";
  const DEFAULT_PROJECT = "pmlead-市场指标";

  const CSV_HEADERS = ["词典名称", "术语名称", "同义词", "术语描述"];

  const TERM_POOL = [
    { name: "合同额", synonyms: "合同金额, 签约额", description: "统计周期内签订的合同总金额，按签订日期归属。", domain: "收入管理" },
    { name: "销售量", synonyms: "销量, 销售数量", description: "商品销售的总数量，通常按门店与产品种类汇总。", domain: "经营管理" },
    { name: "GMV", synonyms: "成交总额, 成交额", description: "成交订单金额合计，包含优惠前销售金额。", domain: "经营管理" },
    { name: "交易月份", synonyms: "月份, 业务月", description: "按交易发生时间归集的月份维度，用于趋势分析。", domain: "经营管理" },
    { name: "产品种类", synonyms: "品类, 商品类别", description: "产品分类维度，用于品类分析。", domain: "经营管理" },
    { name: "门店编号", synonyms: "门店ID, 店铺编号", description: "门店唯一标识，用于关联区域与经营数据。", domain: "经营管理" },
    { name: "订单金额", synonyms: "销售额, 营收", description: "订单实际成交金额，可按区域、月份等维度聚合。", domain: "收入管理" },
    { name: "签订日期", synonyms: "签约日期, 合同日期", description: "合同正式签订的日期，用于合同类指标统计。", domain: "收入管理" },
    { name: "成本金额", synonyms: "成本合计, 归集成本", description: "按权责归集的项目成本金额，内部往来不计入。", domain: "成本管理" },
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createId() {
    return `term-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatDate(date = new Date()) {
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function randomPastDate(daysBackMax = 45) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBackMax));
    date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    return date;
  }

  function termDomainList(item) {
    if (Array.isArray(item?.domains) && item.domains.length) {
      return item.domains.map((d) => String(d).trim()).filter(Boolean);
    }
    return String(item?.domain || "")
      .split(/[、,，]/)
      .map((d) => d.trim())
      .filter(Boolean);
  }

  function termHasDomain(item, domain) {
    return termDomainList(item).includes(domain);
  }

  function normalizeTerm(item, fallbackDomains = [], project = DEFAULT_PROJECT) {
    const domains = termDomainList(item);
    const resolved = domains.length ? domains : [fallbackDomains[0] || "收入管理"];
    return {
      ...item,
      domains: resolved,
      domain: resolved.join("、"),
      project: item?.project || project,
      online: item?.online !== false,
    };
  }

  function readTerms(fallbackDomains = [], project = DEFAULT_PROJECT) {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacy = localStorage.getItem("biz-modeling-terms-v2") || localStorage.getItem("biz-modeling-terms-v1");
        if (legacy) {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map((item) => normalizeTerm(item, fallbackDomains, project));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
          }
        }
        return null;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => normalizeTerm(item, fallbackDomains, project));
      }
    } catch (_err) {
      /* ignore */
    }
    return null;
  }

  function writeTerms(terms) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
      global.dispatchEvent(new CustomEvent("biz-terms-updated", { detail: terms }));
    } catch (_err) {
      /* ignore */
    }
  }

  function seedTerms(fallbackDomains = [], project = DEFAULT_PROJECT) {
    const count = 5 + Math.floor(Math.random() * 3);
    const copy = [...TERM_POOL];
    const picked = [];
    while (picked.length < count && copy.length) {
      const index = Math.floor(Math.random() * copy.length);
      picked.push(copy.splice(index, 1)[0]);
    }
    return picked.map((item, index) => ({
      id: createId(),
      ...item,
      domain: item.domain || fallbackDomains[index % Math.max(fallbackDomains.length, 1)] || "收入管理",
      project,
      online: index < 3,
      creator: "管理员",
      createdAt: formatDate(randomPastDate()),
    }));
  }

  function readFieldTermMap() {
    try {
      const raw = localStorage.getItem(FIELD_TERM_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_err) {
      return {};
    }
  }

  function writeFieldTermMap(map) {
    try {
      localStorage.setItem(FIELD_TERM_KEY, JSON.stringify(map));
      global.dispatchEvent(new CustomEvent("biz-field-terms-updated", { detail: map }));
    } catch (_err) {
      /* ignore */
    }
  }

  function fieldTermKey(modelName, fieldEn) {
    return `${modelName || ""}|${fieldEn || ""}`;
  }

  function normalizeCsvHeader(header) {
    return String(header || "")
      .replace(/^\uFEFF/, "")
      .trim()
      .replace(/^"|"$/g, "");
  }

  function mapCsvHeader(header) {
    const raw = normalizeCsvHeader(header);
    const aliases = {
      词典名称: "词典名称",
      工程: "词典名称",
      所属工程: "词典名称",
      产线: "词典名称",
      术语名称: "术语名称",
      名称: "术语名称",
      同义词: "同义词",
      同义词标签: "同义词",
      "同义词/标签": "同义词",
      术语描述: "术语描述",
      描述: "术语描述",
    };
    return aliases[raw] || raw;
  }

  function parseCsvText(text) {
    const raw = String(text || "").replace(/^\uFEFF/, "");
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return { headers: [], rows: [] };
    const delimiter = lines[0].includes("\t") && !lines[0].includes(",") ? "\t" : ",";
    const split = (line) => {
      const cells = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuote && line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else {
            inQuote = !inQuote;
          }
        } else if (ch === delimiter && !inQuote) {
          cells.push(cur.trim());
          cur = "";
        } else {
          cur += ch;
        }
      }
      cells.push(cur.trim());
      return cells;
    };
    const headers = split(lines[0]).map(mapCsvHeader);
    const rows = lines.slice(1).map((line, idx) => {
      const cells = split(line);
      const obj = { __line: idx + 2 };
      headers.forEach((h, i) => {
        if (!h || h === "__line") return;
        obj[h] = cells[i] ?? "";
      });
      return obj;
    });
    return { headers, rows };
  }

  function csvHasRequiredHeaders(headers) {
    const set = new Set((headers || []).map(normalizeCsvHeader));
    return CSV_HEADERS.every((h) => set.has(h));
  }

  async function readCsvFile(file) {
    const buf = await file.arrayBuffer();
    const tryDecode = (label) => {
      try {
        return new TextDecoder(label).decode(buf);
      } catch (_err) {
        return "";
      }
    };
    const candidates = ["utf-8", "gbk", "gb18030"];
    let best = { text: "", parsed: { headers: [], rows: [] } };
    for (const label of candidates) {
      const text = tryDecode(label);
      if (!text) continue;
      const parsed = parseCsvText(text);
      if (csvHasRequiredHeaders(parsed.headers)) {
        return { text, parsed, encoding: label };
      }
      if (parsed.rows.length > best.parsed.rows.length) {
        best = { text, parsed, encoding: label };
      }
    }
    return best;
  }

  function sampleCsvText(currentProject) {
    const project = currentProject || DEFAULT_PROJECT;
    return [
      CSV_HEADERS.join(","),
      `${project},合同额,"合同金额,签约额",统计周期内签订的合同总金额`,
      `${project},目标额,签约目标,合同签约目标金额`,
      `${project},,同义词错误,缺少术语名称`,
      `${project},合同额,重复名,与已有或文件内重名示意`,
    ].join("\n");
  }

  function downloadCsv(filename, content) {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function mount(deps = {}) {
    const setTip = typeof deps.setTip === "function" ? deps.setTip : () => {};
    const collectUniqueDomainLabels = typeof deps.collectUniqueDomainLabels === "function"
      ? deps.collectUniqueDomainLabels
      : () => ["收入管理", "成本管理", "经营管理"];
    const getCurrentProject = typeof deps.getCurrentProject === "function"
      ? deps.getCurrentProject
      : () => DEFAULT_PROJECT;
    const openMetricById = typeof deps.openMetricById === "function" ? deps.openMetricById : null;
    const openFieldByKey = typeof deps.openFieldByKey === "function" ? deps.openFieldByKey : null;

    const searchEl = document.getElementById("termSearchInput");
    const createBtnEl = document.getElementById("termCreateBtn");
    const importBtnEl = document.getElementById("termImportBtn");
    const templateBtnEl = document.getElementById("termTemplateBtn");
    const selectAllEl = document.getElementById("termSelectAll");
    const tableBodyEl = document.getElementById("termTableBody");
    const formOverlayEl = document.getElementById("termFormOverlay");
    const formTitleEl = document.getElementById("termFormTitle");
    const formNameEl = document.getElementById("termFormName");
    const formSynonymsEl = document.getElementById("termFormSynonyms");
    const formDescEl = document.getElementById("termFormDescription");
    const formSaveBtnEl = document.getElementById("termFormSaveBtn");
    const formCancelBtnEl = document.getElementById("termFormCancelBtn");
    const formCloseBtnEl = document.getElementById("closeTermFormBtn");

    const importOverlayEl = document.getElementById("termImportOverlay");
    const importStepEls = () => Array.from(document.querySelectorAll("[data-term-import-step-panel]"));
    const importDomainEl = document.getElementById("termImportDomain");
    const importModeEls = () => Array.from(document.querySelectorAll('input[name="termImportMode"]'));
    const importFileInputEl = document.getElementById("termImportFileInput");
    const importFileStatusEl = document.getElementById("termImportFileStatus");
    const importPreviewBodyEl = document.getElementById("termImportPreviewBody");
    const importSummaryEl = document.getElementById("termImportSummary");
    const importPrevBtnEl = document.getElementById("termImportPrevBtn");
    const importNextBtnEl = document.getElementById("termImportNextBtn");
    const importCloseBtnEl = document.getElementById("closeTermImportBtn");
    const importCancelBtnEl = document.getElementById("termImportCancelBtn");
    const importUseSampleBtnEl = document.getElementById("termImportUseSampleBtn");

    const detailDrawerEl = document.getElementById("termDetailDrawer");
    const detailBodyEl = document.getElementById("termDetailDrawerBody");
    const detailTitleEl = document.getElementById("termDetailDrawerTitle");
    const detailCloseBtnEl = document.getElementById("closeTermDetailDrawerBtn");

    const domainLabels = () => {
      const labels = collectUniqueDomainLabels() || [];
      return labels.length ? labels : ["收入管理", "成本管理", "经营管理"];
    };

    const currentProject = () => getCurrentProject() || DEFAULT_PROJECT;

    let terms = readTerms(domainLabels(), currentProject()) || seedTerms(domainLabels(), currentProject());
    writeTerms(terms);
    const selection = new Set();
    let editingId = null;
    let domainFilter = "";
    let importStep = 1;
    let importRows = [];
    let validatedRows = [];
    let importSourceFile = null;
    let importSourceText = "";
    let importSourceName = "";

    let selectedFormDomains = new Set();
    let domainPickerBound = false;

    function fillDomainSelect(selectEl, selected = "") {
      if (!selectEl) return;
      const labels = domainLabels();
      const value = selected && labels.includes(selected) ? selected : labels[0];
      selectEl.innerHTML = labels
        .map((label) => `<option value="${escapeHtml(label)}" ${label === value ? "selected" : ""}>${escapeHtml(label)}</option>`)
        .join("");
    }

    function setTermDomainPickerOpen(open) {
      const trigger = document.getElementById("termDomainTrigger");
      const dropdown = document.getElementById("termDomainDropdown");
      if (!trigger || !dropdown) return;
      trigger.classList.toggle("is-open", open);
      dropdown.hidden = !open;
    }

    function renderTermDomainTags() {
      const tagsEl = document.getElementById("termDomainTags");
      if (!tagsEl) return;
      const selected = [...selectedFormDomains];
      tagsEl.innerHTML = selected
        .map((name) => `
          <span class="metric-domain-tag" data-name="${escapeHtml(name)}">
            <span title="${escapeHtml(name)}">${escapeHtml(name)}</span>
            <button type="button" data-remove-term-domain="${escapeHtml(name)}" aria-label="移除 ${escapeHtml(name)}">×</button>
          </span>
        `)
        .join("");
    }

    function renderTermDomainDropdown(keyword = "") {
      const listEl = document.getElementById("termDomainList");
      if (!listEl) return;
      const q = keyword.trim().toLowerCase();
      const labels = domainLabels().filter((label) => !q || label.toLowerCase().includes(q));
      if (!labels.length) {
        listEl.innerHTML = `<div class="metric-domain-empty">没有匹配的数据域</div>`;
        return;
      }
      listEl.innerHTML = labels
        .map((label) => {
          const checked = selectedFormDomains.has(label);
          return `
            <label class="metric-domain-item ${checked ? "is-checked" : ""}">
              <input type="checkbox" name="termFormDomain" value="${escapeHtml(label)}" ${checked ? "checked" : ""} />
              <span>${escapeHtml(label)}</span>
            </label>
          `;
        })
        .join("");
    }

    function initTermDomainPicker(selected = []) {
      const list = Array.isArray(selected) ? selected : String(selected || "").split(/[、,，]/).map((s) => s.trim()).filter(Boolean);
      selectedFormDomains = new Set(list.filter(Boolean));
      const searchEl = document.getElementById("termDomainSearch");
      if (searchEl) searchEl.value = "";
      renderTermDomainTags();
      renderTermDomainDropdown("");
      setTermDomainPickerOpen(false);
    }

    function bindTermDomainPicker() {
      const picker = document.getElementById("termDomainPicker");
      const trigger = document.getElementById("termDomainTrigger");
      const searchEl = document.getElementById("termDomainSearch");
      const listEl = document.getElementById("termDomainList");
      const tagsEl = document.getElementById("termDomainTags");
      if (!picker || domainPickerBound) return;
      domainPickerBound = true;
      trigger?.addEventListener("click", (event) => {
        if (event.target.closest("[data-remove-term-domain]")) return;
        setTermDomainPickerOpen(true);
        searchEl?.focus();
      });
      searchEl?.addEventListener("focus", () => setTermDomainPickerOpen(true));
      searchEl?.addEventListener("input", () => {
        setTermDomainPickerOpen(true);
        renderTermDomainDropdown(searchEl.value);
      });
      listEl?.addEventListener("change", (event) => {
        const input = event.target.closest('input[name="termFormDomain"]');
        if (!input) return;
        if (input.checked) selectedFormDomains.add(input.value);
        else selectedFormDomains.delete(input.value);
        renderTermDomainTags();
        renderTermDomainDropdown(searchEl?.value || "");
      });
      tagsEl?.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-remove-term-domain]");
        if (!btn) return;
        event.preventDefault();
        selectedFormDomains.delete(btn.dataset.removeTermDomain);
        renderTermDomainTags();
        renderTermDomainDropdown(searchEl?.value || "");
      });
      document.addEventListener("click", (event) => {
        if (!picker.contains(event.target)) setTermDomainPickerOpen(false);
      });
    }

    function getFiltered() {
      const keyword = (searchEl?.value || "").trim().toLowerCase();
      return terms.filter((item) => {
        if (domainFilter && !termHasDomain(item, domainFilter)) return false;
        if (!keyword) return true;
        return ["name", "synonyms", "description", "domain", "project"].some((field) =>
          String(item[field] ?? "").toLowerCase().includes(keyword)
        );
      });
    }

    function syncSelectionUi() {
      const visibleIds = new Set(getFiltered().map((item) => item.id));
      [...selection].forEach((id) => {
        if (!visibleIds.has(id)) selection.delete(id);
      });
      const hasRows = visibleIds.size > 0;
      if (selectAllEl) {
        selectAllEl.disabled = !hasRows;
        if (!hasRows) {
          selectAllEl.checked = false;
          selectAllEl.indeterminate = false;
        } else {
          const selectedVisible = [...selection].filter((id) => visibleIds.has(id)).length;
          selectAllEl.checked = selectedVisible > 0 && selectedVisible === visibleIds.size;
          selectAllEl.indeterminate = selectedVisible > 0 && selectedVisible < visibleIds.size;
        }
      }
    }

    function onlineTagHtml(online) {
      return online
        ? '<span class="online-tag is-online">已上线</span>'
        : '<span class="online-tag is-offline">未上线</span>';
    }

    function render() {
      if (!tableBodyEl) return;
      const items = getFiltered();
      if (!items.length) {
        tableBodyEl.innerHTML = `
          <tr class="term-empty-row">
            <td colspan="9">
              <div class="term-empty">暂无术语，点击「创建」或「批量导入」添加</div>
            </td>
          </tr>
        `;
      } else {
        tableBodyEl.innerHTML = items
          .map(
            (item, index) => `
          <tr data-id="${item.id}" class="${item.online === false ? "is-offline" : ""}">
            <td class="col-check"><input type="checkbox" class="term-row-check" data-id="${item.id}" ${selection.has(item.id) ? "checked" : ""} aria-label="选择行" /></td>
            <td class="col-index">${index + 1}</td>
            <td class="col-text"><a class="name-link term-name-link" href="#" data-term-action="detail" data-id="${item.id}" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</a></td>
            <td class="domain-cell" title="${escapeHtml(item.domain || "")}">${escapeHtml(item.domain || "—")}</td>
            <td class="col-text" title="${escapeHtml(item.synonyms)}">${escapeHtml(item.synonyms || "—")}</td>
            <td class="col-text-wide" title="${escapeHtml(item.description)}">${escapeHtml(item.description || "—")}</td>
            <td>${escapeHtml(item.creator)}</td>
            <td>${escapeHtml(item.createdAt)}</td>
            <td class="col-actions">
              ${onlineTagHtml(item.online !== false)}
              <a class="op-link" href="#" data-term-action="online" data-id="${item.id}">${item.online !== false ? "下线" : "上线"}</a>
              <a class="op-link" href="#" data-term-action="edit" data-id="${item.id}">编辑</a>
              <a class="op-link" href="#" data-term-action="delete" data-id="${item.id}">删除</a>
            </td>
          </tr>
        `
          )
          .join("");
      }
      syncSelectionUi();
    }

    function openForm(item = null) {
      editingId = item?.id || null;
      if (formTitleEl) formTitleEl.textContent = item ? "编辑术语" : "创建术语";
      if (formNameEl) formNameEl.value = item?.name || "";
      initTermDomainPicker(termDomainList(item));
      if (formSynonymsEl) formSynonymsEl.value = item?.synonyms || "";
      if (formDescEl) formDescEl.value = item?.description || "";
      if (formOverlayEl) formOverlayEl.hidden = false;
      formNameEl?.focus();
    }

    function closeForm() {
      if (formOverlayEl) formOverlayEl.hidden = true;
      editingId = null;
      setTermDomainPickerOpen(false);
    }

    function saveForm() {
      const name = (formNameEl?.value || "").trim();
      if (!name) {
        window.alert("请填写术语名称");
        formNameEl?.focus();
        return;
      }
      const domains = [...selectedFormDomains];
      if (!domains.length) {
        window.alert("请至少选择一个数据域");
        document.getElementById("termDomainSearch")?.focus();
        return;
      }
      const project = currentProject();
      const dupDomain = domains.find((domain) =>
        terms.some((item) => item.id !== editingId && item.name === name && termHasDomain(item, domain))
      );
      if (dupDomain) {
        window.alert(`数据域「${dupDomain}」下已存在术语「${name}」`);
        return;
      }
      const values = {
        name,
        domains,
        domain: domains.join("、"),
        synonyms: (formSynonymsEl?.value || "").trim(),
        description: (formDescEl?.value || "").trim(),
        project,
      };
      if (editingId) {
        const target = terms.find((item) => item.id === editingId);
        if (!target) {
          setTip("术语不存在或已删除");
          return;
        }
        Object.assign(target, values);
        setTip(`已更新术语：${name}`);
      } else {
        terms.unshift({
          id: createId(),
          ...values,
          online: false,
          creator: "当前用户",
          createdAt: formatDate(),
        });
        setTip(`已创建术语：${name}（默认未上线，上线后可供挂载）`);
      }
      writeTerms(terms);
      closeForm();
      render();
    }

    function deleteByIds(ids) {
      const idSet = new Set(ids);
      const removed = terms.filter((item) => idSet.has(item.id));
      if (!removed.length) return;
      terms = terms.filter((item) => !idSet.has(item.id));
      ids.forEach((id) => selection.delete(id));
      writeTerms(terms);
      render();
    }

    function getLinkedMetrics(termId) {
      const list = global.MetricModule?.readMetrics?.() || [];
      return list.filter((m) => Array.isArray(m.termIds) && m.termIds.includes(termId));
    }

    function getLinkedFields(termId) {
      const map = readFieldTermMap();
      const result = [];
      Object.entries(map).forEach(([key, ids]) => {
        if (!Array.isArray(ids) || !ids.includes(termId)) return;
        const [modelName, fieldEn] = key.split("|");
        result.push({ key, modelName, fieldEn });
      });
      return result;
    }

    function openDetail(termId) {
      const item = terms.find((t) => t.id === termId);
      if (!item || !detailDrawerEl || !detailBodyEl) return;
      if (detailTitleEl) detailTitleEl.textContent = `术语详情 · ${item.name}`;
      const metrics = getLinkedMetrics(item.id);
      const fields = getLinkedFields(item.id);
      detailBodyEl.innerHTML = `
        <div class="bridge-section">
          <h4>基本信息</h4>
          <p><strong>名称：</strong>${escapeHtml(item.name)}</p>
          <p><strong>数据域：</strong>${escapeHtml(item.domain || "—")}</p>
          <p><strong>所属工程：</strong>${escapeHtml(item.project || "—")}</p>
          <p><strong>同义词：</strong>${escapeHtml(item.synonyms || "—")}</p>
          <p><strong>描述：</strong>${escapeHtml(item.description || "—")}</p>
          <p><strong>状态：</strong>${item.online !== false ? "已上线（可供指标/字段挂载）" : "未上线"}</p>
        </div>
        <div class="bridge-section">
          <h4>关联指标清单</h4>
          ${
            metrics.length
              ? `<ul class="term-link-list">${metrics
                  .map(
                    (m) =>
                      `<li><a href="#" data-open-metric="${escapeHtml(m.id)}">${escapeHtml(m.name)}</a> <span class="term-link-meta">${escapeHtml(m.code || "")}</span></li>`
                  )
                  .join("")}</ul>`
              : '<p class="term-link-empty">暂无指标挂载该术语</p>'
          }
        </div>
        <div class="bridge-section">
          <h4>关联字段清单</h4>
          ${
            fields.length
              ? `<ul class="term-link-list">${fields
                  .map(
                    (f) =>
                      `<li><a href="#" data-open-field="${escapeHtml(f.key)}">${escapeHtml(f.modelName)} · ${escapeHtml(f.fieldEn)}</a></li>`
                  )
                  .join("")}</ul>`
              : '<p class="term-link-empty">暂无字段挂载该术语</p>'
          }
        </div>
      `;
      detailDrawerEl.hidden = false;
    }

    function closeDetail() {
      if (detailDrawerEl) detailDrawerEl.hidden = true;
    }

    function setImportStep(step) {
      importStep = step;
      importStepEls().forEach((panel) => {
        panel.hidden = Number(panel.dataset.termImportStepPanel) !== step;
      });
      document.querySelectorAll("[data-term-import-step]").forEach((el) => {
        const n = Number(el.dataset.termImportStep);
        el.classList.toggle("is-active", n === step);
        el.classList.toggle("is-done", n < step);
      });
      if (importPrevBtnEl) importPrevBtnEl.hidden = step <= 1;
      if (importNextBtnEl) {
        importNextBtnEl.textContent = step >= 4 ? "完成并导入" : step === 3 ? "进入确认" : "下一步";
      }
    }

    function setImportFileStatus(message, type = "") {
      if (!importFileStatusEl) return;
      importFileStatusEl.textContent = message;
      importFileStatusEl.classList.remove("is-ok", "is-error");
      if (type === "ok") importFileStatusEl.classList.add("is-ok");
      if (type === "error") importFileStatusEl.classList.add("is-error");
    }

    function applyParsedImport(parsed, meta = {}) {
      const headers = parsed?.headers || [];
      const rows = parsed?.rows || [];
      importRows = rows;
      importSourceText = meta.text || "";
      importSourceName = meta.name || "";
      importSourceFile = meta.file || null;
      if (!csvHasRequiredHeaders(headers)) {
        const missing = CSV_HEADERS.filter((h) => !headers.includes(h));
        setImportFileStatus(
          `已读取「${importSourceName || "文件"}」，但缺少列：${missing.join("、")}。表头需为：${CSV_HEADERS.join("、")}`,
          "error"
        );
        return false;
      }
      if (!rows.length) {
        setImportFileStatus("文件只有表头，没有数据行。请至少填写一行术语。", "error");
        return false;
      }
      setImportFileStatus(`已载入「${importSourceName}」：${rows.length} 行，可点「下一步」。`, "ok");
      return true;
    }

    async function ensureImportRowsFromFile() {
      const file = importFileInputEl?.files?.[0];
      if (!file) return false;
      try {
        const { text, parsed } = await readCsvFile(file);
        return applyParsedImport(parsed, { text, name: file.name, file });
      } catch (_err) {
        setImportFileStatus("读取文件失败，请重新选择 CSV。", "error");
        return false;
      }
    }

    function openImportWizard() {
      importRows = [];
      validatedRows = [];
      importSourceFile = null;
      importSourceText = "";
      importSourceName = "";
      fillDomainSelect(importDomainEl, domainLabels()[0]);
      importModeEls().forEach((el) => {
        el.checked = el.value === "create";
      });
      if (importFileInputEl) importFileInputEl.value = "";
      if (importPreviewBodyEl) importPreviewBodyEl.innerHTML = "";
      if (importSummaryEl) importSummaryEl.textContent = "请先上传 CSV 或使用示例文件";
      setImportFileStatus("尚未载入文件。请选择 CSV，或点「使用示例文件」。");
      setImportStep(1);
      if (importOverlayEl) importOverlayEl.hidden = false;
    }

    function closeImportWizard() {
      if (importOverlayEl) importOverlayEl.hidden = true;
    }

    function validateImportRows(rows, domain, mode, project) {
      const fileNameCount = new Map();
      rows.forEach((row) => {
        const name = String(row["术语名称"] || "").trim();
        if (!name) return;
        fileNameCount.set(name, (fileNameCount.get(name) || 0) + 1);
      });
      return rows.map((row) => {
        const dict = String(row["词典名称"] || "").trim();
        const name = String(row["术语名称"] || "").trim();
        const synonyms = String(row["同义词"] || "").trim();
        const description = String(row["术语描述"] || "").trim();
        const errors = [];
        if (!name) errors.push("术语名称不能为空");
        if (!dict) errors.push("词典名称不能为空");
        if (name && fileNameCount.get(name) > 1) errors.push("CSV 内术语名称重复");
        const existing = terms.find((t) => t.name === name && termHasDomain(t, domain));
        if (mode === "create" && existing) errors.push("数据域内术语已存在（新增模式不可覆盖）");
        const status = errors.length ? "error" : existing && mode === "upsert" ? "update" : "ok";
        return {
          line: row.__line,
          dict,
          name,
          synonyms,
          description,
          domain,
          project: dict || project,
          status,
          errors,
          existingId: existing?.id || null,
        };
      });
    }

    function renderImportPreview() {
      const ok = validatedRows.filter((r) => r.status === "ok").length;
      const update = validatedRows.filter((r) => r.status === "update").length;
      const err = validatedRows.filter((r) => r.status === "error").length;
      if (importSummaryEl) {
        importSummaryEl.textContent = `共 ${validatedRows.length} 行：可新增 ${ok}，将更新 ${update}，失败 ${err}`;
      }
      if (!importPreviewBodyEl) return;
      importPreviewBodyEl.innerHTML = validatedRows
        .map(
          (r) => `
        <tr class="${r.status === "error" ? "is-import-error" : ""}">
          <td>${r.line}</td>
          <td>${escapeHtml(r.name || "—")}</td>
          <td>${escapeHtml(r.synonyms || "—")}</td>
          <td>${escapeHtml(r.description || "—")}</td>
          <td>${r.status === "error" ? "失败" : r.status === "update" ? "更新" : "新增"}</td>
          <td class="import-error-cell">${r.errors.length ? escapeHtml(r.errors.join("；")) : "—"}</td>
        </tr>
      `
        )
        .join("");
    }

    function applyImport() {
      const domain = importDomainEl?.value || domainLabels()[0];
      const mode = importModeEls().find((el) => el.checked)?.value || "create";
      const project = currentProject();
      const passRows = validatedRows.filter((r) => r.status !== "error");
      if (!passRows.length) {
        if (importSummaryEl) {
          importSummaryEl.textContent = "没有可导入的合法行，请返回预览检查失败原因。";
        }
        setTip("没有可导入的合法行");
        return false;
      }
      if (mode === "replace") {
        terms = terms.filter((t) => !termHasDomain(t, domain));
      }
      let added = 0;
      let updated = 0;
      passRows.forEach((row) => {
        const rowProject = row.project || row.dict || project;
        if (row.existingId && (mode === "upsert" || mode === "replace")) {
          const target = terms.find((t) => t.id === row.existingId);
          if (target) {
            target.synonyms = row.synonyms;
            target.description = row.description;
            target.project = rowProject;
            if (!termHasDomain(target, domain)) {
              target.domains = [...termDomainList(target), domain];
              target.domain = target.domains.join("、");
            }
            updated += 1;
            return;
          }
        }
        if (mode === "create" && row.existingId) return;
        const existedAfter = terms.find((t) => t.name === row.name && termHasDomain(t, domain));
        if (existedAfter && mode === "upsert") {
          existedAfter.synonyms = row.synonyms;
          existedAfter.description = row.description;
          existedAfter.project = rowProject;
          updated += 1;
          return;
        }
        if (existedAfter && mode === "create") return;
        terms.unshift({
          id: createId(),
          name: row.name,
          synonyms: row.synonyms,
          description: row.description,
          domains: [domain],
          domain,
          project: rowProject,
          online: false,
          creator: "当前用户",
          createdAt: formatDate(),
        });
        added += 1;
      });
      writeTerms(terms);
      render();
      const onImportDocument = typeof deps.onImportDocument === "function" ? deps.onImportDocument : null;
      if (onImportDocument && (importSourceFile || importSourceText || importSourceName)) {
        onImportDocument({
          file: importSourceFile,
          text: importSourceText,
          name: importSourceName || importSourceFile?.name || "术语导入.csv",
          domain,
          project,
          added,
          updated,
        });
      }
      setTip(`导入完成：新增 ${added}，更新 ${updated}；新导入默认未上线，请在列表中上线后挂载`);
      return true;
    }

    async function handleImportNext() {
      if (importStep === 1) {
        if (!importRows.length) {
          const hasFile = Boolean(importFileInputEl?.files?.[0]);
          if (hasFile) {
            setImportFileStatus("正在读取文件…");
            const ok = await ensureImportRowsFromFile();
            if (!ok) return;
          } else {
            setImportFileStatus("请先选择 CSV 文件，或点「使用示例文件」。", "error");
            return;
          }
        }
        const headers = Object.keys(importRows[0] || {}).filter((k) => k !== "__line");
        const missing = CSV_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length) {
          setImportFileStatus(`CSV 缺少列：${missing.join("、")}。表头需为：${CSV_HEADERS.join("、")}`, "error");
          return;
        }
        setImportStep(2);
        return;
      }
      if (importStep === 2) {
        const domain = importDomainEl?.value || domainLabels()[0];
        const mode = importModeEls().find((el) => el.checked)?.value || "create";
        validatedRows = validateImportRows(importRows, domain, mode, currentProject());
        renderImportPreview();
        setImportStep(3);
        return;
      }
      if (importStep === 3) {
        setImportStep(4);
        return;
      }
      if (importStep === 4) {
        if (applyImport()) closeImportWizard();
      }
    }

    createBtnEl?.addEventListener("click", () => openForm(null));
    templateBtnEl?.addEventListener("click", () => {
      const content = [CSV_HEADERS.join(","), `${currentProject()},示例术语,"同义词1,同义词2",术语业务定义说明`].join("\n");
      downloadCsv("术语导入模板.csv", content);
      setTip("已下载标准 CSV 模板");
    });
    importBtnEl?.addEventListener("click", openImportWizard);
    importCloseBtnEl?.addEventListener("click", closeImportWizard);
    importCancelBtnEl?.addEventListener("click", closeImportWizard);
    importPrevBtnEl?.addEventListener("click", () => {
      if (importStep > 1) setImportStep(importStep - 1);
    });
    importNextBtnEl?.addEventListener("click", () => {
      void handleImportNext();
    });
    importUseSampleBtnEl?.addEventListener("click", () => {
      const text = sampleCsvText(currentProject());
      const parsed = parseCsvText(text);
      applyParsedImport(parsed, {
        text,
        name: "术语导入示例.csv",
        file: new File([`\uFEFF${text}`], "术语导入示例.csv", { type: "text/csv" }),
      });
      if (importFileInputEl) importFileInputEl.value = "";
    });
    importFileInputEl?.addEventListener("change", () => {
      void (async () => {
        const file = importFileInputEl.files?.[0];
        if (!file) {
          importRows = [];
          setImportFileStatus("尚未载入文件。请选择 CSV，或点「使用示例文件」。");
          return;
        }
        setImportFileStatus(`正在读取「${file.name}」…`);
        try {
          const { text, parsed } = await readCsvFile(file);
          applyParsedImport(parsed, { text, name: file.name, file });
        } catch (_err) {
          importRows = [];
          setImportFileStatus("读取文件失败，请重新选择 CSV。", "error");
        }
      })();
    });
    importOverlayEl?.addEventListener("click", (event) => {
      if (event.target === importOverlayEl) closeImportWizard();
    });

    selectAllEl?.addEventListener("change", () => {
      const checked = Boolean(selectAllEl.checked);
      getFiltered().forEach((item) => {
        if (checked) selection.add(item.id);
        else selection.delete(item.id);
      });
      render();
    });
    searchEl?.addEventListener("input", render);
    tableBodyEl?.addEventListener("change", (event) => {
      const check = event.target.closest(".term-row-check");
      if (!check) return;
      if (check.checked) selection.add(check.dataset.id);
      else selection.delete(check.dataset.id);
      syncSelectionUi();
    });
    tableBodyEl?.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-term-action]");
      if (!actionBtn) return;
      event.preventDefault();
      const { id, termAction: action } = actionBtn.dataset;
      const item = terms.find((row) => row.id === id);
      if (!item) return;
      if (action === "detail") openDetail(id);
      if (action === "edit") openForm(item);
      if (action === "online") {
        item.online = item.online === false;
        writeTerms(terms);
        render();
        setTip(
          item.online !== false
            ? `术语「${item.name}」已上线，可供指标/字段挂载`
            : `术语「${item.name}」已下线，暂不可挂载`
        );
      }
      if (action === "delete") {
        if (!window.confirm(`确定删除术语「${item.name}」吗？`)) return;
        deleteByIds([id]);
        setTip(`已删除术语：${item.name}`);
      }
    });
    formSaveBtnEl?.addEventListener("click", saveForm);
    formCancelBtnEl?.addEventListener("click", closeForm);
    formCloseBtnEl?.addEventListener("click", closeForm);
    formOverlayEl?.addEventListener("click", (event) => {
      if (event.target === formOverlayEl) closeForm();
    });
    detailCloseBtnEl?.addEventListener("click", closeDetail);
    detailBodyEl?.addEventListener("click", (event) => {
      const metricLink = event.target.closest("[data-open-metric]");
      if (metricLink) {
        event.preventDefault();
        closeDetail();
        openMetricById?.(metricLink.dataset.openMetric);
        return;
      }
      const fieldLink = event.target.closest("[data-open-field]");
      if (fieldLink) {
        event.preventDefault();
        closeDetail();
        openFieldByKey?.(fieldLink.dataset.openField);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (importOverlayEl && !importOverlayEl.hidden) closeImportWizard();
      else if (formOverlayEl && !formOverlayEl.hidden) closeForm();
      else if (detailDrawerEl && !detailDrawerEl.hidden) closeDetail();
    });

    bindTermDomainPicker();
    render();

    return {
      render,
      readTerms: () => [...terms],
      readOnlineTerms: (project) =>
        terms.filter(
          (item) =>
            item.online !== false &&
            (!project || !item.project || item.project === project)
        ),
      getSelectedIds() {
        const visible = new Set(getFiltered().map((item) => item.id));
        return [...selection].filter((id) => visible.has(id));
      },
      batchMoveDomain(ids, domain) {
        const idSet = new Set(ids || []);
        let count = 0;
        terms.forEach((item) => {
          if (!idSet.has(item.id)) return;
          item.domains = [domain];
          item.domain = domain;
          count += 1;
        });
        writeTerms(terms);
        render();
        setTip(`已将 ${count} 条术语移动到数据域「${domain}」`);
      },
      batchSetOnline(ids, online) {
        const idSet = new Set(ids || []);
        let count = 0;
        terms.forEach((item) => {
          if (!idSet.has(item.id)) return;
          item.online = Boolean(online);
          count += 1;
        });
        writeTerms(terms);
        render();
        setTip(`已将 ${count} 条术语${online ? "上线" : "下线"}`);
      },
      batchDelete(ids) {
        deleteByIds(ids || []);
        setTip(`已处理批量删除`);
      },
      setDomainFilter(value) {
        domainFilter = value || "";
        render();
      },
      openDetail,
      getTermById: (id) => terms.find((t) => t.id === id) || null,
      readFieldTermMap,
      writeFieldTermMap,
      fieldTermKey,
      DEFAULT_PROJECT,
    };
  }

  global.TermModule = {
    mount,
    readTerms: () => readTerms() || [],
    readOnlineTerms: (project) =>
      (readTerms() || []).filter(
        (item) => item.online !== false && (!project || !item.project || item.project === project)
      ),
    readFieldTermMap,
    writeFieldTermMap,
    fieldTermKey,
    DEFAULT_PROJECT,
  };
})(window);
