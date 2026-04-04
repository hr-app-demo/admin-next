import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Grid,
  Input,
  Message,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
} from '@arco-design/web-react'
import { IconArrowLeft, IconLaunch } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RichTextEditor from '../../components/RichTextEditor'
import {
  fieldTypeLabels,
  getDefaultRuleValue,
  operatorMap,
  type AutomationRule,
  type AutomationRuleGroup,
  type FieldGroup,
  type FormTemplateDefinition,
  type FormTemplateField,
} from '../../data/formConfig'
import type { DictionaryDefinition } from '../../data/formConfig'
import { getApiErrorMessage } from '../../apis/http'
import { listDictionaries } from '../../apis/settings/dictionaries'
import { listFormTemplates } from '../../apis/settings/form-templates'
import { getAllJobs, getJobProfileById, upsertJobProfile } from '../../lib/jobsStore'

const { Row, Col } = Grid

interface DraftField extends FormTemplateField {
  selectedForFilter: boolean
}

const compensationUnits = ['Per Hour', 'Per Day', 'Per Line', 'Per Month']
const workModeOptions = ['Remote', 'Onsite']
const assessmentTypeOptions = ['No Assessment', 'Quiz', 'Written Test', 'Case Study', 'Live Interview']

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function parseCompensation(input?: string) {
  if (!input) return { min: '', max: '', unit: 'Per Hour' }
  const matches = input.match(/([\d.]+)\s*-\s*([\d.]+)/)
  const min = matches?.[1] || ''
  const max = matches?.[2] || ''
  const unit = input.includes('Per Day')
    ? 'Per Day'
    : input.includes('Per Line')
      ? 'Per Line'
      : input.includes('Per Month')
        ? 'Per Month'
        : 'Per Hour'
  return { min, max, unit }
}

function buildCompensation(min: string, max: string, unit: string) {
  if (!min && !max) return ''
  return `USD ${min || '0'} - ${max || min || '0'} ${unit}`
}

function cloneTemplateFields(template: FormTemplateDefinition | null): DraftField[] {
  return (template?.fields || []).map((field) => ({
    ...field,
    selectedForFilter: false,
  }))
}

function hydrateFieldsFromProfile(template: FormTemplateDefinition | null, profileFields?: Array<{
  key: string
  label: string
  type: FormTemplateField['type']
  required: boolean
  canFilter: boolean
  dictionaryId?: string
  options?: string[]
}>): DraftField[] {
  const baseFields = cloneTemplateFields(template)
  if (!profileFields?.length) return baseFields

  return baseFields.map((field) => {
    const saved = profileFields.find((item) => item.key === field.key)
    if (!saved) return field
    return {
      ...field,
      required: saved.required,
      selectedForFilter: saved.canFilter,
      dictionaryId: saved.dictionaryId || field.dictionaryId,
    }
  })
}

function defaultRuleForField(field: DraftField): AutomationRule {
  const defaultOperator = operatorMap[field.type][0]?.value || ''
  return {
    fieldKey: field.key,
    fieldLabel: field.label,
    fieldType: field.type,
    operator: defaultOperator,
    value: getDefaultRuleValue(field.type),
    secondValue: '',
  }
}

function getFieldGroupLabel(group: FieldGroup) {
  if (group === 'basic') return '基本信息字段'
  if (group === 'work') return '工作信息字段'
  return '其他信息字段'
}

function resolveDictionaryOptionsFromList(
  dictionaries: DictionaryDefinition[],
  dictionaryId?: string | null,
) {
  if (!dictionaryId) return []
  return dictionaries.find((item) => item.id === dictionaryId)?.options || []
}

