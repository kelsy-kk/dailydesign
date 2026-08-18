/**
 * 智能问数 - 问数引擎
 * 业务模型、意图识别、语义解析、Mock 数据与回答编排
 */
(function initQueryEngine(global) {
  /** 原型：模型面板固定生成 8 个业务模型，每个模型仅挂 1 个数据集 */
  function makeSimpleDataset(cfg) {
    return {
      id: cfg.id,
      name: cfg.name,
      domain: cfg.domain,
      description: cfg.description,
      keywords: cfg.keywords || [],
      dimensions: cfg.dimensions || [
        { name: "统计月份", dataType: "string", synonyms: ["月份", "业务月"], description: "业务统计月份。" },
        { name: "组织名称", dataType: "string", synonyms: ["部门", "单位"], description: "业务归属组织。" },
      ],
      measures: cfg.measures || [
        { name: "记录数", dataType: "number", synonyms: ["条数", "数量"], description: "业务记录条数。" },
      ],
      metrics: cfg.metrics || [
        { name: "金额合计", dataType: "number", synonyms: ["金额", "总额"], description: "金额类指标合计。" },
      ],
    };
  }

  function makeSimpleModel(cfg) {
    return {
      id: cfg.id,
      name: cfg.name,
      description: cfg.description,
      catalog: cfg.catalog || "domain",
      relations: [],
      datasets: [makeSimpleDataset(cfg.dataset)],
    };
  }

  const BUSINESS_MODEL = {
    id: "model-retail-analytics",
    name: "零售经营分析模型",
    description: "覆盖门店咖啡销售经营分析。",
    catalog: "domain",
    relations: [],
    datasets: [
      {
        id: "ds-coffee-sales",
        name: "全国2025年咖啡销售数据",
        domain: "sales",
        description: "门店级咖啡销售事实表，支持按时间、区域、产品分析销量与金额。",
        keywords: ["咖啡", "销售", "门店", "产品", "销量", "订单", "区域"],
        dimensions: [
          { name: "交易月份", dataType: "string", synonyms: ["月份", "业务月", "按月", "各月", "每月"], description: "按交易发生时间归集的月份维度，用于趋势分析。" },
          { name: "产品种类", dataType: "string", synonyms: ["品类", "商品类别", "产品", "咖啡种类"], description: "咖啡产品分类，如美式、拿铁、卡布奇诺等。" },
          { name: "区域名称", dataType: "string", synonyms: ["区域", "大区", "地区", "省份"], description: "门店所属销售区域。" },
          { name: "门店编号", dataType: "string", synonyms: ["门店ID", "店铺编号", "门店"], description: "门店唯一标识。" },
        ],
        measures: [
          { name: "销售量", dataType: "number", synonyms: ["销量", "销售数量", "杯数"], description: "商品销售总杯数，可按多维度汇总。" },
        ],
        metrics: [
          { name: "订单金额", dataType: "number", synonyms: ["销售额", "营收", "GMV", "成交金额"], description: "订单实际成交金额合计。" },
        ],
      },
    ],
  };

  const CONSTRUCTION_MATERIAL_MODEL = {
    id: "model-construction-material",
    name: "建筑行业物料台账模型",
    description: "覆盖建筑物料入库台账问数。",
    catalog: "domain",
    relations: [],
    datasets: [
      {
        id: "ds-cm-inbound",
        name: "入库台账",
        domain: "cm-inbound",
        description: "材料入库流水，支持按项目、物料、供应商分析入库数量与金额。",
        keywords: ["入库", "到货", "收料", "进场", "采购入库", "物料", "项目"],
        dimensions: [
          { name: "入库单号", dataType: "string", synonyms: ["单号", "收料单号"], description: "入库业务单号。" },
          { name: "入库日期", dataType: "date", synonyms: ["到货日期", "收料日期"], description: "材料入库日期。" },
          { name: "物料编码", dataType: "string", synonyms: ["材料编码", "物料号"], description: "入库物料编码。" },
          { name: "项目编号", dataType: "string", synonyms: ["工程编号", "项目代码"], description: "入库所属项目编号。" },
          { name: "供应商编码", dataType: "string", synonyms: ["供方编码"], description: "供货供应商编码。" },
          { name: "仓库编号", dataType: "string", synonyms: ["库房编号"], description: "入库仓库编号。" },
        ],
        measures: [],
        metrics: [
          { name: "入库数量", dataType: "number", synonyms: ["到货数量", "收料数量"], description: "入库材料数量。" },
          { name: "入库金额", dataType: "number", synonyms: ["到货金额", "进价金额"], description: "入库材料金额合计。" },
        ],
      },
    ],
  };

  const EXTRA_BUSINESS_MODELS = [
    makeSimpleModel({
      id: "model-project-cost",
      name: "项目成本分析模型",
      description: "工程项目成本归集与超支分析。",
      dataset: {
        id: "ds-project-cost",
        name: "项目成本明细",
        domain: "project-cost",
        description: "按项目归集的成本发生明细。",
        keywords: ["成本", "项目", "预算", "超支"],
        dimensions: [
          { name: "项目名称", dataType: "string", synonyms: ["工程名称", "项目"], description: "成本归属项目。" },
          { name: "成本科目", dataType: "string", synonyms: ["科目", "费用类型"], description: "人工、材料、机械等科目。" },
          { name: "统计月份", dataType: "string", synonyms: ["月份"], description: "成本入账月份。" },
        ],
        measures: [{ name: "成本笔数", dataType: "number", synonyms: ["笔数"], description: "成本明细笔数。" }],
        metrics: [
          { name: "成本金额", dataType: "number", synonyms: ["发生额", "费用"], description: "成本发生金额。" },
          { name: "预算金额", dataType: "number", synonyms: ["预算"], description: "对应科目预算金额。" },
        ],
      },
    }),
    makeSimpleModel({
      id: "model-hr-efficiency",
      name: "人力资源效能模型",
      description: "组织人力投入与效能分析。",
      dataset: {
        id: "ds-hr-attendance",
        name: "员工考勤绩效",
        domain: "hr",
        description: "员工出勤与绩效评分数据集。",
        keywords: ["人力", "考勤", "绩效", "员工"],
        dimensions: [
          { name: "部门名称", dataType: "string", synonyms: ["部门", "组织"], description: "员工所属部门。" },
          { name: "岗位名称", dataType: "string", synonyms: ["岗位", "职位"], description: "员工岗位。" },
          { name: "统计月份", dataType: "string", synonyms: ["月份"], description: "考勤统计月份。" },
        ],
        measures: [{ name: "出勤天数", dataType: "number", synonyms: ["出勤"], description: "月度出勤天数。" }],
        metrics: [
          { name: "绩效得分", dataType: "number", synonyms: ["绩效", "评分"], description: "月度绩效得分。" },
          { name: "加班时长", dataType: "number", synonyms: ["加班小时"], description: "月度加班小时数。" },
        ],
      },
    }),
    makeSimpleModel({
      id: "model-procurement",
      name: "供应链采购模型",
      description: "采购订单与到货执行分析。",
      dataset: {
        id: "ds-purchase-order",
        name: "采购订单明细",
        domain: "procurement",
        description: "采购订单执行与到货情况。",
        keywords: ["采购", "订单", "供应商", "到货"],
        dimensions: [
          { name: "供应商名称", dataType: "string", synonyms: ["供应商", "供方"], description: "采购供应商。" },
          { name: "物资品类", dataType: "string", synonyms: ["品类", "物资"], description: "采购物资分类。" },
          { name: "下单日期", dataType: "date", synonyms: ["采购日期"], description: "采购订单日期。" },
        ],
        measures: [{ name: "订单数量", dataType: "number", synonyms: ["采购量"], description: "采购下单数量。" }],
        metrics: [
          { name: "采购金额", dataType: "number", synonyms: ["订单金额"], description: "采购订单金额。" },
          { name: "到货及时率", dataType: "number", synonyms: ["及时率"], description: "按期到货占比。" },
        ],
      },
    }),
    makeSimpleModel({
      id: "model-quality-inspect",
      name: "工程质量巡检模型",
      description: "现场质量检查与整改跟踪。",
      dataset: {
        id: "ds-quality-check",
        name: "质量检查记录",
        domain: "quality",
        description: "工程质量巡检问题与整改记录。",
        keywords: ["质量", "巡检", "整改", "隐患"],
        dimensions: [
          { name: "项目名称", dataType: "string", synonyms: ["工程", "项目"], description: "巡检所属项目。" },
          { name: "检查部位", dataType: "string", synonyms: ["部位", "工序"], description: "检查部位或工序。" },
          { name: "问题等级", dataType: "string", synonyms: ["等级", "严重程度"], description: "一般、较大、重大。" },
        ],
        measures: [{ name: "问题数", dataType: "number", synonyms: ["隐患数"], description: "发现问题数量。" }],
        metrics: [
          { name: "整改完成率", dataType: "number", synonyms: ["闭环率"], description: "已整改问题占比。" },
        ],
      },
    }),
    makeSimpleModel({
      id: "model-equipment-ops",
      name: "设备资产运维模型",
      description: "施工设备台账与维保分析。",
      dataset: {
        id: "ds-equipment-ledger",
        name: "设备运维台账",
        domain: "equipment",
        description: "设备资产状态与维保费用。",
        keywords: ["设备", "资产", "维保", "故障"],
        dimensions: [
          { name: "设备名称", dataType: "string", synonyms: ["设备", "机械"], description: "设备名称。" },
          { name: "使用项目", dataType: "string", synonyms: ["项目"], description: "设备当前使用项目。" },
          { name: "设备状态", dataType: "string", synonyms: ["状态"], description: "在用、闲置、维修。" },
        ],
        measures: [{ name: "设备台数", dataType: "number", synonyms: ["台数"], description: "设备数量。" }],
        metrics: [
          { name: "维保费用", dataType: "number", synonyms: ["维修费"], description: "维保费用合计。" },
          { name: "故障次数", dataType: "number", synonyms: ["故障数"], description: "周期内故障次数。" },
        ],
      },
    }),
    makeSimpleModel({
      id: "model-receivable",
      name: "合同经营分析模型",
      description: "合同签订与回款经营分析。",
      dataset: {
        id: "ds-contract",
        name: "合同台账数据集",
        domain: "contract",
        description: "合同签订与回款台账，支持按部门、省份、客户分析合同额。",
        keywords: ["合同", "签约", "签订", "部门", "省份", "客户", "回款"],
        dimensions: [
          { name: "部门名称", dataType: "string", synonyms: ["部门", "事业部", "组织"], description: "合同归属部门。" },
          { name: "省份", dataType: "string", synonyms: ["省", "省级"], description: "合同所属省份。" },
          { name: "签订日期", dataType: "date", synonyms: ["签约日期", "合同日期"], description: "合同正式签订日期。" },
          { name: "客户名称", dataType: "string", synonyms: ["客户", "甲方", "签约客户"], description: "合同签约客户。" },
        ],
        measures: [],
        metrics: [
          { name: "合同额", dataType: "number", synonyms: ["合同金额", "签约额"], description: "统计周期内按签订日期归属的合同金额。" },
          { name: "回款金额", dataType: "number", synonyms: ["已回款", "到账金额"], description: "合同已回款金额合计。" },
        ],
      },
    }),
  ];

  const BUSINESS_MODELS = [BUSINESS_MODEL, CONSTRUCTION_MATERIAL_MODEL, ...EXTRA_BUSINESS_MODELS];

  function makeCatalogSource(cfg) {
    return {
      id: cfg.id,
      name: cfg.name,
      sourceKind: cfg.sourceKind || "dataset",
      domain: cfg.domain || "",
      description: cfg.description || "",
      keywords: cfg.keywords || [],
      dimensions: cfg.dimensions || [],
      measures: cfg.measures || [],
      metrics: cfg.metrics || [],
    };
  }

  function makeCatalogModel(cfg) {
    return {
      id: cfg.id,
      name: cfg.name,
      description: cfg.description || "",
      catalog: cfg.catalog,
      relations: [],
      datasets: (cfg.sources || []).map(makeCatalogSource),
    };
  }

  /** 基础模型：主数据表/视图，部分仅到二级（无指标/维度） */
  const BASE_MODELS = [
    makeCatalogModel({
      catalog: "base",
      id: "base-org",
      name: "组织主数据",
      description: "组织与部门基础信息。",
      sources: [{
        id: "tbl-org",
        name: "组织表",
        sourceKind: "table",
        domain: "org",
        keywords: ["组织", "部门"],
        dimensions: [
          { name: "组织编码", dataType: "string", synonyms: ["部门编码"], description: "组织唯一编码。" },
          { name: "组织名称", dataType: "string", synonyms: ["部门名称"], description: "组织显示名称。" },
        ],
        metrics: [],
      }],
    }),
    makeCatalogModel({
      catalog: "base",
      id: "base-user",
      name: "用户主数据",
      description: "平台用户账号主数据。",
      sources: [{
        id: "vw-user",
        name: "用户视图",
        sourceKind: "view",
        domain: "user",
        keywords: ["用户", "账号"],
        dimensions: [
          { name: "用户账号", dataType: "string", synonyms: ["账号", "登录名"], description: "登录账号。" },
          { name: "所属组织", dataType: "string", synonyms: ["组织"], description: "用户所属组织。" },
        ],
        metrics: [],
      }],
    }),
    makeCatalogModel({
      catalog: "base",
      id: "base-project-master",
      name: "项目主数据",
      description: "工程项目基础台账，当前未配置指标与维度。",
      sources: [{
        id: "tbl-project-master",
        name: "项目主数据表",
        sourceKind: "table",
        domain: "project",
        keywords: ["项目"],
      }],
    }),
    makeCatalogModel({
      catalog: "base",
      id: "base-material",
      name: "物料主数据",
      description: "物料编码与品类主数据。",
      sources: [{
        id: "tbl-material",
        name: "物料主数据表",
        sourceKind: "table",
        domain: "material",
        keywords: ["物料"],
        dimensions: [
          { name: "物料编码", dataType: "string", synonyms: ["料号"], description: "物料唯一编码。" },
          { name: "物料名称", dataType: "string", synonyms: ["材料名称"], description: "物料名称。" },
          { name: "物料品类", dataType: "string", synonyms: ["品类"], description: "物料分类。" },
        ],
        metrics: [
          { name: "标准单价", dataType: "number", synonyms: ["单价"], description: "物料标准单价。" },
        ],
      }],
    }),
    makeCatalogModel({
      catalog: "base",
      id: "base-supplier",
      name: "供应商主数据",
      description: "供应商基础信息，当前未配置字段。",
      sources: [{
        id: "tbl-supplier",
        name: "供应商表",
        sourceKind: "table",
        domain: "supplier",
        keywords: ["供应商"],
      }],
    }),
  ];

  /** PML 业务对象：对象级模型，部分仅到二级 */
  const PML_MODELS = [
    makeCatalogModel({
      catalog: "pml",
      id: "pml-contract-obj",
      name: "合同对象",
      description: "PML 合同业务对象。",
      sources: [{
        id: "vw-pml-contract",
        name: "合同对象视图",
        sourceKind: "view",
        domain: "pml-contract",
        keywords: ["合同对象"],
        dimensions: [
          { name: "合同编号", dataType: "string", synonyms: ["合同号"], description: "合同对象编号。" },
          { name: "合同类型", dataType: "string", synonyms: ["类型"], description: "合同业务类型。" },
        ],
        metrics: [
          { name: "合同额", dataType: "number", synonyms: ["金额"], description: "合同对象金额。" },
        ],
      }],
    }),
    makeCatalogModel({
      catalog: "pml",
      id: "pml-project-obj",
      name: "项目对象",
      description: "PML 项目业务对象，当前未配置指标与维度。",
      sources: [{
        id: "tbl-pml-project",
        name: "项目对象表",
        sourceKind: "table",
        domain: "pml-project",
        keywords: ["项目对象"],
      }],
    }),
    makeCatalogModel({
      catalog: "pml",
      id: "pml-wbs",
      name: "WBS",
      description: "工程分解结构对象。",
      sources: [{
        id: "ds-pml-wbs",
        name: "WBS数据集",
        sourceKind: "dataset",
        domain: "pml-wbs",
        keywords: ["WBS", "分解结构"],
        dimensions: [
          { name: "WBS编码", dataType: "string", synonyms: ["节点编码"], description: "WBS 节点编码。" },
          { name: "WBS名称", dataType: "string", synonyms: ["节点名称"], description: "WBS 节点名称。" },
        ],
        metrics: [],
      }],
    }),
    makeCatalogModel({
      catalog: "pml",
      id: "pml-boq",
      name: "工程量清单",
      description: "清单项对象，当前未配置字段。",
      sources: [{
        id: "tbl-pml-boq",
        name: "工程量清单表",
        sourceKind: "table",
        domain: "pml-boq",
        keywords: ["清单", "工程量"],
      }],
    }),
  ];

  const PANEL_CATALOG_TABS = [
    { key: "domain", label: "域模型" },
    { key: "base", label: "基础模型" },
    { key: "pml", label: "PML业务对象" },
  ];

  function getAllModels() {
    return [...BUSINESS_MODELS, ...BASE_MODELS, ...PML_MODELS];
  }

  function getModelsByCatalog(catalog) {
    return getAllModels().filter((m) => (m.catalog || "domain") === catalog);
  }

  function getModelById(modelId) {
    return getAllModels().find((m) => m.id === modelId) || BUSINESS_MODEL;
  }

  function getModelForDataset(datasetId) {
    return BUSINESS_MODELS.find((m) => m.datasets.some((ds) => ds.id === datasetId)) || BUSINESS_MODEL;
  }

  function getAllDatasets() {
    return BUSINESS_MODELS.flatMap((model) => model.datasets.map((ds) => ({ ds, model })));
  }

  function buildJoinHint(field) {
    if (!field?.joins?.length) return "";
    return field.joins.map((j) => `→${j.datasetName}·${j.field}`).join("；");
  }

  const INTENT_RULES = [
    { intent: "greeting", priority: 100, patterns: [/^(你好|您好|嗨|hi|hello|早上好|下午好|晚上好)[!！?？。\s]*$/i] },
    { intent: "help_usage", priority: 95, patterns: [/怎么用|如何使用|能做什么|可以问什么|使用帮助|功能介绍|问数案例|帮助说明/] },
    { intent: "metadata_model", priority: 90, patterns: [/都有哪些模型|有哪些模型|什么模型|业务模型|模型列表|模型有哪些|几个模型/] },
    { intent: "metadata_dataset", priority: 88, patterns: [/有哪些数据集|数据集列表|都有哪些数据(表|集)|数据表有哪些|包含哪些数据/] },
    { intent: "metadata_dimension", priority: 86, patterns: [/都有哪些维度|有哪些维度|维度有哪些|可分析.*维度|维度列表|什么维度|维度包含/] },
    { intent: "metadata_metric", priority: 84, patterns: [/都有哪些指标|有哪些指标|指标有哪些|指标列表|什么指标|业务指标/] },
    { intent: "metadata_measure", priority: 82, patterns: [/都有哪些度量|有哪些度量|度量有哪些|度量列表|什么度量/] },
    { intent: "metadata_definition", priority: 80, patterns: [/什么是|是什么|什么意思|口径|怎么算|如何计算|如何统计|解释一下|定义是什么|含义是什么/] },
    { intent: "analytical_compare", priority: 75, patterns: [/对比|比较|vs|VS|相比|差异|对照|比对/] },
    { intent: "analytical_ratio", priority: 73, patterns: [/占比|比例|百分比|份额|占总|比重|占有率/] },
    { intent: "analytical_detail", priority: 72, patterns: [/明细|详细数据|列出.*数据|全部数据|原始数据|数据清单|逐条|清单/] },
    { intent: "analytical_trend", priority: 70, patterns: [/趋势|走势|变化|环比|同比|增长|下降|波动|发展情况/] },
    { intent: "analytical_rank", priority: 68, patterns: [/排名|排行|最高|最低|Top\s*\d+|前\s*\d+|后\s*\d+|最多|最少|哪(个|些).*(最|第一|靠前)/] },
    { intent: "analytical_kpi", priority: 66, patterns: [/总共|一共|合计|总计|总量|总共有多少|一共有多少|总共多少/] },
    { intent: "analytical_aggregate", priority: 50, patterns: [/查|统计|汇总|分析|按|各|每|分组|查看|帮我|多少|数据/] },
  ];

  const INTENT_LABELS = {
    greeting: "问候",
    help_usage: "使用帮助",
    metadata_model: "看模型",
    metadata_dataset: "看数据集",
    metadata_dimension: "看维度",
    metadata_metric: "看指标",
    metadata_measure: "看度量",
    metadata_definition: "口径解释",
    analytical_aggregate: "看数值",
    analytical_detail: "看明细",
    analytical_trend: "趋势分析",
    analytical_rank: "排名分析",
    analytical_compare: "对比分析",
    analytical_ratio: "占比分析",
    analytical_kpi: "指标汇总",
    needs_clarification: "待您确认",
    out_of_scope: "暂无法回答",
    guidance: "操作引导",
  };

  const RESULT_PIPELINES = {
    greeting: ["question", "guidance", "footer"],
    help_usage: ["question", "guidance", "footer"],
    metadata_model: ["question", "source", "model-list", "footer"],
    metadata_dataset: ["question", "source", "model-list", "footer"],
    metadata_dimension: ["question", "source", "dimension-list", "footer"],
    metadata_metric: ["question", "source", "metric-list", "footer"],
    metadata_measure: ["question", "source", "metric-list", "footer"],
    metadata_definition: ["question", "source", "definition-list", "footer"],
    needs_clarification: ["question", "source", "choice", "footer"],
    out_of_scope: ["question", "guidance", "footer"],
    guidance: ["question", "guidance", "footer"],
    analytical_aggregate: ["question", "source", "sql", "data", "footer"],
    analytical_detail: ["question", "source", "sql", "data", "footer"],
    analytical_trend: ["question", "source", "sql", "data", "footer"],
    analytical_rank: ["question", "source", "sql", "data", "footer"],
    analytical_compare: ["question", "source", "sql", "compare", "footer"],
    analytical_ratio: ["question", "source", "sql", "data", "footer"],
    analytical_kpi: ["question", "source", "sql", "kpi", "footer"],
  };

  const RELATED_BY_INTENT = {
    greeting: ["都有哪些维度？", "今年各月销售趋势如何", "帮我查一下今年每个部门的合同额"],
    help_usage: ["都有哪些模型？", "都有哪些指标？", "按区域名称统计订单金额"],
    metadata_model: [
      "建筑行业物料台账有哪些数据集？",
      "查询今年各项目中，入库金额超过该物料全公司平均入库金额2倍的物料有哪些？",
      "有哪些数据集？",
      "都有哪些维度？",
      "都有哪些指标？",
    ],
    analytical_aggregate: [
      "按项目统计入库金额",
      "查询今年各项目中，入库金额超过该物料全公司平均入库金额2倍的物料有哪些？",
      "统计各物料分类下，本年入库金额排名前3的供应商及其供货项目数量",
      "按区域名称统计订单金额",
      "帮我查一下今年每个部门的合同额",
      "产品种类与订单金额交叉分析",
    ],
    metadata_dataset: ["都有哪些维度？", "每交易时间按月、产品种类、销售量", "合同台账有哪些指标？"],
    metadata_dimension: ["都有哪些指标？", "按产品种类查看销售量趋势", "库存数据有哪些维度？"],
    metadata_metric: ["都有哪些维度？", "各月份咖啡销售额对比", "客户经营数据集有哪些指标？"],
    metadata_measure: ["都有哪些指标？", "门店库存数量汇总", "销售量是什么意思？"],
    metadata_definition: ["合同额怎么算？", "都有哪些指标？", "按部门统计合同额"],
    needs_clarification: ["帮我查一下今年每个部门的合同额", "按省份查看合同额", "今年合同额一共多少"],
    out_of_scope: ["都有哪些维度？", "按产品种类查看销售量", "帮我查今年各部门合同额"],
    analytical_detail: ["列出咖啡销售全部明细", "合同台账明细数据", "门店库存明细"],
    analytical_trend: ["近六个月销售量环比变化", "签订日期维度的合同金额趋势", "客户复购率趋势"],
    analytical_rank: ["销售量最高的产品种类是哪些", "各区域门店销售排名", "合同额最高的五个省份"],
    analytical_compare: ["美式咖啡与拿铁的销售量对比", "今年和去年合同额对比", "华东与华南订单金额对比"],
    analytical_ratio: ["各产品种类销售量占比", "各部门合同额占总量比例", "会员等级客户数占比"],
    analytical_kpi: ["今年合同额一共多少", "全国咖啡销售总量", "当前库存总金额是多少"],
  };

  /** 建筑行业物料台账 - 偏复杂、含多表关联/子查询语义的推荐问法 */
  const CONSTRUCTION_MATERIAL_RECOMMEND_QUESTIONS = [
    "查询今年各项目中，入库金额超过该物料全公司平均入库金额2倍的物料有哪些？",
    "哪些项目存在出库金额大于同项目同物料入库金额50%的领用情况？",
    "统计各物料分类下，本年入库金额排名前3的供应商及其供货项目数量",
    "查找最新库存快照中，库存金额高于所在省份其他项目平均库存金额的项目与物料",
    "哪些物料在本年仅有出库记录、却没有对应入库记录（异常耗用）？",
    "按承建单位汇总：仅统计存在入库且关联物料主数据标准单价高于500元的项目入库金额",
    "各供应商供应的物料中，哪些物料入库金额占该供应商总入库额超过30%？",
    "查询入库金额处于全部项目前10%分位的高额物料及其所属项目、供应商",
    "对比各项目钢筋类物料的累计入库量与累计出库量，筛出出库大于入库的项目清单",
    "哪些项目工地的库存金额超过该项目本年累计入库金额的80%（子查询对比）？",
    "按项目编号统计：领用出库数量大于同项目同物料平均月度入库量的物料明细",
    "查询同时出现在入库台账、出库台账与库存台账且三表物料编码一致的组合数据",
  ];

  const RECOMMEND_QUESTION_POOL = [
    "都有哪些模型？", "有哪些数据集？", "都有哪些维度？", "都有哪些指标？", "都有哪些度量？",
    "合同额是什么意思？", "销售量怎么算？",
    "每交易时间按月、产品种类、销售量", "各月份咖啡销售额对比", "销售量最高的产品种类是哪些",
    "按区域名称统计订单金额", "今年各月销售趋势如何", "帮我查一下今年每个部门的合同额",
    "帮我查一下今年每个省份的合同额", "今年合同额一共多少", "各产品种类销售量占比",
    "美式咖啡与拿铁的销售量对比", "列出咖啡销售全部明细", "门店库存数量按原料品类汇总",
    "客户复购率按月份趋势", "合同额最高的五个省份", "库存周转天数按门店排名",
    "会员等级客户数占比", "近六个月销售量环比变化", "华东与华南订单金额对比",
    "建筑行业物料台账有哪些数据集？", "按项目统计入库金额", "各物料分类库存数量",
    "入库台账与物料主数据关联查询", "按承建单位查看出库数量", "项目工地台账有哪些关联字段？",
    ...CONSTRUCTION_MATERIAL_RECOMMEND_QUESTIONS,
  ];

  const MOCK_ENUMS = {
    products: ["美式咖啡", "拿铁", "卡布奇诺", "摩卡", "冷萃"],
    months: ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"],
    regions: ["华北", "华东", "华南", "西南"],
    departments: ["销售一部", "销售二部", "市场部", "研发部", "运营部"],
    provinces: ["北京", "上海", "广东", "浙江", "江苏", "四川", "湖北"],
    materials: ["咖啡豆", "牛奶", "糖浆", "纸杯", "杯盖"],
    customerLevels: ["普通会员", "银卡会员", "金卡会员", "钻石会员"],
    channels: ["线下门店", "小程序", "外卖平台", "企业团购"],
  };

  function normalize(text) {
    return String(text || "").trim().replace(/\s+/g, "");
  }

  function hashSeed(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
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

  const FIELD_TYPE_ICONS = {
    string: "str.",
    number: "#",
    date: "date",
  };

  function resolveFieldDataType(field) {
    if (field.dataType && FIELD_TYPE_ICONS[field.dataType]) return field.dataType;
    if (/日期|时间/.test(field.name)) return "date";
    if (/量|数|金额|额|率|价|天数|GMV|杯数/.test(field.name)) return "number";
    return "string";
  }

  function getFieldTypeIcon(dataType) {
    return FIELD_TYPE_ICONS[dataType] || FIELD_TYPE_ICONS.string;
  }

  function flattenFields(dataset, type, model) {
    const list = type === "dim" ? dataset.dimensions
      : type === "measure" ? dataset.measures
        : type === "metric" ? dataset.metrics : [];
    return list.map((field) => ({
      ...field,
      tag: type === "dim" ? "dim" : type === "measure" ? "measure" : "metric",
      tagText: type === "dim" ? "维度" : type === "measure" ? "度量" : "指标",
      dataset: dataset.name,
      datasetId: dataset.id,
      modelId: model.id,
      model: model.name,
      domain: dataset.domain,
      isJoinKey: Boolean(field.isJoinKey || field.joins?.length),
      joinHint: buildJoinHint(field),
    }));
  }

  function getAllFields(types = ["dim", "measure", "metric"]) {
    const fields = [];
    BUSINESS_MODELS.forEach((model) => {
      model.datasets.forEach((ds) => {
        if (types.includes("dim")) fields.push(...flattenFields(ds, "dim", model));
        if (types.includes("measure")) fields.push(...flattenFields(ds, "measure", model));
        if (types.includes("metric")) fields.push(...flattenFields(ds, "metric", model));
      });
    });
    return fields;
  }

  function fieldMatchesText(field, text) {
    const names = [field.name, ...(field.synonyms || [])];
    return names.some((name) => text.includes(name));
  }

  function findFieldsInText(text, types = ["dim", "measure", "metric"]) {
    return getAllFields(types).filter((field) => fieldMatchesText(field, text));
  }

  function scoreDataset(dataset, text) {
    let score = 0;
    (dataset.keywords || []).forEach((kw) => { if (text.includes(kw)) score += 3; });
    [...dataset.dimensions, ...dataset.measures, ...dataset.metrics].forEach((field) => {
      if (fieldMatchesText(field, text)) score += 5;
    });
    if (text.includes(dataset.name.replace(/数据集|数据/g, ""))) score += 4;
    return score;
  }

  function resolveDatasets(text, context = {}) {
    const allDatasets = BUSINESS_MODELS.flatMap((m) => m.datasets);
    if (context.datasetId) {
      const hit = allDatasets.find((ds) => ds.id === context.datasetId);
      return hit ? [hit] : [];
    }
    const scored = allDatasets
      .map((ds) => ({ ds, score: scoreDataset(ds, text) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!scored.length) return [allDatasets[0]];
    if (scored.length > 1 && scored[0].score === scored[1].score) return scored.map((s) => s.ds);
    return [scored[0].ds];
  }

  function classifyIntent(question) {
    const q = normalize(question);
    if (!q || q.length < 2) return "out_of_scope";
    if (/^[0-9+\-*/().%\s]+$/.test(q)) return "out_of_scope";

    let best = { intent: "analytical_aggregate", priority: -1 };
    INTENT_RULES.forEach((rule) => {
      if (rule.patterns.some((p) => p.test(q)) && rule.priority > best.priority) {
        best = { intent: rule.intent, priority: rule.priority };
      }
    });
    return best.intent;
  }

  function extractDimensions(text, dataset) {
    return dataset.dimensions.filter((d) => fieldMatchesText(d, text)).map((d) => d.name);
  }

  function extractMetrics(text, dataset) {
    const metrics = dataset.metrics.filter((m) => fieldMatchesText(m, text)).map((m) => m.name);
    const measures = dataset.measures.filter((m) => fieldMatchesText(m, text)).map((m) => m.name);
    return [...new Set([...metrics, ...measures])];
  }

  function inferDimensions(text, dataset, intent) {
    let dims = extractDimensions(text, dataset);
    if (!dims.length) {
      if (/部门/.test(text)) dims = pickFieldName(dataset, "部门");
      else if (/省份|省级|各省/.test(text)) dims = pickFieldName(dataset, "省份");
      else if (/区域|大区/.test(text)) dims = pickFieldName(dataset, "区域");
      else if (/产品|品类/.test(text)) dims = pickFieldName(dataset, "产品");
      else if (/门店/.test(text)) dims = pickFieldName(dataset, "门店");
      else if (/项目|工地|工程/.test(text)) dims = pickFieldName(dataset, "项目");
      else if (/物料|材料/.test(text)) dims = pickFieldName(dataset, "物料");
      else if (/供应商|供方/.test(text)) dims = pickFieldName(dataset, "供应商");
      else if (/入库/.test(text)) dims = pickFieldName(dataset, "入库");
      else if (/出库|领料/.test(text)) dims = pickFieldName(dataset, "出库");
      else if (/客户|会员/.test(text)) dims = pickFieldName(dataset, "客户");
      else if (/原料|物料|品类/.test(text)) dims = pickFieldName(dataset, "原料");
      else if (/月份|时间|各月|按月|趋势/.test(text) || intent === "analytical_trend") dims = pickFieldName(dataset, "月");
      else if (/渠道/.test(text)) dims = pickFieldName(dataset, "渠道");
      else if (/等级/.test(text)) dims = pickFieldName(dataset, "等级");
    }
    if (!dims.length && ["analytical_aggregate", "analytical_rank", "analytical_ratio", "analytical_trend"].includes(intent)) {
      dims = [dataset.dimensions[0]?.name].filter(Boolean);
    }
    return dims;
  }

  function pickFieldName(dataset, keyword) {
    const hit = dataset.dimensions.find((d) => d.name.includes(keyword) || (d.synonyms || []).some((s) => s.includes(keyword)));
    return hit ? [hit.name] : [];
  }

  function inferMetrics(text, dataset) {
    let metrics = extractMetrics(text, dataset);
    if (!metrics.length) {
      if (/合同/.test(text)) metrics = pickMetricName(dataset, "合同");
      else if (/回款/.test(text)) metrics = pickMetricName(dataset, "回款");
      else if (/金额|销售额|营收|GMV/.test(text)) metrics = pickMetricName(dataset, "金额");
      else if (/销量|销售量|杯/.test(text)) metrics = pickMetricName(dataset, "销量");
      else if (/库存/.test(text)) metrics = pickMetricName(dataset, "库存");
      else if (/周转/.test(text)) metrics = pickMetricName(dataset, "周转");
      else if (/复购/.test(text)) metrics = pickMetricName(dataset, "复购");
      else if (/客单价/.test(text)) metrics = pickMetricName(dataset, "客单价");
      else if (/客户数|会员数/.test(text)) metrics = pickMetricName(dataset, "客户");
      else if (/入库/.test(text)) metrics = pickMetricName(dataset, "入库");
      else if (/出库|领料|发料/.test(text)) metrics = pickMetricName(dataset, "出库");
      else if (/造价|工程造价/.test(text)) metrics = pickMetricName(dataset, "造价");
    }
    if (!metrics.length) {
      const fallback = dataset.metrics[0] || dataset.measures[0];
      metrics = fallback ? [fallback.name] : [];
    }
    return metrics;
  }

  function pickMetricName(dataset, keyword) {
    const all = [...dataset.metrics, ...dataset.measures];
    const hit = all.find((m) => m.name.includes(keyword) || (m.synonyms || []).some((s) => s.includes(keyword)));
    return hit ? [hit.name] : [];
  }

  function buildClarification(question, candidates, reason) {
    return {
      status: "clarify",
      intent: "needs_clarification",
      reason,
      choices: candidates.map((ds) => ({
        id: ds.id,
        label: ds.name,
        description: ds.description,
        prompt: composeClarifiedQuestion(question, ds),
        resolve: { datasetId: ds.id },
      })),
    };
  }

  function composeClarifiedQuestion(question, dataset) {
    const q = question.trim();
    if (q.includes(dataset.name)) return q;
    return `${q}（${dataset.name}）`;
  }

  function buildGuidance(type, question, extra = {}) {
    const guides = {
      greeting: {
        title: "您好，我是智能问数助手",
        message: "我可以帮您查询经营数据、浏览模型维度指标，或生成分析图表与 SQL。",
        actions: [
          { type: "prompt", label: "查看可用维度", prompt: "都有哪些维度？" },
          { type: "prompt", label: "查看推荐分析问题", prompt: "今年各月销售趋势如何" },
          { type: "action", label: "打开模型面板", action: "open-model-panel" },
        ],
      },
      help_usage: {
        title: "您可以这样问",
        message: "支持看模型、看数据集、看维度/指标/度量、查数值、看明细、趋势、排名、对比、占比等问法。",
        actions: [
          { type: "prompt", label: "看数据：有哪些数据集？", prompt: "有哪些数据集？" },
          { type: "prompt", label: "看维度：有哪些维度？", prompt: "都有哪些维度？" },
          { type: "prompt", label: "看数值：各部门合同额", prompt: "帮我查一下今年每个部门的合同额" },
          { type: "prompt", label: "看趋势：销售趋势", prompt: "今年各月销售趋势如何" },
        ],
      },
      out_of_scope: {
        title: "暂时无法直接回答这个问题",
        message: extra.message || "未在业务模型中匹配到相关数据集或字段，您可以换个说法或从下方引导开始。",
        actions: [
          { type: "prompt", label: "查看业务模型", prompt: "都有哪些模型？" },
          { type: "prompt", label: "查看可分析维度", prompt: "都有哪些维度？" },
          { type: "prompt", label: "查看可用指标", prompt: "都有哪些指标？" },
          { type: "action", label: "打开模型面板", action: "open-model-panel" },
        ],
      },
    };
    return guides[type] || guides.out_of_scope;
  }

  function buildSchema(intent, question, dataset, context = {}) {
    const dimensions = context.dimensions || inferDimensions(normalize(question), dataset, intent);
    const metrics = context.metrics || inferMetrics(normalize(question), dataset);
    const columns = [
      ...dimensions.map((label) => ({ key: label, label })),
      ...metrics.map((label) => ({ key: label, label, numeric: true })),
    ];

    let chartMode = "multi-series";
    if (intent === "analytical_detail") chartMode = "none";
    else if (intent === "analytical_kpi") chartMode = "kpi";
    else if (intent === "analytical_compare") chartMode = "compare";
    else if (intent === "analytical_trend") chartMode = "line";
    else if (
      dataset.domain === "contract"
      || dataset.domain === "customer"
      || dataset.domain === "inventory"
      || String(dataset.domain || "").startsWith("cm-")
    ) {
      if (dimensions.length <= 1) chartMode = "simple";
    }

    const modelMeta = getModelForDataset(dataset.id);
    const schemaChartMode = chartMode;

    if (intent === "analytical_detail") {
      const detailCols = getAllFields(["dim", "measure", "metric"])
        .filter((f) => f.datasetId === dataset.id)
        .slice(0, 6)
        .map((f) => ({ key: f.name, label: f.name, numeric: f.tag !== "dim" }));
      return {
        model: modelMeta.name,
        modelId: modelMeta.id,
        dataset: dataset.name,
        datasetId: dataset.id,
        domain: dataset.domain,
        dimensions,
        metrics,
        columns: detailCols.length ? detailCols : columns,
        chartMode: "none",
      };
    }

    const schemaForChart = {
      dimensions,
      metrics,
      chartMode: schemaChartMode,
      columns,
    };
    const chartType = inferChartType(intent, question, schemaForChart, dataset);

    return {
      model: modelMeta.name,
      modelId: modelMeta.id,
      dataset: dataset.name,
      datasetId: dataset.id,
      domain: dataset.domain,
      dimensions,
      metrics,
      columns,
      chartMode: schemaChartMode,
      chartType,
      compareTargets: intent === "analytical_compare" ? extractCompareTargets(question, dataset) : null,
    };
  }

  /**
   * 按问数意图与语义推荐图表类型：bar | hbar | line | pie | donut
   */
  function inferChartType(intent, question, schema, dataset = {}) {
    const q = normalize(question);
    const dimCount = (schema.dimensions || []).length;
    const chartMode = schema.chartMode || "simple";

    if (chartMode === "none" || chartMode === "kpi" || chartMode === "compare") {
      return "bar";
    }

    if (/环形图|圆环图|环图/.test(q)) return "donut";
    if (/饼图|饼状图/.test(q)) return "pie";
    if (/条形图|横向柱|横向条形/.test(q)) return "hbar";
    if (/折线图|趋势图/.test(q)) return "line";
    if (/柱状图|柱形图/.test(q)) return "bar";

    if (intent === "analytical_trend") return "line";
    if (intent === "analytical_ratio") return "donut";
    if (intent === "analytical_rank") return "hbar";
    if (intent === "analytical_compare") return "bar";

    if (chartMode === "line" || chartMode === "multi-series") {
      if (/各月|每月|月份|时间|趋势|走势/.test(q)) return "line";
      if (/占比|比例|份额|结构|构成/.test(q)) return "donut";
      return "bar";
    }

    if (chartMode === "simple") {
      if (/占比|比例|份额|比重|占有率|百分比/.test(q)) return "donut";
      if (/排名|排行|最高|最低|top\s*\d+|前\s*\d+|后\s*\d+/i.test(q)) return "hbar";
      if (/结构|构成|分布|各项.*占/.test(q)) return "pie";
      if (/趋势|走势|变化|各月|每月/.test(q)) return "line";
      if (dimCount === 1 && intent === "analytical_aggregate") return "bar";
      return "bar";
    }

    return "bar";
  }

  function extractCompareTargets(question, dataset) {
    const q = question;
    const products = MOCK_ENUMS.products.filter((p) => q.includes(p.replace("咖啡", "")) || q.includes(p));
    if (products.length >= 2) return products.slice(0, 2);
    const regions = MOCK_ENUMS.regions.filter((r) => q.includes(r));
    if (regions.length >= 2) return regions.slice(0, 2);
    if (/今年.*去年|去年.*今年/.test(q)) return ["今年", "去年"];
    const metric = inferMetrics(q, dataset)[0] || "指标值";
    return [metric, "对比项"];
  }

  function buildSemanticRows(schema) {
    const rows = [];
    schema.metrics.forEach((metric) => {
      (schema.dimensions.length ? schema.dimensions : ["—"]).forEach((dimension) => {
        rows.push({
          model: schema.model,
          dataset: schema.dataset,
          metric,
          dimension,
        });
      });
    });
    return rows;
  }

  /** 数仓实例：所有模型数据集物理表均在此实例下 */
  const SQL_DW_INSTANCE = "gdcp_dw";

  function qualifySqlTable(tableName) {
    const name = String(tableName || "").trim();
    if (!name) return `${SQL_DW_INSTANCE}.unknown_table`;
    if (new RegExp(`^${SQL_DW_INSTANCE}\\.`, "i").test(name)) return name;
    return `${SQL_DW_INSTANCE}.${name}`;
  }

  function getSqlTableRef(profileOrTableName) {
    if (profileOrTableName && typeof profileOrTableName === "object") {
      return qualifySqlTable(profileOrTableName.tableName);
    }
    return qualifySqlTable(profileOrTableName);
  }

  const DATASET_SQL_PROFILES = {
    "ds-coffee-sales": {
      displayName: "全国2025年咖啡销售数据",
      datasetId: "ds-coffee-sales",
      tableName: "coffee_sales_fact",
      valid: true,
      topic: "咖啡销售",
      dateField: "trans_month",
      dateMode: "month",
      defaultYear: 2025,
      fieldMap: {
        交易月份: { column: "trans_month", label: "交易月份" },
        产品种类: { column: "product_category", label: "产品种类" },
        区域名称: { column: "region_name", label: "区域名称" },
        门店编号: { column: "store_id", label: "门店编号" },
        销售量: { column: "sales_qty", label: "销售量" },
        订单金额: { column: "order_amount", label: "订单金额" },
      },
      keyFields: [
        { column: "trans_month", label: "交易月份" },
        { column: "product_category", label: "产品种类" },
        { column: "sales_qty", label: "销售量" },
        { column: "order_amount", label: "订单金额" },
      ],
    },
    "ds-contract": {
      displayName: "合同主数据",
      datasetId: "2047548782814363650",
      tableName: "contract_master",
      valid: true,
      topic: "合同信息",
      dateField: "sign_date",
      dateMode: "date",
      defaultYear: 2025,
      rejectedCandidate: {
        displayName: "合同信息主数据",
        datasetId: "2046587880969068546",
        modelId: "2046464075978235906",
        modelName: "咨询项目主数据",
        inspectFields: [
          { column: "data_list_contractAmountTotal", label: "合同额" },
          { column: "data_list_belongDeptName", label: "所属部门" },
        ],
        invalidFields: [
          { column: "data_list_contractAmountTotal", label: "合同额" },
          { column: "data_list_belongDeptName", label: "所属部门" },
        ],
      },
      candidates: [
        {
          displayName: "合同信息主数据",
          datasetId: "2046587880969068546",
          note: "中有 data_list_contractAmountTotal（合同额）和 data_list_belongDeptName（所属部门）等字段",
        },
        { displayName: "合同主数据", datasetId: "2047548782814363650" },
      ],
      fieldMap: {
        签订日期: { column: "sign_date", label: "签约时间" },
        部门名称: { column: "belong_dept_name", label: "所属部门" },
        省份: { column: "province_name", label: "省份" },
        客户名称: { column: "customer_name", label: "客户名称" },
        合同额: { column: "contract_amount_total", label: "合同额" },
        回款金额: { column: "payment_amount_total", label: "回款金额" },
      },
      keyFields: [
        { column: "contract_amount_total", label: "合同额" },
        { column: "belong_dept_name", label: "所属部门" },
        { column: "sign_date", label: "签约时间" },
      ],
    },
    "ds-inventory": {
      displayName: "门店库存数据集",
      datasetId: "ds-inventory",
      tableName: "store_inventory_snapshot",
      valid: true,
      topic: "门店库存",
      dateField: "inventory_date",
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        库存日期: { column: "inventory_date", label: "库存日期" },
        原料品类: { column: "material_category", label: "原料品类" },
        门店编号: { column: "store_id", label: "门店编号" },
        库存数量: { column: "inventory_qty", label: "库存数量" },
        库存金额: { column: "inventory_amount", label: "库存金额" },
        周转天数: { column: "turnover_days", label: "周转天数" },
      },
      keyFields: [
        { column: "inventory_date", label: "库存日期" },
        { column: "material_category", label: "原料品类" },
        { column: "inventory_qty", label: "库存数量" },
      ],
    },
    "ds-customer": {
      displayName: "客户经营数据集",
      datasetId: "ds-customer",
      tableName: "customer_operation_fact",
      valid: true,
      topic: "客户经营",
      dateField: "stat_month",
      dateMode: "month",
      defaultYear: 2025,
      fieldMap: {
        客户等级: { column: "customer_level", label: "客户等级" },
        获客渠道: { column: "acquisition_channel", label: "获客渠道" },
        统计月份: { column: "stat_month", label: "统计月份" },
        客户数: { column: "customer_cnt", label: "客户数" },
        客单价: { column: "avg_order_value", label: "客单价" },
        复购率: { column: "repurchase_rate", label: "复购率" },
      },
      keyFields: [
        { column: "stat_month", label: "统计月份" },
        { column: "customer_level", label: "客户等级" },
        { column: "repurchase_rate", label: "复购率" },
      ],
    },
    "ds-cm-material-master": {
      displayName: "物料主数据台账",
      datasetId: "ds-cm-material-master",
      tableName: "cm_material_master",
      valid: true,
      topic: "物料主数据",
      dateField: null,
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        物料编码: { column: "material_code", label: "物料编码" },
        物料名称: { column: "material_name", label: "物料名称" },
        规格型号: { column: "spec_model", label: "规格型号" },
        标准单价: { column: "standard_unit_price", label: "标准单价" },
      },
      keyFields: [
        { column: "material_code", label: "物料编码" },
        { column: "material_name", label: "物料名称" },
      ],
    },
    "ds-cm-inbound": {
      displayName: "入库台账",
      datasetId: "ds-cm-inbound",
      tableName: "cm_inbound_ledger",
      valid: true,
      topic: "材料入库",
      dateField: "inbound_date",
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        入库日期: { column: "inbound_date", label: "入库日期" },
        物料编码: { column: "material_code", label: "物料编码" },
        项目编号: { column: "project_code", label: "项目编号" },
        入库数量: { column: "inbound_qty", label: "入库数量" },
        入库金额: { column: "inbound_amount", label: "入库金额" },
      },
      keyFields: [
        { column: "inbound_date", label: "入库日期" },
        { column: "inbound_qty", label: "入库数量" },
        { column: "inbound_amount", label: "入库金额" },
      ],
    },
    "ds-cm-outbound": {
      displayName: "出库台账",
      datasetId: "ds-cm-outbound",
      tableName: "cm_outbound_ledger",
      valid: true,
      topic: "材料出库",
      dateField: "outbound_date",
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        出库日期: { column: "outbound_date", label: "出库日期" },
        物料编码: { column: "material_code", label: "物料编码" },
        项目编号: { column: "project_code", label: "项目编号" },
        出库数量: { column: "outbound_qty", label: "出库数量" },
        出库金额: { column: "outbound_amount", label: "出库金额" },
      },
      keyFields: [
        { column: "outbound_date", label: "出库日期" },
        { column: "outbound_qty", label: "出库数量" },
      ],
    },
    "ds-cm-inventory": {
      displayName: "库存台账",
      datasetId: "ds-cm-inventory",
      tableName: "cm_inventory_snapshot",
      valid: true,
      topic: "项目库存",
      dateField: "inventory_date",
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        库存日期: { column: "inventory_date", label: "库存日期" },
        物料编码: { column: "material_code", label: "物料编码" },
        项目编号: { column: "project_code", label: "项目编号" },
        库存数量: { column: "inventory_qty", label: "库存数量" },
        库存金额: { column: "inventory_amount", label: "库存金额" },
      },
      keyFields: [
        { column: "inventory_date", label: "库存日期" },
        { column: "inventory_qty", label: "库存数量" },
      ],
    },
    "ds-cm-project-site": {
      displayName: "项目工地台账",
      datasetId: "ds-cm-project-site",
      tableName: "cm_project_site",
      valid: true,
      topic: "工程项目",
      dateField: null,
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: {
        项目编号: { column: "project_code", label: "项目编号" },
        项目名称: { column: "project_name", label: "项目名称" },
        承建单位: { column: "contractor_name", label: "承建单位" },
        合同造价: { column: "contract_cost", label: "合同造价" },
      },
      keyFields: [
        { column: "project_code", label: "项目编号" },
        { column: "project_name", label: "项目名称" },
      ],
    },
  };

  function getDatasetSqlProfile(datasetId) {
    if (DATASET_SQL_PROFILES[datasetId]) return DATASET_SQL_PROFILES[datasetId];
    const ds = BUSINESS_MODELS.flatMap((m) => m.datasets).find((d) => d.id === datasetId);
    const fallbackMap = {};
    [...(ds?.dimensions || []), ...(ds?.measures || []), ...(ds?.metrics || [])].forEach((f) => {
      const column = String(f.name).replace(/[^\w\u4e00-\u9fa5]/g, "_").replace(/_{2,}/g, "_");
      fallbackMap[f.name] = { column: column || "field_col", label: f.name };
    });
    return {
      displayName: ds?.name || "业务数据集",
      datasetId: datasetId || "unknown",
      tableName: "biz_dataset",
      valid: true,
      topic: "业务数据",
      dateField: null,
      dateMode: "date",
      defaultYear: 2025,
      fieldMap: fallbackMap,
      keyFields: Object.values(fallbackMap).slice(0, 4).map((f) => ({ column: f.column, label: f.label })),
    };
  }

  function getDatasetSqlMeta(datasetId) {
    const profile = getDatasetSqlProfile(datasetId);
    return {
      dateField: profile.dateField,
      dateMode: profile.dateMode,
      defaultYear: profile.defaultYear || 2025,
    };
  }

  function sqlCol(fieldName, profile) {
    return profile.fieldMap[fieldName]?.column || fieldName;
  }

  function sqlFieldLabel(fieldName, profile) {
    return profile.fieldMap[fieldName]?.label || fieldName;
  }

  function quoteSqlAlias(label) {
    const s = String(label || "字段").replace(/`/g, "``");
    return `\`${s}\``;
  }

  function sqlAlias(fieldName, profile) {
    return quoteSqlAlias(sqlFieldLabel(fieldName, profile));
  }

  function sqlDimSelect(fieldName, profile, tableAlias = "") {
    const col = tableAlias ? `${tableAlias}.${sqlCol(fieldName, profile)}` : sqlCol(fieldName, profile);
    return `${col} AS ${sqlAlias(fieldName, profile)}`;
  }

  function sqlMetricAlias(metric, profile) {
    return sqlAlias(metric, profile);
  }

  function colRef(tableAlias, fieldName, profile) {
    return `${tableAlias}.${sqlCol(fieldName, profile)}`;
  }

  function sqlMetricExpr(metric, profile, tableAlias = "") {
    const col = tableAlias ? colRef(tableAlias, metric, profile) : sqlCol(metric, profile);
    if (/率/.test(metric)) return `COALESCE(AVG(${col}), 0)`;
    return `IFNULL(SUM(${col}), 0)`;
  }

  /** 各数据集生产级 SQL 编排：主表别名、关联表、通用业务过滤 */
  const SQL_DATASET_PLANS = {
    "ds-coffee-sales": {
      alias: "o",
      idColumn: "order_id",
      timeColumn: "create_time",
      joinType: "INNER JOIN",
      joinTable: "dim_store_region",
      joinAlias: "d",
      joinOn: "o.store_id = d.store_id",
      joinExtra: "d.delete_flag = 0",
      joinComment: "关联门店区域维度",
      standardFilters: [
        { expr: "o.delete_flag = 0", comment: "未删除数据" },
        { expr: "o.is_valid = 1", comment: "有效记录" },
        { expr: "o.order_status IN (1, 2, 4)", comment: "有效订单" },
        { expr: "o.channel_type != 99", comment: "排除测试渠道" },
      ],
    },
    "ds-contract": {
      alias: "c",
      idColumn: "contract_id",
      timeColumn: "sign_date",
      joinType: "INNER JOIN",
      joinTable: "contract_customer_dim",
      joinAlias: "u",
      joinOn: "c.customer_id = u.customer_id",
      joinExtra: "u.delete_flag = 0",
      joinComment: "关联客户维度",
      standardFilters: [
        { expr: "c.delete_flag = 0", comment: "未删除合同" },
        { expr: "c.is_valid = 1", comment: "有效合同" },
        { expr: "c.contract_status IN (1, 2, 4)", comment: "有效签约状态" },
        { expr: "c.channel_type != 99", comment: "排除异常渠道" },
      ],
    },
    "ds-inventory": {
      alias: "i",
      idColumn: "inventory_id",
      timeColumn: "inventory_date",
      joinType: "INNER JOIN",
      joinTable: "dim_store_info",
      joinAlias: "s",
      joinOn: "i.store_id = s.store_id",
      joinExtra: "s.delete_flag = 0",
      joinComment: "关联门店主数据",
      standardFilters: [
        { expr: "i.delete_flag = 0", comment: "未删除库存快照" },
        { expr: "i.is_valid = 1", comment: "有效库存记录" },
        { expr: "i.stock_status IN (1, 2, 4)", comment: "在库状态" },
      ],
    },
    "ds-customer": {
      alias: "u",
      idColumn: "customer_id",
      timeColumn: "create_time",
      joinType: "INNER JOIN",
      joinTable: "dim_channel",
      joinAlias: "ch",
      joinOn: "u.channel_type = ch.channel_type",
      joinExtra: "ch.delete_flag = 0",
      joinComment: "关联获客渠道维度",
      standardFilters: [
        { expr: "u.delete_flag = 0", comment: "未删除客户" },
        { expr: "u.is_valid = 1", comment: "有效客户" },
        { expr: "u.member_status IN (1, 2, 4)", comment: "有效会员状态" },
        { expr: "u.channel_type != 99", comment: "排除测试渠道" },
      ],
    },
    "ds-cm-material-master": {
      alias: "m",
      idColumn: "material_code",
      timeColumn: "create_time",
      joinType: "INNER JOIN",
      joinTable: "dim_material_category",
      joinAlias: "cat",
      joinOn: "m.material_category = cat.category_code",
      joinExtra: "cat.delete_flag = 0",
      joinComment: "关联物料品类维度",
      standardFilters: [
        { expr: "m.delete_flag = 0", comment: "未删除物料" },
        { expr: "m.is_valid = 1", comment: "有效物料" },
      ],
    },
    "ds-cm-inbound": {
      alias: "i",
      idColumn: "inbound_id",
      timeColumn: "inbound_date",
      joinType: "INNER JOIN",
      joinTable: "cm_material_master",
      joinAlias: "m",
      joinOn: "i.material_code = m.material_code",
      joinExtra: "m.delete_flag = 0",
      joinComment: "关联物料主数据",
      standardFilters: [
        { expr: "i.delete_flag = 0", comment: "未删除入库单" },
        { expr: "i.is_valid = 1", comment: "有效入库记录" },
        { expr: "i.inbound_status IN (1, 2, 4)", comment: "已确认入库" },
      ],
    },
    "ds-cm-outbound": {
      alias: "o",
      idColumn: "outbound_id",
      timeColumn: "outbound_date",
      joinType: "INNER JOIN",
      joinTable: "cm_project_site",
      joinAlias: "p",
      joinOn: "o.project_code = p.project_code",
      joinExtra: "p.delete_flag = 0",
      joinComment: "关联项目工地",
      standardFilters: [
        { expr: "o.delete_flag = 0", comment: "未删除出库单" },
        { expr: "o.is_valid = 1", comment: "有效出库记录" },
        { expr: "o.outbound_status IN (1, 2, 4)", comment: "已确认出库" },
      ],
    },
    "ds-cm-inventory": {
      alias: "inv",
      idColumn: "inventory_id",
      timeColumn: "inventory_date",
      joinType: "INNER JOIN",
      joinTable: "cm_material_master",
      joinAlias: "m",
      joinOn: "inv.material_code = m.material_code",
      joinExtra: "m.delete_flag = 0",
      joinComment: "关联物料主数据",
      standardFilters: [
        { expr: "inv.delete_flag = 0", comment: "未删除库存记录" },
        { expr: "inv.is_valid = 1", comment: "有效库存快照" },
        { expr: "inv.stock_status IN (1, 2, 4)", comment: "在库状态" },
      ],
    },
    "ds-cm-project-site": {
      alias: "p",
      idColumn: "project_code",
      timeColumn: "create_time",
      joinType: "INNER JOIN",
      joinTable: "dim_contractor",
      joinAlias: "ct",
      joinOn: "p.contractor_code = ct.contractor_code",
      joinExtra: "ct.delete_flag = 0",
      joinComment: "关联承建单位维度",
      standardFilters: [
        { expr: "p.delete_flag = 0", comment: "未删除项目" },
        { expr: "p.is_valid = 1", comment: "有效项目" },
        { expr: "p.project_status IN (1, 2, 4)", comment: "在建有效状态" },
      ],
    },
    _default: {
      alias: "t",
      idColumn: "id",
      timeColumn: "create_time",
      joinType: "INNER JOIN",
      joinTable: "dim_biz_common",
      joinAlias: "d",
      joinOn: "t.biz_id = d.biz_id",
      joinExtra: "d.delete_flag = 0",
      joinComment: "关联业务维度",
      standardFilters: [
        { expr: "t.delete_flag = 0", comment: "未删除" },
        { expr: "t.is_valid = 1", comment: "有效记录" },
        { expr: "t.order_status IN (1, 2, 4)", comment: "有效状态" },
        { expr: "t.channel_type != 99", comment: "排除测试渠道" },
      ],
    },
  };

  function getSqlPlan(datasetId, profile) {
    const resolvedId = datasetId === "2047548782814363650" ? "ds-contract" : datasetId;
    const plan = SQL_DATASET_PLANS[resolvedId] || SQL_DATASET_PLANS._default;
    if (!SQL_DATASET_PLANS[resolvedId] && profile?.dateField) {
      return { ...plan, timeColumn: profile.dateField };
    }
    return plan;
  }

  function resolveTimeRange(question, meta) {
    const explicit = parseExplicitDateRange(question);
    if (explicit) return [explicit.start, explicit.end];
    const year = meta.defaultYear || 2025;
    const q = normalize(question);
    if (/去年|上年/.test(q) && !/今年/.test(q)) {
      return [`${year - 1}-01-01`, `${year - 1}-12-31`];
    }
    if (/近(?:六|6)个?月/.test(q)) {
      return [`${year}-01-01`, `${year}-06-30`];
    }
    if (/今年|本年|本财年|当期/.test(q) || /20\d{2}年/.test(q)) {
      const ym = q.match(/(20\d{2})年/);
      const y = ym ? ym[1] : year;
      return [`${y}-01-01`, `${y}-12-31`];
    }
    return [`${year}-01-01`, `${year}-01-31`];
  }

  function buildBizTimeFilter(plan, question, meta) {
    const [start, end] = resolveTimeRange(question, meta);
    return {
      expr: `${plan.alias}.${plan.timeColumn} BETWEEN '${start}' AND '${end}'`,
      comment: "统计周期",
    };
  }

  function buildProductionWhereFilters(question, schema, dataset, profile, plan, meta) {
    const filters = [
      buildBizTimeFilter(plan, question, meta),
      ...(plan.standardFilters || []),
    ];
    extractDimensionConditions(question, schema, dataset, profile, plan.alias).forEach((expr) => {
      filters.push({ expr, comment: null });
    });
    return filters;
  }

  function buildFromJoinLines(profile, plan) {
    const lines = [
      `FROM ${getSqlTableRef(profile)} ${plan.alias}`,
      `  -- ${plan.joinComment || "关联维度表"}`,
      `${plan.joinType} ${qualifySqlTable(plan.joinTable)} ${plan.joinAlias}`,
      `    ON ${plan.joinOn}`,
    ];
    if (plan.joinExtra) lines.push(`   AND ${plan.joinExtra}`);
    return lines;
  }

  function buildWhereBlock(filterItems) {
    const lines = ["WHERE 1 = 1"];
    (filterItems || []).forEach(({ expr, comment }) => {
      if (!expr) return;
      if (comment) lines.push(`  -- ${comment}`);
      lines.push(`  AND ${expr}`);
    });
    return lines.join("\n");
  }

  function dimSelectForSql(alias, dimCn, profile, meta, plan) {
    if (/月|日期|时间/.test(dimCn)) {
      const fmt = /月/.test(dimCn) && meta.dateMode === "month" ? "%Y-%m" : "%Y-%m-%d";
      const timeCol = `${plan.alias}.${plan.timeColumn}`;
      return `DATE_FORMAT(${timeCol}, '${fmt}') AS ${sqlAlias(dimCn, profile)}`;
    }
    return `${colRef(alias, dimCn, profile)} AS ${sqlAlias(dimCn, profile)}`;
  }

  function metricSelectForSql(alias, metric, profile, comment) {
    const expr = sqlMetricExpr(metric, profile, alias);
    const lines = [`  ${expr} AS ${sqlMetricAlias(metric, profile)}`];
    if (comment) lines[0] += `  -- ${comment}`;
    return lines[0];
  }

  function distinctCountSelect(alias, plan, profile) {
    const idCol = plan.idColumn || "id";
    const label = quoteSqlAlias("去重单量");
    return `  COUNT(DISTINCT ${alias}.${idCol}) AS ${label}  -- 去重单量`;
  }

  const SQL_KW_UPPER_PATTERN = /\b(SELECT|FROM|WHERE|AND|OR|NOT|GROUP BY|ORDER BY|HAVING|LIMIT|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|ON|AS|CASE|WHEN|THEN|ELSE|END|IN|EXISTS|BETWEEN|LIKE|IS|NULL|DISTINCT|COUNT|SUM|AVG|MIN|MAX|UNION|ALL|WITH|OVER|PARTITION BY|DATE_FORMAT|IFNULL|COALESCE|YEAR|MONTH|INTERVAL|DESC|ASC|BY|CURRENT_DATE|DATE_SUB)\b/gi;

  function uppercaseSqlKeywords(sql) {
    return String(sql || "").split(/(`[^`]*`|'[^']*')/g).map((part) => {
      if (!part || part.startsWith("`") || part.startsWith("'")) return part;
      return part.replace(SQL_KW_UPPER_PATTERN, (m) => m.toUpperCase());
    }).join("");
  }

  function finalizeProductionSql(lines) {
    return uppercaseSqlKeywords(joinSqlLines(lines));
  }

  function mapSqlIdentifierToBusinessName(identifier, dataset) {
    const profile = getDatasetSqlProfile(dataset.id);
    const key = String(identifier || "").trim();
    for (const [cn, meta] of Object.entries(profile.fieldMap || {})) {
      if (meta.column === key || meta.label === key || cn === key) return cn;
    }
    return identifier;
  }

  function describeSqlQuery(schema, intent) {
    const dims = schema.dimensions.length ? schema.dimensions.join("、") : "整体";
    const metric = schema.metrics[0] || "指标";
    if (intent === "analytical_kpi") return `汇总${metric}`;
    if (intent === "analytical_rank") return `按${dims}分组统计${metric}并排序`;
    if (intent === "analytical_ratio") return `按${dims}分组计算${metric}及占比`;
    if (intent === "analytical_trend") return `按${dims}查看${metric}趋势`;
    return `按${dims}分组汇总${metric}`;
  }

  function escSqlNarrativeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const SQL_KEYWORD_LIST = [
    "GROUP BY", "ORDER BY", "PARTITION BY", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
    "FULL OUTER JOIN", "FULL JOIN", "CROSS JOIN", "NOT EXISTS", "NOT IN",
    "IS NOT NULL", "IS NULL", "CURRENT_DATE", "DATE_SUB", "DATE_FORMAT",
    "SELECT", "FROM", "WHERE", "HAVING", "LIMIT", "JOIN", "INNER", "LEFT", "RIGHT",
    "OUTER", "CROSS", "ON", "AS", "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN",
    "LIKE", "IS", "NULL", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
    "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL", "WITH", "OVER",
    "ROW_NUMBER", "YEAR", "MONTH", "INTERVAL", "DESC", "ASC", "BY",
  ].sort((a, b) => b.length - a.length);

  const SQL_KEYWORD_PATTERN = new RegExp(
    `\\b(${SQL_KEYWORD_LIST.map((kw) => kw.replace(/\s+/g, "\\s+")).join("|")})\\b`,
    "gi",
  );

  function highlightSqlKeywordSegment(segment) {
    return segment.replace(SQL_KEYWORD_PATTERN, (match) => `<span class="sql-kw">${match}</span>`);
  }

  /** 对 SQL 文本做 HTML 转义，并将数据库关键字标蓝 */
  function highlightSql(sql) {
    const escaped = escSqlNarrativeHtml(sql);
    return escaped.split(/(`[^`]*`|'[^']*')/g).map((part) => {
      if (!part || part.startsWith("`") || part.startsWith("'")) return part;
      return highlightSqlKeywordSegment(part);
    }).join("");
  }

  function sqlNarrativeTok(value, kind = "id") {
    return `<code class="sql-narrative-token" data-kind="${kind}">${escSqlNarrativeHtml(value)}</code>`;
  }

  function formatFieldNeedList(schema, profile) {
    const names = [...(schema.metrics || []), ...(schema.dimensions || [])];
    const unique = [...new Set(names)];
    if (!unique.length) return "相关业务指标与维度";
    return unique.map((name) => {
      const col = profile.fieldMap?.[name]?.column;
      const label = profile.fieldMap?.[name]?.label || name;
      return col
        ? `「${escSqlNarrativeHtml(label)}」（${sqlNarrativeTok(col, "field")}）`
        : `「${escSqlNarrativeHtml(name)}」`;
    }).join("、");
  }

  function buildSqlNarrative(question, schema, intent, dataset) {
    const profile = getDatasetSqlProfile(dataset.id);
    const model = getModelForDataset(dataset.id);
    const q = escSqlNarrativeHtml(String(question || "").trim());
    const blocks = [];
    const needFields = formatFieldNeedList(schema, profile);
    const queryDesc = escSqlNarrativeHtml(describeSqlQuery(schema, intent));

    blocks.push(`<p>用户想查询「${q}」。根据问题语义，需要获取 ${needFields} 等信息。</p>`);

    if (profile.rejectedCandidate) {
      const rejected = profile.rejectedCandidate;
      const rejectedModelId = rejected.modelId || rejected.datasetId;
      const rejectedModelName = rejected.modelName || rejected.displayName;

      blocks.push(
        `<p>我注意到用户问题可能关联模型 ${sqlNarrativeTok(rejectedModelId, "model")}（${escSqlNarrativeHtml(rejectedModelName)}）。`
        + `让我先查看该模型下数据集 ${sqlNarrativeTok(rejected.datasetId)}（${escSqlNarrativeHtml(rejected.displayName)}）的元数据。</p>`,
      );

      const inspectFields = (rejected.inspectFields || rejected.invalidFields || profile.keyFields || []).slice(0, 4);
      if (inspectFields.length) {
        const fieldPhrase = inspectFields
          .map((f) => `${sqlNarrativeTok(f.column, "field")}（${escSqlNarrativeHtml(f.label)}）`)
          .join("、");
        blocks.push(`<p>在该数据集中找到 ${fieldPhrase} 等字段，与用户需求较为匹配。</p>`);
      }

      blocks.push(
        `<p>进一步检查发现该数据集 ${sqlNarrativeTok("valid", "attr")} 为 ${sqlNarrativeTok("false", "bool")}，`
        + "说明当前数据集不可用，无法直接用于查询。</p>",
      );
      blocks.push("<p>让我换个思路，在可用模型目录中查找其他数据集。</p>");

      if (profile.candidates?.length) {
        profile.candidates
          .filter((item) => item.datasetId !== rejected.datasetId)
          .forEach((item) => {
            blocks.push(
              `<p>检索到「${escSqlNarrativeHtml(item.displayName)}」（datasetId: ${sqlNarrativeTok(item.datasetId)}）`
              + `${item.note ? `，${escSqlNarrativeHtml(item.note)}` : ""}。</p>`,
            );
          });
      }
    } else {
      blocks.push("<p>好的，我先查询可用的模型和数据集，看看有哪些数据可以使用。</p>");
      blocks.push(
        `<p>在「${escSqlNarrativeHtml(model.name)}」下检索到数据集 `
        + `「${escSqlNarrativeHtml(profile.displayName)}」（datasetId: ${sqlNarrativeTok(profile.datasetId)}）。</p>`,
      );

      const peers = model.datasets.filter((d) => d.id !== dataset.id).slice(0, 2);
      peers.forEach((ds) => {
        const peerProfile = getDatasetSqlProfile(ds.id);
        blocks.push(
          `<p>同时发现关联数据集「${escSqlNarrativeHtml(peerProfile.displayName)}」`
          + `（datasetId: ${sqlNarrativeTok(peerProfile.datasetId)}），可作为备选数据源。</p>`,
        );
      });
    }

    blocks.push(
      `<p>最终选用「${escSqlNarrativeHtml(profile.displayName)}」数据集（datasetId: ${sqlNarrativeTok(profile.datasetId)}），`
      + `物理表位于 ${sqlNarrativeTok(SQL_DW_INSTANCE, "model")} 实例：${sqlNarrativeTok(getSqlTableRef(profile), "field")}，`
      + `${sqlNarrativeTok("valid", "attr")}: ${sqlNarrativeTok(profile.valid !== false ? "true" : "false", "bool")}，`
      + "关键字段如下：</p>",
    );

    blocks.push('<ul class="sql-narrative-fields">');
    (profile.keyFields || []).forEach((f) => {
      blocks.push(`<li>${sqlNarrativeTok(f.column, "field")} - ${escSqlNarrativeHtml(f.label)}</li>`);
    });
    blocks.push("</ul>");

    blocks.push(
      `<p>结合用户问题，查询目标为：${queryDesc}。`
      + "字段映射与数据集状态已确认，下面生成 SQL 供您确认执行。</p>",
    );

    return {
      html: blocks.join(""),
      sqlIntro: "将执行的sql 内容如下:",
    };
  }

  function buildSqlBundle(schema, intent, question, dataset) {
    const sql = buildSql(schema, intent);
    const sqlNarrative = buildSqlNarrative(question, schema, intent, dataset);
    return { sql, sqlNarrative };
  }

  function getDimensionValuePool(dimName) {
    const pools = {
      产品种类: MOCK_ENUMS.products,
      区域名称: MOCK_ENUMS.regions,
      部门名称: MOCK_ENUMS.departments,
      省份: MOCK_ENUMS.provinces,
      原料品类: MOCK_ENUMS.materials,
      客户等级: MOCK_ENUMS.customerLevels,
      获客渠道: MOCK_ENUMS.channels,
    };
    return pools[dimName] || null;
  }

  function parseExplicitDateRange(question) {
    const match = String(question || "").match(/[（(](\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})[）)]/);
    if (!match) return null;
    return { start: match[1], end: match[2] };
  }

  function buildTimeCondition(question, meta) {
    const q = normalize(question);
    const { dateField, dateMode, defaultYear } = meta;
    if (!dateField) return null;

    const explicitRange = parseExplicitDateRange(question);
    if (explicitRange) {
      if (dateMode === "month") {
        const startMonth = explicitRange.start.slice(0, 7);
        const endMonth = explicitRange.end.slice(0, 7);
        return `${dateField} >= '${startMonth}' AND ${dateField} <= '${endMonth}'`;
      }
      return `${dateField} >= '${explicitRange.start}' AND ${dateField} <= '${explicitRange.end}'`;
    }

    if (/今年和去年|去年.*今年|今年.*去年/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} >= '${defaultYear - 1}-01' AND ${dateField} <= '${defaultYear}-12'`;
      }
      return `${dateField} >= '${defaultYear - 1}-01-01' AND ${dateField} < '${defaultYear + 1}-01-01'`;
    }

    if (/去年|上年/.test(q) && !/今年/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} >= '${defaultYear - 1}-01' AND ${dateField} <= '${defaultYear - 1}-12'`;
      }
      return `YEAR(${dateField}) = ${defaultYear - 1}`;
    }

    if (/近(?:六|6)个?月|最近(?:六|6)个?月/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} >= '${defaultYear}-01' AND ${dateField} <= '${defaultYear}-06'`;
      }
      return `${dateField} >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)`;
    }

    if (/近(?:十二|12)个?月|最近(?:一|1)年/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} >= '${defaultYear - 1}-07' AND ${dateField} <= '${defaultYear}-06'`;
      }
      return `${dateField} >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)`;
    }

    if (/本月|这个月|当月/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} = '${defaultYear}-06'`;
      }
      return `DATE_FORMAT(${dateField}, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')`;
    }

    const yearMatch = q.match(/(20\d{2})年/);
    if (yearMatch) {
      const year = yearMatch[1];
      if (dateMode === "month") {
        return `${dateField} >= '${year}-01' AND ${dateField} <= '${year}-12'`;
      }
      return `YEAR(${dateField}) = ${year}`;
    }

    if (/今年|本年|本财年|当期/.test(q)) {
      if (dateMode === "month") {
        return `${dateField} >= '${defaultYear}-01' AND ${dateField} <= '${defaultYear}-12'`;
      }
      return `YEAR(${dateField}) = ${defaultYear}`;
    }

    if (dateMode === "month") {
      return `${dateField} >= '${defaultYear}-01' AND ${dateField} <= '${defaultYear}-12'`;
    }
    return `YEAR(${dateField}) = ${defaultYear}`;
  }

  function extractDimensionConditions(question, schema, dataset, profile, tableAlias = "") {
    const q = String(question || "");
    const conditions = [];
    const seen = new Set();
    const dimNames = new Set([
      ...schema.dimensions,
      ...dataset.dimensions.map((d) => d.name),
    ]);
    const prof = profile || getDatasetSqlProfile(dataset.id);

    dimNames.forEach((dimName) => {
      const pool = getDimensionValuePool(dimName);
      if (!pool) return;
      const matched = pool.filter((val) => q.includes(val));
      if (!matched.length) return;
      const col = tableAlias
        ? colRef(tableAlias, dimName, prof)
        : sqlCol(dimName, prof);

      let condition;
      if (matched.length === 1) {
        condition = `${col} = '${matched[0]}'`;
      } else {
        condition = `${col} IN (${matched.map((v) => `'${v}'`).join(", ")})`;
      }
      if (!seen.has(condition)) {
        seen.add(condition);
        conditions.push(condition);
      }
    });

    return conditions;
  }

  function extractRankLimit(question) {
    const q = normalize(question);
    const topMatch = q.match(/top(\d+)|前(\d+)/i);
    if (topMatch) {
      const n = Number(topMatch[1] || topMatch[2]);
      if (n > 0) return n;
    }
    if (/五个|5个|前五/.test(q)) return 5;
    if (/三个|3个|前三/.test(q)) return 3;
    if (/排名|最高|最多|top/i.test(q)) return 10;
    return 10;
  }

  function metricAggregate(metric) {
    return /率/.test(metric) ? `AVG(${metric})` : `SUM(${metric})`;
  }

  function joinSqlLines(lines) {
    return lines.filter((line) => line !== null && line !== undefined && line !== "").join("\n");
  }

  function buildSql(schema, intent) {
    const question = schema._question || "";
    const dataset = BUSINESS_MODELS.flatMap((m) => m.datasets).find((d) => d.id === schema.datasetId) || { dimensions: [] };
    const profile = getDatasetSqlProfile(schema.datasetId);
    const meta = getDatasetSqlMeta(schema.datasetId);
    const plan = getSqlPlan(schema.datasetId, profile);
    const alias = plan.alias;
    const metric = schema.metrics[0];
    const metricAlias = sqlMetricAlias(metric, profile);
    const metricCol = colRef(alias, metric, profile);
    const whereFilters = buildProductionWhereFilters(question, schema, dataset, profile, plan, meta);
    const fromJoin = buildFromJoinLines(profile, plan);

    if (intent === "analytical_detail") {
      const orderField = schema.columns.find((c) => c.numeric)?.label || schema.columns[0]?.label || metric;
      const detailCols = schema.columns.map((c) => `  ${sqlDimSelect(c.label, profile, alias)}`);
      const lines = [
        "SELECT",
        detailCols.join(",\n"),
        fromJoin[0],
        ...fromJoin.slice(1),
        buildWhereBlock(whereFilters),
        `ORDER BY ${colRef(alias, orderField, profile)} DESC`,
        "LIMIT 100",
      ];
      return finalizeProductionSql(lines);
    }

    if (intent === "analytical_kpi") {
      const kpiCols = [
        metricSelectForSql(alias, metric, profile, `${sqlFieldLabel(metric, profile)}合计`),
        distinctCountSelect(alias, plan, profile),
      ];
      const lines = [
        "SELECT",
        kpiCols.join(",\n"),
        ...fromJoin,
        buildWhereBlock(whereFilters),
      ];
      return finalizeProductionSql(lines);
    }

    if (intent === "analytical_compare") {
      const targets = schema.compareTargets || [];
      const productDimCn = schema.dimensions.find((d) => d.includes("产品")) || "产品种类";
      const timeDimCn = schema.dimensions.find((d) => d.includes("月")) || schema.dimensions[0];
      const productDim = colRef(alias, productDimCn, profile);
      const timeDimExpr = dimSelectForSql(alias, timeDimCn, profile, meta, plan).split(" AS ")[0];

      if (targets.length >= 2 && dataset.domain === "sales") {
        const metricLabel = sqlFieldLabel(metric, profile);
        const extraFilters = [
          ...whereFilters,
          { expr: `${productDim} IN (${targets.slice(0, 2).map((t) => `'${t}'`).join(", ")})`, comment: "对比产品范围" },
        ];
        const compareCols = [
          `  ${dimSelectForSql(alias, timeDimCn, profile, meta, plan)}`,
          ...targets.slice(0, 2).map((t) => (
            `  IFNULL(SUM(CASE WHEN ${productDim} = '${t}' THEN ${metricCol} ELSE 0 END), 0) AS ${quoteSqlAlias(`${t}_${metricLabel}`)}  -- ${t}${metricLabel}`
          )),
          distinctCountSelect(alias, plan, profile),
        ];
        const lines = [
          "SELECT",
          compareCols.join(",\n"),
          ...fromJoin,
          buildWhereBlock(extraFilters),
          `GROUP BY ${timeDimExpr}`,
          `ORDER BY ${timeDimExpr}`,
        ];
        return finalizeProductionSql(lines);
      }

      if (/今年.*去年|去年.*今年/.test(normalize(question)) && meta.dateField) {
        const dateCol = `${alias}.${plan.timeColumn}`;
        const caseExpr = [
          "CASE",
          `  WHEN YEAR(${dateCol}) = ${meta.defaultYear} THEN '今年'`,
          `  WHEN YEAR(${dateCol}) = ${meta.defaultYear - 1} THEN '去年'`,
          "END",
        ].join("\n");
        const yoyCols = [
          `  ${caseExpr} AS ${quoteSqlAlias("对比周期")}  -- 同比周期`,
          metricSelectForSql(alias, metric, profile, "指标合计"),
          distinctCountSelect(alias, plan, profile),
        ];
        const lines = [
          "SELECT",
          yoyCols.join(",\n"),
          ...fromJoin,
          buildWhereBlock(whereFilters),
          `GROUP BY ${caseExpr}`,
          `ORDER BY ${quoteSqlAlias("对比周期")}`,
        ];
        return finalizeProductionSql(lines);
      }

      const compareDimCn = schema.dimensions[0];
      if (targets.length >= 2 && compareDimCn) {
        const compareDim = colRef(alias, compareDimCn, profile);
        const extraFilters = [
          ...whereFilters,
          { expr: `${compareDim} IN (${targets.slice(0, 2).map((t) => `'${t}'`).join(", ")})`, comment: "对比维度范围" },
        ];
        const dimCompareCols = [
          `  ${dimSelectForSql(alias, compareDimCn, profile, meta, plan)}`,
          metricSelectForSql(alias, metric, profile, `${sqlFieldLabel(metric, profile)}合计`),
          distinctCountSelect(alias, plan, profile),
        ];
        const lines = [
          "SELECT",
          dimCompareCols.join(",\n"),
          ...fromJoin,
          buildWhereBlock(extraFilters),
          `GROUP BY ${compareDim}`,
          `ORDER BY ${metricAlias} DESC`,
        ];
        return finalizeProductionSql(lines);
      }
    }

    if (intent === "analytical_ratio") {
      const dimCn = schema.dimensions[0];
      const dimExpr = dimSelectForSql(alias, dimCn, profile, meta, plan).split(" AS ")[0];
      const ratioCols = [
        `  ${dimSelectForSql(alias, dimCn, profile, meta, plan)}`,
        `  IFNULL(SUM(${metricCol}), 0) AS ${metricAlias}  -- ${sqlFieldLabel(metric, profile)}合计`,
        `  ROUND(IFNULL(SUM(${metricCol}), 0) * 100.0 / NULLIF(SUM(SUM(${metricCol})) OVER (), 0), 2) AS ${quoteSqlAlias("占比")}  -- 占比`,
        distinctCountSelect(alias, plan, profile),
      ];
      const lines = [
        "SELECT",
        ratioCols.join(",\n"),
        ...fromJoin,
        buildWhereBlock(whereFilters),
        `GROUP BY ${dimExpr}`,
        `ORDER BY ${metricAlias} DESC`,
      ];
      return finalizeProductionSql(lines);
    }

    const dimSelects = schema.dimensions.map((d) => `  ${dimSelectForSql(alias, d, profile, meta, plan)}`);
    const metricSelects = schema.metrics.map((m) => metricSelectForSql(alias, m, profile, `${sqlFieldLabel(m, profile)}合计`));
    const groupExprs = schema.dimensions.map((d) => dimSelectForSql(alias, d, profile, meta, plan).split(" AS ")[0]);

    const aggregateCols = [...dimSelects, ...metricSelects, distinctCountSelect(alias, plan, profile)];
    const lines = [
      "SELECT",
      aggregateCols.join(",\n"),
      ...fromJoin,
      buildWhereBlock(whereFilters),
    ];

    if (groupExprs.length) {
      lines.push("GROUP BY");
      lines.push(...groupExprs.map((g) => `  ${g}`));
    }

    if (intent === "analytical_rank") {
      lines.push(`ORDER BY ${metricAlias} DESC`);
      lines.push(`LIMIT ${extractRankLimit(question)}`);
    } else if (intent === "analytical_trend") {
      lines.push(`ORDER BY ${groupExprs[0] || metricAlias}`);
    } else {
      lines.push(`ORDER BY ${groupExprs[0] || metricAlias} DESC`);
    }

    return finalizeProductionSql(lines);
  }

  function generateMockData(schema, intent, seedText) {
    const random = createSeededRandom(hashSeed(seedText + schema.datasetId));
    const { domain } = schema;

    if (intent === "analytical_kpi") {
      const value = Math.floor(random() * 90000000) + 10000000;
      return { type: "kpi", value, label: schema.metrics[0], unit: /率/.test(schema.metrics[0]) ? "%" : "元" };
    }

    if (intent === "analytical_compare") {
      const targets = schema.compareTargets || ["A", "B"];
      const metric = schema.metrics[0];
      return {
        type: "compare",
        rows: targets.map((name) => ({
          对比项: name,
          [metric]: Math.floor(random() * 500000) + 50000,
        })),
        metric,
      };
    }

    if (domain === "contract") {
      const dimName = schema.dimensions[0];
      const items = dimName === "省份" ? MOCK_ENUMS.provinces : MOCK_ENUMS.departments;
      let rows = items.map((name) => ({
        [dimName]: name,
        [schema.metrics[0]]: Math.floor(random() * 8000000) + 200000,
      }));
      if (intent === "analytical_rank") {
        rows.sort((a, b) => b[schema.metrics[0]] - a[schema.metrics[0]]);
        rows = rows.slice(0, 10);
      }
      if (intent === "analytical_ratio") {
        const total = rows.reduce((s, r) => s + r[schema.metrics[0]], 0);
        rows = rows.map((r) => ({
          ...r,
          占比: `${((r[schema.metrics[0]] / total) * 100).toFixed(1)}%`,
        }));
        schema.columns = [
          { key: dimName, label: dimName },
          { key: schema.metrics[0], label: schema.metrics[0], numeric: true },
          { key: "占比", label: "占比" },
        ];
      }
      return { type: "table", rows };
    }

    if (domain === "inventory") {
      const dimName = schema.dimensions[0] || "原料品类";
      const items = dimName.includes("原料") ? MOCK_ENUMS.materials : MOCK_ENUMS.products;
      let rows = items.map((name) => ({
        [dimName]: name,
        [schema.metrics[0]]: Math.floor(random() * 5000) + 200,
      }));
      if (intent === "analytical_rank") rows.sort((a, b) => b[schema.metrics[0]] - a[schema.metrics[0]]).slice(0, 10);
      return { type: "table", rows };
    }

    if (domain === "customer") {
      const dimName = schema.dimensions[0] || "客户等级";
      const items = dimName.includes("渠道") ? MOCK_ENUMS.channels : MOCK_ENUMS.customerLevels;
      let rows = items.map((name) => ({
        [dimName]: name,
        [schema.metrics[0]]: /率/.test(schema.metrics[0])
          ? `${(random() * 40 + 10).toFixed(1)}%`
          : Math.floor(random() * 500) + 50,
      }));
      return { type: "table", rows };
    }

    // sales default
    if (intent === "analytical_detail") {
      const rows = [];
      MOCK_ENUMS.months.forEach((month) => {
        MOCK_ENUMS.products.forEach((product) => {
          rows.push({
            交易月份: month,
            产品种类: product,
            区域名称: MOCK_ENUMS.regions[Math.floor(random() * MOCK_ENUMS.regions.length)],
            销售量: Math.floor(random() * 7200) + 800,
            订单金额: Math.floor(random() * 180000) + 20000,
          });
        });
      });
      return { type: "table", rows: rows.slice(0, 50) };
    }

    const rows = [];
    MOCK_ENUMS.months.forEach((month) => {
      MOCK_ENUMS.products.forEach((product) => {
        rows.push({
          month,
          productType: product,
          salesVolume: Math.floor(random() * 7200) + 800,
          orderAmount: Math.floor(random() * 180000) + 20000,
          region: MOCK_ENUMS.regions[Math.floor(random() * MOCK_ENUMS.regions.length)],
        });
      });
    });

    if (intent === "analytical_rank") {
      rows.sort((a, b) => b.salesVolume - a.salesVolume);
      return {
        type: "chart",
        chartRows: rows.slice(0, 10),
        tableRows: rows.slice(0, 10).map((r) => ({
          交易月份: r.month,
          产品种类: r.productType,
          销售量: r.salesVolume,
        })),
      };
    }

    if (intent === "analytical_ratio") {
      const grouped = {};
      rows.forEach((r) => {
        grouped[r.productType] = (grouped[r.productType] || 0) + r.salesVolume;
      });
      const total = Object.values(grouped).reduce((a, b) => a + b, 0);
      const tableRows = Object.entries(grouped).map(([k, v]) => ({
        产品种类: k,
        销售量: v,
        占比: `${((v / total) * 100).toFixed(1)}%`,
      }));
      schema.columns = [
        { key: "产品种类", label: "产品种类" },
        { key: "销售量", label: "销售量", numeric: true },
        { key: "占比", label: "占比" },
      ];
      return { type: "table", rows: tableRows };
    }

    const tableRows = rows.map((r) => {
      const row = {};
      schema.dimensions.forEach((d) => {
        if (d.includes("月")) row[d] = r.month;
        else if (d.includes("产品")) row[d] = r.productType;
        else if (d.includes("区域")) row[d] = r.region;
      });
      schema.metrics.forEach((m) => {
        row[m] = m.includes("金额") ? r.orderAmount : r.salesVolume;
      });
      return row;
    });

    return { type: "chart", chartRows: rows, tableRows };
  }

  function findDefinitionTarget(text) {
    const fields = getAllFields();
    const hits = fields.filter((f) => fieldMatchesText(f, text));
    if (hits.length) return hits;
    if (/合同额/.test(text)) return fields.filter((f) => f.name === "合同额");
    return [];
  }

  function resolveDefinitionDescription(field, text) {
    if (field.name === "合同额" && /怎么算|如何计算|如何统计/.test(text)) {
      return "根据不同维度（如部门、签订日期等）进行SUM计算。";
    }
    return field.description;
  }

  function mapDefinitionResults(fields, text) {
    return fields.map((field) => ({
      ...field,
      description: resolveDefinitionDescription(field, text),
    }));
  }

  function analyzeQuery(question, context = {}) {
    const raw = String(question || "").trim();
    const text = normalize(raw);
    if (!text) {
      return {
        status: "guidance",
        intent: "out_of_scope",
        question: raw,
        guidance: buildGuidance("out_of_scope", raw, { message: "请输入您要查询的问题。" }),
        pipeline: RESULT_PIPELINES.out_of_scope,
        related: RELATED_BY_INTENT.out_of_scope,
      };
    }

    let intent = context.forcedIntent || classifyIntent(raw);

    if (intent === "metadata_dataset") intent = "metadata_model";

    if (intent === "greeting") {
      return {
        status: "ok",
        intent,
        question: raw,
        guidance: buildGuidance("greeting", raw),
        pipeline: RESULT_PIPELINES.greeting,
        related: RELATED_BY_INTENT.greeting,
      };
    }

    if (intent === "help_usage") {
      return {
        status: "ok",
        intent,
        question: raw,
        guidance: buildGuidance("help_usage", raw),
        pipeline: RESULT_PIPELINES.help_usage,
        related: RELATED_BY_INTENT.help_usage,
      };
    }

    if (intent.startsWith("metadata_")) {
      return {
        status: "ok",
        intent,
        question: raw,
        model: BUSINESS_MODEL,
        models: BUSINESS_MODELS,
        pipeline: RESULT_PIPELINES[intent],
        related: RELATED_BY_INTENT[intent] || RELATED_BY_INTENT.metadata_model,
      };
    }

    if (intent === "metadata_definition") {
      const defs = findDefinitionTarget(text);
      if (!defs.length) {
        return {
          status: "guidance",
          intent: "out_of_scope",
          question: raw,
          guidance: buildGuidance("out_of_scope", raw, {
            message: `未找到「${raw}」相关的指标或维度定义，您可以指定具体字段名称。`,
          }),
          pipeline: RESULT_PIPELINES.out_of_scope,
          related: ["合同额是什么意思？", "销售量怎么算？", "都有哪些指标？"],
        };
      }
      return {
        status: "ok",
        intent,
        question: raw,
        definitions: mapDefinitionResults(defs, text),
        pipeline: RESULT_PIPELINES.metadata_definition,
        related: RELATED_BY_INTENT.metadata_definition,
      };
    }

    const matchedFields = findFieldsInText(text);
    const datasets = resolveDatasets(text, context);

    if (!matchedFields.length && !/查|统计|分析|多少|帮我|按|各|每/.test(text)) {
      const vagueMetric = /合同额|销售量|订单金额|库存|回款|复购率|客单价/.test(text);
      if (vagueMetric && datasets.length > 1) {
        return {
          ...buildClarification(raw, datasets, "匹配到多个数据集，请选择您要查询的数据来源："),
          question: raw,
          pipeline: RESULT_PIPELINES.needs_clarification,
          related: RELATED_BY_INTENT.needs_clarification,
        };
      }
      if (!vagueMetric) {
        return {
          status: "guidance",
          intent: "out_of_scope",
          question: raw,
          guidance: buildGuidance("out_of_scope", raw, {
            message: "未能识别问题中的业务字段，建议先查看维度/指标列表，或补充更具体的查询条件。",
          }),
          pipeline: RESULT_PIPELINES.out_of_scope,
          related: RELATED_BY_INTENT.out_of_scope,
        };
      }
    }

    if (datasets.length > 1 && !context.datasetId) {
      return {
        ...buildClarification(raw, datasets, "您的问题可能对应多个数据集，请选择后继续分析："),
        question: raw,
        pipeline: RESULT_PIPELINES.needs_clarification,
        related: RELATED_BY_INTENT.needs_clarification,
      };
    }

    const dataset = datasets[0];
    const schema = buildSchema(intent, raw, dataset, context);
    schema._question = raw;

    if (!schema.metrics.length) {
      return {
        status: "guidance",
        intent: "out_of_scope",
        question: raw,
        guidance: buildGuidance("out_of_scope", raw, {
          message: `在「${dataset.name}」中未找到可分析的指标，请指定如合同额、销售量、订单金额等字段。`,
        }),
        pipeline: RESULT_PIPELINES.out_of_scope,
        related: ["都有哪些指标？", `列出${dataset.name}明细`, "都有哪些维度？"],
      };
    }

    if (schema.dimensions.length === 0 && ["analytical_aggregate", "analytical_rank"].includes(intent)) {
      const dimCandidates = dataset.dimensions.slice(0, 3);
      return {
        status: "clarify",
        intent: "needs_clarification",
        reason: "请补充您希望按哪个维度查看数据：",
        question: raw,
        choices: dimCandidates.map((d) => ({
          id: `dim-${d.name}`,
          label: `按${d.name}分析`,
          description: d.description,
          prompt: `${raw}，按${d.name}分组`,
          resolve: { datasetId: dataset.id, dimensions: [d.name], metrics: schema.metrics },
        })),
        pipeline: RESULT_PIPELINES.needs_clarification,
        related: RELATED_BY_INTENT.needs_clarification,
      };
    }

    const mockData = generateMockData(schema, intent, raw);
    return {
      status: "ok",
      intent,
      question: raw,
      dataset,
      schema,
      semanticRows: buildSemanticRows(schema),
      ...buildSqlBundle(schema, intent, raw, dataset),
      mockData,
      pipeline: RESULT_PIPELINES[intent] || RESULT_PIPELINES.analytical_aggregate,
      related: RELATED_BY_INTENT[intent] || RELATED_BY_INTENT.analytical_aggregate,
    };
  }

  function executeSql(sql, baseAnalysis = {}) {
    const parsed = parseSqlQuery(sql);
    if (!parsed.ok) return parsed;

    const schema = {
      ...(baseAnalysis.schema || {}),
      ...parsed.schema,
    };
    schema._question = baseAnalysis.question || schema._question || "";

    const intent = parsed.intent || baseAnalysis.intent || "analytical_aggregate";
    if (!schema.metrics.length && intent !== "analytical_detail") {
      return { ok: false, error: "未能从 SQL 中解析出指标字段，请检查 SELECT 中的 SUM/AVG 聚合列" };
    }
    if (intent === "analytical_detail" && !schema.columns.length) {
      return { ok: false, error: "明细查询未能解析出字段，请检查 SELECT 列" };
    }

    const mockData = generateMockData(schema, intent, baseAnalysis.question || sql);
    return {
      ok: true,
      sql: String(sql).trim(),
      schema,
      mockData,
      intent,
      dataset: parsed.dataset,
    };
  }

  function buildAnalysisFromSqlExecution(sql, baseAnalysis = {}) {
    const result = executeSql(sql, baseAnalysis);
    if (!result.ok) return result;

    const intent = result.intent || baseAnalysis.intent || "analytical_aggregate";
    const question = baseAnalysis.question || baseAnalysis._question || "";
    result.schema._question = question;

    const sqlNarrative = buildSqlNarrative(question, result.schema, intent, result.dataset);

    return {
      ok: true,
      status: "ok",
      intent,
      intentLabel: "SQL 修正执行",
      question,
      dataset: result.dataset,
      schema: result.schema,
      semanticRows: buildSemanticRows(result.schema),
      sql: result.sql,
      sqlNarrative,
      mockData: result.mockData,
      pipeline: RESULT_PIPELINES[intent] || RESULT_PIPELINES.analytical_aggregate,
      related: RELATED_BY_INTENT[intent] || RELATED_BY_INTENT.analytical_aggregate,
    };
  }

  function resolveDatasetFromSql(sql) {
    const allDatasets = BUSINESS_MODELS.flatMap((m) => m.datasets);
    return allDatasets.find((ds) => {
      const profile = getDatasetSqlProfile(ds.id);
      const candidates = [
        getSqlTableRef(profile),
        profile.tableName,
        ds.name,
        profile.displayName,
      ].filter(Boolean);
      return candidates.some((name) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(?:FROM|JOIN)\\s+${escaped}\\b`, "i").test(sql);
      });
    }) || null;
  }

  function buildDatasetFieldNodes(ds) {
    const toFieldNode = (f, i, tag, tagText) => ({
      id: `${ds.id}-${tag}-${i}`,
      label: f.name,
      type: "field",
      category: "model",
      tag,
      tagText,
      fieldTag: f.isJoinKey || f.joins?.length ? "join" : null,
      fieldTagText: f.isJoinKey || f.joins?.length ? "关联" : null,
      joinHint: buildJoinHint(f),
      dataType: resolveFieldDataType(f),
    });

    return [
      ...ds.dimensions.map((f, i) => toFieldNode(f, i, "dim", "维度")),
      ...ds.measures.map((f, i) => toFieldNode(f, i, "measure", "度量")),
      ...ds.metrics.map((f, i) => toFieldNode(f, i, "metric", "指标")),
    ].map((node) => ({ ...node, insertLabel: node.label }));
  }

  function buildModelTreeNode(model) {
    const relationsFolder = (model.relations || []).length
      ? [{
        id: `${model.id}-relations`,
        label: "关联关系",
        type: "folder",
        category: "model",
        expanded: false,
        children: model.relations.map((rel) => ({
          id: rel.id,
          label: `${rel.from.datasetName}.${rel.from.field} ↔ ${rel.to.datasetName}.${rel.to.field}`,
          type: "relation",
          category: "model",
        })),
      }]
      : [];

    return {
      id: model.id,
      label: model.name,
      type: "model",
      category: "model",
      link: model.id === BUSINESS_MODEL.id ? "../业务建模产品原型/index.html" : undefined,
      expanded: model.id === CONSTRUCTION_MATERIAL_MODEL.id,
      children: [
        ...relationsFolder,
        {
          id: `${model.id}-datasets`,
          label: "数据集",
          type: "folder",
          category: "model",
          expanded: model.id === CONSTRUCTION_MATERIAL_MODEL.id,
          children: model.datasets.map((ds) => ({
            id: ds.id,
            label: ds.name,
            type: "dataset",
            category: "model",
            description: ds.description,
            expanded: false,
            children: buildDatasetFieldNodes(ds),
          })),
        },
      ],
    };
  }

  function parseSelectClause(selectPart) {
    const dimensions = [];
    const metrics = [];
    const columns = [];
    const parts = selectPart.split(/,(?![^()]*\))/).map((p) => p.trim()).filter(Boolean);

    parts.forEach((part) => {
      if (/^CASE\s/i.test(part) || /占比/.test(part) || /OVER\s*\(/i.test(part)) return;
      const aggMatch = part.match(/^(SUM|AVG|COUNT|MAX|MIN)\s*\(\s*([^)]+)\s*\)(?:\s+AS\s+(?:`([^`]+)`|([^\s,]+)))?/i);
      if (aggMatch) {
        const label = (aggMatch[3] || aggMatch[4] || aggMatch[2]).trim();
        metrics.push(label);
        columns.push({ key: label, label, numeric: true });
        return;
      }
      const asMatch = part.match(/^(.+?)\s+AS\s+(?:`([^`]+)`|([^\s,]+))\s*$/i);
      const label = (asMatch ? (asMatch[2] || asMatch[3]) : part).trim();
      if (label && !/^(CASE|ROUND)/i.test(label)) {
        dimensions.push(label);
        columns.push({ key: label, label, numeric: false });
      }
    });

    return { dimensions, metrics, columns };
  }

  function parseSqlQuery(sql) {
    const text = String(sql || "").trim();
    if (!text) return { ok: false, error: "SQL 不能为空" };
    if (!/^SELECT\s/i.test(text)) return { ok: false, error: "仅支持 SELECT 查询语句" };

    const dataset = resolveDatasetFromSql(text);
    if (!dataset) return { ok: false, error: "无法识别 FROM 子句中的数据集名称，请使用业务模型中的数据集表名" };

    const selectMatch = text.match(/SELECT\s+([\s\S]+?)\s+FROM\s+/i);
    if (!selectMatch) return { ok: false, error: "SQL 语法不完整，缺少 SELECT 或 FROM" };

    const { dimensions, metrics, columns } = parseSelectClause(selectMatch[1]);
    const groupMatch = text.match(/GROUP\s+BY\s+([\s\S]+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+HAVING|$)/i);
    const groupDimensions = groupMatch
      ? groupMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let finalDimensions = groupDimensions.length
      ? groupDimensions
      : dimensions.filter((d) => !metrics.includes(d));

    let finalMetrics = metrics.slice();
    finalDimensions = finalDimensions.map((d) => mapSqlIdentifierToBusinessName(d, dataset));
    finalMetrics = finalMetrics.map((m) => mapSqlIdentifierToBusinessName(m, dataset));
    if (!finalMetrics.length && groupDimensions.length) {
      finalMetrics = (dataset.metrics[0] || dataset.measures[0]) ? [(dataset.metrics[0] || dataset.measures[0]).name] : [];
    }

    let intent = "analytical_aggregate";
    if (/LIMIT\s+\d+/i.test(text) && !groupMatch && !finalMetrics.length) intent = "analytical_detail";
    else if (finalDimensions.length === 0 && finalMetrics.length === 1 && !groupMatch) intent = "analytical_kpi";
    else if (/CASE\s+WHEN/i.test(text)) intent = "analytical_compare";
    else if (/OVER\s*\(\s*\)/i.test(text) || /AS\s+占比/i.test(text)) intent = "analytical_ratio";
    else if (/ORDER\s+BY[\s\S]+DESC/i.test(text) && /LIMIT/i.test(text)) intent = "analytical_rank";
    else if (finalDimensions.some((d) => /月|日期|时间/.test(d))) intent = "analytical_trend";

    let chartMode = "simple";
    if (intent === "analytical_detail") chartMode = "none";
    else if (intent === "analytical_kpi") chartMode = "kpi";
    else if (intent === "analytical_compare") chartMode = "compare";
    else if (intent === "analytical_trend") chartMode = "line";
    else if (dataset.domain === "sales" && finalDimensions.length >= 2) chartMode = "multi-series";

    const finalColumns = columns.length
      ? columns
      : [
        ...finalDimensions.map((d) => ({ key: d, label: d })),
        ...finalMetrics.map((m) => ({ key: m, label: m, numeric: true })),
      ];

    const schemaForChart = {
      dimensions: finalDimensions,
      metrics: finalMetrics,
      chartMode,
      columns: finalColumns,
    };
    const modelMeta = getModelForDataset(dataset.id);
    const chartType = inferChartType(intent, "", schemaForChart, dataset);

    return {
      ok: true,
      dataset,
      schema: {
        model: modelMeta.name,
        modelId: modelMeta.id,
        dataset: dataset.name,
        datasetId: dataset.id,
        domain: dataset.domain,
        dimensions: finalDimensions,
        metrics: finalMetrics,
        columns: finalColumns,
        chartMode,
        chartType,
      },
      intent,
    };
  }

  const RESOURCE_FILE_POOLS = {
    word: [
      "零售经营分析口径说明.docx",
      "数据集字段释义文档.docx",
      "合同台账接入规范.docx",
      "智能问数使用手册.docx",
      "门店库存盘点说明.docx",
      "客户经营指标定义.docx",
      "业务模型变更记录.docx",
      "问数术语对照表.docx",
    ],
    pdf: [
      "2025年Q1销售分析报告.pdf",
      "咖啡品类经营白皮书.pdf",
      "合同回款风险简报.pdf",
      "区域门店业绩对比.pdf",
      "库存周转诊断报告.pdf",
      "客户复购洞察报告.pdf",
      "月度经营复盘摘要.pdf",
      "数据质量巡检报告.pdf",
    ],
    excel: [
      "全国咖啡销售明细表.xlsx",
      "合同台账导出_202505.xlsx",
      "门店库存盘点表.xlsx",
      "客户复购分析模板.xlsx",
      "月度经营KPI汇总.xlsx",
      "区域销售对标表.xlsx",
      "原料采购计划表.xlsx",
      "会员消费明细.xlsx",
    ],
    image: [
      "销售趋势图.png",
      "区域热力分布图.jpg",
      "产品结构占比图.png",
      "门店地图标注.png",
      "合同额排行截图.png",
      "库存预警看板.png",
      "客单价分布图.jpg",
      "渠道转化漏斗图.png",
    ],
    code: [
      "sales_query.sql",
      "contract_agg.py",
      "inventory_etl.dtsx",
      "customer_segment.ipynb",
      "build_metrics.js",
      "refresh_dataset.sh",
      "coffee_sales_view.sql",
      "sync_contract_data.py",
    ],
  };

  const RESOURCE_FILE_FOLDER_META = [
    { docType: "word", label: "文档", countMin: 2, countMax: 4 },
    { docType: "pdf", label: "PDF", countMin: 2, countMax: 5 },
    { docType: "excel", label: "表格", countMin: 2, countMax: 4 },
    { docType: "image", label: "图片", countMin: 2, countMax: 4 },
    { docType: "code", label: "代码文件", countMin: 2, countMax: 4 },
  ];

  let resourceFileIdCounter = 0;

  function pickRandomResourceCount(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pickRandomResourceItems(pool, count) {
    const copy = [...pool];
    const picked = [];
    while (picked.length < count && copy.length) {
      const index = Math.floor(Math.random() * copy.length);
      picked.push(copy.splice(index, 1)[0]);
    }
    return picked;
  }

  function createResourceFileId(docType) {
    resourceFileIdCounter += 1;
    return `asset-${docType}-${resourceFileIdCounter}`;
  }

  function buildRandomAssetFolder(meta) {
    const pool = RESOURCE_FILE_POOLS[meta.docType] || [];
    if (!pool.length) return null;

    const count = pickRandomResourceCount(meta.countMin, Math.min(meta.countMax, pool.length));
    const files = pickRandomResourceItems(pool, count).map((name) => ({
      id: createResourceFileId(meta.docType),
      label: name,
      type: "file",
      docType: meta.docType,
    }));

    return {
      id: `folder-${meta.docType}`,
      label: meta.label,
      type: "folder",
      expanded: true,
      children: files,
    };
  }

  function buildProjectAssetsNode() {
    const folders = RESOURCE_FILE_FOLDER_META
      .map((meta) => buildRandomAssetFolder(meta))
      .filter(Boolean);

    return {
      id: "assets-root",
      label: "项目资料",
      type: "folder",
      expanded: true,
      children: folders,
    };
  }

  function buildPanelSourceNode(ds) {
    const fieldNodes = buildDatasetFieldNodes(ds);
    const sourceType = ds.sourceKind || "dataset";
    return {
      id: ds.id,
      label: ds.name,
      type: sourceType,
      insertLabel: ds.name,
      expanded: false,
      children: fieldNodes,
    };
  }

  function buildPanelModelNode(model, expanded) {
    return {
      id: model.id,
      label: model.name,
      type: "model",
      insertLabel: model.name,
      expanded: Boolean(expanded),
      children: (model.datasets || []).map(buildPanelSourceNode),
    };
  }

  function buildPanelCatalogTrees() {
    const trees = {};
    PANEL_CATALOG_TABS.forEach((tab) => {
      const models = getModelsByCatalog(tab.key);
      trees[tab.key] = models.map((model, index) => (
        buildPanelModelNode(model, tab.key === "domain" && index === 0)
      ));
    });
    return trees;
  }

  function buildResourceTree() {
    return {
      id: "resource-root",
      type: "root",
      expanded: true,
      catalogs: buildPanelCatalogTrees(),
      children: buildPanelCatalogTrees().domain,
    };
  }

  function getSuggestFields() {
    return getAllFields().map((f) => ({
      label: f.name,
      tag: f.tag,
      tagText: f.tagText,
      dataType: resolveFieldDataType(f),
      typeIcon: getFieldTypeIcon(resolveFieldDataType(f)),
    }));
  }

  global.QueryEngine = {
    BUSINESS_MODEL,
    CONSTRUCTION_MATERIAL_MODEL,
    BUSINESS_MODELS,
    BASE_MODELS,
    PML_MODELS,
    PANEL_CATALOG_TABS,
    getAllModels,
    getModelsByCatalog,
    getModelForDataset,
    INTENT_LABELS,
    RESULT_PIPELINES,
    RECOMMEND_QUESTION_POOL,
    CONSTRUCTION_MATERIAL_RECOMMEND_QUESTIONS,
    RELATED_BY_INTENT,
    analyzeQuery,
    buildResourceTree,
    buildPanelCatalogTrees,
    getSuggestFields,
    getAllFields,
    getFieldTypeIcon,
    resolveFieldDataType,
    FIELD_TYPE_ICONS,
    classifyIntent,
    inferChartType,
    buildSqlNarrative,
    buildSqlBundle,
    highlightSql,
    getDatasetSqlProfile,
    SQL_DW_INSTANCE,
    qualifySqlTable,
    getSqlTableRef,
    MOCK_ENUMS,
    executeSql,
    parseSqlQuery,
    buildAnalysisFromSqlExecution,
  };
})(window);
