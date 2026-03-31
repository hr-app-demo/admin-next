export type FieldType = 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'file' | 'boolean'

export type FieldGroup = 'basic' | 'work' | 'other'

export interface DictionaryOption {
  label: string
  value: string
}

export interface DictionaryDefinition {
  key: string
  label: string
  description: string
  options: DictionaryOption[]
}

export interface FormTemplateField {
  key: string
  label: string
  type: FieldType
  required: boolean
  builtin: boolean
  group: FieldGroup
  canFilter: boolean
  dictionaryKey?: string
  placeholder?: string
}

export interface FormTemplateDefinition {
  key: string
  name: string
  description: string
  coverageHint: string
  fields: FormTemplateField[]
}

export interface JobFormField {
  key: string
  label: string
  type: FieldType
  required: boolean
  canFilter: boolean
  dictionaryKey?: string
  options?: string[]
}

export interface AutomationRule {
  fieldKey: string
  fieldLabel: string
  fieldType: FieldType
  operator: string
  value?: string | number | string[]
  secondValue?: string | number
}

export interface AutomationRuleGroup {
  combinator: 'and' | 'or'
  rules: AutomationRule[]
}

export const fieldTypeLabels: Record<FieldType, string> = {
  text: '文本',
  email: '邮箱',
  number: '数字',
  select: '单选',
  multiselect: '多选',
  file: '文件',
  boolean: '布尔',
}

export const defaultDictionaries: Record<string, DictionaryDefinition> = {
  country: {
    key: 'country',
    label: '国家 / 地区',
    description: '岗位发布与候选人基础资料共用的国家范围。',
    options: [
      { label: 'United Kingdom', value: 'UK' },
      { label: 'United States', value: 'United States' },
      { label: 'Indonesia', value: 'Indonesia' },
      { label: 'Brazil', value: 'Brazil' },
      { label: 'Philippines', value: 'Philippines' },
      { label: 'Mexico', value: 'Mexico' },
      { label: 'India', value: 'India' },
      { label: 'China', value: 'China' },
    ],
  },
  location: {
    key: 'location',
    label: '所在地',
    description: '候选人常驻城市，用于岗位定向筛选。',
    options: [
      { label: '北京', value: '北京' },
      { label: '上海', value: '上海' },
      { label: '深圳', value: '深圳' },
      { label: 'London', value: 'London' },
      { label: 'Jakarta', value: 'Jakarta' },
      { label: 'Bandung', value: 'Bandung' },
      { label: 'Surabaya', value: 'Surabaya' },
      { label: 'Manila', value: 'Manila' },
    ],
  },
  nationality: {
    key: 'nationality',
    label: '国籍',
    description: '用于国籍与签证相关筛选。',
    options: [
      { label: '中国', value: '中国' },
      { label: '英国', value: '英国' },
      { label: '印尼', value: '印尼' },
      { label: '西班牙', value: '西班牙' },
      { label: '菲律宾', value: '菲律宾' },
    ],
  },
  education: {
    key: 'education',
    label: '学历',
    description: '候选人学历层级。',
    options: [
      { label: '本科', value: '本科' },
      { label: '硕士', value: '硕士' },
      { label: '博士', value: '博士' },
      { label: '专科', value: '专科' },
    ],
  },
  employment_status: {
    key: 'employment_status',
    label: '在职状态',
    description: '候选人当前工作状态。',
    options: [
      { label: '全职', value: '全职' },
      { label: '兼职', value: '兼职' },
      { label: '自由职业', value: '自由职业' },
      { label: '待业', value: '待业' },
    ],
  },
  language: {
    key: 'language',
    label: '语言能力',
    description: '候选人可使用语言，用于语言岗筛选。',
    options: [
      { label: '英语', value: '英语' },
      { label: '印尼语', value: '印尼语' },
      { label: '菲律宾语', value: '菲律宾语' },
      { label: '中文', value: '中文' },
      { label: '葡萄牙语', value: '葡萄牙语' },
    ],
  },
  yes_no: {
    key: 'yes_no',
    label: '是 / 否',
    description: '用于单选判断型字段。',
    options: [
      { label: '是', value: '是' },
      { label: '否', value: '否' },
    ],
  },
}

