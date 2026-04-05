import { Button, Modal, Spin } from '@arco-design/web-react'
import { IconDownload } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { createAssetObjectUrl, downloadProtectedAsset, fetchAssetText } from '../../apis/assets'
import type { PreviewableFile } from './filePreview'
import { getExtensionLabel, getPreviewKind } from './filePreview'

interface FilePreviewModalProps {
  file: PreviewableFile | null
  visible: boolean
  onClose: () => void
}

export default function FilePreviewModal({
  file,
  visible,
  onClose,
}: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [objectUrl, setObjectUrl] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)

  const previewKind = useMemo(() => (file ? getPreviewKind(file) : 'unsupported'), [file])

  useEffect(() => {
    let cancelled = false
    let currentObjectUrl = ''

    async function loadPreview() {
      if (!visible || !file?.url) {
        setTextContent('')
        setObjectUrl('')
        return
      }

      if (previewKind === 'unsupported') {
        setTextContent('')
        setObjectUrl('')
        return
      }

      try {
        if (previewKind === 'text') {
          setLoadingText(true)
          const text = await fetchAssetText(file.url)
          if (!cancelled) {
            setTextContent(text)
          }
          return
        }

        setLoadingPreview(true)
        const nextUrl = await createAssetObjectUrl(file.url)
        if (cancelled) {
          URL.revokeObjectURL(nextUrl)
          return
        }
        currentObjectUrl = nextUrl
        setObjectUrl(nextUrl)
      } catch {
        if (!cancelled) {
          setTextContent('')
          setObjectUrl('')
        }
      } finally {
        if (!cancelled) {
          setLoadingText(false)
          setLoadingPreview(false)
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl)
      }
    }
  }, [file, previewKind, visible])

  const canDownload = Boolean(file?.downloadUrl || file?.url)

  return (
    <Modal
      title={
        <div className="next-file-preview__header">
          <div className="next-file-preview__title">
            <strong>{file?.name || '文件预览'}</strong>
            {file ? <span>{getExtensionLabel(file)}</span> : null}
          </div>
          {canDownload ? (
            <Button
              type="outline"
              icon={<IconDownload />}
              onClick={() => void downloadProtectedAsset(file?.downloadUrl || file?.url || '', file?.name)}
            >
              下载
            </Button>
          ) : null}
        </div>
      }
      visible={visible}
      footer={null}
      onCancel={onClose}
      className="next-file-preview__modal"
      style={{ width: '80vw', maxWidth: '80vw' }}
    >
      <div className="next-file-preview">
        {(previewKind === 'image' || previewKind === 'pdf' || previewKind === 'video' || previewKind === 'audio') && loadingPreview ? (
          <div className="next-file-preview__placeholder">
            <Spin />
          </div>
        ) : null}

        {previewKind === 'image' && objectUrl ? (
          <img src={objectUrl} alt={file?.name} className="next-file-preview__image" />
        ) : null}

        {previewKind === 'pdf' && objectUrl ? (
          <iframe src={objectUrl} title={file?.name} className="next-file-preview__frame" />
        ) : null}

        {previewKind === 'video' && objectUrl ? (
          <video src={objectUrl} controls className="next-file-preview__media" />
        ) : null}

        {previewKind === 'audio' && objectUrl ? (
          <div className="next-file-preview__audio">
            <audio src={objectUrl} controls />
          </div>
        ) : null}

        {previewKind === 'text' ? (
          loadingText ? (
            <div className="next-file-preview__placeholder">
              <Spin />
            </div>
          ) : (
            <pre className="next-file-preview__text">{textContent || '当前文件内容为空，或暂时无法读取。'}</pre>
          )
        ) : null}

        {previewKind === 'unsupported' ? (
          <div className="next-file-preview__placeholder">
            <strong>暂不支持当前格式的在线预览</strong>
            <span>第一版先支持图片、PDF、文本、音视频。Office 文件可先下载查看。</span>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
