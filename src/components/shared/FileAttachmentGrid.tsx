import { Button, Empty } from '@arco-design/web-react'
import {
  IconDelete,
  IconFile,
  IconFileAudio,
  IconFileImage,
  IconFilePdf,
  IconFileVideo,
} from '@arco-design/web-react/icon'
import type { PreviewableFile } from './filePreview'
import { getExtensionLabel, getPreviewKind } from './filePreview'

interface FileAttachmentGridProps {
  files: PreviewableFile[]
  onPreview: (file: PreviewableFile) => void
  onDelete: (file: PreviewableFile) => void
}

function renderFileIcon(file: PreviewableFile) {
  const previewKind = getPreviewKind(file)
  if (previewKind === 'image') return <IconFileImage />
  if (previewKind === 'pdf') return <IconFilePdf />
  if (previewKind === 'audio') return <IconFileAudio />
  if (previewKind === 'video') return <IconFileVideo />
  return <IconFile />
}

export default function FileAttachmentGrid({
  files,
  onPreview,
  onDelete,
}: FileAttachmentGridProps) {
  if (!files.length) {
    return <Empty description="当前还没有附件" className="next-file-grid__empty" />
  }

  return (
    <div className="next-file-grid">
      {files.map((file) => (
        <button
          key={file.id || file.name}
          type="button"
          className="next-file-grid__card"
          onClick={() => onPreview(file)}
        >
          <div className="next-file-grid__icon">{renderFileIcon(file)}</div>
          <div className="next-file-grid__meta">
            <strong title={file.name}>{file.name}</strong>
            <span>{getExtensionLabel(file)}</span>
          </div>
          <div className="next-file-grid__actions">
            <Button
              size="mini"
              type="text"
              status="danger"
              icon={<IconDelete />}
              onClick={(event) => {
                event.stopPropagation()
                onDelete(file)
              }}
            />
          </div>
        </button>
      ))}
    </div>
  )
}
