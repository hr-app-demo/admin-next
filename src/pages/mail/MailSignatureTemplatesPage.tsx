import {
  Button,
  Card,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Upload,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh, IconUpload } from '@arco-design/web-react/icon'
import type { UploadItem } from '@arco-design/web-react/es/Upload'
import { useEffect, useMemo, useState } from 'react'
import { uploadAsset } from '../../apis/assets'
import {
  createMailSignature,
  deleteMailSignature,
  listMailSignatures,
  type MailSignature,
  type MailSignaturePayload,
  updateMailSignature,
} from '../../apis/mail/signatures'
import { getApiErrorMessage, resolveApiUrl } from '../../apis/http'
import ProtectedImage from '../../components/shared/ProtectedImage'

interface SignatureDraft {
  id: string
  name: string
  owner: string
  enabled: boolean
  fullName: string
  jobTitle: string
  companyName: string
  primaryEmail: string
  secondaryEmail: string
  website: string
  linkedinLabel: string
  linkedinUrl: string
  address: string
  avatarAssetId: number | null
  bannerAssetId: number | null
  avatarUrl: string
  bannerUrl: string
}

function buildImageUploadList(url: string, name: string): UploadItem[] {
  if (!url) return []
  return [{ uid: name, name, url, status: 'done' }]
}

function createEmptySignature(index: number): SignatureDraft {
  return {
    id: `sig-new-${index + 1}`,
    name: '',
    owner: '',
    enabled: true,
    fullName: '',
    jobTitle: '',
    companyName: '',
    primaryEmail: '',
    secondaryEmail: '',
    website: '',
    linkedinLabel: '',
    linkedinUrl: '',
    address: '',
    avatarAssetId: null,
    bannerAssetId: null,
    avatarUrl: '',
    bannerUrl: '',
  }
}

function toDraft(record: MailSignature): SignatureDraft {
  return {
    id: String(record.id),
    name: record.name,
    owner: record.owner || '',
    enabled: record.enabled,
    fullName: record.full_name,
    jobTitle: record.job_title || '',
    companyName: record.company_name || '',
    primaryEmail: record.primary_email || '',
    secondaryEmail: record.secondary_email || '',
    website: record.website || '',
    linkedinLabel: record.linkedin_label || '',
    linkedinUrl: record.linkedin_url || '',
    address: record.address || '',
    avatarAssetId: record.avatar_asset_id,
    bannerAssetId: record.banner_asset_id,
    avatarUrl: resolveApiUrl(record.avatar_asset?.preview_url),
    bannerUrl: resolveApiUrl(record.banner_asset?.preview_url),
  }
}

function toPayload(draft: SignatureDraft): MailSignaturePayload {
  return {
    name: draft.name.trim(),
    owner: draft.owner.trim() || null,
    enabled: draft.enabled,
    full_name: draft.fullName.trim(),
    job_title: draft.jobTitle.trim() || null,
    company_name: draft.companyName.trim() || null,
    primary_email: draft.primaryEmail.trim() || null,
    secondary_email: draft.secondaryEmail.trim() || null,
    website: draft.website.trim() || null,
    linkedin_label: draft.linkedinLabel.trim() || null,
    linkedin_url: draft.linkedinUrl.trim() || null,
    address: draft.address.trim() || null,
    avatar_asset_id: draft.avatarAssetId,
    banner_asset_id: draft.bannerAssetId,
  }
}

