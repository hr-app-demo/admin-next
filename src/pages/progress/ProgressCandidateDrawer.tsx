import { Button, Card, Descriptions, Drawer, Message, Select, Tag } from '@arco-design/web-react'
import { IconFile, IconSwap, IconUpload } from '@arco-design/web-react/icon'
import type { ProgressCandidateProfile, ProgressRow, ProgressStage } from '../../data/mock'
import { batchEditOptions, getStageLabel, stageColorMap, stageTransitionMap } from './progressConfig'

interface ProgressCandidateDrawerProps {
  visible: boolean
  candidate: ProgressRow | null
  profile: ProgressCandidateProfile | null
  currentJobTitle?: string
  selectedJobId: string
  selectedJobRecord:
    | {
        jobTitle: string
        stage: ProgressRow['stage']
        rate: number
        qaStatus: ProgressRow['qaStatus']
        signingStatus: ProgressRow['signingStatus']
        onboardingStatus: ProgressRow['onboardingStatus']
      }
    | null
  selectedJobStageHistory: Array<{
    jobId: string
    time: string
    stage: Exclude<ProgressStage, 'all'>
    operator: string
    note: string
  }>
  selectedJobActivityFeed: Array<{
    jobId: string
    time: string
    title: string
    description: string
  }>
  onClose: () => void
  onViewFullProfile: () => void
  onLocateStage: (stage: Exclude<ProgressStage, 'all'>) => void
  onOpenFlow: (id: number) => void
  onStageChange: (stage: Exclude<ProgressStage, 'all'>) => void
  onQaStatusChange: (value: ProgressRow['qaStatus']) => void
  onSigningStatusChange: (value: ProgressRow['signingStatus']) => void
  onOnboardingStatusChange: (value: ProgressRow['onboardingStatus']) => void
  onIdAttachmentUpdate: () => void
  onAttachmentUpdate: (
    key: 'testAttachment' | 'contractSigned',
    value: string,
  ) => void
}

