import type { AutomationRuleGroup, JobFormField } from './formConfig'

export const dashboardMetrics = {
  day: [
    { label: '测试题总量', value: 28, note: '今天回收并待处理的测试题' },
    { label: '申请', value: 46, note: '今天新增的岗位申请数' },
    { label: '成功签约', value: 5, note: '今天完成签约的人数' },
    { label: '在职', value: 19, note: '今天处于在职状态的人数' },
  ],
  week: [
    { label: '测试题总量', value: 162, note: '本周累计回收的测试题' },
    { label: '申请', value: 284, note: '本周累计进入系统的申请' },
    { label: '成功签约', value: 26, note: '本周完成签约的人数' },
    { label: '在职', value: 113, note: '本周稳定在职的人数' },
  ],
  month: [
    { label: '测试题总量', value: 642, note: '本月累计回收的测试题' },
    { label: '申请', value: 1138, note: '本月累计新增申请数' },
    { label: '成功签约', value: 94, note: '本月成功签约人数' },
    { label: '在职', value: 386, note: '本月在职候选人总量' },
  ],
} as const

export const latestActivities = [
  { id: 1, title: '张三提交了 UK DA 的测试题', stage: '测试题回收', time: '10 分钟前' },
  { id: 2, title: 'Maria Garcia 已上传签回合同', stage: '合同库', time: '38 分钟前' },
  { id: 3, title: '李四被移入筛选通过并待补全信息', stage: '筛选通过', time: '1 小时前' },
]

export interface JobListItem {
  id: string
  title: string
  company: string
  country: string
  status: string
  applicants: number
  createdAt: string
  workMode: string
  owner: string
  collaborators?: string[]
}

export const jobs: JobListItem[] = [
  {
    id: 'job-1',
    title: 'UK Data Analyst',
    company: 'TechCorp',
    country: 'UK',
    status: '在招',
    applicants: 19,
    createdAt: '2026-03-18',
    workMode: 'Remote',
    owner: 'Mia',
    collaborators: ['Kelly'],
  },
  {
    id: 'job-2',
    title: 'ID Data Analyst',
    company: 'DataCo',
    country: 'ID',
    status: '在招',
    applicants: 14,
    createdAt: '2026-03-15',
    workMode: 'Remote',
    owner: 'Tony',
    collaborators: ['Anna'],
  },
  {
    id: 'job-3',
    title: 'BR QA Reviewer',
    company: 'Northstar Labs',
    country: 'BR',
    status: '关闭',
    applicants: 7,
    createdAt: '2026-02-28',
    workMode: 'Onsite',
    owner: 'Anna',
    collaborators: [],
  },
]

export interface JobProfile {
  id: string
  title: string
  company: string
  country: string
  status: string
  workMode: string
  assessmentType?: string
  createdAt: string
  owner: string
  collaborators?: string[]
  compensation: string
  description: string
  highlights: string[]
  applicationSummary?: {
    applicants: number
    applyStarters: number
    totalViews: number
    audienceTitle: string
    audienceDescription: string
  }
  formStrategy: {
    template: string
    coverage: string
    resumeRequired: boolean
    idRequired: boolean
  }
  formFields?: JobFormField[]
  automationRules?: AutomationRuleGroup
  screeningRules: string[]
  publishChecklist: string[]
}

