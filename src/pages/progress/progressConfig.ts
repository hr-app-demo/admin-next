import type { ProgressRow, ProgressStage } from '../../data/mock'

export const stageOptions: Array<{ key: ProgressStage; label: string }> = [
  { key: 'all', label: '所有申请人' },
  { key: 'screening', label: '待筛选名单' },
  { key: 'assessment', label: '测试题回收' },
  { key: 'passed', label: '筛选通过' },
  { key: 'contract', label: '合同库' },
  { key: 'employed', label: '在职' },
  { key: 'replaced', label: '汰换名单' },
  { key: 'eliminated', label: '淘汰' },
]

export const actionableStages = stageOptions.filter(
  (stage): stage is { key: Exclude<ProgressStage, 'all'>; label: string } => stage.key !== 'all',
)

export const stageColorMap: Record<Exclude<ProgressStage, 'all'>, string> = {
  screening: 'arcoblue',
  assessment: 'orange',
  passed: 'purple',
  contract: 'cyan',
  employed: 'green',
  replaced: 'orangered',
  eliminated: 'red',
}

export const defaultColumns = {
  all: ['candidate', 'email', 'stage', 'rate', 'appliedAt'],
  screening: [
    'candidate',
    'email',
    'whatsapp',
    'location',
    'nationality',
    'education',
    'daExperienceYears',
    'minSalary',
    'employmentStatus',
    'resume',
    'appliedAt',
  ],
  assessment: [
    'candidate',
    'email',
    'whatsapp',
    'location',
    'nationality',
    'education',
    'daExperienceYears',
    'minSalary',
    'employmentStatus',
    'resume',
    'testAttachment',
    'testResult',
    'reviewOwner',
    'reviewComment',
    'appliedAt',
  ],
  passed: ['candidate', 'testAttachment', 'testResult', 'qaStatus', 'qaFeedback', 'signingStatus', 'contractDraft', 'rate', 'appliedAt'],
  contract: ['candidate', 'email', 'location', 'contractNumber', 'contractDraft', 'contractSigned', 'idAttachment', 'contractReview', 'rate'],
  employed: ['candidate', 'email', 'location', 'onboardingStatus', 'contractSigned', 'idAttachment', 'rate', 'appliedAt'],
  replaced: ['candidate', 'email', 'location', 'onboardingStatus', 'contractSigned', 'idAttachment', 'rate', 'replacementReason', 'appliedAt'],
  eliminated: ['candidate', 'testAttachment', 'testResult', 'qaStatus', 'qaFeedback', 'signingStatus', 'rate', 'appliedAt'],
} as const

export type VisibleKey =
  | (typeof defaultColumns)[ProgressStage][number]
  | 'candidate'
  | 'email'
  | 'whatsapp'
  | 'stage'
  | 'location'
  | 'nationality'
  | 'education'
  | 'nativeLanguage'
  | 'otherLanguages'
  | 'maxWorkHours'
  | 'resume'
  | 'minSalary'
  | 'needVisa'
  | 'acceptHourlyRate'
  | 'daExperienceYears'
  | 'employmentStatus'
  | 'contractNumber'
  | 'testAttachment'
  | 'idAttachment'
  | 'testResult'
  | 'reviewOwner'
  | 'reviewComment'
  | 'qaStatus'
  | 'qaFeedback'
  | 'signingStatus'
  | 'contractDraft'
  | 'contractSigned'
  | 'contractReview'
  | 'onboardingStatus'
  | 'replacementReason'
  | 'rate'
  | 'appliedAt'

export type BatchEditMode = 'signingStatus' | 'onboardingStatus' | 'contractReview'

export const batchEditOptions: Record<BatchEditMode, string[]> = {
  signingStatus: ['已发砍价', '可发合同', '已通知补全信息', '暂缓发合同', '砍价中', '砍价失败', '人选退出', '消失'],
  onboardingStatus: ['成功签约', '已告知晋升与淘汰规则', '已发大礼包', '飞书已取得联系', '消失', '休假', '淘汰预备役', '汰换', '主动离职'],
  contractReview: ['待修改', '已重新提交'],
}

export const stageTransitionMap: Record<Exclude<ProgressStage, 'all'>, Exclude<ProgressStage, 'all'>[]> = {
  screening: ['assessment', 'eliminated'],
  assessment: ['passed', 'screening', 'eliminated'],
  passed: ['contract', 'assessment', 'eliminated'],
  contract: ['employed', 'passed', 'eliminated'],
  employed: ['replaced', 'eliminated'],
  replaced: ['screening'],
  eliminated: ['screening', 'assessment'],
}

export function getStageLabel(stage: ProgressStage | ProgressRow['stage']) {
  return stageOptions.find((item) => item.key === stage)?.label || stage
}

