import {
  Button,
  Card,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tree,
  Upload,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import RichTextEditor from '../../components/RichTextEditor'
import type { UploadItem } from '@arco-design/web-react/es/Upload'

interface MailTemplateRecord {
  id: string
  name: string
  folder: string
  market: string
  language: string
  subject: string
  content: string
  attachments: Array<{
    id: string
    name: string
    url?: string
  }>
  variables: string[]
}

const variableCatalog = [
  'candidate_name',
  'job_title',
  'assessment_link',
  'due_date',
  'project_name',
  'contract_link',
  'onboarding_date',
]

const initialTemplates: MailTemplateRecord[] = [
  {
    id: 'assessment-uk',
    name: 'UK 测试题发送通知',
    folder: '测试题目录',
    market: 'UK',
    language: '中文 / 英文',
    subject: '请提交 {{job_title}} 测试题',
    content: '<p>Hi {{candidate_name}}，请在 <strong>{{due_date}}</strong> 前完成测试题，并通过 {{assessment_link}} 提交。</p>',
    attachments: [{ id: 'att-1', name: 'uk-assessment-brief.pdf' }],
    variables: ['candidate_name', 'job_title', 'assessment_link', 'due_date'],
  },
  {
    id: 'assessment-id',
    name: 'Indonesia 测试题发送通知',
    folder: '测试题目录',
    market: 'Indonesia',
    language: '英文',
    subject: 'Assessment for {{job_title}}',
    content: '<p>Please complete the assessment and submit it through {{assessment_link}} before {{due_date}}.</p>',
    attachments: [{ id: 'att-2', name: 'id-assessment-brief.pdf' }],
    variables: ['candidate_name', 'job_title', 'assessment_link', 'due_date'],
  },
  {
    id: 'contract-uk',
    name: 'UK 合同补全提醒',
    folder: '合同目录',
    market: 'UK',
    language: '中文',
    subject: '请补全 {{job_title}} 的签约资料',
    content: '<p>请在 {{due_date}} 前补全身份证、银行卡等信息，便于后续发合同。</p>',
    attachments: [
      { id: 'att-3', name: 'uk-contract-checklist.pdf' },
      { id: 'att-4', name: 'uk-id-guide.pdf' },
    ],
    variables: ['candidate_name', 'job_title', 'due_date'],
  },
  {
    id: 'contract-br',
    name: 'Brazil 合同发送邮件',
    folder: '合同目录',
    market: 'Brazil',
    language: '英文',
    subject: 'Contract package for {{job_title}}',
    content: '<p>Please review the attached contract package and send back the signed version.</p>',
    attachments: [
      { id: 'att-5', name: 'br-contract-draft.pdf' },
      { id: 'att-6', name: 'br-onboarding-guide.pdf' },
    ],
    variables: ['candidate_name', 'job_title'],
  },
]

function createEmptyTemplate(index: number): MailTemplateRecord {
  return {
    id: `mail-template-${index + 1}`,
    name: `新邮件模板 ${index + 1}`,
    folder: '测试题目录',
    market: 'Global',
    language: '中文',
    subject: '',
    content: '<p><br></p>',
    attachments: [],
    variables: [],
  }
}

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [selectedId, setSelectedId] = useState(initialTemplates[0]?.id || '')
  const [draft, setDraft] = useState<MailTemplateRecord | null>(initialTemplates[0] || null)
  const [isCreating, setIsCreating] = useState(false)
  const [variableInput, setVariableInput] = useState('')
  const [selectedVariable, setSelectedVariable] = useState(variableCatalog[0])
  const [previewAttachment, setPreviewAttachment] = useState<MailTemplateRecord['attachments'][number] | null>(null)

  useEffect(() => {
    if (isCreating) return
    const current = templates.find((item) => item.id === selectedId) || templates[0] || null
    setSelectedId(current?.id || '')
      setDraft(
        current
          ? {
              ...current,
              attachments: current.attachments.map((item) => ({ ...item })),
              variables: [...current.variables],
            }
          : null,
      )
  }, [isCreating, selectedId, templates])

  const treeData = useMemo(() => {
    const folderMap = new Map<string, Map<string, MailTemplateRecord[]>>()

    templates.forEach((template) => {
      if (!folderMap.has(template.folder)) {
        folderMap.set(template.folder, new Map())
      }
      const marketMap = folderMap.get(template.folder)!
      if (!marketMap.has(template.market)) {
        marketMap.set(template.market, [])
      }
      marketMap.get(template.market)!.push(template)
    })

    return Array.from(folderMap.entries()).map(([folder, marketMap]) => ({
      key: folder,
      title: folder,
      children: Array.from(marketMap.entries()).map(([market, records]) => ({
        key: `${folder}-${market}`,
        title: market,
        children: records.map((record) => ({
          key: record.id,
          title: record.name,
          isLeaf: true,
        })),
      })),
    }))
  }, [templates])

  const expandedKeys = useMemo(
    () =>
      treeData.flatMap((folder) => [
        String(folder.key),
        ...((folder.children || []).map((market) => String(market.key))),
      ]),
    [treeData],
  )

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyTemplate(templates.length))
    setVariableInput('')
  }

  const handleSave = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      Message.warning('请先填写模板名称')
      return
    }
    const next = {
      ...draft,
      name: draft.name.trim(),
      subject: draft.subject.trim(),
      content: draft.content.trim(),
    }
    if (isCreating) {
      setTemplates((current) => [...current, next])
      Message.success('邮件模板已创建')
    } else {
      setTemplates((current) => current.map((item) => (item.id === next.id ? next : item)))
      Message.success('邮件模板已保存')
    }
    setIsCreating(false)
    setSelectedId(next.id)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = templates[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(
        fallback
          ? {
              ...fallback,
              attachments: fallback.attachments.map((item) => ({ ...item })),
              variables: [...fallback.variables],
            }
          : null,
      )
      return
    }
    const next = templates.filter((item) => item.id !== draft.id)
    setTemplates(next)
    const fallback = next[0] || null
    setSelectedId(fallback?.id || '')
    setDraft(
      fallback
        ? {
            ...fallback,
            attachments: fallback.attachments.map((item) => ({ ...item })),
            variables: [...fallback.variables],
          }
        : null,
    )
    Message.success('邮件模板已删除')
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyTemplate(templates.length))
      return
    }
    const current = templates.find((item) => item.id === selectedId) || null
    setDraft(
      current
        ? {
            ...current,
            attachments: current.attachments.map((item) => ({ ...item })),
            variables: [...current.variables],
          }
        : null,
    )
  }

  const attachmentFileList: UploadItem[] = (draft?.attachments || []).map((item) => ({
    uid: item.id,
    name: item.name,
    url: item.url,
    status: 'done',
  }))

  const insertVariable = (target: 'subject' | 'content', variableName: string) => {
    const token = `{{${variableName}}}`
    setDraft((current) => {
      if (!current) return current
      const nextVariables = Array.from(new Set([...current.variables, variableName]))
      if (target === 'subject') {
        return {
          ...current,
          variables: nextVariables,
          subject: `${current.subject}${current.subject ? ' ' : ''}${token}`,
        }
      }
      return {
        ...current,
        variables: nextVariables,
        content: `${current.content}<p>${token}</p>`,
      }
    })
    Message.success(target === 'subject' ? '变量已插入标题' : '变量已插入正文')
  }

  const addCustomVariable = () => {
    const value = variableInput.trim()
    if (!value) return
    setDraft((current) =>
      current
        ? { ...current, variables: Array.from(new Set([...current.variables, value])) }
        : current,
    )
    setVariableInput('')
    Message.success('变量已添加')
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          title="邮件模板"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增模板
            </Button>
          }
        >
          <div className="next-settings-tree">
            <Tree
              treeData={treeData}
              defaultExpandedKeys={expandedKeys}
              selectedKeys={isCreating ? [] : selectedId ? [selectedId] : []}
              onSelect={(keys) => {
                const key = String(keys[0] || '')
                if (!key || key.includes('-目录') || key.includes('目录-')) return
                const hit = templates.find((item) => item.id === key)
                if (hit) {
                  setIsCreating(false)
                  setSelectedId(hit.id)
                }
              }}
            />

            {isCreating ? (
              <div className="next-settings-tree__draft">
                <Tag color="arcoblue">草稿</Tag>
                <span>正在创建新的邮件模板</span>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="next-settings-content">
          <Card
            bordered={false}
            className="next-panel"
            title={isCreating ? '新建邮件模板' : '模板详情'}
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
                <div className="next-settings-workspace__field-grid">
                  <div className="next-job-create__field">
                    <label>模板名称</label>
                    <Input
                      value={draft.name}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, name: value } : current))
                      }
                    />
                  </div>
                  <div className="next-job-create__field">
                    <label>目录类别</label>
                    <Select
                      value={draft.folder}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, folder: String(value) } : current,
                        )
                      }
                    >
                      {['测试题目录', '合同目录', '通知目录'].map((item) => (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>国家 / 分组</label>
                    <Select
                      value={draft.market}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, market: String(value) } : current,
                        )
                      }
                    >
                      {['Global', 'UK', 'United States', 'Indonesia', 'Brazil', 'Philippines'].map(
                        (item) => (
                          <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>
                        ),
                      )}
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>语言</label>
                    <Select
                      value={draft.language}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, language: String(value) } : current,
                        )
                      }
                    >
                      {['中文', '英文', '中文 / 英文'].map((item) => (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>邮件标题</label>
                    <Input
                      value={draft.subject}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, subject: value } : current))
                      }
                    />
                  </div>
                </div>

                <div className="next-job-create__field">
                  <label>邮件正文</label>
                  <RichTextEditor
                    value={draft.content}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, content: value } : current))
                    }
                    placeholder="填写邮件正文内容，可直接插入变量和附件说明"
                  />
                </div>

                <div className="next-settings-workspace__section">
                  <div className="next-settings-workspace__section-header">
                    <div>
                      <strong>附件管理</strong>
                      <div className="next-job-create__field-tip">支持上传本地附件，并在当前页面直接预览。</div>
                    </div>
                  </div>
                  <Upload
                    action="/"
                    autoUpload={false}
                    fileList={attachmentFileList}
                    onChange={(fileList) => {
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              attachments: fileList.map((file) => ({
                                id: String(file.uid),
                                name: file.name || '未命名附件',
                                url:
                                  file.url ||
                                  (file.originFile ? URL.createObjectURL(file.originFile as File) : undefined),
                              })),
                            }
                          : current,
                      )
                    }}
                    onPreview={(file) =>
                      setPreviewAttachment({
                        id: String(file.uid),
                        name: file.name || '未命名附件',
                        url: file.url,
                      })
                    }
                    onRemove={(file) => {
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              attachments: current.attachments.filter(
                                (attachment) => attachment.id !== String(file.uid),
                              ),
                            }
                          : current,
                      )
                      return true
                    }}
                  />
                  <div className="next-settings-workspace__attachment-list">
                    {draft.attachments.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="next-settings-workspace__attachment-chip"
                        onClick={() => setPreviewAttachment(item)}
                      >
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="next-settings-workspace__section">
                  <div className="next-settings-workspace__section-header">
                    <div>
                      <strong>变量交互</strong>
                      <div className="next-job-create__field-tip">可以从变量库中选取变量，并直接插入到标题或正文。</div>
                    </div>
                  </div>
                  <div className="next-settings-workspace__field-inline">
                    <Select value={selectedVariable} onChange={(value) => setSelectedVariable(String(value))}>
                      {variableCatalog.map((item) => (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      ))}
                    </Select>
                    <Space>
                      <Button onClick={() => insertVariable('subject', selectedVariable)}>插入标题</Button>
                      <Button onClick={() => insertVariable('content', selectedVariable)}>插入正文</Button>
                    </Space>
                  </div>
                  <div className="next-settings-workspace__field-inline">
                    <Input
                      value={variableInput}
                      onChange={setVariableInput}
                      placeholder="输入变量名，例如 candidate_name"
                    />
                    <Button onClick={addCustomVariable}>添加变量</Button>
                  </div>
                  <Space wrap>
                    {draft.variables.map((item) => (
                      <Tag
                        key={item}
                        color="arcoblue"
                        closable
                        onClose={() =>
                          setDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  variables: current.variables.filter(
                                    (variable) => variable !== item,
                                  ),
                                }
                              : current,
                          )
                        }
                      >
                        {item}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的邮件模板。</div>
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={previewAttachment?.name || '附件预览'}
        visible={Boolean(previewAttachment)}
        footer={null}
        onCancel={() => setPreviewAttachment(null)}
        className="next-mail-preview__modal next-modal--70vh"
      >
        {previewAttachment?.url ? (
          previewAttachment.url.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
            <img
              src={previewAttachment.url}
              alt={previewAttachment.name}
              className="next-mail-preview__image"
            />
          ) : (
            <iframe
              src={previewAttachment.url}
              title={previewAttachment.name}
              className="next-mail-preview__frame"
            />
          )
        ) : (
          <div className="next-empty-state">当前附件没有可预览地址，仅展示文件名。</div>
        )}
      </Modal>
    </div>
  )
}
