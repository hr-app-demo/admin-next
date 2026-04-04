import {
  Button,
  Card,
  Input,
  Message,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import {
  createDictionary,
  deleteDictionary,
  listDictionaries,
  updateDictionary,
} from '../../apis/settings/dictionaries'
import { getApiErrorMessage } from '../../apis/http'
import type { DictionaryDefinition } from '../../data/formConfig'

function createEmptyDictionary(): DictionaryDefinition {
  return {
    id: '',
    label: '新字典',
    options: [],
  }
}

function cloneDictionary(dictionary: DictionaryDefinition) {
  return {
    ...dictionary,
    options: dictionary.options.map((option) => ({ ...option })),
  }
}

export default function DictionarySettingsPage() {
  const [dictionaries, setDictionaries] = useState<DictionaryDefinition[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<DictionaryDefinition | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = async (preferredSelectedId?: string, preserveCreateState: boolean = false) => {
    setLoading(true)
    try {
      const nextDictionaries = await listDictionaries()
      setDictionaries(nextDictionaries)
      if (!preserveCreateState) {
        const fallback =
          nextDictionaries.find((item) => item.id === preferredSelectedId) || nextDictionaries[0] || null
        setSelectedId(fallback?.id || '')
        setDraft(fallback ? cloneDictionary(fallback) : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载字典数据失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (isCreating) return
    const current = dictionaries.find((item) => item.id === selectedId) || dictionaries[0] || null
    setSelectedId(current?.id || '')
    setDraft(current ? cloneDictionary(current) : null)
  }, [dictionaries, isCreating, selectedId])

  const optionColumns = [
    {
      title: '展示文案',
      dataIndex: 'label',
      render: (_: string, record: DictionaryDefinition['options'][number], index: number) => (
        <Input
          value={record.label}
          onChange={(value) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    options: current.options.map((option, optionIndex) =>
                      optionIndex === index ? { ...option, label: value } : option,
                    ),
                  }
                : current,
            )
          }
          placeholder="例如：United Kingdom"
        />
      ),
    },
    {
      title: '提交值',
      dataIndex: 'value',
      render: (_: string, record: DictionaryDefinition['options'][number], index: number) => (
        <Input
          value={record.value}
          onChange={(value) =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    options: current.options.map((option, optionIndex) =>
                      optionIndex === index ? { ...option, value } : option,
                    ),
                  }
                : current,
            )
          }
          placeholder="例如：UK"
        />
      ),
    },
    {
      title: '操作',
      width: 90,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          size="mini"
          status="danger"
          icon={<IconDelete />}
          onClick={() =>
            setDraft((current) =>
              current
                ? {
                    ...current,
                    options: current.options.filter((_, optionIndex) => optionIndex !== index),
                  }
                : current,
            )
          }
        />
      ),
    },
  ]

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyDictionary())
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyDictionary())
      return
    }
    const current = dictionaries.find((item) => item.id === selectedId) || null
    setDraft(current ? cloneDictionary(current) : null)
  }

  const handleSave = async () => {
    if (!draft) return
    const nextLabel = draft.label.trim()
    if (!nextLabel) {
      Message.warning('请先填写字典名称')
      return
    }
    const sanitized = {
      ...draft,
      label: nextLabel,
      options: draft.options
        .map((option) => ({
          label: option.label.trim(),
          value: option.value.trim(),
        }))
        .filter((option) => option.label && option.value),
    }
    setSaving(true)
    try {
      if (isCreating) {
        const created = await createDictionary({
          label: sanitized.label,
          options: sanitized.options,
        })
        Message.success('字典已创建')
        setIsCreating(false)
        await loadData(created.id, false)
      } else {
        const updated = await updateDictionary(draft.id, {
          label: sanitized.label,
          options: sanitized.options,
        })
        Message.success('字典已保存')
        await loadData(updated.id, false)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, isCreating ? '创建字典失败' : '保存字典失败'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = dictionaries[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(fallback ? cloneDictionary(fallback) : null)
      return
    }
    try {
      await deleteDictionary(draft.id)
      Message.success('字典已删除')
      setIsCreating(false)
      await loadData(undefined, false)
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除字典失败'))
    }
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          title="常量字典"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增字典
            </Button>
          }
        >
          <Spin loading={loading} block>
            <div className="next-settings-nav">
              {dictionaries.map((dictionary) => (
                <button
                  key={dictionary.id}
                  type="button"
                  className={`next-settings-nav__item${!isCreating && selectedId === dictionary.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsCreating(false)
                    setSelectedId(dictionary.id)
                  }}
                >
                  <div>
                    <strong>{dictionary.label}</strong>
                    <span>{dictionary.options.length} 个常量项</span>
                  </div>
                  <Tag>{dictionary.options.length} 项</Tag>
                </button>
              ))}

              {isCreating ? (
                <button type="button" className="next-settings-nav__item is-active">
                  <div>
                    <strong>新字典</strong>
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
            title={isCreating ? '新建字典' : '字典详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm
                  title={isCreating ? '放弃当前新建字典？' : '确认删除这个字典吗？'}
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
                  <label>字典名称</label>
                  <Input
                    value={draft.label}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, label: value } : current))
                    }
                  />
                </div>

                <div className="next-job-create__field">
                  <label>选项管理</label>
                  <Table
                    pagination={false}
                    rowKey={(record) => `${record.value}-${record.label}`}
                    columns={optionColumns}
                    data={draft.options}
                  />
                  <div className="next-settings-workspace__actions">
                    <Button
                      icon={<IconPlus />}
                      onClick={() =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                options: [
                                  ...current.options,
                                  { label: '', value: '' },
                                ],
                              }
                            : current,
                        )
                      }
                    >
                      新增常量项
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的字典。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
