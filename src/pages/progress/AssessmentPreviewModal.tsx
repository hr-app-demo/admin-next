import { Input, Modal, Select } from '@arco-design/web-react'
import type { ProgressRow } from '../../data/mock'

interface AssessmentPreviewModalProps {
  visible: boolean
  candidate: ProgressRow | null
  profilePhone?: string
  previewUrl: string
  onClose: () => void
  onResultChange: (value: ProgressRow['testResult']) => void
  onCommentChange: (value: string) => void
}

export default function AssessmentPreviewModal({
  visible,
  candidate,
  profilePhone,
  previewUrl,
  onClose,
  onResultChange,
  onCommentChange,
}: AssessmentPreviewModalProps) {
  return (
    <Modal
      title={candidate ? `${candidate.candidate} · 测试题预览` : '测试题预览'}
      visible={visible}
      footer={null}
      className="next-progress-preview__modal"
      style={{ width: 'calc(100vw - 48px)', height: '95vh' }}
      onCancel={onClose}
    >
      {candidate ? (
        <div className="next-progress-preview">
          <div className="next-progress-preview__viewer">
            {candidate.testAttachment.endsWith('.pdf') ? (
              previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={candidate.testAttachment}
                  className="next-progress-preview__frame"
                />
              ) : (
                <div className="next-progress-preview__placeholder">
                  <strong>{candidate.testAttachment}</strong>
                  <span>当前为演示文件名，接入真实文件地址后可在这里直接满屏预览 PDF。</span>
                </div>
              )
            ) : (
              <div className="next-progress-preview__placeholder">
                <strong>{candidate.testAttachment}</strong>
                <span>当前文件格式暂不支持在线预览，可在接入真实文件服务后打开原文件。</span>
              </div>
            )}
          </div>

          <div className="next-progress-preview__side">
            <div className="next-progress-preview__candidate">
              <strong>{candidate.candidate}</strong>
              <span>{candidate.email}</span>
              <span>{profilePhone || '-'}</span>
            </div>

            <div>
              <div className="next-modal-label">测试结果</div>
              <Select
                value={candidate.testResult}
                onChange={(value) => onResultChange(value as ProgressRow['testResult'])}
              >
                {['通过', '待定', '不通过', '需重新提交'].map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <div className="next-modal-label">测试评价</div>
              <Input.TextArea
                autoSize={{ minRows: 8, maxRows: 18 }}
                value={candidate.reviewComment}
                onChange={onCommentChange}
                placeholder="在预览右侧直接填写判题评价"
              />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
