import {
  Button,
  Card,
  Input,
  Message,
  Modal,
  Popconfirm,
  Space,
  TreeSelect,
  Upload,
} from '@arco-design/web-react'
import { IconCopy, IconDelete, IconRefresh } from '@arco-design/web-react/icon'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { useState } from 'react'
import RichTextEditor from '../../../../components/RichTextEditor'
import FileAttachmentGrid from '../../../../components/shared/FileAttachmentGrid'
import type { MailAttachment, MailTemplateCategory, MailTemplateRecord } from '../types'

interface TemplateFormCardProps {
  categories: MailTemplateCategory[]
  draft: MailTemplateRecord | null
  isCreating: boolean
  variableCatalog: Array<{ key: string; label: string }>
  uploadingAttachment?: boolean
  onChangeDraft: (updater: (current: MailTemplateRecord | null) => MailTemplateRecord | null) => void
  onSave: () => void
  onDelete: () => void
  onReset: () => void
  onPreviewAttachment: (attachment: MailAttachment) => void
  onUploadAttachment: (file: File) => Promise<void>
}

export default function TemplateFormCard({
  categories,
  draft,
  isCreating,
  variableCatalog,
  uploadingAttachment = false,
  onChangeDraft,
  onSave,
  onDelete,
  onReset,
  onPreviewAttachment,
  onUploadAttachment,
}: TemplateFormCardProps) {
  const [variableModalVisible, setVariableModalVisible] = useState(false)
  const leafCategories = categories.filter((item) => item.parentId !== null)
  const attachmentFileList: UploadItem[] = (draft?.attachments || []).map((item) => ({
    uid: item.id,
    name: item.name,
    url: item.url,
    status: 'done',
  }))

  return (
    <>
      <Card
        bordered={false}
        className="next-panel next-mail-template-form-card"
        title={isCreating ? '新建邮件模板' : '模板详情'}
        extra={
          <Space>
            <Button
              type="outline"
              status="warning"
              onClick={() => setVariableModalVisible(true)}
            >
              查看支持变量
            </Button>
            <Button icon={<IconRefresh />} onClick={onReset}>
              重置
            </Button>
            <Popconfirm title={isCreating ? '放弃当前新模板？' : '确认删除这个模板吗？'} onOk={onDelete}>
              <Button status="danger" icon={<IconDelete />}>
                {isCreating ? '放弃' : '删除'}
              </Button>
            </Popconfirm>
            <Button type="primary" onClick={onSave}>
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
                    onChangeDraft((current) => (current ? { ...current, name: value } : current))
                  }
                />
              </div>
              <div className="next-job-create__field">
                <label>所属目录</label>
                <TreeSelect
                  value={draft.categoryId}
                  treeData={categories
                    .filter((item) => item.parentId === null)
                    .map((root) => ({
                      key: root.id,
                      title: root.name,
                      selectable: false,
                      children: leafCategories
                        .filter((item) => item.parentId === root.id)
                        .map((item) => ({
                          key: item.id,
                          title: item.name,
                        })),
                    }))}
                  placeholder="请选择所属目录"
                  onChange={(value) =>
                    onChangeDraft((current) =>
                      current ? { ...current, categoryId: String(value) } : current,
                    )
                  }
                />
              </div>
              <div className="next-job-create__field next-job-create__field--full">
                <label>邮件标题</label>
                <Input
                  value={draft.subject}
                  onChange={(value) =>
                    onChangeDraft((current) => (current ? { ...current, subject: value } : current))
                  }
                />
              </div>
            </div>

            <div className="next-job-create__field">
              <label>邮件正文</label>
              <RichTextEditor
                value={draft.content}
                onChange={(value) =>
                  onChangeDraft((current) => (current ? { ...current, content: value } : current))
                }
                placeholder="填写邮件正文内容，可直接插入变量和附件说明"
              />
            </div>
          </div>
        ) : (
          <div className="next-empty-state">请选择要维护的邮件模板。</div>
        )}
      </Card>

      {draft ? (
        <Card bordered={false} className="next-panel" title="附件管理">
          <div className="next-file-section">
            <div className="next-file-section__toolbar">
              <div>
                <div className="next-job-create__field-tip">支持上传本地附件，并在当前页面直接预览。</div>
                <span className="next-file-section__meta">支持图片、PDF、文本类在线预览，其他格式可先下载查看。</span>
              </div>
              <Upload
                action="/"
                autoUpload={false}
                showUploadList={false}
                fileList={attachmentFileList}
                onChange={async (fileList) => {
                  const latest = [...fileList].reverse().find((item) => item.originFile)
                  if (!latest?.originFile) return
                  await onUploadAttachment(latest.originFile as File)
                }}
              >
                <Button type="primary" loading={uploadingAttachment}>上传附件</Button>
              </Upload>
            </div>

            <FileAttachmentGrid
              files={draft.attachments}
              onPreview={(file) => onPreviewAttachment(file as MailAttachment)}
              onDelete={(file) =>
                onChangeDraft((current) =>
                  current
                    ? {
                        ...current,
                        attachments: current.attachments.filter((attachment) => attachment.id !== file.id),
                      }
                    : current,
                )
              }
            />
          </div>
        </Card>
      ) : null}

      <Modal
        title="支持变量"
        visible={variableModalVisible}
        footer={null}
        onCancel={() => setVariableModalVisible(false)}
        className="next-variable-modal__wrapper"
      >
        <div className="next-variable-modal">
          {variableCatalog.map((item) => {
            const token = `{{${item.key}}}`
            return (
              <div key={item.key} className="next-variable-modal__item">
                <div>
                  <strong>{item.label}</strong>
                  <span>{token}</span>
                </div>
                <Button
                  size="small"
                  icon={<IconCopy />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(token)
                      Message.success('变量已复制')
                    } catch {
                      Message.error('复制失败，请手动复制')
                    }
                  }}
                >
                  复制
                </Button>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
