import {
  Button,
  Card,
  Grid,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
  Space,
  Tabs,
  Tag,
} from '@arco-design/web-react'
import {
  IconFile,
  IconSwap,
  IconUpload,
} from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AddCandidatesToStageModal from '../../components/progress/AddCandidatesToStageModal'
import ProgressStageTable, { type ProgressColumnDefinition } from '../../components/progress/ProgressStageTable'
import JobOverviewHero from '../../components/jobs/JobOverviewHero'
import SendMailModal from '../../components/shared/SendMailModal'
import AssessmentPreviewModal from './AssessmentPreviewModal'
import ProgressCandidateDrawer from './ProgressCandidateDrawer'
import ProgressStageActions from './ProgressStageActions'
import {
  candidateMergeSources,
  candidateProfiles,
  candidates,
  progressRows,
  type ProgressCandidateProfile,
  type ProgressRow,
  type ProgressStage,
} from '../../data/mock'
import { getJobProfileById } from '../../lib/jobsStore'
import {
  actionableStages,
  allColumnDefs,
  batchEditOptions,
  defaultColumns,
  getStageLabel,
  stageColorMap,
  stageOptions,
  stageTransitionMap,
  type BatchEditMode,
  type VisibleKey,
} from './progressConfig'

const { Row, Col } = Grid