export const defaultFormTemplates: FormTemplateDefinition[] = [
  {
    key: 'da-default',
    name: '默认报名表单',
    description: '适用于大多数数据分析岗位，覆盖基础资料、语言、工作投入和简历附件。',
    coverageHint: '使用默认报名表单，覆盖候选人基础信息、工作信息与自动筛选字段。',
    fields: [
      { key: 'name', label: '人名', type: 'text', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入候选人姓名' },
      { key: 'email', label: '邮箱', type: 'email', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入联系邮箱' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'text', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入 WhatsApp 号码' },
      { key: 'location', label: '所在地', type: 'select', required: true, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'location' },
      { key: 'nationality', label: '国籍', type: 'select', required: true, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'nationality' },
      { key: 'nativeLanguage', label: '语言（母语）', type: 'select', required: true, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'language' },
      { key: 'otherLanguages', label: '其他语言', type: 'multiselect', required: false, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'language' },
      { key: 'maxWorkHours', label: '每天最长工作时间', type: 'number', required: true, builtin: true, group: 'work', canFilter: true, placeholder: '例如：6' },
      { key: 'resume', label: '简历附件', type: 'file', required: true, builtin: true, group: 'work', canFilter: true },
      { key: 'minSalary', label: '最低期望薪资', type: 'number', required: true, builtin: true, group: 'work', canFilter: true, placeholder: '例如：4.5' },
      { key: 'highestEducation', label: '最高学历', type: 'select', required: true, builtin: true, group: 'other', canFilter: true, dictionaryKey: 'education' },
      { key: 'needVisa', label: '是否需要签证', type: 'select', required: true, builtin: true, group: 'other', canFilter: true, dictionaryKey: 'yes_no' },
      { key: 'acceptHourlyRate', label: '是否接受按小时付费', type: 'select', required: true, builtin: true, group: 'other', canFilter: true, dictionaryKey: 'yes_no' },
      { key: 'daExperienceYears', label: 'DA 经验年限', type: 'number', required: true, builtin: true, group: 'other', canFilter: true, placeholder: '例如：2' },
      { key: 'employmentStatus', label: '当前在职状态', type: 'select', required: true, builtin: true, group: 'other', canFilter: true, dictionaryKey: 'employment_status' },
    ],
  },
  {
    key: 'sea-default',
    name: '东南亚岗位报名表',
    description: '适合东南亚区域岗位，增加语言和在职状态字段。',
    coverageHint: '继承默认模板，增加语言能力与本地节假日说明。',
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入候选人姓名' },
      { key: 'email', label: '邮箱', type: 'email', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入联系邮箱' },
      { key: 'location', label: '所在地', type: 'select', required: true, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'location' },
      { key: 'otherLanguages', label: '其他语言', type: 'multiselect', required: false, builtin: true, group: 'basic', canFilter: true, dictionaryKey: 'language' },
      { key: 'employmentStatus', label: '在职状态', type: 'select', required: true, builtin: true, group: 'work', canFilter: true, dictionaryKey: 'employment_status' },
      { key: 'minSalary', label: '最低期望薪资', type: 'number', required: true, builtin: true, group: 'work', canFilter: true, placeholder: '例如：3.8' },
      { key: 'needVisa', label: '是否需要签证', type: 'boolean', required: true, builtin: true, group: 'other', canFilter: true },
      { key: 'resume', label: '简历文件', type: 'file', required: true, builtin: true, group: 'other', canFilter: true },
    ],
  },
  {
    key: 'qa-reviewer',
    name: 'QA Reviewer 表单',
    description: '适用于质检与 reviewer 岗位，关注经验与案例说明。',
    coverageHint: '沿用历史模板，无额外字段扩展。',
    fields: [
      { key: 'name', label: '姓名', type: 'text', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入候选人姓名' },
      { key: 'email', label: '邮箱', type: 'email', required: true, builtin: true, group: 'basic', canFilter: false, placeholder: '输入联系邮箱' },
      { key: 'qaExperience', label: 'QA 经验年限', type: 'number', required: true, builtin: true, group: 'work', canFilter: true, placeholder: '例如：3' },
      { key: 'caseStudy', label: '案例说明', type: 'text', required: true, builtin: true, group: 'other', canFilter: true, placeholder: '输入案例关键词或说明' },
      { key: 'resume', label: '简历文件', type: 'file', required: true, builtin: true, group: 'other', canFilter: true },
    ],
  },
]

export const operatorMap: Record<FieldType, Array<{ label: string; value: string }>> = {
  text: [
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
  ],
  email: [
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
  ],
  number: [
    { label: '大于', value: 'gt' },
    { label: '小于', value: 'lt' },
    { label: '等于', value: 'eq' },
    { label: '区间', value: 'between' },
  ],
  select: [
    { label: '包含', value: 'includes' },
    { label: '不包含', value: 'not_includes' },
  ],
  multiselect: [
    { label: '包含', value: 'includes' },
    { label: '不包含', value: 'not_includes' },
  ],
  file: [
    { label: '已上传', value: 'uploaded' },
    { label: '未上传', value: 'not_uploaded' },
  ],
  boolean: [
    { label: '是', value: 'true' },
    { label: '否', value: 'false' },
  ],
}

export function getDefaultRuleValue(fieldType: FieldType) {
  if (fieldType === 'multiselect') return []
  if (fieldType === 'boolean') return 'true'
  return ''
}