export function buildStageInsights(stage: ProgressStage, rows: ProgressRow[]) {
  if (stage === 'assessment') {
    return [
      { label: '待判题', value: rows.filter((row) => row.testResult === '待定').length },
      { label: '待重新提交', value: rows.filter((row) => row.testResult === '需重新提交').length },
      { label: '未分配负责人', value: rows.filter((row) => !row.reviewOwner).length },
    ]
  }

  if (stage === 'passed') {
    return [
      { label: '待返修', value: rows.filter((row) => row.qaStatus === '待返修').length },
      { label: '待补全信息', value: rows.filter((row) => row.signingStatus === '已通知补全信息').length },
      { label: '待签合同', value: rows.filter((row) => !row.contractDraft).length },
    ]
  }

  if (stage === 'contract') {
    return [
      { label: '待修改', value: rows.filter((row) => row.contractReview === '待修改').length },
      { label: '缺少 ID 附件', value: rows.filter((row) => !row.idAttachment).length },
      { label: '未签回合同', value: rows.filter((row) => !row.contractSigned).length },
    ]
  }

  if (stage === 'employed') {
    return [
      { label: '待同步飞书', value: rows.filter((row) => row.onboardingStatus !== '飞书已取得联系').length },
      { label: '待发大礼包', value: rows.filter((row) => row.onboardingStatus !== '已发大礼包').length },
      { label: '在职总数', value: rows.length },
    ]
  }

  if (stage === 'replaced') {
    return [
      { label: '待恢复待筛选', value: rows.length },
      { label: '缺少汰换理由', value: rows.filter((row) => !row.replacementReason).length },
      { label: '已签回合同', value: rows.filter((row) => Boolean(row.contractSigned)).length },
    ]
  }

  if (stage === 'eliminated') {
    return [
      { label: '可复检', value: rows.filter((row) => row.qaStatus === '待返修').length },
      { label: '保留附件', value: rows.filter((row) => Boolean(row.testAttachment)).length },
      { label: '淘汰人数', value: rows.length },
    ]
  }

  if (stage === 'screening') {
    return [
      { label: '待筛选', value: rows.length },
      { label: '缺少测试题', value: rows.filter((row) => !row.testAttachment).length },
      { label: '待推进', value: rows.filter((row) => row.signingStatus === '暂缓发合同').length },
    ]
  }

  return [
    { label: '总申请人', value: rows.length },
    { label: '待签回合同', value: rows.filter((row) => !row.contractSigned).length },
    { label: '在职', value: rows.filter((row) => row.stage === 'employed').length },
  ]
}

export const allColumnDefs: Array<{ key: VisibleKey; title: string }> = [
  { key: 'candidate', title: '候选人' },
  { key: 'email', title: '邮箱' },
  { key: 'whatsapp', title: 'WhatsApp' },
  { key: 'stage', title: '当前阶段' },
  { key: 'location', title: '所在地' },
  { key: 'nationality', title: '国籍' },
  { key: 'education', title: '学历' },
  { key: 'nativeLanguage', title: '语言（母语）' },
  { key: 'otherLanguages', title: '其他语言' },
  { key: 'maxWorkHours', title: '每天最长工作时间' },
  { key: 'resume', title: '简历附件' },
  { key: 'minSalary', title: '最低期望薪资' },
  { key: 'needVisa', title: '是否需要签证' },
  { key: 'acceptHourlyRate', title: '是否接受按小时付费' },
  { key: 'daExperienceYears', title: 'DA 经验年限' },
  { key: 'employmentStatus', title: '当前在职状态' },
  { key: 'contractNumber', title: '合同编号' },
  { key: 'testAttachment', title: '测试题附件' },
  { key: 'idAttachment', title: 'ID 附件' },
  { key: 'testResult', title: '测试结果' },
  { key: 'reviewOwner', title: '判题人' },
  { key: 'reviewComment', title: '测试评价' },
  { key: 'qaStatus', title: '质检' },
  { key: 'qaFeedback', title: '质检反馈' },
  { key: 'signingStatus', title: '签约进展' },
  { key: 'contractDraft', title: '待签合同' },
  { key: 'contractSigned', title: '签回合同' },
  { key: 'contractReview', title: '合同审核' },
  { key: 'onboardingStatus', title: '入职进展' },
  { key: 'replacementReason', title: '汰换理由' },
  { key: 'rate', title: '接受时薪' },
  { key: 'appliedAt', title: '申请时间' },
]

export function getStageDescription(stage: ProgressStage): string {
  if (stage === 'screening') {
    return '基于默认报名表单展示关键字段，支持添加候选人、批量发邮件和列配置。'
  }
  if (stage === 'assessment') {
    return '沿用待筛选名单核心字段，并补充测试题附件、测试结果、测试评价与判题负责人。'
  }
  return '支持列内编辑、附件预览、排序、完整分页和批量流转。'
}