function getNowLabel() {
  return new Date().toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialJobId = jobId || 'job-1'
  const initialStage = (searchParams.get('stage') as ProgressStage | null) || 'screening'
  const selectedJobId = initialJobId
  const [activeStage, setActiveStage] = useState<ProgressStage>(
    stageOptions.some((item) => item.key === initialStage) ? initialStage : 'screening',
  )
  const [keyword, setKeyword] = useState('')
  const [nationality, setNationality] = useState('all')
  const [education, setEducation] = useState('all')
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [rows, setRows] = useState(progressRows)
  const [profiles, setProfiles] = useState<Record<number, ProgressCandidateProfile>>(candidateProfiles)
  const [screeningMailVisible, setScreeningMailVisible] = useState(false)
  const [mailRecipientIds, setMailRecipientIds] = useState<number[]>([])
  const [screeningAddVisible, setScreeningAddVisible] = useState(false)
  const [testPreviewCandidateId, setTestPreviewCandidateId] = useState<number | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<Record<ProgressStage, VisibleKey[]>>({
    all: [...defaultColumns.all],
    screening: [...defaultColumns.screening],
    assessment: [...defaultColumns.assessment],
    passed: [...defaultColumns.passed],
    contract: [...defaultColumns.contract],
    employed: [...defaultColumns.employed],
    replaced: [...defaultColumns.replaced],
    eliminated: [...defaultColumns.eliminated],
  })
  const [detailCandidateId, setDetailCandidateId] = useState<number | null>(null)
  const [flowRowIds, setFlowRowIds] = useState<number[]>([])
  const [isFlowModalVisible, setIsFlowModalVisible] = useState(false)
  const [flowTargetStage, setFlowTargetStage] = useState<Exclude<ProgressStage, 'all'>>('passed')
  const [isOwnerModalVisible, setIsOwnerModalVisible] = useState(false)
  const [batchOwner, setBatchOwner] = useState('Kelly')
  const [batchEditMode, setBatchEditMode] = useState<BatchEditMode>('signingStatus')
  const [batchEditValue, setBatchEditValue] = useState('')
  const [isBatchEditModalVisible, setIsBatchEditModalVisible] = useState(false)
  const [isRateHighlightModalVisible, setIsRateHighlightModalVisible] = useState(false)
  const [rateHighlightMin, setRateHighlightMin] = useState<number | undefined>(4)
  const [rateHighlightMax, setRateHighlightMax] = useState<number | undefined>(undefined)

  const currentJob = getJobProfileById(selectedJobId)
  const isAllStage = activeStage === 'all'

  const jobRows = useMemo(
    () => rows.filter((row) => row.jobId === selectedJobId),
    [rows, selectedJobId],
  )

  const currentJobStats = useMemo(
    () => ({
      applicants: jobRows.length,
      screening: jobRows.filter((row) => row.stage === 'screening').length,
      assessment: jobRows.filter((row) => row.stage === 'assessment').length,
      passed: jobRows.filter((row) => row.stage === 'passed').length,
      contract: jobRows.filter((row) => row.stage === 'contract').length,
      employed: jobRows.filter((row) => row.stage === 'employed').length,
      replaced: jobRows.filter((row) => row.stage === 'replaced').length,
      eliminated: jobRows.filter((row) => row.stage === 'eliminated').length,
    }),
    [jobRows],
  )

  const rowsByStage = useMemo(
    () => jobRows.filter((row) => activeStage === 'all' || row.stage === activeStage),
    [activeStage, jobRows],
  )

  const filteredRows = useMemo(() => {
    return rowsByStage.filter((row) => {
      const matchesKeyword =
        keyword.length === 0 ||
        [row.candidate, row.email, row.location].some((value) =>
          value.toLowerCase().includes(keyword.toLowerCase()),
        )
      const matchesNationality = nationality === 'all' || row.nationality === nationality
      const matchesEducation = education === 'all' || row.education === education
      return matchesKeyword && matchesNationality && matchesEducation
    })
  }, [education, keyword, nationality, rowsByStage])

  const nationalityOptions = ['all', ...Array.from(new Set(jobRows.map((row) => row.nationality)))]
  const educationOptions = ['all', ...Array.from(new Set(jobRows.map((row) => row.education)))]

  const stageCountMap: Record<ProgressStage, number> = {
    all: currentJobStats.applicants,
    screening: currentJobStats.screening,
    assessment: currentJobStats.assessment,
    passed: currentJobStats.passed,
    contract: currentJobStats.contract,
    employed: currentJobStats.employed,
    replaced: currentJobStats.replaced,
    eliminated: currentJobStats.eliminated,
  }

  const selectedCandidate = useMemo(
    () => rows.find((row) => row.id === detailCandidateId) || null,
    [detailCandidateId, rows],
  )
  const mailRecipients = useMemo(
    () =>
      rows
        .filter((row) => mailRecipientIds.includes(row.id))
        .map((row) => ({ name: row.candidate, email: row.email })),
    [mailRecipientIds, rows],
  )

  const selectedProfile = detailCandidateId ? profiles[detailCandidateId] : null
  const previewCandidate = testPreviewCandidateId != null ? rows.find((row) => row.id === testPreviewCandidateId) || null : null
  const previewProfile = testPreviewCandidateId != null ? profiles[testPreviewCandidateId] : null
  const previewAttachmentUrl = useMemo(() => {
    if (!previewCandidate?.testAttachment) return ''
    const value = previewCandidate.testAttachment
    if (/^(https?:\/\/|data:|\/)/.test(value)) return value
    return ''
  }, [previewCandidate])
  const selectedJobRecord = selectedCandidate
    ? {
        jobTitle: currentJob?.title || '-',
        stage: selectedCandidate.stage,
        rate: selectedCandidate.rate,
        qaStatus: selectedCandidate.qaStatus,
        signingStatus: selectedCandidate.signingStatus,
        onboardingStatus: selectedCandidate.onboardingStatus,
      }
    : null
  const selectedJobStageHistory =
    selectedProfile?.stageHistory.filter((item) => item.jobId === selectedJobId) || []
  const selectedJobActivityFeed =
    selectedProfile?.activityFeed.filter((item) => item.jobId === selectedJobId) || []

  const flowSourceStages = useMemo(
    () =>
      Array.from(
        new Set(
          flowRowIds
            .map((id) => rows.find((row) => row.id === id)?.stage)
            .filter((stage): stage is Exclude<ProgressStage, 'all'> => Boolean(stage)),
        ),
      ),
    [flowRowIds, rows],
  )

  const flowTargetOptions = useMemo(() => {
    if (flowSourceStages.length === 1) {
      return stageTransitionMap[flowSourceStages[0]]
    }
    if (activeStage !== 'all') {
      return stageTransitionMap[activeStage]
    }
    return actionableStages.map((stage) => stage.key)
  }, [activeStage, flowSourceStages])

  useEffect(() => {
    setSelectedRowKeys([])
  }, [activeStage, selectedJobId])

  useEffect(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('stage', activeStage)
      return next
    })
  }, [activeStage, setSearchParams])

  useEffect(() => {
  if (detailCandidateId == null) return
    const stillExists = rows.some((row) => row.id === detailCandidateId && row.jobId === selectedJobId)
    if (!stillExists) {
      setDetailCandidateId(null)
    }
  }, [detailCandidateId, rows, selectedJobId])

  const updateRow = <K extends keyof ProgressRow>(id: number, key: K, value: ProgressRow[K]) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)))
  }

  const updateAssessmentField = <
    K extends 'testResult' | 'reviewOwner' | 'reviewComment',
  >(
    id: number,
    key: K,
    value: ProgressRow[K],
  ) => {
    updateRow(id, key, value)
  }

  const updateProfile = (candidateId: number, updater: (profile: ProgressCandidateProfile) => ProgressCandidateProfile) => {
    setProfiles((current) => {
      const profile = current[candidateId]
      if (!profile) return current
      return {
        ...current,
        [candidateId]: updater(profile),
      }
    })
  }

  const syncProfileJobRecord = (
    candidateId: number,
    patch: Partial<ProgressCandidateProfile['jobHistory'][number]>,
  ) => {
    updateProfile(candidateId, (profile) => ({
      ...profile,
      jobHistory: profile.jobHistory.map((item) =>
        item.jobId === selectedJobId ? { ...item, ...patch } : item,
      ),
    }))
  }

  const appendProfileFeed = (candidateId: number, title: string, description: string) => {
    updateProfile(candidateId, (profile) => ({
      ...profile,
      activityFeed: [{ jobId: selectedJobId, time: getNowLabel(), title, description }, ...profile.activityFeed],
    }))
  }

  const openFlowModal = (rowIds: number[]) => {
    if (rowIds.length === 0) {
      Message.warning('请先选择要流转的人选')
      return
    }
    const firstRow = rows.find((row) => row.id === rowIds[0])
    setFlowRowIds(rowIds)
    const initialTargets: Exclude<ProgressStage, 'all'>[] = firstRow
      ? stageTransitionMap[firstRow.stage]
      : ['passed']
    setFlowTargetStage(initialTargets[0] || 'passed')
    setIsFlowModalVisible(true)
  }

  const openMailModal = (rowIds: number[]) => {
    if (!rowIds.length) {
      Message.warning('请先选择要发送邮件的候选人')
      return
    }
    setMailRecipientIds(rowIds)
    setScreeningMailVisible(true)
  }

  const applyStageFlow = () => {
    const flowTime = getNowLabel()
    setRows((current) =>
      current.map((row) => {
        if (!flowRowIds.includes(row.id)) return row
        return {
          ...row,
          stage: flowTargetStage,
          signingStatus: flowTargetStage === 'contract' ? '可发合同' : row.signingStatus,
          onboardingStatus:
            flowTargetStage === 'employed'
              ? '成功签约'
              : flowTargetStage === 'replaced'
                ? '汰换'
                : row.onboardingStatus,
          qaStatus: flowTargetStage === 'passed' ? '质检合格' : row.qaStatus,
        }
      }),
    )
    flowRowIds.forEach((candidateId) => {
      const currentRow = rows.find((row) => row.id === candidateId)
      if (!currentRow) return
      syncProfileJobRecord(candidateId, {
        stage: flowTargetStage,
        qaStatus: flowTargetStage === 'passed' ? '质检合格' : currentRow.qaStatus,
        signingStatus: flowTargetStage === 'contract' ? '可发合同' : currentRow.signingStatus,
        onboardingStatus:
          flowTargetStage === 'employed'
            ? '成功签约'
            : flowTargetStage === 'replaced'
              ? '汰换'
              : currentRow.onboardingStatus,
      })
      updateProfile(candidateId, (profile) => ({
        ...profile,
        stageHistory: [
          {
            jobId: selectedJobId,
            time: flowTime,
            stage: flowTargetStage,
            operator: 'Admin',
            note: `从${getStageLabel(currentRow.stage)}流转至${getStageLabel(flowTargetStage)}`,
          },
          ...profile.stageHistory,
        ],
      }))
      appendProfileFeed(
        candidateId,
        `阶段流转至${getStageLabel(flowTargetStage)}`,
        `由招聘进展工作台执行流转，原阶段为${getStageLabel(currentRow.stage)}。`,
      )
    })
    Message.success(`已将 ${flowRowIds.length} 位候选人流转到${getStageLabel(flowTargetStage)}`)
    setSelectedRowKeys([])
    setIsFlowModalVisible(false)
  }

  const openOwnerModal = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要分配判题人的人选')
      return
    }
    setIsOwnerModalVisible(true)
  }

  const applyBatchOwner = () => {
    setRows((current) =>
      current.map((row) =>
        selectedRowKeys.includes(row.id) ? { ...row, reviewOwner: batchOwner } : row,
      ),
    )
    selectedRowKeys.forEach((candidateId) => {
      appendProfileFeed(candidateId, '判题人更新', `已将判题人更新为 ${batchOwner}。`)
    })
    Message.success(`已为 ${selectedRowKeys.length} 位候选人分配判题人`)
    setSelectedRowKeys([])
    setIsOwnerModalVisible(false)
  }

  const executeAssessmentAutomation = () => {
    const selectedAssessmentRows = rows.filter(
      (row) => selectedRowKeys.includes(row.id) && row.stage === 'assessment',
    )

    if (!selectedAssessmentRows.length) {
      Message.warning('请先选择测试题回收阶段的人选')
      return
    }

    const now = getNowLabel()
    let passedCount = 0
    let eliminatedCount = 0

    setRows((current) =>
      current.map((row) => {
        if (!selectedRowKeys.includes(row.id) || row.stage !== 'assessment') return row

        if (row.testResult === '通过' || row.testResult === '待定') {
          passedCount += 1
          return { ...row, stage: 'passed' }
        }

        if (row.testResult === '不通过') {
          eliminatedCount += 1
          return { ...row, stage: 'eliminated' }
        }

        return row
      }),
    )

    selectedAssessmentRows.forEach((row) => {
      let nextStage: Exclude<ProgressStage, 'all'> | null = null
      if (row.testResult === '通过' || row.testResult === '待定') nextStage = 'passed'
      if (row.testResult === '不通过') nextStage = 'eliminated'
      if (!nextStage) return

      syncProfileJobRecord(row.id, { stage: nextStage })
      updateProfile(row.id, (profile) => ({
        ...profile,
        stageHistory: [
          {
            jobId: selectedJobId,
            time: now,
            stage: nextStage,
            operator: 'Admin',
            note:
              nextStage === 'passed'
                ? `执行自动化后，基于测试结果“${row.testResult}”进入筛选通过。`
                : `执行自动化后，基于测试结果“不通过”进入淘汰。`,
          },
          ...profile.stageHistory,
        ],
      }))
      appendProfileFeed(
        row.id,
        nextStage === 'passed' ? '已自动流转到筛选通过' : '已自动流转到淘汰',
        nextStage === 'passed'
          ? `测试结果为“${row.testResult}”，已自动加入筛选通过。`
          : '测试结果为“不通过”，已自动加入淘汰。',
      )
    })

    const untouchedCount = selectedAssessmentRows.length - passedCount - eliminatedCount
    Message.success(
      `执行完成：${passedCount} 人进入筛选通过，${eliminatedCount} 人进入淘汰` +
        (untouchedCount > 0 ? `，${untouchedCount} 人保持测试题回收` : ''),
    )
    setSelectedRowKeys([])
  }

  const openBatchEditModal = (mode: BatchEditMode) => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要批量更新的人选')
      return
    }
    setBatchEditMode(mode)
    setBatchEditValue(batchEditOptions[mode][0])
    setIsBatchEditModalVisible(true)
  }

  const applyBatchEdit = () => {
    setRows((current) =>
      current.map((row) =>
        selectedRowKeys.includes(row.id)
          ? { ...row, [batchEditMode]: batchEditValue }
          : row,
      ),
    )
    selectedRowKeys.forEach((candidateId) => {
      if (batchEditMode === 'signingStatus') {
        syncProfileJobRecord(candidateId, {
          signingStatus: batchEditValue as ProgressRow['signingStatus'],
        })
        appendProfileFeed(candidateId, '签约进展已更新', `已批量更新为 ${batchEditValue}。`)
      }
      if (batchEditMode === 'onboardingStatus') {
        syncProfileJobRecord(candidateId, {
          onboardingStatus: batchEditValue as ProgressRow['onboardingStatus'],
        })
        appendProfileFeed(candidateId, '入职进展已更新', `已批量更新为 ${batchEditValue}。`)
      }
      if (batchEditMode === 'contractReview') {
        appendProfileFeed(candidateId, '合同审核状态已更新', `已批量更新为 ${batchEditValue}。`)
      }
    })
    Message.success(`已批量更新 ${selectedRowKeys.length} 位候选人的字段`)
    setSelectedRowKeys([])
    setIsBatchEditModalVisible(false)
  }

  const quickMoveSelectedToStage = (
    targetStage: Exclude<ProgressStage, 'all'>,
    _note: string,
    rowIds?: number[],
  ) => {
    const targetRowIds = rowIds && rowIds.length ? rowIds : selectedRowKeys
    if (targetRowIds.length === 0) {
      Message.warning('请先选择要处理的人选')
      return
    }
    setFlowRowIds(targetRowIds)
    setFlowTargetStage(targetStage)
    setIsFlowModalVisible(true)
  }

  const handleDrawerStageChange = (nextStage: Exclude<ProgressStage, 'all'>) => {
    if (!selectedCandidate) return
    setRows((current) =>
      current.map((row) =>
        row.id === selectedCandidate.id
          ? {
              ...row,
              stage: nextStage,
              onboardingStatus:
                nextStage === 'employed'
                  ? '成功签约'
                  : nextStage === 'replaced'
                    ? '汰换'
                    : row.onboardingStatus,
            }
          : row,
      ),
    )
    syncProfileJobRecord(selectedCandidate.id, {
      stage: nextStage,
      onboardingStatus:
        nextStage === 'employed'
          ? '成功签约'
          : nextStage === 'replaced'
            ? '汰换'
            : selectedCandidate.onboardingStatus,
    })
    updateProfile(selectedCandidate.id, (profile) => ({
      ...profile,
      stageHistory: [
        {
          jobId: selectedJobId,
          time: getNowLabel(),
          stage: nextStage,
          operator: 'Admin',
          note: `在详情抽屉中直接调整到${getStageLabel(nextStage)}。`,
        },
        ...profile.stageHistory,
      ],
    }))
    appendProfileFeed(selectedCandidate.id, '阶段已更新', `已在详情抽屉中调整到${getStageLabel(nextStage)}。`)
    Message.success(`已将 ${selectedCandidate.candidate} 调整到${getStageLabel(nextStage)}`)
  }

  const handleAttachmentUpdate = (
    attachmentKey: 'testAttachment' | 'contractDraft' | 'contractSigned',
    nextFile: string,
  ) => {
    if (!selectedCandidate) return
    updateRow(selectedCandidate.id, attachmentKey, nextFile)
    appendProfileFeed(selectedCandidate.id, '附件已更新', `已更新${nextFile}。`)
    Message.success('附件状态已更新')
  }

  const handleIdAttachmentUpdate = () => {
    if (!selectedCandidate) return
    const nextFile = `${selectedCandidate.candidate.toLowerCase().replace(/\s+/g, '-')}-id-upload.pdf`
    updateRow(selectedCandidate.id, 'idAttachment', nextFile)
    updateProfile(selectedCandidate.id, (profile) => ({
      ...profile,
      idAttachment: nextFile,
    }))
    appendProfileFeed(selectedCandidate.id, '身份证附件已更新', `已上传 ${nextFile}。`)
    Message.success('身份证附件已更新')
  }

  const getCandidateFormSnapshot = (row: ProgressRow) => {
    const profile = profiles[row.id]
    const mergeSource = candidateMergeSources[row.id]
    const mergedSource = mergeSource?.incoming || mergeSource?.current || {}

    return {
      name: row.candidate,
      email: row.email,
      whatsapp: String(mergedSource.whatsapp || profile?.phone || '-'),
      location: String(mergedSource.location || row.location || '-'),
      nationality: String(mergedSource.nationality || row.nationality || '-'),
      education: String(mergedSource.highestEducation || row.education || '-'),
      nativeLanguage: String(mergedSource.nativeLanguage || '-'),
      otherLanguages: Array.isArray(mergedSource.otherLanguages)
        ? mergedSource.otherLanguages.join(' / ')
        : String(mergedSource.otherLanguages || '-'),
      maxWorkHours: mergedSource.maxWorkHours ? `${mergedSource.maxWorkHours} 小时` : '-',
      resume: String(mergedSource.resume || profile?.resumeAttachment || '-'),
      minSalary: mergedSource.minSalary ? `$${mergedSource.minSalary} / h` : profile?.preferredRate || `$${row.rate} / h`,
      needVisa: String(mergedSource.needVisa || '-'),
      acceptHourlyRate: String(mergedSource.acceptHourlyRate || '-'),
      daExperienceYears: mergedSource.daExperienceYears
        ? `${mergedSource.daExperienceYears} 年`
        : profile?.yearsOfExperience || '-',
      employmentStatus: String(mergedSource.employmentStatus || '-'),
    }
  }

  const availableCandidatesForScreening = useMemo(() => {
    const currentJobCandidateIds = new Set(jobRows.map((row) => row.id))
    return Object.entries(profiles)
      .map(([id, profile]) => {
        const numericId = Number(id)
        const row = rows.find((item) => item.id === numericId) || null
        return {
          id: numericId,
          name: row?.candidate || candidates.find((item) => item.id === numericId)?.name || `候选人 ${numericId}`,
          email: row?.email || candidates.find((item) => item.id === numericId)?.email || '-',
          location: row?.location || candidates.find((item) => item.id === numericId)?.location || '-',
          education: row?.education || candidates.find((item) => item.id === numericId)?.education || '-',
          experience: profile.yearsOfExperience,
          expectedRate: profile.preferredRate,
        }
      })
      .filter((item) => !currentJobCandidateIds.has(item.id))
  }, [jobRows, profiles, rows])

  const addCandidatesToScreeningStage = (candidateIds: number[]) => {
    const now = getNowLabel()
    const nextRows: ProgressRow[] = []

    candidateIds.forEach((candidateId) => {
      const existingRow = rows.find((item) => item.id === candidateId)
      const profile = profiles[candidateId]
      const candidateBase = candidates.find((item) => item.id === candidateId)

      if (!profile) return

      nextRows.push({
        id: candidateId,
        jobId: selectedJobId,
        contractNumber: `CTR-${new Date().getFullYear()}-${String(candidateId).padStart(3, '0')}`,
        appliedAt: now,
        candidate: existingRow?.candidate || candidateBase?.name || `候选人 ${candidateId}`,
        email: existingRow?.email || candidateBase?.email || '-',
        location: existingRow?.location || candidateBase?.location || '-',
        nationality: existingRow?.nationality || String(candidateMergeSources[candidateId]?.incoming?.nationality || candidateMergeSources[candidateId]?.current?.nationality || '-'),
        education: existingRow?.education || candidateBase?.education || '-',
        stage: 'screening',
        testResult: '待定',
        reviewOwner: '',
        reviewComment: '',
        qaStatus: '未开始',
        qaFeedback: '',
        signingStatus: '暂缓发合同',
        onboardingStatus: '消失',
        rate: Number(String(profile.preferredRate).replace(/[^\d.]/g, '') || existingRow?.rate || 0),
        testAttachment: '',
        idAttachment: profile.idAttachment || '',
        contractDraft: '',
        contractSigned: '',
        contractReview: '待修改',
        replacementReason: '',
      })

      updateProfile(candidateId, (currentProfile) => ({
        ...currentProfile,
        jobHistory: [
          {
            jobId: selectedJobId,
            jobTitle: currentJob?.title || selectedJobId,
            stage: 'screening',
            rate: Number(String(profile.preferredRate).replace(/[^\d.]/g, '') || existingRow?.rate || 0),
            qaStatus: '未开始',
            signingStatus: '暂缓发合同',
            onboardingStatus: '消失',
          },
          ...currentProfile.jobHistory.filter((item) => item.jobId !== selectedJobId),
        ],
        stageHistory: [
          {
            jobId: selectedJobId,
            time: now,
            stage: 'screening',
            operator: 'Admin',
            note: '从总人才库加入待筛选名单。',
          },
          ...currentProfile.stageHistory,
        ],
        activityFeed: [
          {
            jobId: selectedJobId,
            time: now,
            title: '已加入岗位待筛选名单',
            description: `已加入 ${currentJob?.title || selectedJobId} 的待筛选名单。`,
          },
          ...currentProfile.activityFeed,
        ],
      }))
    })

    if (!nextRows.length) {
      Message.warning('当前没有可添加的候选人')
      return
    }

    setRows((current) => [...current, ...nextRows])
    Message.success(`已添加 ${nextRows.length} 位候选人到待筛选名单`)
  }

  const tableColumns = useMemo<ProgressColumnDefinition<ProgressRow>[]>(() => {
    const activeVisible = visibleColumns[activeStage]
    const textSorter = (getter: (row: ProgressRow) => string) => (a: ProgressRow, b: ProgressRow) =>
      getter(a).localeCompare(getter(b), 'zh-CN')
    const numberSorter = (getter: (row: ProgressRow) => number) => (a: ProgressRow, b: ProgressRow) =>
      getter(a) - getter(b)

    const columns = activeVisible.map((key): ProgressColumnDefinition<ProgressRow> => {
      if (key === 'candidate') {
        return {
          key,
          title: '候选人',
          dataIndex: 'candidate',
          width: 180,
          minWidth: 160,
          fixed: 'left',
          sorter: textSorter((row) => row.candidate),
          render: (value, row) => (
            <div>
              <Button type="text" size="small" style={{ padding: 0, fontWeight: 600 }} onClick={() => setDetailCandidateId(row.id)}>
                {value}
              </Button>
              <div style={{ fontSize: 12, color: 'var(--next-muted)' }}>{row.email}</div>
            </div>
          ),
        }
      }

      if (key === 'stage') {
        return {
          key,
          title: '当前阶段',
          dataIndex: 'stage',
          width: 128,
          minWidth: 120,
          sorter: textSorter((row) => getStageLabel(row.stage)),
          render: (value: ProgressRow['stage']) => <Tag color={stageColorMap[value]}>{getStageLabel(value)}</Tag>,
        }
      }

      if (key === 'email') {
        return {
          key,
          title: '邮箱',
          dataIndex: 'email',
          width: 220,
          minWidth: 180,
          ellipsis: true,
          sorter: textSorter((row) => row.email),
        }
      }

      if (
        [
          'whatsapp',
          'location',
          'nationality',
          'education',
          'nativeLanguage',
          'otherLanguages',
          'maxWorkHours',
          'resume',
          'minSalary',
          'needVisa',
          'acceptHourlyRate',
          'daExperienceYears',
          'employmentStatus',
          'contractNumber',
        ].includes(key)
      ) {
        return {
          key,
          title:
            key === 'contractNumber'
              ? '合同编号'
              : allColumnDefs.find((col) => col.key === key)?.title || key,
          width: key === 'resume' ? 210 : key === 'otherLanguages' ? 180 : 150,
          minWidth: 120,
          ellipsis: true,
          sorter: textSorter((row) => {
            if (key === 'contractNumber') return String(row.contractNumber || '')
            const snapshot = getCandidateFormSnapshot(row)
            return String(snapshot[key as keyof typeof snapshot] || '')
          }),
          render: (_value, row) => {
            if (key === 'contractNumber') return row.contractNumber || '-'
            const snapshot = getCandidateFormSnapshot(row)
            const displayValue = snapshot[key as keyof typeof snapshot]
            if (key === 'resume') {
              return displayValue && displayValue !== '-' ? (
                <Button
                  type="text"
                  size="small"
                  icon={<IconFile />}
                  onClick={() => Message.info(`演示态：预览 ${displayValue}`)}
                >
                  {displayValue}
                </Button>
              ) : (
                '-'
              )
            }
            return displayValue || '-'
          },
        }
      }

      if (key === 'testAttachment' || key === 'contractDraft' || key === 'contractSigned' || key === 'idAttachment') {
        return {
          key,
          title:
            key === 'contractDraft' && activeStage === 'contract'
              ? '提交合同附件'
              : key === 'contractSigned' && activeStage === 'contract'
                ? '合同签回附件'
                : allColumnDefs.find((col) => col.key === key)?.title || key,
          dataIndex: key,
          width: 190,
          minWidth: 160,
          ellipsis: true,
          sorter: textSorter((row) => String(row[key] || '')),
          render: (value: string, row) =>
            value ? (
              <Button
                type="text"
                size="small"
                icon={<IconFile />}
                onClick={() =>
                  key === 'testAttachment'
                    ? setTestPreviewCandidateId(row.id)
                    : Message.info(`演示态：预览 ${value}`)
                }
              >
                {value}
              </Button>
            ) : (
              <Button
                type="text"
                size="small"
                icon={<IconUpload />}
                onClick={() => Message.info('演示态：打开上传附件弹窗')}
              >
                上传附件
              </Button>
            ),
        }
      }

      if (key === 'contractReview') {
        return {
          key,
          title: '合同审核',
          dataIndex: 'contractReview',
          width: 150,
          minWidth: 140,
          sorter: textSorter((row) => row.contractReview),
          render: (value: ProgressRow['contractReview'], row) => (
            <Select size="small" value={value} onChange={(next) => updateRow(row.id, 'contractReview', next as ProgressRow['contractReview'])}>
              {batchEditOptions.contractReview.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'testResult') {
        return {
          key,
          title: '测试结果',
          dataIndex: 'testResult',
          width: 150,
          minWidth: 140,
          sorter: textSorter((row) => row.testResult),
          render: (value: ProgressRow['testResult'], row) => (
            <Select
              size="small"
              value={value}
              onChange={(next) =>
                updateAssessmentField(row.id, 'testResult', next as ProgressRow['testResult'])
              }
            >
              {['通过', '待定', '不通过', '需重新提交'].map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'reviewOwner') {
        return {
          key,
          title: '判题人',
          dataIndex: 'reviewOwner',
          width: 140,
          minWidth: 130,
          sorter: textSorter((row) => row.reviewOwner),
          render: (value: string, row) => (
            <Select
              size="small"
              value={value}
              onChange={(next) => updateAssessmentField(row.id, 'reviewOwner', String(next))}
            >
              {['Kelly', 'Tony', 'Anna', 'Mia'].map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'reviewComment' || key === 'qaFeedback' || key === 'replacementReason') {
        return {
          key,
          title: allColumnDefs.find((col) => col.key === key)?.title || key,
          dataIndex: key,
          width: 240,
          minWidth: 200,
          ellipsis: true,
          sorter: textSorter((row) => String(row[key] || '')),
          render: (value: string, row) => (
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              value={value}
              onChange={(next) =>
                key === 'reviewComment'
                  ? updateAssessmentField(row.id, 'reviewComment', next)
                  : key === 'qaFeedback'
                    ? updateRow(row.id, 'qaFeedback', next)
                    : updateRow(row.id, 'replacementReason', next)
              }
            />
          ),
        }
      }

      if (key === 'qaStatus') {
        return {
          key,
          title: '质检',
          dataIndex: 'qaStatus',
          width: 150,
          minWidth: 140,
          sorter: textSorter((row) => row.qaStatus),
          render: (value: ProgressRow['qaStatus'], row) => (
            <Select size="small" value={value} onChange={(next) => updateRow(row.id, 'qaStatus', next as ProgressRow['qaStatus'])}>
              {(
                activeStage === 'passed' || activeStage === 'eliminated'
                  ? ['质检合格', '待返修']
                  : ['未开始', '质检合格', '待返修']
              ).map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'signingStatus') {
        return {
          key,
          title: '签约进展',
          dataIndex: 'signingStatus',
          width: 190,
          minWidth: 170,
          sorter: textSorter((row) => row.signingStatus),
          render: (value: ProgressRow['signingStatus'], row) => (
            <Select size="small" value={value} onChange={(next) => updateRow(row.id, 'signingStatus', next as ProgressRow['signingStatus'])}>
              {batchEditOptions.signingStatus.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'onboardingStatus') {
        return {
          key,
          title: '入职进展',
          dataIndex: 'onboardingStatus',
          width: 180,
          minWidth: 160,
          sorter: textSorter((row) => row.onboardingStatus),
          render: (value: ProgressRow['onboardingStatus'], row) => (
            <Select size="small" value={value} onChange={(next) => updateRow(row.id, 'onboardingStatus', next as ProgressRow['onboardingStatus'])}>
              {batchEditOptions.onboardingStatus.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          ),
        }
      }

      if (key === 'rate') {
        return {
          key,
          title: activeStage === 'contract' ? '签约时薪' : '接受时薪',
          dataIndex: 'rate',
          width: 120,
          minWidth: 110,
          sorter: numberSorter((row) => row.rate),
          render: (value: number) => {
            const shouldHighlightRate =
              activeStage === 'passed' &&
              rateHighlightMin != null &&
              value >= rateHighlightMin &&
              (rateHighlightMax == null || value <= rateHighlightMax)

            return (
              <span
                style={{
                  color: shouldHighlightRate ? 'rgb(var(--danger-6))' : 'var(--next-text)',
                  fontWeight: 700,
                  background: shouldHighlightRate ? 'rgba(var(--danger-1), 0.9)' : 'transparent',
                  borderRadius: shouldHighlightRate ? 999 : 0,
                  padding: shouldHighlightRate ? '2px 8px' : 0,
                }}
              >
                ${value}
              </span>
            )
          },
        }
      }

      if (key === 'appliedAt') {
        return {
          key,
          title: '申请时间',
          dataIndex: 'appliedAt',
          width: 160,
          minWidth: 150,
          ellipsis: true,
          sorter: textSorter((row) => row.appliedAt),
        }
      }

      return {
        key,
        title: allColumnDefs.find((col) => col.key === key)?.title || key,
        dataIndex: key,
        width: 140,
        minWidth: 120,
        ellipsis: true,
        sorter: textSorter((row) => String((row as Record<string, any>)[key] || '')),
      }
    })

    columns.push({
      key: 'actions',
      title: '操作',
      width:
        activeStage === 'all'
          ? 92
          : activeStage === 'assessment'
          ? 180
          : activeStage === 'screening'
            ? 230
            : activeStage === 'contract'
              ? 230
            : activeStage === 'passed' || activeStage === 'eliminated' || activeStage === 'replaced'
              ? 260
              : activeStage === 'employed'
                ? 230
                : 170,
      minWidth:
        activeStage === 'all'
          ? 84
          : activeStage === 'assessment'
          ? 170
          : activeStage === 'screening'
            ? 210
            : activeStage === 'contract'
              ? 210
            : activeStage === 'passed' || activeStage === 'eliminated' || activeStage === 'replaced'
              ? 240
              : activeStage === 'employed'
                ? 210
                : 150,
      fixed: 'right',
      resizable: false,
      render: (_value, row) => (
        <Space>
          <Button size="mini" onClick={() => setDetailCandidateId(row.id)}>
            查看
          </Button>
          {activeStage === 'all' ? null : (
            <>
              <Button size="mini" status="success" onClick={() => openMailModal([row.id])}>
                发邮件
              </Button>
              {activeStage === 'passed' || activeStage === 'eliminated' ? (
                <Button
                  size="mini"
                  status="warning"
                  icon={<IconSwap />}
                  onClick={() => quickMoveSelectedToStage('assessment', '', [row.id])}
                >
                  移回测试题回收
                </Button>
              ) : activeStage === 'replaced' ? (
                <Button
                  size="mini"
                  status="warning"
                  icon={<IconSwap />}
                  onClick={() => quickMoveSelectedToStage('screening', '', [row.id])}
                >
                  恢复待筛选
                </Button>
              ) : activeStage === 'assessment' ? null : (
                <Button size="mini" status="warning" icon={<IconSwap />} onClick={() => openFlowModal([row.id])}>
                  流转
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    })

    return columns
  }, [activeStage, visibleColumns, rows, profiles, rateHighlightMin, rateHighlightMax])

  return (
    <div className="next-admin-page">
      <Card bordered={false} className="next-panel next-progress-hero">
        {currentJob ? (
          <JobOverviewHero
            job={currentJob}
            actions={
              <>
                <Button onClick={() => navigate(`/jobs/${selectedJobId}`)}>查看岗位详情</Button>
              </>
            }
          />
        ) : null}
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bordered={false} className="next-panel">
            <Tabs activeTab={activeStage} onChange={(key) => setActiveStage(key as ProgressStage)}>
              {stageOptions.map((stage) => (
                <Tabs.TabPane
                  key={stage.key}
                  title={`${stage.label} (${stageCountMap[stage.key]})`}
                >
                  <ProgressStageTable
                    stageKey={stage.key}
                    data={filteredRows}
                    rowKey="id"
                    columns={tableColumns}
                    allColumnOptions={allColumnDefs
                      .filter((column) =>
                        activeStage === 'all'
                          ? column.key !== 'testResult' && column.key !== 'reviewOwner'
                          : true,
                      )
                      .map((column) => ({
                        ...column,
                        disabled: column.key === 'candidate',
                      }))}
                    visibleColumnKeys={
                      activeStage === 'all'
                        ? visibleColumns[activeStage].filter(
                            (key) => key !== 'testResult' && key !== 'reviewOwner',
                          )
                        : visibleColumns[activeStage]
                    }
                    onVisibleColumnKeysChange={(keys) =>
                      setVisibleColumns((current) => ({
                        ...current,
                        [activeStage]: keys as VisibleKey[],
                      }))
                    }
                    selectedRowKeys={selectedRowKeys}
                    onSelectedRowKeysChange={(keys) => setSelectedRowKeys(keys as number[])}
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    nationality={nationality}
                    onNationalityChange={setNationality}
                    nationalityOptions={nationalityOptions.map((option) => ({
                      label: option === 'all' ? '全部国籍' : option,
                      value: option,
                    }))}
                    education={education}
                    onEducationChange={setEducation}
                    educationOptions={educationOptions.map((option) => ({
                      label: option === 'all' ? '全部学历' : option,
                      value: option,
                    }))}
                    enableRowSelection={!isAllStage}
                    leftActions={
                      isAllStage ? null : (
                        <ProgressStageActions
                          activeStage={activeStage}
                          selectedCount={selectedRowKeys.length}
                          onAddCandidates={() => setScreeningAddVisible(true)}
                          onBatchMail={() => openMailModal(selectedRowKeys)}
                          onOpenRateHighlight={() => setIsRateHighlightModalVisible(true)}
                          onOpenFlow={() => openFlowModal(selectedRowKeys)}
                          onOpenOwner={openOwnerModal}
                          onExecuteAutomation={executeAssessmentAutomation}
                          onOpenBatchEdit={openBatchEditModal}
                          onQuickMove={quickMoveSelectedToStage}
                        />
                      )
                    }
                    rightActions={
                      !isAllStage && activeStage !== 'screening' && activeStage !== 'assessment' ? (
                        <Button
                          icon={<IconSwap />}
                          disabled={selectedRowKeys.length === 0}
                          onClick={() => openFlowModal(selectedRowKeys)}
                        >
                          更多流转
                        </Button>
                      ) : null
                    }
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          </Card>
        </Col>
      </Row>

      <ProgressCandidateDrawer
        visible={detailCandidateId != null}
        candidate={selectedCandidate}
        profile={selectedProfile}
        currentJobTitle={currentJob?.title}
        selectedJobId={selectedJobId}
        selectedJobRecord={selectedJobRecord}
        selectedJobStageHistory={selectedJobStageHistory}
        selectedJobActivityFeed={selectedJobActivityFeed}
        onClose={() => setDetailCandidateId(null)}
        onViewFullProfile={() =>
          selectedCandidate
            ? navigate(
                `/candidates/${selectedCandidate.id}?source=progress&jobId=${selectedJobId}&stage=${selectedCandidate.stage}`,
              )
            : undefined
        }
        onLocateStage={(stage) => {
          setActiveStage(stage)
          setDetailCandidateId(null)
        }}
        onOpenFlow={(id) => openFlowModal([id])}
        onStageChange={handleDrawerStageChange}
        onQaStatusChange={(value) => {
          if (!selectedCandidate) return
          updateRow(selectedCandidate.id, 'qaStatus', value)
          syncProfileJobRecord(selectedCandidate.id, { qaStatus: value })
        }}
        onSigningStatusChange={(value) => {
          if (!selectedCandidate) return
          updateRow(selectedCandidate.id, 'signingStatus', value)
          syncProfileJobRecord(selectedCandidate.id, { signingStatus: value })
        }}
        onOnboardingStatusChange={(value) => {
          if (!selectedCandidate) return
          updateRow(selectedCandidate.id, 'onboardingStatus', value)
          syncProfileJobRecord(selectedCandidate.id, { onboardingStatus: value })
        }}
        onIdAttachmentUpdate={handleIdAttachmentUpdate}
        onAttachmentUpdate={handleAttachmentUpdate}
      />

      <AssessmentPreviewModal
        visible={testPreviewCandidateId != null}
        candidate={previewCandidate}
        profilePhone={previewProfile?.phone}
        previewUrl={previewAttachmentUrl}
        onClose={() => setTestPreviewCandidateId(null)}
        onResultChange={(value) => {
          if (!previewCandidate) return
          updateAssessmentField(previewCandidate.id, 'testResult', value)
        }}
        onCommentChange={(value) => {
          if (!previewCandidate) return
          updateAssessmentField(previewCandidate.id, 'reviewComment', value)
        }}
      />

      <Modal
        title={`流转 ${flowRowIds.length} 位候选人`}
        visible={isFlowModalVisible}
        className="next-modal--70vh"
        onOk={applyStageFlow}
        onCancel={() => setIsFlowModalVisible(false)}
      >
        <div className="next-modal-stack">
          <div>
            <div className="next-modal-label">目标阶段</div>
            <Select
              value={flowTargetStage}
              style={{ width: '100%' }}
              onChange={(value) => setFlowTargetStage(value as Exclude<ProgressStage, 'all'>)}
            >
              {flowTargetOptions.map((stage) => (
                <Select.Option key={stage} value={stage}>
                  {getStageLabel(stage)}
                </Select.Option>
              ))}
            </Select>
            <div className="next-modal-hint">
              当前仅展示符合阶段规则的可流转目标，避免跨阶段误操作。
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={`为 ${selectedRowKeys.length} 位候选人分配判题人`}
        visible={isOwnerModalVisible}
        className="next-modal--70vh"
        onOk={applyBatchOwner}
        onCancel={() => setIsOwnerModalVisible(false)}
      >
        <div className="next-modal-stack">
          <div className="next-modal-label">判题人</div>
          <Select value={batchOwner} style={{ width: '100%' }} onChange={(value) => setBatchOwner(String(value))}>
            {['Kelly', 'Tony', 'Anna', 'Mia'].map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>

      <Modal
        title={`批量更新 ${selectedRowKeys.length} 位候选人`}
        visible={isBatchEditModalVisible}
        className="next-modal--70vh"
        onOk={applyBatchEdit}
        onCancel={() => setIsBatchEditModalVisible(false)}
      >
        <div className="next-modal-stack">
          <div>
            <div className="next-modal-label">
              {batchEditMode === 'signingStatus'
                ? '签约进展'
                : batchEditMode === 'onboardingStatus'
                  ? '入职进展'
                  : '合同审核'}
            </div>
            <Select
              value={batchEditValue}
              style={{ width: '100%' }}
              onChange={(value) => setBatchEditValue(String(value))}
            >
              {batchEditOptions[batchEditMode].map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        title="高亮时薪区间"
        visible={isRateHighlightModalVisible}
        className="next-modal--70vh"
        onOk={() => setIsRateHighlightModalVisible(false)}
        onCancel={() => setIsRateHighlightModalVisible(false)}
      >
        <div className="next-modal-stack">
          <div>
            <div className="next-modal-label">最小值（USD）</div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              value={rateHighlightMin}
              placeholder="例如 4"
              onChange={(value) => setRateHighlightMin(typeof value === 'number' ? value : undefined)}
            />
          </div>
          <div>
            <div className="next-modal-label">最大值（USD）</div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              value={rateHighlightMax}
              placeholder="留空表示不设上限"
              onChange={(value) => setRateHighlightMax(typeof value === 'number' ? value : undefined)}
            />
          </div>
          <div className="next-modal-hint">
            仅在“筛选通过”阶段生效。满足区间的人选会在“接受时薪”列里高亮显示。
          </div>
        </div>
      </Modal>

      <AddCandidatesToStageModal
        visible={screeningAddVisible}
        onVisibleChange={setScreeningAddVisible}
        jobTitle={currentJob?.title || '-'}
        candidates={availableCandidatesForScreening}
        onConfirm={addCandidatesToScreeningStage}
      />

      <SendMailModal
        visible={screeningMailVisible}
        onVisibleChange={(visible) => {
          setScreeningMailVisible(visible)
          if (!visible) setMailRecipientIds([])
        }}
        recipientName=""
        recipientEmail=""
        recipients={mailRecipients}
      />
    </div>
  )
}