export const jobProfiles: Record<string, JobProfile> = {
  'job-1': {
    id: 'job-1',
    title: 'UK Data Analyst',
    company: 'TechCorp',
    country: 'UK',
    status: '在招',
    workMode: 'Remote',
    assessmentType: 'Written Test',
    createdAt: '2026-03-18',
    owner: 'Mia',
    collaborators: ['Kelly'],
    compensation: '$4.0 - $5.5 / h',
    description:
      '负责数据清洗、日报周报制作、业务指标核对与异常反馈，需要稳定的 SQL、Excel 和英文沟通能力。',
    highlights: ['优先处理跨时区数据协作', '支持长期项目续约', '可直接进入招聘进展操作台'],
    applicationSummary: {
      applicants: 809,
      applyStarters: 505,
      totalViews: 10265,
      audienceTitle: '数据分析方向候选人',
      audienceDescription: '居住在英国或对远程数据分析岗位感兴趣的候选人。',
    },
    formStrategy: {
      template: 'da-default',
      coverage: '岗位覆盖默认模板，并额外收集时区与每周可投入时长',
      resumeRequired: true,
      idRequired: true,
    },
    screeningRules: ['英语书面沟通可独立完成', 'SQL 基础能力达标', '可连续稳定投入 20h+/周'],
    publishChecklist: ['已同步 C 端描述', '已配置测试题模板', '已勾选自动筛选条件'],
  },
  'job-2': {
    id: 'job-2',
    title: 'ID Data Analyst',
    company: 'DataCo',
    country: 'ID',
    status: '在招',
    workMode: 'Remote',
    assessmentType: 'Quiz',
    createdAt: '2026-03-15',
    owner: 'Tony',
    collaborators: ['Anna'],
    compensation: '$3.8 - $4.8 / h',
    description: '偏印尼语和英语双语支持的数据标注与分析岗位，重视稳定交付与复盘能力。',
    highlights: ['本地化沟通要求较高', '对响应时效要求高', '支持快速签约'],
    applicationSummary: {
      applicants: 642,
      applyStarters: 388,
      totalViews: 8436,
      audienceTitle: '东南亚双语数据分析候选人',
      audienceDescription: '居住在印尼或对东南亚远程岗位有意向、具备双语沟通能力的候选人。',
    },
    formStrategy: {
      template: 'sea-default',
      coverage: '继承默认模板，增加语言能力与本地节假日说明',
      resumeRequired: true,
      idRequired: true,
    },
    screeningRules: ['印尼语与英语可切换', '有远程项目经验', '可接受标准合同流程'],
    publishChecklist: ['已设置自动邮件', '已配置表单字段覆盖', '已准备合同模板'],
  },
  'job-3': {
    id: 'job-3',
    title: 'BR QA Reviewer',
    company: 'Northstar Labs',
    country: 'BR',
    status: '关闭',
    workMode: 'Onsite',
    assessmentType: 'Case Study',
    createdAt: '2026-02-28',
    owner: 'Anna',
    collaborators: [],
    compensation: '$4.5 - $6.0 / h',
    description: '负责历史项目的 QA 复核与反馈整理，当前岗位已关闭，仅保留查看与复用配置。',
    highlights: ['岗位已关闭', '可复制为新岗位', '保留原筛选规则与模板'],
    applicationSummary: {
      applicants: 809,
      applyStarters: 505,
      totalViews: 10265,
      audienceTitle: '语言专家',
      audienceDescription: '居住在巴西或有意向远程参与巴西项目的候选人。',
    },
    formStrategy: {
      template: 'qa-reviewer',
      coverage: '沿用历史模板，无额外字段扩展',
      resumeRequired: true,
      idRequired: false,
    },
    screeningRules: ['英语书写清晰', '有 QA 或质检经验', '能提供历史案例说明'],
    publishChecklist: ['已归档岗位描述', '历史模板可复用', '招聘进展已冻结'],
  },
}

export const progressJobs = [
  {
    id: 'job-1',
    title: 'UK Data Analyst',
    company: 'TechCorp',
    country: 'UK',
    workMode: 'Remote',
    status: '在招',
    applicants: 19,
    screening: 6,
    assessment: 5,
    passed: 4,
    contract: 2,
    employed: 2,
    replaced: 1,
    eliminated: 3,
  },
  {
    id: 'job-2',
    title: 'ID Data Analyst',
    company: 'DataCo',
    country: 'ID',
    workMode: 'Remote',
    status: '在招',
    applicants: 14,
    screening: 5,
    assessment: 3,
    passed: 2,
    contract: 1,
    employed: 1,
    replaced: 0,
    eliminated: 2,
  },
]

