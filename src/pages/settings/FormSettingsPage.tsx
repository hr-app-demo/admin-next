import {
  Button,
  Card,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../apis/http'
import { listDictionaries } from '../../apis/settings/dictionaries'
import {
  createFormTemplate,
  deleteFormTemplate,
  listFormTemplates,
  updateFormTemplate,
} from '../../apis/settings/form-templates'
import {
  fieldTypeLabels,
  type FieldGroup,
  type FieldType,
  type DictionaryDefinition,
  type FormTemplateDefinition,
  type FormTemplateField,
} from '../../data/formConfig'

const fieldGroups: Array<{ label: string; value: FieldGroup }> = [
  { label: '基本信息', value: 'basic' },
  { label: '工作信息', value: 'work' },
  { label: '其他信息', value: 'other' },
]

const fieldTypes = Object.keys(fieldTypeLabels) as FieldType[]
function createEmptyField(): FormTemplateField {
  return {
    key: '',
    label: '',
    type: 'text',
    required: false,
    group: 'other',
    canFilter: true,
    placeholder: '',
  }
}

function createEmptyTemplate(): FormTemplateDefinition {
  return {
    id: '',
    name: '',
    description: '',
    fields: [createEmptyField()],
  }
}

function cloneTemplate(template: FormTemplateDefinition) {
  return {
    ...template,
    fields: template.fields.map((field) => ({ ...field })),
  }
}

export default function FormSettingsPage() {
  const [templates, setTemplates] = useState<FormTemplateDefinition[]>([])
  const [dictionaries, setDictionaries] = useState<DictionaryDefinition[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<FormTemplateDefinition | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = async (preferredSelectedId?: string, preserveCreateState: boolean = false) => {
    setLoading(true)
    try {
      const [nextTemplates, nextDictionaries] = await Promise.all([
        listFormTemplates(),
        listDictionaries(),
      ])
      setTemplates(nextTemplates)
      setDictionaries(nextDictionaries)
      if (!preserveCreateState) {
        const fallback =
          nextTemplates.find((item) => item.id === preferredSelectedId) || nextTemplates[0] || null
        setSelectedId(fallback?.id || '')
        setDraft(fallback ? cloneTemplate(fallback) : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载模板数据失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (isCreating) return
    const current = templates.find((item) => item.id === selectedId) || templates[0] || null
    setSelectedId(current?.id || '')
    setDraft(current ? cloneTemplate(current) : null)
  }, [isCreating, selectedId, templates])

  const dictionaryOptions = dictionaries.map((dictionary) => ({
    label: dictionary.label,
    value: dictionary.id,
  }))

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
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
    const current = templates.find((item) => item.id === selectedId) || null
    setDraft(current ? cloneTemplate(current) : null)
  }

  const handleDuplicate = () => {
    if (!draft || isCreating) return
    setIsCreating(true)
    setSelectedId('')
    setDraft({
      ...cloneTemplate(draft),
      id: '',
      name: `${draft.name} 副本`,
    })
    Message.success('已基于当前模板创建副本草稿')
  }

  const moveField = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.fields.length) return current
      const nextFields = [...current.fields]
      const [target] = nextFields.splice(index, 1)
      nextFields.splice(nextIndex, 0, target)
      return { ...current, fields: nextFields }
    })
  }

  const handleSave = async () => {
    if (!draft) return
    const nextName = draft.name.trim()
    if (!nextName) {
      Message.warning('请先填写模板名称')
      return
    }
    const hasEmptyField = draft.fields.some((field) => !field.key.trim() || !field.label.trim())
    if (hasEmptyField) {
      Message.warning('请先填写所有字段的展示标题和标识')
      return
    }
    const sanitized: FormTemplateDefinition = {
      ...draft,
      name: nextName,
      description: draft.description.trim(),
      fields: draft.fields.map((field) => ({
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
        placeholder: field.placeholder?.trim() || '',
      })),
    }
    setSaving(true)
    try {
      if (isCreating) {
        const created = await createFormTemplate({
          name: sanitized.name,
          description: sanitized.description,
          fields: sanitized.fields,
        })
        Message.success('模板已创建')
        setIsCreating(false)
        await loadData(created.id, false)
      } else {
        const updated = await updateFormTemplate(draft.id, {
          name: sanitized.name,
          description: sanitized.description,
          fields: sanitized.fields,
        })
        Message.success('模板已保存')
        await loadData(updated.id, false)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, isCreating ? '创建模板失败' : '保存模板失败'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = templates[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(fallback ? cloneTemplate(fallback) : null)
      return
    }
    try {
      await deleteFormTemplate(draft.id)
      Message.success('模板已删除')
      setIsCreating(false)
      await loadData(undefined, false)
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除模板失败'))
    }
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
          <Spin loading={loading} block>
            <div className="next-settings-nav">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`next-settings-nav__item${!isCreating && selectedId === template.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsCreating(false)
                    setSelectedId(template.id)
                  }}
                >
                  <div>
                    <strong>{template.name}</strong>
                    <span>{template.fields.length} 个字段</span>
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
          </Spin>
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
                <Button disabled={!draft || isCreating} onClick={handleDuplicate}>
                  复制模板
                </Button>
                <Popconfirm
                  title={isCreating ? '放弃当前新模板？' : '确认删除这个模板吗？'}
                  onOk={handleDelete}
                >
                  <Button status="danger" icon={<IconDelete />}>
                    {isCreating ? '放弃' : '删除'}
                  </Button>
                </Popconfirm>
                <Button type="primary" loading={saving} onClick={() => void handleSave()}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
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

                <div className="next-settings-workspace__section">
                  <div className="next-settings-workspace__section-header">
                    <div>
                      <strong>字段配置</strong>
                      <div className="next-job-create__field-tip">
                        模板只保留名称和说明。字段支持上下调整顺序，便于更快整理报名表结构。
                      </div>
                    </div>
                    <Button
                      icon={<IconPlus />}
                      onClick={() =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                fields: [...current.fields, createEmptyField()],
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
                          <Space>
                            <Button size="small" disabled={index === 0} onClick={() => moveField(index, -1)}>
                              上移
                            </Button>
                            <Button
                              size="small"
                              disabled={index === draft.fields.length - 1}
                              onClick={() => moveField(index, 1)}
                            >
                              下移
                            </Button>
                            <Button
                              size="small"
                              status="danger"
                              icon={<IconDelete />}
                              disabled={draft.fields.length === 1}
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
                          </Space>
                        }
                      >
                        <div className="next-settings-workspace__field-grid">
                          <div className="next-job-create__field">
                            <label>展示标题</label>
                            <Input value={field.label} onChange={(value) => updateField(index, { label: value })} />
                          </div>

                          <div className="next-job-create__field">
                            <label>字段标识</label>
                            <Input
                              value={field.key}
                              onChange={(value) => updateField(index, { key: value })}
                              placeholder="用于内部字段映射"
                            />
                          </div>

                          <div className="next-job-create__field">
                            <label>字段类型</label>
                            <Select
                              value={field.type}
                              onChange={(value) =>
                                updateField(index, {
                                  type: String(value) as FieldType,
                                  dictionaryId:
                                    value === 'select' || value === 'multiselect'
                                      ? field.dictionaryId
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
                                value={field.dictionaryId}
                                placeholder="选择常量字典"
                                onChange={(value) =>
                                  updateField(index, { dictionaryId: value ? String(value) : undefined })
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
