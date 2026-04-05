import { Message } from '@arco-design/web-react'
import { useEffect, useState } from 'react'
import { uploadAsset } from '../../../apis/assets'
import {
  createMailTemplateCategory,
  deleteMailTemplateCategory,
  listMailTemplateCategories,
  type MailTemplateCategory as MailTemplateCategoryApi,
  updateMailTemplateCategory,
} from '../../../apis/mail/template-categories'
import {
  createMailTemplate,
  deleteMailTemplate,
  listMailTemplates,
  type MailTemplate as MailTemplateApi,
  updateMailTemplate,
} from '../../../apis/mail/templates'
import { listMailVariables, type MailVariableItem } from '../../../apis/mail/variables'
import { getApiErrorMessage, resolveApiUrl } from '../../../apis/http'
import FilePreviewModal from '../../../components/shared/FilePreviewModal'
import TemplateCategoryManagerModal from './components/TemplateCategoryManagerModal'
import TemplateFormCard from './components/TemplateFormCard'
import TemplateListCard from './components/TemplateListCard'
import type { MailAttachment, MailTemplateCategory, MailTemplateRecord } from './types'
import { cloneTemplate, createEmptyTemplate, getLeafCategories } from './utils'

function toCategoryRecord(record: MailTemplateCategoryApi): MailTemplateCategory {
  return {
    id: String(record.id),
    name: record.name,
    parentId: record.parent_id == null ? null : String(record.parent_id),
    sortOrder: record.sort_order,
    enabled: record.enabled,
  }
}

function toTemplateRecord(record: MailTemplateApi): MailTemplateRecord {
  return {
    id: String(record.id),
    name: record.name,
    categoryId: String(record.category_id),
    subject: record.subject_template,
    content: record.body_html,
    attachments: record.attachments.map(
      (item): MailAttachment => ({
        id: String(item.asset_id),
        assetId: item.asset_id,
        name: item.name,
        url: resolveApiUrl(item.preview_url),
        downloadUrl: resolveApiUrl(item.download_url),
        mimeType: item.mime_type,
      }),
    ),
    variables: record.variables,
  }
}

