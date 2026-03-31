import {
  defaultDictionaries,
  defaultFormTemplates,
  type DictionaryDefinition,
  type FormTemplateField,
  type FormTemplateDefinition,
} from '../data/formConfig'

const STORAGE_KEY = 'admin-web-next.form-config.v1'

interface PersistedFormConfigState {
  dictionaries: Record<string, DictionaryDefinition>
  templates: Record<string, FormTemplateDefinition>
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeDictionary(input: unknown): DictionaryDefinition | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<DictionaryDefinition>
  const key = typeof raw.key === 'string' ? raw.key : ''
  const label = typeof raw.label === 'string' ? raw.label : key
  const description = typeof raw.description === 'string' ? raw.description : ''
  const options = Array.isArray(raw.options)
    ? raw.options
        .map((option) => {
          if (!option || typeof option !== 'object') return null
          const rawOption = option as { label?: unknown; value?: unknown }
          if (typeof rawOption.label !== 'string' || typeof rawOption.value !== 'string') return null
          return {
            label: rawOption.label,
            value: rawOption.value,
          }
        })
        .filter((option): option is NonNullable<typeof option> => Boolean(option))
    : []

  if (!key) return null
  return { key, label, description, options }
}

function normalizeField(input: unknown): FormTemplateField | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<FormTemplateField>
  if (typeof raw.key !== 'string' || typeof raw.label !== 'string' || typeof raw.type !== 'string') {
    return null
  }

  return {
    key: raw.key,
    label: raw.label,
    type: raw.type as FormTemplateField['type'],
    required: Boolean(raw.required),
    builtin: Boolean(raw.builtin),
    group: (raw.group as FormTemplateField['group']) || 'other',
    canFilter: Boolean(raw.canFilter),
    dictionaryKey: typeof raw.dictionaryKey === 'string' ? raw.dictionaryKey : undefined,
    placeholder: typeof raw.placeholder === 'string' ? raw.placeholder : '',
  }
}

function normalizeTemplate(input: unknown): FormTemplateDefinition | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<FormTemplateDefinition>
  const key = typeof raw.key === 'string' ? raw.key : ''
  if (!key) return null
  return {
    key,
    name: typeof raw.name === 'string' ? raw.name : key,
    description: typeof raw.description === 'string' ? raw.description : '',
    coverageHint: typeof raw.coverageHint === 'string' ? raw.coverageHint : '',
    fields: Array.isArray(raw.fields)
      ? raw.fields
          .map(normalizeField)
          .filter((field): field is NonNullable<typeof field> => Boolean(field))
      : [],
  }
}

function readStoredState(): PersistedFormConfigState {
  if (!canUseStorage()) {
    return { dictionaries: {}, templates: {} }
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { dictionaries: {}, templates: {} }
  }

  try {
    const parsed = JSON.parse(raw) as PersistedFormConfigState
    const dictionaries = Object.fromEntries(
      Object.values(parsed.dictionaries || {})
        .map(normalizeDictionary)
        .filter((dictionary): dictionary is NonNullable<typeof dictionary> => Boolean(dictionary))
        .map((dictionary) => [dictionary.key, dictionary]),
    )
    const templates = Object.fromEntries(
      Object.values(parsed.templates || {})
        .map(normalizeTemplate)
        .filter((template): template is NonNullable<typeof template> => Boolean(template))
        .map((template) => [template.key, template]),
    )
    return {
      dictionaries,
      templates,
    }
  } catch {
    return { dictionaries: {}, templates: {} }
  }
}

function writeStoredState(state: PersistedFormConfigState) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getAllDictionaries() {
  const stored = readStoredState()
  const merged = new Map<string, DictionaryDefinition>()

  Object.values(defaultDictionaries).forEach((dictionary) => merged.set(dictionary.key, dictionary))
  Object.values(stored.dictionaries).forEach((dictionary) => merged.set(dictionary.key, dictionary))

  return Array.from(merged.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
}

export function getDictionaryByKey(key?: string | null) {
  if (!key) return null
  const stored = readStoredState()
  return stored.dictionaries[key] || defaultDictionaries[key] || null
}

export function upsertDictionary(dictionary: DictionaryDefinition) {
  const stored = readStoredState()
  writeStoredState({
    dictionaries: {
      ...stored.dictionaries,
      [dictionary.key]: dictionary,
    },
    templates: stored.templates,
  })
}

export function deleteDictionary(key: string) {
  const stored = readStoredState()
  const nextDictionaries = { ...stored.dictionaries }
  delete nextDictionaries[key]
  writeStoredState({
    dictionaries: nextDictionaries,
    templates: stored.templates,
  })
}

export function getAllFormTemplates() {
  const stored = readStoredState()
  const merged = new Map<string, FormTemplateDefinition>()

  defaultFormTemplates.forEach((template) => merged.set(template.key, template))
  Object.values(stored.templates).forEach((template) => merged.set(template.key, template))

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

export function getFormTemplateByKey(key?: string | null) {
  if (!key) return null
  const stored = readStoredState()
  return stored.templates[key] || defaultFormTemplates.find((template) => template.key === key) || null
}

export function upsertFormTemplate(template: FormTemplateDefinition) {
  const stored = readStoredState()
  writeStoredState({
    dictionaries: stored.dictionaries,
    templates: {
      ...stored.templates,
      [template.key]: template,
    },
  })
}

export function deleteFormTemplate(key: string) {
  const stored = readStoredState()
  const nextTemplates = { ...stored.templates }
  delete nextTemplates[key]
  writeStoredState({
    dictionaries: stored.dictionaries,
    templates: nextTemplates,
  })
}

export function resolveDictionaryOptions(dictionaryKey?: string | null) {
  return getDictionaryByKey(dictionaryKey)?.options || []
}