export type ProgressStage =
  | 'all'
  | 'screening'
  | 'assessment'
  | 'passed'
  | 'contract'
  | 'employed'
  | 'replaced'
  | 'eliminated'

export interface ProgressRow {
  id: number
  jobId: string
  contractNumber: string
  appliedAt: string
  candidate: string
  email: string
  location: string
  nationality: string
  education: string
  stage: Exclude<ProgressStage, 'all'>
  testResult: '通过' | '待定' | '不通过' | '需重新提交'
  reviewOwner: string
  reviewComment: string
  qaStatus: '质检合格' | '待返修' | '未开始'
  qaFeedback: string
  signingStatus:
    | '已发砍价'
    | '可发合同'
    | '已通知补全信息'
    | '暂缓发合同'
    | '砍价中'
    | '砍价失败'
    | '人选退出'
    | '消失'
  onboardingStatus:
    | '成功签约'
    | '已告知晋升与淘汰规则'
    | '已发大礼包'
    | '飞书已取得联系'
    | '消失'
    | '休假'
    | '淘汰预备役'
    | '汰换'
    | '主动离职'
  rate: number
  testAttachment: string
  idAttachment: string
  contractDraft: string
  contractSigned: string
  contractReview: '待修改' | '已重新提交'
  replacementReason: string
}