export default function CreateJobPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const copyFrom = searchParams.get('copyFrom')
  const editJobId = searchParams.get('editJobId')
  const copyProfile = editJobId ? getJobProfileById(editJobId) : copyFrom ? getJobProfileById(copyFrom) : null
  const isEditMode = Boolean(editJobId && copyProfile)

  const [dictionaries, setDictionaries] = useState<DictionaryDefinition[]>([])
  const [templates, setTemplates] = useState<FormTemplateDefinition[]>([])
  const [configLoading, setConfigLoading] = useState(true)
  const ownerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          getAllJobs()
            .flatMap((item) => [item.owner, ...(item.collaborators || [])])
            .filter(Boolean),
        ),
      ),
    [],
  )

  const parsedCompensation = parseCompensation(copyProfile?.compensation)

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState(copyProfile?.title ? (isEditMode ? copyProfile.title : `${copyProfile.title} Copy`) : '')
  const [country, setCountry] = useState(copyProfile?.country || '')
  const [workMode, setWorkMode] = useState(copyProfile?.workMode || 'Remote')
  const [minCompensation, setMinCompensation] = useState(parsedCompensation.min)
  const [maxCompensation, setMaxCompensation] = useState(parsedCompensation.max)
  const [compensationUnit, setCompensationUnit] = useState(parsedCompensation.unit)
  const [assessmentType, setAssessmentType] = useState(copyProfile?.assessmentType || 'Written Test')
  const [description, setDescription] = useState(copyProfile?.description || '<p><br></p>')
  const [status, setStatus] = useState(copyProfile?.status || '在招')
  const [owner, setOwner] = useState(copyProfile?.owner || ownerOptions[0] || '')
  const [collaborators, setCollaborators] = useState<string[]>(copyProfile?.collaborators || [])
  const [templateId, setTemplateId] = useState(copyProfile?.formStrategy.templateId || '')
  const [resumeRequired, setResumeRequired] = useState(copyProfile?.formStrategy.resumeRequired ?? true)
  const [idRequired, setIdRequired] = useState(copyProfile?.formStrategy.idRequired ?? true)
  const [formFields, setFormFields] = useState<DraftField[]>([])
  const [automationGroup, setAutomationGroup] = useState<AutomationRuleGroup>(() => ({
    combinator: (copyProfile?.automationRules?.combinator as 'and' | 'or') || 'and',
    rules: copyProfile?.automationRules?.rules?.length
      ? copyProfile.automationRules.rules.map((rule) => ({ ...rule }))
      : [],
  }))

  useEffect(() => {
    const loadConfig = async () => {
      setConfigLoading(true)
      try {
        const [nextDictionaries, nextTemplates] = await Promise.all([
          listDictionaries(),
          listFormTemplates(),
        ])
        setDictionaries(nextDictionaries)
        setTemplates(nextTemplates)
        if (!nextTemplates.length) return
        const nextTemplate =
          nextTemplates.find((item) => item.id === templateId) ||
          nextTemplates.find((item) => item.id === copyProfile?.formStrategy.templateId) ||
          nextTemplates[0]
        if (nextTemplate && !nextTemplates.some((item) => item.id === templateId)) {
          setTemplateId(nextTemplate.id)
        }
      } catch (error) {
        Message.error(getApiErrorMessage(error, '加载表单配置失败'))
      } finally {
        setConfigLoading(false)
      }
    }

    void loadConfig()
  }, [])

  const fallbackTemplate = templates[0] || null
  const copyTemplate = templates.find((item) => item.id === copyProfile?.formStrategy.templateId) || fallbackTemplate

  useEffect(() => {
    if (!templates.length) return
    const nextTemplate = templates.find((item) => item.id === templateId) || copyTemplate || fallbackTemplate
    if (!templateId && nextTemplate) {
      setTemplateId(nextTemplate.id)
      setFormFields(hydrateFieldsFromProfile(nextTemplate, copyProfile?.formFields))
      return
    }
    if (templateId && nextTemplate) {
      setFormFields((current) => {
        if (current.length > 0) return current
        return hydrateFieldsFromProfile(nextTemplate, copyProfile?.formFields)
      })
    }
  }, [copyProfile?.formFields, copyTemplate, fallbackTemplate, templateId, templates])

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === templateId) || fallbackTemplate,
    [fallbackTemplate, templateId, templates],
  )

  useEffect(() => {
    if (!selectedTemplate) return
    setFormFields((current) => {
      const hasUserSelection = current.some((field) => field.selectedForFilter)
      if (templateId === copyProfile?.formStrategy.templateId && copyProfile?.formFields?.length) {
        return hydrateFieldsFromProfile(selectedTemplate, copyProfile.formFields)
      }
      if (hasUserSelection && templateId === copyProfile?.formStrategy.templateId) {
        return current
      }
      return hydrateFieldsFromProfile(selectedTemplate, undefined)
    })
  }, [copyProfile?.formFields, copyProfile?.formStrategy.templateId, selectedTemplate, templateId])

  const compensation = useMemo(
    () => buildCompensation(minCompensation, maxCompensation, compensationUnit),
    [compensationUnit, maxCompensation, minCompensation],
  )

  const groupedFields = useMemo(
    () =>
      (['basic', 'work', 'other'] as FieldGroup[]).map((group) => ({
        group,
        title: getFieldGroupLabel(group),
        fields: formFields.filter((field) => field.group === group),
      })),
    [formFields],
  )

  const selectedFilterFields = useMemo(
    () => formFields.filter((field) => field.selectedForFilter),
    [formFields],
  )

  useEffect(() => {
    setAutomationGroup((current) => {
      const selectedKeys = new Set(selectedFilterFields.map((field) => field.key))
      const kept = current.rules.filter((rule) => selectedKeys.has(rule.fieldKey))
      const existingKeys = new Set(kept.map((rule) => rule.fieldKey))
      const missing = selectedFilterFields
        .filter((field) => !existingKeys.has(field.key))
        .map(defaultRuleForField)

      return {
        ...current,
        rules: [...kept, ...missing],
      }
    })
  }, [selectedFilterFields])

  const countryOptions = useMemo(
    () => resolveDictionaryOptionsFromList(dictionaries, 'country').map((option) => option.value),
    [dictionaries],
  )

  const previewChecklist = useMemo(
    () => ['已填写岗位基础信息', '已确认表单模板与字段配置', '已配置自动筛选交互'],
    [],
  )

  const updateField = (key: string, patch: Partial<DraftField>) => {
    setFormFields((current) =>
      current.map((field) => (field.key === key ? { ...field, ...patch } : field)),
    )
  }

  const updateRule = (fieldKey: string, patch: Partial<AutomationRule>) => {
    setAutomationGroup((current) => ({
      ...current,
      rules: current.rules.map((rule) => (rule.fieldKey === fieldKey ? { ...rule, ...patch } : rule)),
    }))
  }

  const handleTemplateChange = (value: string) => {
    const nextTemplate = templates.find((item) => item.id === value) || null
    setTemplateId(value)
    setFormFields(hydrateFieldsFromProfile(nextTemplate, undefined))
    setAutomationGroup((current) => ({ ...current, rules: [] }))
  }

  const handlePublish = () => {
    const nextId = editJobId || `job-${Date.now()}`
    const currentApplicants = editJobId ? getAllJobs().find((item) => item.id === editJobId)?.applicants || 0 : 0
    upsertJobProfile({
      id: nextId,
      title,
      company: copyProfile?.company || 'DA',
      country,
      status: isEditMode ? status : '在招',
      workMode,
      createdAt: copyProfile?.createdAt || getToday(),
      owner: owner || copyProfile?.owner || '系统创建',
      collaborators,
      compensation,
      assessmentType,
      description,
      highlights: [`${country || 'Global'} 岗位`, '已配置报名表单与自动筛选', '发布后可直接进入招聘进展'],
      formStrategy: {
        templateId,
        resumeRequired,
        idRequired,
      },
      formFields: formFields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        canFilter: field.selectedForFilter || false,
        dictionaryId: field.dictionaryId,
        options: field.dictionaryId
          ? resolveDictionaryOptionsFromList(dictionaries, field.dictionaryId).map((option) => option.value)
          : undefined,
      })),
      automationRules: {
        combinator: automationGroup.combinator,
        rules: automationGroup.rules.map((rule) => ({ ...rule })),
      },
      screeningRules: selectedFilterFields.map((field) => field.label),
      publishChecklist: previewChecklist,
    }, currentApplicants)
    Message.success(isEditMode ? '岗位已更新，并跳转到岗位详情页' : '岗位已发布，并跳转到岗位详情页')
    navigate(`/jobs/${nextId}`)
  }

  const renderFieldGroup = (titleText: string, fields: DraftField[]) => {
    if (fields.length === 0) return null
    return (
      <div className="next-job-create__field-group">
        <div className="next-job-create__group-title">{titleText}</div>
        <div className="next-job-create__field-list">
          {fields.map((field) => {
            const dictionary = dictionaries.find((item) => item.id === field.dictionaryId)
            const options = resolveDictionaryOptionsFromList(dictionaries, field.dictionaryId)
            return (
              <div key={field.key} className="next-job-create__field-card">
                <div className="next-job-create__field-card-top">
                  <div>
                    <strong>{field.label}</strong>
                    <div className="next-job-create__field-card-key">{field.key}</div>
                  </div>
                  <Tag>{fieldTypeLabels[field.type]}</Tag>
                </div>

                <div className="next-job-create__field-card-actions">
                  <Checkbox
                    checked={field.required}
                    onChange={(checked) => updateField(field.key, { required: checked })}
                  >
                    必填
                  </Checkbox>
                  {field.canFilter ? (
                    <Checkbox
                      checked={field.selectedForFilter}
                      onChange={(checked) => updateField(field.key, { selectedForFilter: checked })}
                    >
                      用于自动筛选
                    </Checkbox>
                  ) : (
                    <span className="next-job-create__field-card-hint">该字段不参与自动筛选</span>
                  )}
                </div>

                {dictionary ? (
                  <div className="next-job-create__field-card-meta">
                    引用字典：<strong>{dictionary.label}</strong>
                    <span>{options.length} 个选项</span>
                  </div>
                ) : null}

                {options.length ? (
                  <div className="next-job-create__field-card-options">
                    {options.map((option) => (
                      <Tag key={option.value} size="small" color="arcoblue">
                        {option.label}
                      </Tag>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderRuleEditor = (rule: AutomationRule) => {
    const field = formFields.find((item) => item.key === rule.fieldKey)
    if (!field) return null

    const options = resolveDictionaryOptionsFromList(dictionaries, field.dictionaryId)

    return (
      <div key={rule.fieldKey} className="next-job-create__rule-card">
        <div className="next-job-create__rule-card-top">
          <div>
            <strong>{rule.fieldLabel}</strong>
            <div className="next-job-create__field-card-key">{rule.fieldKey}</div>
          </div>
          <Tag>{fieldTypeLabels[rule.fieldType]}</Tag>
        </div>

        <div className="next-job-create__rule-grid">
          <div className="next-job-create__field">
            <label>条件</label>
            <Select
              value={rule.operator}
              onChange={(value) =>
                updateRule(rule.fieldKey, {
                  operator: String(value),
                  value: getDefaultRuleValue(field.type),
                  secondValue: '',
                })
              }
            >
              {operatorMap[rule.fieldType].map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          {(rule.fieldType === 'select' || rule.fieldType === 'multiselect') ? (
            <div className="next-job-create__field">
              <label>取值</label>
              <Select
                mode={rule.fieldType === 'multiselect' ? 'multiple' : undefined}
                value={rule.fieldType === 'multiselect' ? ((rule.value as string[]) || []) : String(rule.value || '')}
                onChange={(value) =>
                  updateRule(rule.fieldKey, {
                    value: rule.fieldType === 'multiselect' ? (value as string[]) : String(value),
                  })
                }
              >
                {options.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          ) : null}

          {(rule.fieldType === 'text' || rule.fieldType === 'email') ? (
            <div className="next-job-create__field">
              <label>关键字</label>
              <Input
                value={String(rule.value || '')}
                onChange={(value) => updateRule(rule.fieldKey, { value })}
                placeholder="输入需要包含或排除的内容"
              />
            </div>
          ) : null}

          {rule.fieldType === 'number' ? (
            <>
              <div className="next-job-create__field">
                <label>{rule.operator === 'between' ? '最小值' : '取值'}</label>
                <Input
                  value={String(rule.value || '')}
                  onChange={(value) => updateRule(rule.fieldKey, { value })}
                  placeholder="请输入数字"
                />
              </div>
              {rule.operator === 'between' ? (
                <div className="next-job-create__field">
                  <label>最大值</label>
                  <Input
                    value={String(rule.secondValue || '')}
                    onChange={(value) => updateRule(rule.fieldKey, { secondValue: value })}
                    placeholder="请输入数字"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {rule.fieldType === 'boolean' ? (
            <div className="next-job-create__field">
              <label>取值</label>
              <Select
                value={String(rule.operator)}
                onChange={(value) => updateRule(rule.fieldKey, { operator: String(value) })}
              >
                <Select.Option value="true">是</Select.Option>
                <Select.Option value="false">否</Select.Option>
              </Select>
            </div>
          ) : null}

          {rule.fieldType === 'file' ? (
            <div className="next-job-create__field">
              <label>上传判断</label>
              <div className="next-job-create__file-hint">
                将根据候选人是否上传该文件进行自动筛选，最常见的是简历文件。
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="next-admin-page">
      <div className="next-job-detail__header">
        <Button icon={<IconArrowLeft />} onClick={() => navigate(isEditMode && editJobId ? `/jobs/${editJobId}` : '/jobs')}>
          {isEditMode ? '返回岗位详情' : '返回岗位列表'}
        </Button>
        <Space>
          <Button type="primary" icon={<IconLaunch />} onClick={handlePublish}>
            {isEditMode ? '保存岗位' : '发布岗位'}
          </Button>
        </Space>
      </div>

      <div className="next-job-create__stack">
        <Card bordered={false} className="next-panel">
          <Steps current={step + 1} labelPlacement="vertical" className="next-job-create__steps">
            <Steps.Step title="基础信息" description="岗位名称、国家要求、工作模式、薪资与测评类型" />
            <Steps.Step title="表单与筛选" description="模板初始化字段，并在当前岗位内勾选哪些字段参与自动筛选" />
            <Steps.Step title="自动化交互" description="根据字段类型生成规则，配置包含、不包含、区间与上传判断" />
          </Steps>
        </Card>

        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} xl={18}>
            <Card bordered={false} className="next-panel">
              {step === 0 ? (
                <div className="next-job-create__form">
                  <div className="next-job-create__field">
                    <label>岗位名称</label>
                    <Input value={title} onChange={setTitle} placeholder="例如：UK Data Analyst" />
                  </div>

                  <div className="next-job-create__field">
                    <label>国家要求</label>
                    <Select
                      value={country}
                      placeholder="请选择国家要求"
                      onChange={(value) => setCountry(String(value))}
                    >
                      {countryOptions.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="next-job-create__field">
                    <label>工作方式</label>
                    <Select value={workMode} onChange={(value) => setWorkMode(String(value))}>
                      {workModeOptions.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div className="next-job-create__field">
                    <label>薪资范围</label>
                    <div className="next-job-create__salary-row">
                      <Input value={minCompensation} onChange={setMinCompensation} placeholder="最低值" />
                      <span className="next-job-create__salary-sep">-</span>
                      <Input value={maxCompensation} onChange={setMaxCompensation} placeholder="最高值" />
                      <Select
                        value={compensationUnit}
                        style={{ width: 140 }}
                        onChange={(value) => setCompensationUnit(String(value))}
                      >
                        {compensationUnits.map((option) => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                    <div className="next-job-create__field-tip">默认币种为 USD，单位支持 Per Hour / Per Day / Per Line / Per Month。</div>
                  </div>

                  <div className="next-job-create__field">
                    <label>测评要求</label>
                    <Select value={assessmentType} onChange={(value) => setAssessmentType(String(value))}>
                      {assessmentTypeOptions.map((option) => (
                        <Select.Option key={option} value={option}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {isEditMode ? (
                    <>
                      <div className="next-job-create__field">
                        <label>岗位状态</label>
                        <Select value={status} onChange={(value) => setStatus(String(value))}>
                          <Select.Option value="在招">在招</Select.Option>
                          <Select.Option value="暂停">暂停</Select.Option>
                          <Select.Option value="关闭">关闭</Select.Option>
                        </Select>
                      </div>

                      <div className="next-job-create__field">
                        <label>负责人</label>
                        <Select
                          value={owner}
                          placeholder="请选择负责人"
                          onChange={(value) => {
                            const nextOwner = String(value)
                            setOwner(nextOwner)
                            setCollaborators((current) => current.filter((item) => item !== nextOwner))
                          }}
                        >
                          {ownerOptions.map((item) => (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="next-job-create__field">
                        <label>协作人</label>
                        <Select
                          mode="multiple"
                          value={collaborators}
                          placeholder="请选择协作人"
                          onChange={(value) =>
                            setCollaborators((value as string[]).filter((item) => item !== owner))
                          }
                        >
                          {ownerOptions
                            .filter((item) => item !== owner)
                            .map((item) => (
                              <Select.Option key={item} value={item}>
                                {item}
                              </Select.Option>
                            ))}
                        </Select>
                      </div>
                    </>
                  ) : null}

                  <div className="next-job-create__field">
                    <label>岗位描述</label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="填写面向 C 端展示的岗位职责、要求和协作方式"
                    />
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="next-job-create__form">
                  <Card bordered={false} className="next-job-create__subcard">
                    <div className="next-job-create__field">
                      <label>报名表模板</label>
                      <Select value={templateId} onChange={(value) => handleTemplateChange(String(value))}>
                        {templates.map((template) => (
                          <Select.Option key={template.id} value={template.id}>
                            {template.name}
                          </Select.Option>
                        ))}
                      </Select>
                      <div className="next-job-create__field-tip">
                        模板只作为字段初始化来源。选中后会把模板字段实例化到当前岗位，并继续在这里勾选必填项和自动筛选字段。
                      </div>
                      {configLoading ? <div className="next-job-create__field-tip">正在加载模板配置...</div> : null}
                    </div>

                    {selectedTemplate ? (
                      <div className="next-job-create__template-summary">
                        <span>{selectedTemplate.description}</span>
                      </div>
                    ) : null}
                  </Card>

                  <Card bordered={false} className="next-job-create__subcard">
                    <div className="next-job-create__switches">
                      <div className="next-job-create__switch-card">
                        <div>
                          <strong>简历附件</strong>
                          <span>用于候选人基础背景审核</span>
                        </div>
                        <Switch checked={resumeRequired} onChange={setResumeRequired} />
                      </div>
                      <div className="next-job-create__switch-card">
                        <div>
                          <strong>ID 附件</strong>
                          <span>合同库阶段需要补齐身份附件</span>
                        </div>
                        <Switch checked={idRequired} onChange={setIdRequired} />
                      </div>
                    </div>
                  </Card>

                  {groupedFields.map((group) => renderFieldGroup(group.title, group.fields))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="next-job-create__preview-stack">
                  <Card bordered={false} className="next-panel" title="自动筛选交互配置">
                    <div className="next-job-create__rule-mode">
                      <div>
                        <strong>规则组合方式</strong>
                        <div className="next-job-create__field-tip">
                          第 2 步勾选的字段会自动进入这里。后续如果接规则引擎，这里可以直接映射为 AND / OR 条件组。
                        </div>
                      </div>
                      <Select
                        style={{ width: 200 }}
                        value={automationGroup.combinator}
                        onChange={(value) =>
                          setAutomationGroup((current) => ({
                            ...current,
                            combinator: String(value) as 'and' | 'or',
                          }))
                        }
                      >
                        <Select.Option value="and">全部满足</Select.Option>
                        <Select.Option value="or">任一满足</Select.Option>
                      </Select>
                    </div>

                    {automationGroup.rules.length === 0 ? (
                      <div className="next-empty-state">
                        请先在上一步勾选需要参与自动筛选的字段。文本字段支持“包含/不包含”，下拉字段支持“包含/不包含”，数字字段支持“大于/小于/等于/区间”，文件字段支持“已上传/未上传”。
                      </div>
                    ) : (
                      <div className="next-job-create__rule-list">
                        {automationGroup.rules.map(renderRuleEditor)}
                      </div>
                    )}
                  </Card>

                  <Card bordered={false} className="next-panel" title="发布预览">
                    <Descriptions
                      column={2}
                      data={[
                        { label: '岗位名称', value: title || '-' },
                        { label: '国家要求', value: country || '-' },
                        { label: '工作方式', value: workMode || '-' },
                        { label: '薪资范围', value: compensation || '-' },
                        { label: '测评要求', value: assessmentType || '-' },
                        { label: '表单模板', value: selectedTemplate?.name || '-' },
                        { label: '自动筛选字段数', value: `${selectedFilterFields.length} 条` },
                        { label: '规则组合方式', value: automationGroup.combinator === 'and' ? '全部满足' : '任一满足' },
                      ]}
                    />
                    <div
                      className="next-job-detail__copy next-rich-editor__preview"
                      dangerouslySetInnerHTML={{ __html: description || '<p>暂无岗位描述</p>' }}
                    />
                  </Card>
                </div>
              ) : null}

              <div className="next-job-create__footer">
                <Button disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
                  上一步
                </Button>
                {step < 2 ? (
                  <Button type="primary" onClick={() => setStep((current) => current + 1)}>
                    下一步
                  </Button>
                ) : (
                  <Button type="primary" onClick={handlePublish}>
                    {isEditMode ? '保存并查看详情' : '发布并查看详情'}
                  </Button>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