export default function ProgressCandidateDrawer({
  visible,
  candidate,
  profile,
  currentJobTitle,
  selectedJobId,
  selectedJobRecord,
  selectedJobStageHistory,
  selectedJobActivityFeed,
  onClose,
  onViewFullProfile,
  onLocateStage,
  onOpenFlow,
  onStageChange,
  onQaStatusChange,
  onSigningStatusChange,
  onOnboardingStatusChange,
  onIdAttachmentUpdate,
  onAttachmentUpdate,
}: ProgressCandidateDrawerProps) {
  return (
    <Drawer
      width={520}
      title={candidate ? `${candidate.candidate} · 候选人详情` : '候选人详情'}
      visible={visible}
      onCancel={onClose}
    >
      {candidate && profile ? (
        <div className="next-candidate-drawer">
          <Card bordered={false} className="next-panel">
            <div className="next-candidate-drawer__hero">
              <div>
                <div className="next-candidate-drawer__name">{candidate.candidate}</div>
                <div className="next-candidate-drawer__meta">
                  {candidate.email} · {profile.phone} · {profile.timezone}
                </div>
              </div>
              <Tag color={stageColorMap[candidate.stage]}>{getStageLabel(candidate.stage)}</Tag>
            </div>
            <div className="next-candidate-drawer__summary">{profile.summary}</div>
            <div className="next-candidate-drawer__action-row">
              <Button
                size="small"
                icon={<IconFile />}
                onClick={() => Message.info(`演示态：预览 ${profile.resumeAttachment}`)}
              >
                查看简历
              </Button>
              <Button size="small" onClick={onViewFullProfile}>
                查看完整档案
              </Button>
              <Button size="small" onClick={() => onLocateStage(candidate.stage)}>
                定位到当前阶段
              </Button>
            </div>
          </Card>

          <Card bordered={false} className="next-panel" title="基本信息">
            <Descriptions
              column={2}
              data={[
                { label: '所在地', value: candidate.location },
                { label: '学历', value: candidate.education },
                { label: '经验', value: profile.yearsOfExperience },
                { label: '期望时薪', value: profile.preferredRate },
              ]}
            />
          </Card>

          <Card bordered={false} className="next-panel" title="当前岗位记录">
            <Descriptions
              column={2}
              data={[
                { label: '岗位', value: selectedJobRecord?.jobTitle || currentJobTitle || selectedJobId },
                {
                  label: '当前阶段',
                  value: (
                    <Select
                      size="small"
                      value={candidate.stage}
                      style={{ width: 160 }}
                      onChange={(value) => onStageChange(value as Exclude<ProgressStage, 'all'>)}
                    >
                      {[candidate.stage, ...stageTransitionMap[candidate.stage]]
                        .filter((stage, index, list) => list.indexOf(stage) === index)
                        .map((stage) => (
                          <Select.Option key={stage} value={stage}>
                            {getStageLabel(stage)}
                          </Select.Option>
                        ))}
                    </Select>
                  ),
                },
                { label: '接受时薪', value: `$${selectedJobRecord?.rate || candidate.rate}` },
                { label: '合同审核', value: candidate.contractReview },
                {
                  label: '质检状态',
                  value: (
                    <Select
                      size="small"
                      value={candidate.qaStatus}
                      style={{ width: 160 }}
                      onChange={(value) => onQaStatusChange(value as ProgressRow['qaStatus'])}
                    >
                      {['未开始', '质检合格', '待返修'].map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  label: '签约进展',
                  value: (
                    <Select
                      size="small"
                      value={candidate.signingStatus}
                      style={{ width: 180 }}
                      onChange={(value) => onSigningStatusChange(value as ProgressRow['signingStatus'])}
                    >
                      {batchEditOptions.signingStatus.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  label: '入职进展',
                  value: (
                    <Select
                      size="small"
                      value={candidate.onboardingStatus}
                      style={{ width: 180 }}
                      onChange={(value) =>
                        onOnboardingStatusChange(value as ProgressRow['onboardingStatus'])
                      }
                    >
                      {batchEditOptions.onboardingStatus.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  ),
                },
              ]}
            />
            <div className="next-candidate-drawer__action-row">
              <Button size="small" status="warning" icon={<IconSwap />} onClick={() => onOpenFlow(candidate.id)}>
                打开流转面板
              </Button>
            </div>
          </Card>

          <Card bordered={false} className="next-panel" title="附件与资料">
            <div className="next-candidate-drawer__attachments">
              <Button
                type="text"
                icon={<IconFile />}
                onClick={() => Message.info(`演示态：预览 ${profile.resumeAttachment}`)}
              >
                {profile.resumeAttachment}
              </Button>
              <Button
                type="text"
                icon={profile.idAttachment ? <IconFile /> : <IconUpload />}
                onClick={() =>
                  profile.idAttachment
                    ? Message.info(`演示态：预览 ${profile.idAttachment}`)
                    : onIdAttachmentUpdate()
                }
              >
                {profile.idAttachment || '上传身份证附件'}
              </Button>
              <Button
                type="text"
                icon={candidate.testAttachment ? <IconFile /> : <IconUpload />}
                onClick={() =>
                  candidate.testAttachment
                    ? Message.info(`演示态：预览 ${candidate.testAttachment}`)
                    : onAttachmentUpdate(
                        'testAttachment',
                        `${candidate.candidate.toLowerCase().replace(/\s+/g, '-')}-test-upload.pdf`,
                      )
                }
              >
                {candidate.testAttachment || '上传测试题附件'}
              </Button>
              <Button
                type="text"
                icon={candidate.contractSigned ? <IconFile /> : <IconUpload />}
                onClick={() =>
                  candidate.contractSigned
                    ? Message.info(`演示态：预览 ${candidate.contractSigned}`)
                    : onAttachmentUpdate(
                        'contractSigned',
                        `${candidate.candidate.toLowerCase().replace(/\s+/g, '-')}-contract-signed.pdf`,
                      )
                }
              >
                {candidate.contractSigned || '上传签回合同'}
              </Button>
            </div>
          </Card>

          <Card bordered={false} className="next-panel" title="阶段记录">
            <div className="next-candidate-drawer__timeline">
              {selectedJobStageHistory.map((item) => (
                <div key={`${item.time}-${item.stage}`} className="next-candidate-drawer__timeline-item">
                  <div className="next-candidate-drawer__timeline-dot" />
                  <div>
                    <div className="next-candidate-drawer__timeline-title">
                      {getStageLabel(item.stage)} · {item.operator}
                    </div>
                    <div className="next-candidate-drawer__timeline-meta">{item.time}</div>
                    <div className="next-candidate-drawer__timeline-note">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card bordered={false} className="next-panel" title="最新动态">
            <div className="next-candidate-drawer__feed">
              {selectedJobActivityFeed.map((item) => (
                <div key={`${item.time}-${item.title}`} className="next-candidate-drawer__feed-item">
                  <div className="next-candidate-drawer__feed-title">{item.title}</div>
                  <div className="next-candidate-drawer__feed-time">{item.time}</div>
                  <div className="next-candidate-drawer__feed-desc">{item.description}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </Drawer>
  )
}
