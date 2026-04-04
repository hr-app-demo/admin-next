export type FieldType = 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'file' | 'boolean'

export type FieldGroup = 'basic' | 'work' | 'other'

export interface DictionaryOption {
  label: string
  value: string
}

export interface DictionaryDefinition {
  id: string
  label: string
  options: DictionaryOption[]
}

export interface FormTemplateField {
  key: string
  label: string
  type: FieldType
  required: boolean
  group: FieldGroup
  canFilter: boolean
  dictionaryId?: string
  placeholder?: string
}

export interface FormTemplateDefinition {
  id: string
  name: string
  description: string
  fields: FormTemplateField[]
}

export interface JobFormField {
  key: string
  label: string
  type: FieldType
  required: boolean
  canFilter: boolean
  dictionaryId?: string
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
