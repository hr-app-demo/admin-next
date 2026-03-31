import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Message,
  Modal,
  Pagination,
  Radio,
  Select,
  Space,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconArrowLeft } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import JoinJobModal from '../../components/shared/JoinJobModal'
import SendMailModal from '../../components/shared/SendMailModal'
import {
  candidateMergeSources,
  candidateProfiles,
  progressJobs,
  progressRows,
  type ProgressRow,
  type ProgressStage,
} from '../../data/mock'
import { getFormTemplateByKey } from '../../lib/formConfigStore'

const stageLabels: Record<Exclude<ProgressStage, 'all'>, string> = {
  screening: '待筛选',
  assessment: '测试题回收',
  passed: '筛选通过',
  contract: '合同库',
  employed: '在职',
  replaced: '汰换名单',
  eliminated: '淘汰',
}

const stageColors: Record<Exclude<ProgressStage, 'all'>, string> = {
  screening: 'arcoblue',
  assessment: 'orange',
  passed: 'purple',
  contract: 'cyan',
  employed: 'green',
  replaced: 'orangered',
  eliminated: 'red',
}

type MergeChoice = Record<string, 'current' | 'incoming'>

export default function CandidateDetailPage() {
  const navigate = useNavigate()
  const { candidateId } = useParams()
  const [searchParams] = useSearchParams()
  const source = searchParams.get('source')
  const fromJobId = searchParams.get('jobId')
  const fromStage = searchParams.get('stage')

  const id = Number(candidateId)
  const profile = candidateProfiles[id]
  const candidateRows = progressRows.filter((row) => row.id === id)
  const initialJobId = fromJobId || profile?.jobHistory[0]?.jobId || candidateRows[0]?.jobId || ''
  const [activeJobId, setActiveJobId] = useState(initialJobId)
  const [emailVisible, setEmailVisible] = useState(false)
  const [jobVisible, setJobVisible] = useState(false)
  const [mergeVisible, setMergeVisible] = useState(false)
  const [jobDrawerVisible, setJobDrawerVisible] = useState(false)
  const [logMode, setLogMode] = useState<'time' | 'job'>('time')
  const [logJobId, setLogJobId] = useState(initialJobId)
  const [logPage, setLogPage] = useState(1)
  const logPageSize = 5

  const activeRow = candidateRows.find((row) => row.jobId === activeJobId) || candidateRows[0]
  const activeJob = progressJobs.find((job) => job.id === activeJobId)
  const activeJobHistory = profile?.jobHistory.find((item) => item.jobId === activeJobId)
  const mergeSource = candidateMergeSources[id]
  const defaultTemplate = getFormTemplateByKey('da-default')

  const jobSummaryRows = useMemo(
    () =>
      profile?.jobHistory.map((item) => ({
        ...item,
        company: progressJobs.find((job) => job.id === item.jobId)?.company || '-',
      })) || [],
    [profile],
  )

  const mergeFieldKeys = useMemo(
    () =>
      mergeSource
        ? Array.from(new Set([...Object.keys(mergeSource.current), ...Object.keys(mergeSource.incoming)]))
        : [],
    [mergeSource],
  )

  const mergeLabelMap = useMemo(
    () =>
      Object.fromEntries(
        (defaultTemplate?.fields || []).map((field) => [field.key, field.label]),
      ) as Record<string, string>,
    [defaultTemplate],
  )

  const buildDefaultMergeChoice = () =>
    Object.fromEntries(
      mergeFieldKeys.map((key) => {
        const currentValue = mergeSource?.current[key]
        const incomingValue = mergeSource?.incoming[key]
        const useIncoming =
          (!currentValue || String(currentValue).length === 0) &&
          Boolean(incomingValue && String(incomingValue).length > 0)
        return [key, useIncoming ? 'incoming' : 'current']
      }),
    ) as MergeChoice

  const formatMergeValue = (value?: string | string[]) => {
    if (Array.isArray(value)) return value.length ? value.join(' / ') : '未填写'
    if (value === undefined || value === null || value === '') return '未填写'
    return String(value)
  }

  const buildMergedPayload = (choice: MergeChoice) =>
    Object.fromEntries(
      mergeFieldKeys.map((key) => [
        key,
        choice[key] === 'incoming'
          ? formatMergeValue(mergeSource?.incoming[key])
          : formatMergeValue(mergeSource?.current[key]),
      ]),
    )

  const [mergeChoice, setMergeChoice] = useState<MergeChoice>(() => buildDefaultMergeChoice())
  const [mergedFormData, setMergedFormData] = useState<Record<string, string>>(() =>
    buildMergedPayload(buildDefaultMergeChoice()),
  )

  useEffect(() => {
    const nextChoice = buildDefaultMergeChoice()
    setMergeChoice(nextChoice)
    setMergedFormData(buildMergedPayload(nextChoice))
  }, [id])

  const logItems = useMemo(() => {
    const stageLogs =
      profile?.stageHistory.map((item) => ({
        id: `${item.jobId}-${item.time}-${item.stage}`,
        jobId: item.jobId,
        jobTitle: progressJobs.find((job) => job.id === item.jobId)?.title || item.jobId,
        time: item.time,
        title: `${stageLabels[item.stage]} · ${item.operator}`,
        description: item.note,
        kind: 'stage' as const,
      })) || []

    const activityLogs =
      profile?.activityFeed.map((item) => ({
        id: `${item.jobId}-${item.time}-${item.title}`,
        jobId: item.jobId,
        jobTitle: progressJobs.find((job) => job.id === item.jobId)?.title || item.jobId,
        time: item.time,
        title: item.title,
        description: item.description,
        kind: 'activity' as const,
      })) || []

    return [...stageLogs, ...activityLogs].sort((a, b) => String(b.time).localeCompare(String(a.time)))
  }, [profile])

  const filteredJobLogs = useMemo(
    () => logItems.filter((item) => item.jobId === (logJobId || activeJobId)),
    [activeJobId, logItems, logJobId],
  )

  const pagedTimeLogs = useMemo(
    () => logItems.slice((logPage - 1) * logPageSize, logPage * logPageSize),
    [logItems, logPage],
  )
  const pagedJobLogs = useMemo(
    () => filteredJobLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize),
    [filteredJobLogs, logPage],
  )

  useEffect(() => {
    setLogPage(1)
  }, [logMode, logJobId])

  useEffect(() => {
    setLogJobId(initialJobId)
  }, [initialJobId])

  if (!profile || !activeRow) {
    return (
      <Card bordered={false} className="next-panel">
        未找到候选人详情。
      </Card>
    )
  }

  const handleBack = () => {
    if (source === 'progress' && fromJobId && fromStage) {
      navigate(`/jobs/${fromJobId}/progress?stage=${fromStage}`)
      return
    }
    navigate('/candidates')
  }

  const applyMerge = () => {
    setMergedFormData(buildMergedPayload(mergeChoice))
    setMergeVisible(false)
    Message.success('已应用本次合并结果')
  }

  const mergedCandidateName =
    mergedFormData.name && mergedFormData.name !== '未填写' ? mergedFormData.name : activeRow.candidate
  const mergedCandidateEmail =
    mergedFormData.email && mergedFormData.email !== '未填写' ? mergedFormData.email : activeRow.email
  const mergedLocation =
    mergedFormData.location && mergedFormData.location !== '未填写' ? mergedFormData.location : activeRow.location
  const mergedEducation =
    mergedFormData.highestEducation && mergedFormData.highestEducation !== '未填写'
      ? mergedFormData.highestEducation
      : activeRow.education
  const mergedExperience =
    mergedFormData.daExperienceYears && mergedFormData.daExperienceYears !== '未填写'
      ? `${mergedFormData.daExperienceYears} 年`
      : profile.yearsOfExperience
  const mergedRate =
    mergedFormData.minSalary && mergedFormData.minSalary !== '未填写'
      ? `$${mergedFormData.minSalary} / h`
      : profile.preferredRate
  const mergedPhone =
    mergedFormData.whatsapp && mergedFormData.whatsapp !== '未填写' ? mergedFormData.whatsapp : profile.phone

  const mergeActionStyle = {
    borderColor: 'rgba(22, 93, 255, 0.28)',
    background: 'linear-gradient(180deg, rgba(22, 93, 255, 0.14) 0%, rgba(22, 93, 255, 0.08) 100%)',
    color: '#165dff',
  } as const

  const mailActionStyle = {
    borderColor: 'rgba(255, 125, 0, 0.28)',
    background: 'linear-gradient(180deg, rgba(255, 125, 0, 0.14) 0%, rgba(255, 125, 0, 0.08) 100%)',
    color: '#d25f00',
  } as const

  const joinActionStyle = {
    borderColor: 'rgba(0, 180, 42, 0.26)',
    background: 'linear-gradient(180deg, rgba(0, 180, 42, 0.14) 0%, rgba(0, 180, 42, 0.08) 100%)',
    color: '#0e8a2f',
  } as const

  return (
    <div className="next-admin-page">
      <div className="next-candidate-page__header">
        <Button icon={<IconArrowLeft />} onClick={handleBack}>
          {source === 'progress' ? '返回招聘进展' : '返回总人才库'}
        </Button>
        <Space>
          <Button
            className="next-candidate-page__action next-candidate-page__action--merge"
            style={mergeActionStyle}
            onClick={() => setMergeVisible(true)}
          >
            合并表单信息
          </Button>
          <Button
            className="next-candidate-page__action next-candidate-page__action--mail"
            style={mailActionStyle}
            onClick={() => setEmailVisible(true)}
          >
            发邮件
          </Button>
          <Button
            className="next-candidate-page__action next-candidate-page__action--join"
            style={joinActionStyle}
            onClick={() => setJobVisible(true)}
          >
            加入岗位
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="next-panel">
        <div className="next-candidate-page__hero">
          <div>
            <div className="next-candidate-page__name">{mergedCandidateName}</div>
            <div className="next-candidate-page__meta">
              {mergedCandidateEmail} · {mergedPhone} · {profile.timezone}
            </div>
          </div>
        </div>
        <div className="next-candidate-page__summary">{profile.summary}</div>

        <Descriptions
          column={3}
          data={[
            { label: '所在地', value: mergedLocation },
            { label: '学历', value: mergedEducation },
            { label: '经验', value: mergedExperience },
            { label: '期望时薪', value: mergedRate },
            { label: '当前手机号', value: mergedPhone },
            { label: '国籍', value: mergedFormData.nationality || '未填写' },
            { label: '母语', value: mergedFormData.nativeLanguage || '未填写' },
            { label: '其他语言', value: mergedFormData.otherLanguages || '未填写' },
            { label: '每天最长工作时间', value: mergedFormData.maxWorkHours ? `${mergedFormData.maxWorkHours} 小时` : '未填写' },
            { label: '是否需要签证', value: mergedFormData.needVisa || '未填写' },
            { label: '是否接受按小时付费', value: mergedFormData.acceptHourlyRate || '未填写' },
            { label: '当前在职状态', value: mergedFormData.employmentStatus || '未填写' },
          ]}
        />
      </Card>

      <Card bordered={false} className="next-panel" title="已投递岗位" style={{ marginTop: 16 }}>
        <Table
          rowKey="jobId"
          data={jobSummaryRows}
          pagination={{
            pageSize: 6,
            showJumper: true,
            showTotal: true,
          }}
          columns={[
            {
              title: '岗位',
              dataIndex: 'jobTitle',
              width: 220,
              render: (value: string, record: { jobId: string }) => (
                <Button
                  type="text"
                  style={{ padding: 0, fontWeight: 600 }}
                  onClick={() => navigate(`/jobs/${record.jobId}`)}
                >
                  {value}
                </Button>
              ),
            },
            { title: '公司', dataIndex: 'company', width: 180 },
            {
              title: '流转状态',
              dataIndex: 'stage',
              width: 130,
              render: (value: ProgressRow['stage']) => (
                <Tag color={stageColors[value]}>{stageLabels[value]}</Tag>
              ),
            },
            { title: '接受时薪', dataIndex: 'rate', width: 120, render: (value: number) => `$${value}` },
            { title: '质检状态', dataIndex: 'qaStatus', width: 140 },
            { title: '签约进展', dataIndex: 'signingStatus', width: 160 },
            { title: '入职进展', dataIndex: 'onboardingStatus', width: 140 },
            {
              title: '操作',
              dataIndex: 'actions',
              width: 140,
              render: (_: unknown, record: { jobId: string }) => (
                <Button
                  type="secondary"
                  size="mini"
                  onClick={() => {
                    setActiveJobId(record.jobId)
                    setJobDrawerVisible(true)
                  }}
                >
                  查看进度详情
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Card
        bordered={false}
        className="next-panel"
        title="状态流转日志"
        style={{ marginTop: 16 }}
        extra={
          <Radio.Group
            type="button"
            size="small"
            value={logMode}
            onChange={(value) => setLogMode(String(value) as 'time' | 'job')}
          >
            <Radio value="time">按时间</Radio>
            <Radio value="job">按岗位</Radio>
          </Radio.Group>
        }
      >
        {logMode === 'time' ? (
          <div className="next-candidate-page__feed">
            {pagedTimeLogs.map((item) => (
              <div key={item.id} className="next-candidate-page__feed-item">
                <div className="next-candidate-page__feed-title">
                  {item.title}
                  <span className="next-candidate-page__feed-badge">{item.jobTitle}</span>
                </div>
                <div className="next-candidate-page__feed-time">{item.time}</div>
                <div className="next-candidate-page__feed-note">{item.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="next-candidate-page__log-panel">
            <div className="next-candidate-page__log-filter">
              <span>选择岗位</span>
              <Select
                className="next-candidate-page__log-select"
                value={logJobId || activeJobId}
                onChange={(value) => setLogJobId(String(value))}
              >
                {jobSummaryRows.map((item) => (
                  <Select.Option key={item.jobId} value={item.jobId}>
                    {item.jobTitle}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="next-candidate-page__feed">
              {pagedJobLogs.map((item) => (
                <div key={item.id} className="next-candidate-page__feed-item">
                  <div className="next-candidate-page__feed-title">{item.title}</div>
                  <div className="next-candidate-page__feed-time">{item.time}</div>
                  <div className="next-candidate-page__feed-note">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="next-candidate-page__pagination">
          <Pagination
            size="small"
            current={logPage}
            pageSize={logPageSize}
            total={logMode === 'time' ? logItems.length : filteredJobLogs.length}
            onChange={(pageNumber) => setLogPage(pageNumber)}
            showTotal
          />
        </div>
      </Card>

      <Modal
        title="合并表单信息"
        visible={mergeVisible}
        style={{ width: 1040 }}
        className="next-candidate-merge-modal--90vh"
        onCancel={() => setMergeVisible(false)}
        onOk={applyMerge}
      >
        <div className="next-candidate-merge-modal">
          <div className="next-candidate-merge__toolbar">
            <Space>
              <Button
                size="small"
                onClick={() =>
                  setMergeChoice(
                    Object.fromEntries(mergeFieldKeys.map((key) => [key, 'current'])) as MergeChoice,
                  )
                }
              >
                全部选原数据
              </Button>
              <Button
                size="small"
                onClick={() =>
                  setMergeChoice(
                    Object.fromEntries(mergeFieldKeys.map((key) => [key, 'incoming'])) as MergeChoice,
                  )
                }
              >
                全部选新表单
              </Button>
            </Space>
          </div>
          <div className="next-candidate-merge-modal__content">
            <div className="next-candidate-merge">
              {mergeFieldKeys.map((key) => (
                <div key={key} className="next-candidate-merge__row">
                  <div className="next-candidate-merge__label">{mergeLabelMap[key] || key}</div>
                  <button
                    type="button"
                    className={`next-candidate-merge__option${mergeChoice[key] === 'current' ? ' is-active' : ''}`}
                    onClick={() => setMergeChoice((current) => ({ ...current, [key]: 'current' }))}
                  >
                    <span className="next-candidate-merge__source">原数据</span>
                    <strong>{formatMergeValue(mergeSource?.current[key])}</strong>
                  </button>
                  <button
                    type="button"
                    className={`next-candidate-merge__option${mergeChoice[key] === 'incoming' ? ' is-active' : ''}`}
                    onClick={() => setMergeChoice((current) => ({ ...current, [key]: 'incoming' }))}
                  >
                    <span className="next-candidate-merge__source">新表单</span>
                    <strong>{formatMergeValue(mergeSource?.incoming[key])}</strong>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Drawer
        width={520}
        title="当前岗位进度详情"
        visible={jobDrawerVisible}
        onCancel={() => setJobDrawerVisible(false)}
      >
        <Descriptions
          column={1}
          data={[
            { label: '岗位', value: activeJobHistory?.jobTitle || activeJob?.title || '-' },
            { label: '公司', value: activeJob?.company || '-' },
            {
              label: '当前阶段',
              value: activeRow ? (
                <Tag color={stageColors[activeRow.stage]}>{stageLabels[activeRow.stage]}</Tag>
              ) : (
                '-'
              ),
            },
            { label: '申请时间', value: activeRow?.appliedAt || '-' },
            { label: '测试结果', value: activeRow?.testResult || '-' },
            { label: '判题负责人', value: activeRow?.reviewOwner || '-' },
            { label: '质检状态', value: activeRow?.qaStatus || '-' },
            { label: '签约进展', value: activeRow?.signingStatus || '-' },
            { label: '合同审核', value: activeRow?.contractReview || '-' },
            { label: '入职进展', value: activeRow?.onboardingStatus || '-' },
            { label: '待签合同', value: activeRow?.contractDraft || '暂无' },
            { label: '签回合同', value: activeRow?.contractSigned || '暂无' },
          ]}
        />
      </Drawer>

      <SendMailModal
        visible={emailVisible}
        onVisibleChange={setEmailVisible}
        recipientName={mergedCandidateName}
        recipientEmail={mergedCandidateEmail}
      />
      <JoinJobModal
        visible={jobVisible}
        onVisibleChange={setJobVisible}
        candidateName={mergedCandidateName}
      />
    </div>
  )
}