export const progressRows: ProgressRow[] = [
  {
    id: 1,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-001',
    appliedAt: '2026-03-28 09:12',
    candidate: '张三',
    email: 'zhang@example.com',
    location: '北京',
    nationality: '中国',
    education: '本科',
    stage: 'assessment',
    testResult: '待定',
    reviewOwner: 'Kelly',
    reviewComment: '逻辑清晰，但第 3 题还需要复核。',
    qaStatus: '未开始',
    qaFeedback: '',
    signingStatus: '可发合同',
    onboardingStatus: '成功签约',
    rate: 4.5,
    testAttachment: 'uk-da-test-zhang.pdf',
    idAttachment: 'zhangsan-id.pdf',
    contractDraft: '',
    contractSigned: '',
    contractReview: '待修改',
    replacementReason: '',
  },
  {
    id: 2,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-002',
    appliedAt: '2026-03-27 14:30',
    candidate: '李四',
    email: 'li@example.com',
    location: '上海',
    nationality: '中国',
    education: '硕士',
    stage: 'passed',
    testResult: '通过',
    reviewOwner: 'Tony',
    reviewComment: '综合表现稳定，可以推进签约。',
    qaStatus: '质检合格',
    qaFeedback: '',
    signingStatus: '已通知补全信息',
    onboardingStatus: '成功签约',
    rate: 5.2,
    testAttachment: 'id-da-test-li.pdf',
    idAttachment: 'lisi-id.pdf',
    contractDraft: 'li-contract-draft.pdf',
    contractSigned: '',
    contractReview: '待修改',
    replacementReason: '',
  },
  {
    id: 3,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-003',
    appliedAt: '2026-03-26 18:05',
    candidate: 'Maria Garcia',
    email: 'maria@example.com',
    location: 'Madrid',
    nationality: '西班牙',
    education: '硕士',
    stage: 'contract',
    testResult: '通过',
    reviewOwner: 'Anna',
    reviewComment: '英文沟通和表述很强。',
    qaStatus: '质检合格',
    qaFeedback: '',
    signingStatus: '可发合同',
    onboardingStatus: '成功签约',
    rate: 4.1,
    testAttachment: 'qa-review-maria.pdf',
    idAttachment: 'maria-id.pdf',
    contractDraft: 'maria-contract-draft.pdf',
    contractSigned: 'maria-contract-signed.pdf',
    contractReview: '已重新提交',
    replacementReason: '',
  },
  {
    id: 4,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-004',
    appliedAt: '2026-03-29 08:45',
    candidate: 'John Smith',
    email: 'john@example.com',
    location: 'London',
    nationality: '英国',
    education: '本科',
    stage: 'screening',
    testResult: '需重新提交',
    reviewOwner: 'Kelly',
    reviewComment: '文件打不开，需要重新上传。',
    qaStatus: '未开始',
    qaFeedback: '',
    signingStatus: '暂缓发合同',
    onboardingStatus: '消失',
    rate: 3.8,
    testAttachment: 'john-test-broken.zip',
    idAttachment: '',
    contractDraft: '',
    contractSigned: '',
    contractReview: '待修改',
    replacementReason: '',
  },
  {
    id: 5,
    jobId: 'job-2',
    contractNumber: 'CTR-2026-005',
    appliedAt: '2026-03-24 11:18',
    candidate: '王五',
    email: 'wang@example.com',
    location: '深圳',
    nationality: '中国',
    education: '本科',
    stage: 'eliminated',
    testResult: '不通过',
    reviewOwner: 'Tony',
    reviewComment: '测试题完成度不足。',
    qaStatus: '待返修',
    qaFeedback: '评价结论需更具体，补充题目维度反馈。',
    signingStatus: '人选退出',
    onboardingStatus: '汰换',
    rate: 4.9,
    testAttachment: 'wang-test.pdf',
    idAttachment: '',
    contractDraft: '',
    contractSigned: '',
    contractReview: '待修改',
    replacementReason: '',
  },
  {
    id: 6,
    jobId: 'job-2',
    contractNumber: 'CTR-2026-006',
    appliedAt: '2026-03-22 16:42',
    candidate: 'Aisyah Putri',
    email: 'aisyah@example.com',
    location: 'Jakarta',
    nationality: '印尼',
    education: '硕士',
    stage: 'employed',
    testResult: '通过',
    reviewOwner: 'Anna',
    reviewComment: '签约并已进入项目。',
    qaStatus: '质检合格',
    qaFeedback: '',
    signingStatus: '可发合同',
    onboardingStatus: '已发大礼包',
    rate: 4.3,
    testAttachment: 'aisyah-test.pdf',
    idAttachment: 'aisyah-id.pdf',
    contractDraft: 'aisyah-contract-draft.pdf',
    contractSigned: 'aisyah-contract-signed.pdf',
    contractReview: '已重新提交',
    replacementReason: '',
  },
  {
    id: 7,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-007',
    appliedAt: '2026-03-21 10:08',
    candidate: 'Chen Wei',
    email: 'chenwei@example.com',
    location: '广州',
    nationality: '中国',
    education: '本科',
    stage: 'employed',
    testResult: '通过',
    reviewOwner: 'Mia',
    reviewComment: '已稳定进入项目，在职表现正常。',
    qaStatus: '质检合格',
    qaFeedback: '',
    signingStatus: '可发合同',
    onboardingStatus: '飞书已取得联系',
    rate: 4.0,
    testAttachment: 'chenwei-test.pdf',
    idAttachment: 'chenwei-id.pdf',
    contractDraft: 'chenwei-contract-draft.pdf',
    contractSigned: 'chenwei-contract-signed.pdf',
    contractReview: '已重新提交',
    replacementReason: '',
  },
  {
    id: 9,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-009',
    appliedAt: '2026-03-19 13:22',
    candidate: 'Lucas Pereira',
    email: 'lucas@example.com',
    location: 'Sao Paulo',
    nationality: '巴西',
    education: '本科',
    stage: 'replaced',
    testResult: '通过',
    reviewOwner: 'Mia',
    reviewComment: '入项后沟通成本较高，建议暂退回候选池。',
    qaStatus: '质检合格',
    qaFeedback: '',
    signingStatus: '可发合同',
    onboardingStatus: '汰换',
    rate: 4.2,
    testAttachment: 'lucas-test.pdf',
    idAttachment: 'lucas-id.pdf',
    contractDraft: 'lucas-contract-draft.pdf',
    contractSigned: 'lucas-contract-signed.pdf',
    contractReview: '已重新提交',
    replacementReason: '项目响应时效不稳定，建议恢复到待筛选后重新评估匹配岗位。',
  },
  {
    id: 8,
    jobId: 'job-1',
    contractNumber: 'CTR-2026-008',
    appliedAt: '2026-03-20 15:36',
    candidate: 'Sofia Rossi',
    email: 'sofia@example.com',
    location: 'Milan',
    nationality: '意大利',
    education: '硕士',
    stage: 'eliminated',
    testResult: '不通过',
    reviewOwner: 'Kelly',
    reviewComment: '业务理解不错，但测试题结论不完整。',
    qaStatus: '待返修',
    qaFeedback: '建议补充质检反馈并回退测试题回收重新评估。',
    signingStatus: '人选退出',
    onboardingStatus: '消失',
    rate: 4.7,
    testAttachment: 'sofia-test.pdf',
    idAttachment: '',
    contractDraft: '',
    contractSigned: '',
    contractReview: '待修改',
    replacementReason: '',
  },
]

