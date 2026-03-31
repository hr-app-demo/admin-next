import {
  Button,
  Card,
  Input,
  Message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import type { DictionaryDefinition } from '../../data/formConfig'
import {
  deleteDictionary,
  getAllDictionaries,
  getDictionaryByKey,
  upsertDictionary,
} from '../../lib/formConfigStore'

function createEmptyDictionary(): DictionaryDefinition {
  return {
    key: '',
    label: '新字典',
    description: '',
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
  const [version, setVersion] = useState(0)
  const dictionaries = useMemo(() => getAllDictionaries(), [version])
  const [selectedKey, setSelectedKey] = useState(dictionaries[0]?.key || '')
  const [draft, setDraft] = useState<DictionaryDefinition | null>(
    dictionaries[0] ? cloneDictionary(dictionaries[0]) : null,
  )
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isCreating) return
    if (!selectedKey && dictionaries[0]) {
      setSelectedKey(dictionaries[0].key)
      setDraft(cloneDictionary(dictionaries[0]))
      return
    }
    const current = getDictionaryByKey(selectedKey)
    setDraft(current ? cloneDictionary(current) : null)
  }, [dictionaries, isCreating, selectedKey])

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
    setSelectedKey('')
    setDraft(createEmptyDictionary())
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyDictionary())
      return
    }
    const current = getDictionaryByKey(selectedKey)
    setDraft(current ? cloneDictionary(current) : null)
  }

  const handleSave = () => {
    if (!draft) return
    const nextKey = draft.key.trim()
    if (!nextKey) {
      Message.warning('请先填写字典 Key')
      return
    }
    const sanitized = {
      ...draft,
      key: nextKey,
      label: draft.label.trim(),
      description: draft.description.trim(),
      options: draft.options
        .map((option) => ({
          label: option.label.trim(),
          value: option.value.trim(),
        }))
        .filter((option) => option.label && option.value),
    }
    upsertDictionary(sanitized)
    Message.success(isCreating ? '字典已创建' : '字典已保存')
    setIsCreating(false)
    setSelectedKey(sanitized.key)
    setVersion((current) => current + 1)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = dictionaries[0] || null
      setSelectedKey(fallback?.key || '')
      setDraft(fallback ? cloneDictionary(fallback) : null)
      return
    }
    deleteDictionary(draft.key)
    Message.success('字典已删除')
    const remaining = getAllDictionaries().filter((item) => item.key !== draft.key)
    const fallback = remaining[0] || null
    setIsCreating(false)
    setSelectedKey(fallback?.key || '')
    setDraft(fallback ? cloneDictionary(fallback) : null)
    setVersion((current) => current + 1)
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
          <div className="next-settings-nav">
            {dictionaries.map((dictionary) => (
              <button
                key={dictionary.key}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedKey === dictionary.key ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedKey(dictionary.key)
                }}
              >
                <div>
                  <strong>{dictionary.label}</strong>
                  <span>{dictionary.key}</span>
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
                <Button type="primary" onClick={handleSave}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-job-create__field">
                  <label>字典 Key</label>
                  <Input
                    value={draft.key}
                    disabled={!isCreating}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, key: value } : current))
                    }
                    placeholder="例如：country"
                  />
                </div>

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
                  <label>说明</label>
                  <Input.TextArea
                    value={draft.description}
                    onChange={(value) =>
                      setDraft((current) =>
                        current ? { ...current, description: value } : current,
                      )
                    }
                    autoSize={{ minRows: 3, maxRows: 6 }}
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
                                  { label: `新选项 ${current.options.length + 1}`, value: '' },
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

          <Card bordered={false} className="next-panel" title="使用说明">
            <div className="next-job-detail__list">
              <div className="next-job-detail__list-item">
                创建岗位第 1 步的国家选择器会直接引用 `country` 字典。
              </div>
              <div className="next-job-detail__list-item">
                表单模板里的下拉、多选字段通过 `dictionaryKey` 指向这里的常量集。
              </div>
              <div className="next-job-detail__list-item">
                第 3 步自动筛选里，选择类字段的可选值也都来自这里。
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