export default function MailTemplatesPage() {
  const [categories, setCategories] = useState<MailTemplateCategory[]>([])
  const [templates, setTemplates] = useState<MailTemplateRecord[]>([])
  const [variableCatalog, setVariableCatalog] = useState<MailVariableItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<MailTemplateRecord | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<MailAttachment | null>(null)
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {
        const nextVariables = await listMailVariables()
        setVariableCatalog(nextVariables)
        await loadAccountData()
      } catch (error) {
        Message.error(getApiErrorMessage(error, '加载邮件配置失败'))
      }
    }

    void bootstrap()
  }, [])

  async function loadAccountData(preferredTemplateId?: string) {
    try {
      const [nextCategoriesRaw, nextTemplatesRaw] = await Promise.all([
        listMailTemplateCategories(),
        listMailTemplates(),
      ])
      const nextCategories = nextCategoriesRaw.map(toCategoryRecord)
      const nextTemplates = nextTemplatesRaw.map(toTemplateRecord)
      setCategories(nextCategories)
      setTemplates(nextTemplates)

      const nextLeafCategories = getLeafCategories(nextCategories)
      const nextSelectedCategoryId =
        nextTemplates.find((item) => item.id === preferredTemplateId)?.categoryId ||
        (nextLeafCategories.some((item) => item.id === selectedCategoryId) ? selectedCategoryId : nextLeafCategories[0]?.id || '')

      const nextSelectedTemplate =
        nextTemplates.find((item) => item.id === preferredTemplateId) ||
        nextTemplates.find((item) => item.categoryId === nextSelectedCategoryId) ||
        nextTemplates[0] ||
        null

      setSelectedCategoryId(nextSelectedCategoryId)
      setSelectedId(nextSelectedTemplate?.id || '')
      if (!isCreating) {
        setDraft(nextSelectedTemplate ? cloneTemplate(nextSelectedTemplate) : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载邮件模板失败'))
    }
  }

  useEffect(() => {
    if (isCreating) return
    const current = templates.find((item) => item.id === selectedId) || null
    setDraft(current ? cloneTemplate(current) : null)
  }, [isCreating, selectedId, templates])

  const beginCreate = () => {
    if (!selectedCategoryId) {
      Message.warning('请先准备一个可用的二级目录，再创建模板')
      return
    }
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyTemplate(templates.length, selectedCategoryId))
  }

  const handleSave = async () => {
    if (!draft) return
    if (!draft.name.trim()) {
      Message.warning('请先填写模板名称')
      return
    }
    if (!draft.categoryId) {
      Message.warning('请先选择所属目录')
      return
    }

    const payload = {
      name: draft.name.trim(),
      category_id: Number(draft.categoryId),
      subject_template: draft.subject.trim(),
      body_html: draft.content.trim(),
      attachments: draft.attachments.map((item) => ({ asset_id: item.assetId })),
    }

    try {
      if (isCreating) {
        const created = await createMailTemplate(payload)
        Message.success('邮件模板已创建')
        setIsCreating(false)
        await loadAccountData(String(created.id))
        return
      }

      const updated = await updateMailTemplate(Number(draft.id), payload)
      Message.success('邮件模板已保存')
      await loadAccountData(String(updated.id))
    } catch (error) {
      Message.error(getApiErrorMessage(error, '保存邮件模板失败'))
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = templates.find((item) => item.id === selectedId) || templates[0] || null
      setDraft(fallback ? cloneTemplate(fallback) : null)
      return
    }

    try {
      await deleteMailTemplate(Number(draft.id))
      Message.success('邮件模板已删除')
      await loadAccountData()
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除邮件模板失败'))
    }
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyTemplate(templates.length, selectedCategoryId))
      return
    }
    const current = templates.find((item) => item.id === selectedId) || null
    setDraft(current ? cloneTemplate(current) : null)
  }

  const handleUploadAttachment = async (file: File) => {
    setUploadingAttachment(true)
    try {
      const asset = await uploadAsset({
        type: 'file',
        module: 'mail',
        file,
      })
      onChangeDraftAddAttachment(asset)
      Message.success('附件已上传')
    } catch (error) {
      Message.error(getApiErrorMessage(error, '上传附件失败'))
    } finally {
      setUploadingAttachment(false)
    }
  }

  const onChangeDraftAddAttachment = (asset: {
    id: number
    original_name: string
    preview_url: string
    download_url: string
    mime_type: string
  }) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            attachments: [
              ...current.attachments,
              {
                id: String(asset.id),
                assetId: asset.id,
                name: asset.original_name,
                url: resolveApiUrl(asset.preview_url),
                downloadUrl: resolveApiUrl(asset.download_url),
                mimeType: asset.mime_type,
              },
            ],
          }
        : current,
    )
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout next-mail-template-layout">
        <TemplateListCard
          categories={categories}
          templates={templates}
          selectedTemplateId={selectedId}
          isCreating={isCreating}
          onSelectTemplate={(value) => {
            setIsCreating(false)
            const current = templates.find((item) => item.id === value) || null
            if (current) {
              setSelectedCategoryId(current.categoryId)
            }
            setSelectedId(value)
          }}
          onOpenCategoryManager={() => setCategoryModalVisible(true)}
          onCreateTemplate={beginCreate}
        />

        <div className="next-settings-content">
          <TemplateFormCard
            categories={categories}
            draft={draft}
            isCreating={isCreating}
            variableCatalog={variableCatalog}
            uploadingAttachment={uploadingAttachment}
            onChangeDraft={setDraft}
            onSave={handleSave}
            onDelete={handleDelete}
            onReset={handleReset}
            onPreviewAttachment={setPreviewAttachment}
            onUploadAttachment={handleUploadAttachment}
          />
        </div>
      </div>

      <TemplateCategoryManagerModal
        visible={categoryModalVisible}
        categories={categories}
        templates={templates}
        currentCategoryId={selectedCategoryId}
        onCreateRoot={async (name) => {
          await createMailTemplateCategory({ name, parent_id: null })
          await loadAccountData()
        }}
        onCreateChild={async (parentId, name) => {
          await createMailTemplateCategory({ name, parent_id: Number(parentId) })
          await loadAccountData()
        }}
        onRename={async (categoryId, name) => {
          await updateMailTemplateCategory(Number(categoryId), { name })
          await loadAccountData()
        }}
        onDelete={async (categoryId) => {
          await deleteMailTemplateCategory(Number(categoryId))
          await loadAccountData()
        }}
        onClose={() => setCategoryModalVisible(false)}
      />

      <FilePreviewModal
        file={previewAttachment}
        visible={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
      />
    </div>
  )
}