export const candidates = [
  { id: 1, name: '张三', email: 'zhang@example.com', location: '北京', education: '本科', status: '在职' },
  { id: 2, name: '李四', email: 'li@example.com', location: '上海', education: '硕士', status: '离职' },
  { id: 3, name: 'Maria Garcia', email: 'maria@example.com', location: 'Madrid', education: '硕士', status: '离职' },
  { id: 7, name: 'Chen Wei', email: 'chenwei@example.com', location: '广州', education: '本科', status: '在职' },
  { id: 9, name: 'Lucas Pereira', email: 'lucas@example.com', location: 'Sao Paulo', education: '本科', status: '汰换' },
  { id: 8, name: 'Sofia Rossi', email: 'sofia@example.com', location: 'Milan', education: '硕士', status: '离职' },
]

export interface CandidateMergeSource {
  current: Record<string, string | string[]>
  incoming: Record<string, string | string[]>
}

export const candidateMergeSources: Record<number, CandidateMergeSource> = {
  1: {
    current: {
      name: '张三',
      email: 'zhang@example.com',
      whatsapp: '+86 138 0000 0001',
      location: '北京',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语'],
      maxWorkHours: '6',
      resume: 'zhangsan-resume-v1.pdf',
      minSalary: '4.5',
      highestEducation: '本科',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '4',
      employmentStatus: '全职',
    },
    incoming: {
      name: '张三',
      email: 'zhang.data@example.com',
      whatsapp: '+86 138 0000 8888',
      location: '上海',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语', '日语'],
      maxWorkHours: '8',
      resume: 'zhangsan-resume-v2.pdf',
      minSalary: '5.0',
      highestEducation: '硕士',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '5',
      employmentStatus: '自由职业',
    },
  },
  2: {
    current: {
      name: '李四',
      email: 'li@example.com',
      whatsapp: '',
      location: '上海',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语'],
      maxWorkHours: '4',
      resume: 'lisi-resume-v1.pdf',
      minSalary: '5.0',
      highestEducation: '硕士',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '6',
      employmentStatus: '全职',
    },
    incoming: {
      name: '李四',
      email: 'li@example.com',
      whatsapp: '+86 139 0000 0002',
      location: '杭州',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语', '法语'],
      maxWorkHours: '6',
      resume: 'lisi-resume-v2.pdf',
      minSalary: '5.5',
      highestEducation: '硕士',
      needVisa: '否',
      acceptHourlyRate: '否',
      daExperienceYears: '7',
      employmentStatus: '待业',
    },
  },
  7: {
    current: {
      name: 'Chen Wei',
      email: 'chenwei@example.com',
      whatsapp: '+86 136 0000 0007',
      location: '广州',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语'],
      maxWorkHours: '8',
      resume: 'chenwei-resume.pdf',
      minSalary: '4.0',
      highestEducation: '本科',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '4',
      employmentStatus: '全职',
    },
    incoming: {
      name: 'Chen Wei',
      email: 'chenwei@example.com',
      whatsapp: '+86 136 0000 0007',
      location: '广州',
      nationality: '中国',
      nativeLanguage: '中文',
      otherLanguages: ['英语'],
      maxWorkHours: '8',
      resume: 'chenwei-resume.pdf',
      minSalary: '4.0',
      highestEducation: '本科',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '4',
      employmentStatus: '全职',
    },
  },
  9: {
    current: {
      name: 'Lucas Pereira',
      email: 'lucas@example.com',
      whatsapp: '+55 11 90000 0009',
      location: 'Sao Paulo',
      nationality: '巴西',
      nativeLanguage: '葡萄牙语',
      otherLanguages: ['英语'],
      maxWorkHours: '8',
      resume: 'lucas-resume.pdf',
      minSalary: '4.2',
      highestEducation: '本科',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '5',
      employmentStatus: '全职',
    },
    incoming: {
      name: 'Lucas Pereira',
      email: 'lucas@example.com',
      whatsapp: '+55 11 90000 0009',
      location: 'Sao Paulo',
      nationality: '巴西',
      nativeLanguage: '葡萄牙语',
      otherLanguages: ['英语', '西班牙语'],
      maxWorkHours: '8',
      resume: 'lucas-resume-v2.pdf',
      minSalary: '4.4',
      highestEducation: '本科',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '6',
      employmentStatus: '全职',
    },
  },
  8: {
    current: {
      name: 'Sofia Rossi',
      email: 'sofia@example.com',
      whatsapp: '+39 320 000 0008',
      location: 'Milan',
      nationality: '意大利',
      nativeLanguage: '意大利语',
      otherLanguages: ['英语'],
      maxWorkHours: '6',
      resume: 'sofia-resume.pdf',
      minSalary: '4.7',
      highestEducation: '硕士',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '5',
      employmentStatus: '待业',
    },
    incoming: {
      name: 'Sofia Rossi',
      email: 'sofia@example.com',
      whatsapp: '+39 320 000 0008',
      location: 'Milan',
      nationality: '意大利',
      nativeLanguage: '意大利语',
      otherLanguages: ['英语', '西班牙语'],
      maxWorkHours: '7',
      resume: 'sofia-resume-v2.pdf',
      minSalary: '4.9',
      highestEducation: '硕士',
      needVisa: '否',
      acceptHourlyRate: '是',
      daExperienceYears: '6',
      employmentStatus: '自由职业',
    },
  },
}

