import {
  Button,
  Card,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import {
  fieldTypeLabels,
  type FieldGroup,
  type FieldType,
  type FormTemplateDefinition,
  type FormTemplateField,
} from '../../data/formConfig'
import {
  deleteFormTemplate,
  getAllDictionaries,
  getAllFormTemplates,
  getFormTemplateByKey,
  upsertFormTemplate,
} from '../../lib/formConfigStore'

const fieldGroups: Array<{ label: string; value: FieldGroup }> = [
  { label: '基本信息', value: 'basic' },
  { label: '工作信息', value: 'work' },
  { label: '其他信息', value: 'other' },
]

const fieldTypes = Object.keys(fieldTypeLabels) as FieldType[]

function createEmptyField(index: number): FormTemplateField {
  return {
    key: `custom_field_${index + 1}`,
    label: `新字段 ${index + 1}`,
    type: 'text',
    required: false,
    builtin: false,
    group: 'other',
    canFilter: true,
    placeholder: '',
  }
}

function createEmptyTemplate(): FormTemplateDefinition {
  return {
    key: '',
    name: '新模板',
    description: '',
    coverageHint: '',
    fields: [createEmptyField(0)],
  }
}

function cloneTemplate(template: FormTemplateDefinition) {
  return {
    ...template,
    fields: template.fields.map((field) => ({ ...field })),
  }
}

export default function FormSettingsPage() {
  const [version, setVersion] = useState(0)
  const templates = useMemo(() => getAllFormTemplates(), [version])
  const dictionaries = useMemo(() => getAllDictionaries(), [version])
  const [selectedKey, setSelectedKey] = useState(templates[0]?.key || '')
  const [draft, setDraft] = useState<FormTemplateDefinition | null>(
    templates[0] ? cloneTemplate(templates[0]) : null,
  )
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isCreating) return
    if (!selectedKey && templates[0]) {
      setSelectedKey(templates[0].key)
      setDraft(cloneTemplate(templates[0]))
      return
    }
    const current = getFormTemplateByKey(selectedKey)
    setDraft(current ? cloneTemplate(current) : null)
  }, [isCreating, selectedKey, templates])

  const dictionaryOptions = dictionaries.map((dictionary) => ({
    label: dictionary.label,
    value: dictionary.key,
  }))

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedKey('')
    setDraft(createEmptyTemplate())
  }

  const updateTemplate = (patch: Partial<FormTemplateDefinition>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  const updateField = (index: number, patch: Partial<FormTemplateField>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            fields: current.fields.map((field, fieldIndex) =>
              fieldIndex === index ? { ...field, ...patch } : field,
            ),
          }
        : current,
    )
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyTemplate())
      return
    }
    const current = getFormTemplateByKey(selectedKey)
    setDraft(current ? cloneTemplate(current) : null)
  }

  const handleSave = () => {
    if (!draft) return
    const nextKey = draft.key.trim()
    if (!nextKey) {
      Message.warning('请先填写模板 Key')
      return
    }
    const sanitized: FormTemplateDefinition = {
      ...draft,
      key: nextKey,
      name: draft.name.trim(),
      description: draft.description.trim(),
      coverageHint: draft.coverageHint.trim(),
      fields: draft.fields
        .map((field, index) => ({
          ...field,
          key: field.key.trim() || `field_${index + 1}`,
          label: field.label.trim() || `字段 ${index + 1}`,
          placeholder: field.placeholder?.trim() || '',
        }))
        .filter((field) => field.key && field.label),
    }
    upsertFormTemplate(sanitized)
    Message.success(isCreating ? '模板已创建' : '模板已保存')
    setIsCreating(false)
    setSelectedKey(sanitized.key)
    setVersion((current) => current + 1)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = templates[0] || null
      setSelectedKey(fallback?.key || '')
      setDraft(fallback ? cloneTemplate(fallback) : null)
      return
    }
    deleteFormTemplate(draft.key)
    Message.success('模板已删除')
    const remaining = getAllFormTemplates().filter((item) => item.key !== draft.key)
    const fallback = remaining[0] || null
    setIsCreating(false)
    setSelectedKey(fallback?.key || '')
    setDraft(fallback ? cloneTemplate(fallback) : null)
    setVersion((current) => current + 1)
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          title="报名表模板"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增模板
            </Button>
          }
        >
          <div className="next-settings-nav">
            {templates.map((template) => (
              <button
                key={template.key}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedKey === template.key ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedKey(template.key)
                }}
              >
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.key}</span>
                </div>
                <Tag>{template.fields.length} 个字段</Tag>
              </button>
            ))}

            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div>
                  <strong>新模板</strong>
                  <span>未保存</span>
                </div>
                <Tag color="arcoblue">草稿</Tag>
              </button>
            ) : null}
          </div>
        </Card>

        <div className="next-settings-content">
          <Card
            bordered={false}
            className="next-panel"
            title={isCreating ? '新建报名表模板' : '模板详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm
                  title={isCreating ? '放弃当前新模板？' : '确认删除这个模板吗？'}
                  onOk={handleDelete}
                >
                  <Button status="danger" icon={<IconDelete />}>
                    {isCreating ? '放弃' : '删除'}
                  </Button>
                </Popconfirm>
                <Button type="primary" onClick={handleSave}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-job-create__field">
                  <label>模板 Key</label>
                  <Input
                    value={draft.key}
                    disabled={!isCreating}
                    onChange={(value) => updateTemplate({ key: value })}
                    placeholder="例如：da-default"
                  />
                </div>

                <div className="next-job-create__field">
                  <label>模板名称</label>
                  <Input value={draft.name} onChange={(value) => updateTemplate({ name: value })} />
                </div>

                <div className="next-job-create__field">
                  <label>模板说明</label>
                  <Input.TextArea
                    value={draft.description}
                    onChange={(value) => updateTemplate({ description: value })}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </div>

                <div className="next-job-create__field">
                  <label>覆盖说明</label>
                  <Input.TextArea
                    value={draft.coverageHint}
                    onChange={(value) => updateTemplate({ coverageHint: value })}
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </div>

                <div className="next-settings-workspace__section">
                  <div className="next-settings-workspace__section-header">
                    <div>
                      <strong>字段配置</strong>
                      <div className="next-job-create__field-tip">
                        左侧模板只是目录，这里才是当前模板的字段数据，支持新增、修改和删除。
                      </div>
                    </div>
                    <Button
                      icon={<IconPlus />}
                      onClick={() =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                fields: [...current.fields, createEmptyField(current.fields.length)],
                              }
                            : current,
                        )
                      }
                    >
                      新增字段
                    </Button>
                  </div>

                  <div className="next-settings-workspace__cards">
                    {draft.fields.map((field, index) => (
                      <Card
                        key={`${field.key}-${index}`}
                        bordered={false}
                        className="next-job-create__subcard"
                        title={field.label || `字段 ${index + 1}`}
                        extra={
                          <Button
                            size="small"
                            status="danger"
                            icon={<IconDelete />}
                            onClick={() =>
                              setDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      fields: current.fields.filter((_, fieldIndex) => fieldIndex !== index),
                                    }
                                  : current,
                              )
                            }
                          >
                            删除字段
                          </Button>
                        }
                      >
                        <div className="next-settings-workspace__field-grid">
                          <div className="next-job-create__field">
                            <label>字段名称</label>
                            <Input value={field.label} onChange={(value) => updateField(index, { label: value })} />
                          </div>

                          <div className="next-job-create__field">
                            <label>字段 Key</label>
                            <Input value={field.key} onChange={(value) => updateField(index, { key: value })} />
                          </div>

                          <div className="next-job-create__field">
                            <label>字段类型</label>
                            <Select
                              value={field.type}
                              onChange={(value) =>
                                updateField(index, {
                                  type: String(value) as FieldType,
                                  dictionaryKey:
                                    value === 'select' || value === 'multiselect'
                                      ? field.dictionaryKey
                                      : undefined,
                                })
                              }
                            >
                              {fieldTypes.map((fieldType) => (
                                <Select.Option key={fieldType} value={fieldType}>
                                  {fieldTypeLabels[fieldType]}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>

                          <div className="next-job-create__field">
                            <label>字段分组</label>
                            <Select
                              value={field.group}
                              onChange={(value) =>
                                updateField(index, { group: String(value) as FieldGroup })
                              }
                            >
                              {fieldGroups.map((group) => (
                                <Select.Option key={group.value} value={group.value}>
                                  {group.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>

                          {(field.type === 'select' || field.type === 'multiselect') ? (
                            <div className="next-job-create__field">
                              <label>字典来源</label>
                              <Select
                                allowClear
                                value={field.dictionaryKey}
                                placeholder="选择常量字典"
                                onChange={(value) =>
                                  updateField(index, { dictionaryKey: value ? String(value) : undefined })
                                }
                              >
                                {dictionaryOptions.map((option) => (
                                  <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          ) : null}

                          <div className="next-job-create__field">
                            <label>占位提示</label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(value) => updateField(index, { placeholder: value })}
                              placeholder="选填"
                            />
                          </div>
                        </div>

                        <div className="next-job-create__field-card-actions">
                          <Checkbox
                            checked={field.required}
                            onChange={(checked) => updateField(index, { required: checked })}
                          >
                            必填
                          </Checkbox>
                          <Checkbox
                            checked={field.canFilter}
                            onChange={(checked) => updateField(index, { canFilter: checked })}
                          >
                            支持自动筛选
                          </Checkbox>
                          <Checkbox
                            checked={field.builtin}
                            onChange={(checked) => updateField(index, { builtin: checked })}
                          >
                            内置字段
                          </Checkbox>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的模板。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