export default function MailSignatureTemplatesPage() {
  const [signatures, setSignatures] = useState<MailSignature[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<SignatureDraft | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const selectedSignature = useMemo(
    () => signatures.find((item) => String(item.id) === selectedId) || null,
    [selectedId, signatures],
  )

  useEffect(() => {
    async function bootstrap() {
      setLoading(true)
      try {
        await loadSignatures()
      } catch (error) {
        Message.error(getApiErrorMessage(error, '加载签名模板失败'))
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [])

  async function loadSignatures(preferredId?: string) {
    setLoading(true)
    try {
      const nextSignatures = await listMailSignatures()
      setSignatures(nextSignatures)
      const current =
        nextSignatures.find((item) => String(item.id) === preferredId) ||
        nextSignatures.find((item) => String(item.id) === selectedId) ||
        nextSignatures[0] ||
        null
      setSelectedId(current ? String(current.id) : '')
      if (!isCreating) {
        setDraft(current ? toDraft(current) : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载签名模板失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isCreating) return
    setDraft(selectedSignature ? toDraft(selectedSignature) : null)
  }, [isCreating, selectedSignature])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptySignature(signatures.length))
  }

  const handleSave = async () => {
    if (!draft) return
    if (!draft.name.trim()) {
      Message.warning('请先填写签名名称')
      return
    }
    if (!draft.fullName.trim()) {
      Message.warning('请先填写姓名')
      return
    }

    const payload = toPayload(draft)
    setSubmitting(true)
    try {
      if (isCreating) {
        const created = await createMailSignature(payload)
        Message.success('签名模板已创建')
        setIsCreating(false)
        await loadSignatures(String(created.id))
        return
      }

      const updated = await updateMailSignature(Number(draft.id), payload)
      Message.success('签名模板已保存')
      await loadSignatures(String(updated.id))
    } catch (error) {
      Message.error(getApiErrorMessage(error, '保存签名模板失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = signatures[0] || null
      setSelectedId(fallback ? String(fallback.id) : '')
      setDraft(fallback ? toDraft(fallback) : null)
      return
    }

    setSubmitting(true)
    try {
      await deleteMailSignature(Number(draft.id))
      Message.success('签名模板已删除')
      await loadSignatures()
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除签名模板失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptySignature(signatures.length))
      return
    }
    setDraft(selectedSignature ? toDraft(selectedSignature) : null)
  }

  const handleUploadImage = async (field: 'avatar' | 'banner', fileList: UploadItem[]) => {
    const latest = [...fileList].reverse().find((item) => item.originFile)
    if (!latest?.originFile) return

    if (field === 'avatar') setUploadingAvatar(true)
    else setUploadingBanner(true)

    try {
      const asset = await uploadAsset({
        type: 'image',
        module: 'mail',
        file: latest.originFile as File,
      })
      setDraft((current) =>
        current
          ? {
              ...current,
              avatarAssetId: field === 'avatar' ? asset.id : current.avatarAssetId,
              bannerAssetId: field === 'banner' ? asset.id : current.bannerAssetId,
              avatarUrl: field === 'avatar' ? resolveApiUrl(asset.preview_url) : current.avatarUrl,
              bannerUrl: field === 'banner' ? resolveApiUrl(asset.preview_url) : current.bannerUrl,
            }
          : current,
      )
      Message.success(field === 'avatar' ? '头像已上传' : '横幅已上传')
    } catch (error) {
      Message.error(getApiErrorMessage(error, '上传图片失败'))
    } finally {
      if (field === 'avatar') setUploadingAvatar(false)
      else setUploadingBanner(false)
    }
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          loading={loading}
          title="邮件签名模板"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增签名
            </Button>
          }
        >
          <div className="next-settings-nav">
            {signatures.map((signature) => (
              <button
                key={signature.id}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedId === String(signature.id) ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedId(String(signature.id))
                }}
              >
                <div>
                  <strong>{signature.name}</strong>
                  <span>{signature.full_name || '未填写姓名'}</span>
                </div>
                <span className={`next-signature-status${signature.enabled ? ' is-enabled' : ''}`}>
                  {signature.enabled ? '启用' : '停用'}
                </span>
              </button>
            ))}

            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div>
                  <strong>新签名</strong>
                  <span>未保存</span>
                </div>
                <span className="next-signature-status">草稿</span>
              </button>
            ) : null}
          </div>
        </Card>

        <div className="next-settings-content">
          <Card
            bordered={false}
            className="next-panel"
            loading={loading}
            title={isCreating ? '新建签名模板' : '签名详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm title={isCreating ? '放弃当前新签名？' : '确认删除这个签名吗？'} onOk={handleDelete}>
                  <Button status="danger" icon={<IconDelete />}>
                    {isCreating ? '放弃' : '删除'}
                  </Button>
                </Popconfirm>
                <Button type="primary" loading={submitting} onClick={handleSave}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-settings-workspace__field-grid">
                  <div className="next-job-create__field">
                    <label>签名名称</label>
                    <Input value={draft.name} onChange={(value) => setDraft((current) => (current ? { ...current, name: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>所属团队</label>
                    <Input value={draft.owner} onChange={(value) => setDraft((current) => (current ? { ...current, owner: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>姓名</label>
                    <Input value={draft.fullName} onChange={(value) => setDraft((current) => (current ? { ...current, fullName: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>职位</label>
                    <Input value={draft.jobTitle} onChange={(value) => setDraft((current) => (current ? { ...current, jobTitle: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>公司名称</label>
                    <Input value={draft.companyName} onChange={(value) => setDraft((current) => (current ? { ...current, companyName: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>启用状态</label>
                    <Select
                      value={draft.enabled ? 'enabled' : 'disabled'}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, enabled: value === 'enabled' } : current))
                      }
                    >
                      <Select.Option value="enabled">启用</Select.Option>
                      <Select.Option value="disabled">停用</Select.Option>
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>主邮箱</label>
                    <Input value={draft.primaryEmail} onChange={(value) => setDraft((current) => (current ? { ...current, primaryEmail: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>备用邮箱</label>
                    <Input value={draft.secondaryEmail} onChange={(value) => setDraft((current) => (current ? { ...current, secondaryEmail: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>官网链接</label>
                    <Input value={draft.website} onChange={(value) => setDraft((current) => (current ? { ...current, website: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>LinkedIn 文案</label>
                    <Input value={draft.linkedinLabel} onChange={(value) => setDraft((current) => (current ? { ...current, linkedinLabel: value } : current))} />
                  </div>
                  <div className="next-job-create__field next-job-create__field--full">
                    <label>LinkedIn 链接</label>
                    <Input value={draft.linkedinUrl} onChange={(value) => setDraft((current) => (current ? { ...current, linkedinUrl: value } : current))} />
                  </div>
                  <div className="next-job-create__field next-job-create__field--full">
                    <label>地址</label>
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={draft.address} onChange={(value) => setDraft((current) => (current ? { ...current, address: value } : current))} />
                  </div>
                  <div className="next-job-create__field next-job-create__field--full">
                    <label>头像图片</label>
                    <div className="next-signature-image-field">
                      <div className="next-signature-image-field__preview next-signature-image-field__preview--avatar">
                        {draft.avatarUrl ? <ProtectedImage src={draft.avatarUrl} alt={draft.fullName || 'signature avatar'} /> : <span>上传头像后在这里预览</span>}
                      </div>
                      <div className="next-signature-image-field__actions">
                        <Space>
                          <Upload
                            action="/"
                            autoUpload={false}
                            showUploadList={false}
                            fileList={buildImageUploadList(draft.avatarUrl, 'avatar')}
                            onChange={(fileList) => void handleUploadImage('avatar', fileList)}
                          >
                            <Button icon={<IconUpload />} loading={uploadingAvatar}>上传头像</Button>
                          </Upload>
                          {draft.avatarUrl ? (
                            <Button
                              status="danger"
                              onClick={() =>
                                setDraft((current) =>
                                  current ? { ...current, avatarAssetId: null, avatarUrl: '' } : current,
                                )
                              }
                            >
                              移除
                            </Button>
                          ) : null}
                        </Space>
                        <span className="next-job-create__field-tip">建议使用 1:1 的正方形头像，方便在邮件客户端里稳定显示。</span>
                      </div>
                    </div>
                  </div>
                  <div className="next-job-create__field next-job-create__field--full">
                    <label>横幅图片</label>
                    <div className="next-signature-image-field next-signature-image-field--banner">
                      <div className="next-signature-image-field__preview next-signature-image-field__preview--banner">
                        {draft.bannerUrl ? <ProtectedImage src={draft.bannerUrl} alt="signature banner" /> : <span>上传横幅后在这里预览</span>}
                      </div>
                      <div className="next-signature-image-field__actions">
                        <Space>
                          <Upload
                            action="/"
                            autoUpload={false}
                            showUploadList={false}
                            fileList={buildImageUploadList(draft.bannerUrl, 'banner')}
                            onChange={(fileList) => void handleUploadImage('banner', fileList)}
                          >
                            <Button icon={<IconUpload />} loading={uploadingBanner}>上传横幅</Button>
                          </Upload>
                          {draft.bannerUrl ? (
                            <Button
                              status="danger"
                              onClick={() =>
                                setDraft((current) =>
                                  current ? { ...current, bannerAssetId: null, bannerUrl: '' } : current,
                                )
                              }
                            >
                              移除
                            </Button>
                          ) : null}
                        </Space>
                        <span className="next-job-create__field-tip">建议使用横向大图，邮件里会作为底部品牌横幅展示。</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请先选择发信账号，再维护签名模板。</div>
            )}
          </Card>

          {draft ? (
            <Card bordered={false} className="next-panel" title="签名预览">
              <div className="next-signature-preview">
                <div className="next-signature-preview__header">
                  <div className="next-signature-preview__avatar-column">
                    <div className="next-signature-preview__avatar">
                      {draft.avatarUrl ? <ProtectedImage src={draft.avatarUrl} alt={draft.fullName || 'signature avatar'} /> : null}
                    </div>
                  </div>

                  <div className="next-signature-preview__content">
                    <div className="next-signature-preview__name-row">
                      <strong>{draft.fullName || '请填写姓名'}</strong>
                      <span className="next-signature-preview__badge">in</span>
                    </div>
                    <div className="next-signature-preview__role">{draft.jobTitle || '请填写职位'}</div>
                    <div className="next-signature-preview__company">{draft.companyName || '请填写公司名称'}</div>

                    <div className="next-signature-preview__divider" />

                    <div className="next-signature-preview__links">
                      {draft.primaryEmail ? <a href={`mailto:${draft.primaryEmail}`}>{draft.primaryEmail}</a> : null}
                      {draft.secondaryEmail ? <a href={`mailto:${draft.secondaryEmail}`}>{draft.secondaryEmail}</a> : null}
                      {draft.website ? <a href={draft.website}>{draft.website}</a> : null}
                      {draft.linkedinLabel ? <a href={draft.linkedinUrl || '#'}>{draft.linkedinLabel}</a> : null}
                    </div>

                    {draft.address ? <div className="next-signature-preview__address">{draft.address}</div> : null}
                  </div>
                </div>

                {draft.bannerUrl ? (
                  <div className="next-signature-preview__banner">
                    <ProtectedImage src={draft.bannerUrl} alt="signature banner" />
                  </div>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