export interface ProgressCandidateProfile {
  id: number
  phone: string
  timezone: string
  yearsOfExperience: string
  resumeAttachment: string
  idAttachment: string
  preferredRate: string
  summary: string
  jobHistory: Array<{
    jobId: string
    jobTitle: string
    stage: Exclude<ProgressStage, 'all'>
    rate: number
    qaStatus: ProgressRow['qaStatus']
    signingStatus: ProgressRow['signingStatus']
    onboardingStatus: ProgressRow['onboardingStatus']
  }>
  stageHistory: Array<{
    jobId: string
    time: string
    stage: Exclude<ProgressStage, 'all'>
    operator: string
    note: string
  }>
  activityFeed: Array<{
    jobId: string
    time: string
    title: string
    description: string
  }>
}

export const candidateProfiles: Record<number, ProgressCandidateProfile> = {
  1: {
    id: 1,
    phone: '+86 138 0000 0001',
    timezone: 'UTC+8',
    yearsOfExperience: '4 年',
    resumeAttachment: 'zhangsan-resume.pdf',
    idAttachment: 'zhangsan-id.pdf',
    preferredRate: '$4.6 / h',
    summary: '偏数据分析与报表自动化，SQL 和数据校验能力稳定，适合高执行度项目。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'assessment',
        rate: 4.5,
        qaStatus: '未开始',
        signingStatus: '可发合同',
        onboardingStatus: '成功签约',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-28 09:12', stage: 'screening', operator: 'Mia', note: '通过基础信息筛选。' },
      { jobId: 'job-1', time: '2026-03-28 18:40', stage: 'assessment', operator: 'Kelly', note: '已发送测试题并收到回传。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '10 分钟前', title: '上传测试题附件', description: '已上传 `uk-da-test-zhang.pdf`。' },
      { jobId: 'job-1', time: '1 小时前', title: '判题备注更新', description: '第 3 题建议复核业务指标口径。' },
    ],
  },
  2: {
    id: 2,
    phone: '+86 139 0000 0002',
    timezone: 'UTC+8',
    yearsOfExperience: '6 年',
    resumeAttachment: 'lisi-resume.pdf',
    idAttachment: 'lisi-id.pdf',
    preferredRate: '$5.0 / h',
    summary: '候选人稳定度较高，测试表现良好，已进入签约信息补全阶段。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'passed',
        rate: 5.2,
        qaStatus: '质检合格',
        signingStatus: '已通知补全信息',
        onboardingStatus: '成功签约',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-27 14:30', stage: 'assessment', operator: 'Tony', note: '测试题通过。' },
      { jobId: 'job-1', time: '2026-03-28 10:20', stage: 'passed', operator: 'Anna', note: '进入筛选通过，准备补全签约资料。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '38 分钟前', title: '资料补全提醒已发送', description: '已通知补充身份证与银行信息。' },
    ],
  },
  3: {
    id: 3,
    phone: '+34 600 000 003',
    timezone: 'UTC+1',
    yearsOfExperience: '5 年',
    resumeAttachment: 'maria-resume.pdf',
    idAttachment: 'maria-id.pdf',
    preferredRate: '$4.2 / h',
    summary: '英文沟通顺畅，当前处于合同库阶段，签回文件已齐全。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'contract',
        rate: 4.1,
        qaStatus: '质检合格',
        signingStatus: '可发合同',
        onboardingStatus: '成功签约',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-26 18:05', stage: 'passed', operator: 'Anna', note: '通过筛选，转入合同库。' },
      { jobId: 'job-1', time: '2026-03-29 09:30', stage: 'contract', operator: 'Mia', note: '已收到签回合同。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '38 分钟前', title: '签回合同已上传', description: '合同文件状态变更为已回传。' },
    ],
  },
  4: {
    id: 4,
    phone: '+44 7000 000004',
    timezone: 'UTC+0',
    yearsOfExperience: '3 年',
    resumeAttachment: 'john-smith-resume.pdf',
    idAttachment: '',
    preferredRate: '$3.8 / h',
    summary: '当前卡在资料问题，测试题附件损坏，需要重新提交。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'screening',
        rate: 3.8,
        qaStatus: '未开始',
        signingStatus: '暂缓发合同',
        onboardingStatus: '消失',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-29 08:45', stage: 'screening', operator: 'Kelly', note: '附件损坏，等待候选人重新提交。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '2 小时前', title: '提醒重新上传测试题', description: '已通过邮件通知候选人重新提交。' },
    ],
  },
  5: {
    id: 5,
    phone: '+86 137 0000 0005',
    timezone: 'UTC+8',
    yearsOfExperience: '4 年',
    resumeAttachment: 'wangwu-resume.pdf',
    idAttachment: '',
    preferredRate: '$4.8 / h',
    summary: '测试题表现不达标，已进入淘汰阶段，保留在总人才库待后续复用。',
    jobHistory: [
      {
        jobId: 'job-2',
        jobTitle: 'ID Data Analyst',
        stage: 'eliminated',
        rate: 4.9,
        qaStatus: '待返修',
        signingStatus: '人选退出',
        onboardingStatus: '汰换',
      },
    ],
    stageHistory: [
      { jobId: 'job-2', time: '2026-03-24 11:18', stage: 'assessment', operator: 'Tony', note: '测试题评价不达标。' },
      { jobId: 'job-2', time: '2026-03-25 16:00', stage: 'eliminated', operator: 'Mia', note: '移入淘汰并记录反馈。' },
    ],
    activityFeed: [
      { jobId: 'job-2', time: '昨天', title: '质检反馈补充', description: '已补充题目维度反馈，等待归档。' },
    ],
  },
  6: {
    id: 6,
    phone: '+62 812 0000 0006',
    timezone: 'UTC+7',
    yearsOfExperience: '5 年',
    resumeAttachment: 'aisyah-resume.pdf',
    idAttachment: 'aisyah-id.pdf',
    preferredRate: '$4.3 / h',
    summary: '已签约并进入项目，在职进展维护完整，可以作为在职页示例。',
    jobHistory: [
      {
        jobId: 'job-2',
        jobTitle: 'ID Data Analyst',
        stage: 'employed',
        rate: 4.3,
        qaStatus: '质检合格',
        signingStatus: '可发合同',
        onboardingStatus: '已发大礼包',
      },
    ],
    stageHistory: [
      { jobId: 'job-2', time: '2026-03-22 16:42', stage: 'contract', operator: 'Anna', note: '签约完成。' },
      { jobId: 'job-2', time: '2026-03-23 09:15', stage: 'employed', operator: 'Mia', note: '已进入在职管理。' },
    ],
    activityFeed: [
      { jobId: 'job-2', time: '今天', title: '入职欢迎包已发送', description: '已同步飞书并发送项目须知。' },
    ],
  },
  7: {
    id: 7,
    phone: '+86 136 0000 0007',
    timezone: 'UTC+8',
    yearsOfExperience: '4 年',
    resumeAttachment: 'chenwei-resume.pdf',
    idAttachment: 'chenwei-id.pdf',
    preferredRate: '$4.0 / h',
    summary: '已进入在职阶段，可作为国内在职人选示例。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'employed',
        rate: 4.0,
        qaStatus: '质检合格',
        signingStatus: '可发合同',
        onboardingStatus: '飞书已取得联系',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-20 17:20', stage: 'contract', operator: 'Anna', note: '合同完成，等待入职同步。' },
      { jobId: 'job-1', time: '2026-03-21 10:08', stage: 'employed', operator: 'Mia', note: '已进入在职管理。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '今天', title: '飞书同步完成', description: '已同步项目群并完成在职侧初始化。' },
    ],
  },
  9: {
    id: 9,
    phone: '+55 11 90000 0009',
    timezone: 'UTC-3',
    yearsOfExperience: '5 年',
    resumeAttachment: 'lucas-resume.pdf',
    idAttachment: 'lucas-id.pdf',
    preferredRate: '$4.2 / h',
    summary: '原在职候选人已转入汰换名单，保留合同与在职信息，等待决定是否恢复到待筛选。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'replaced',
        rate: 4.2,
        qaStatus: '质检合格',
        signingStatus: '可发合同',
        onboardingStatus: '汰换',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-18 09:00', stage: 'employed', operator: 'Mia', note: '已完成入项。' },
      { jobId: 'job-1', time: '2026-03-19 13:22', stage: 'replaced', operator: 'Mia', note: '转入汰换名单，待重新评估后续安排。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '今天', title: '已转入汰换名单', description: '已记录汰换原因，可恢复到待筛选继续匹配岗位。' },
    ],
  },
  8: {
    id: 8,
    phone: '+39 320 000 0008',
    timezone: 'UTC+1',
    yearsOfExperience: '5 年',
    resumeAttachment: 'sofia-resume.pdf',
    idAttachment: '',
    preferredRate: '$4.7 / h',
    summary: '当前处于淘汰阶段，保留附件与反馈，便于后续复检。',
    jobHistory: [
      {
        jobId: 'job-1',
        jobTitle: 'UK Data Analyst',
        stage: 'eliminated',
        rate: 4.7,
        qaStatus: '待返修',
        signingStatus: '人选退出',
        onboardingStatus: '消失',
      },
    ],
    stageHistory: [
      { jobId: 'job-1', time: '2026-03-20 15:36', stage: 'assessment', operator: 'Kelly', note: '测试题完成但判题结论不足。' },
      { jobId: 'job-1', time: '2026-03-21 09:20', stage: 'eliminated', operator: 'Mia', note: '转入淘汰并保留返修意见。' },
    ],
    activityFeed: [
      { jobId: 'job-1', time: '昨天', title: '质检反馈已补充', description: '建议移回测试题回收后重新评估。' },
    ],
  },
}
