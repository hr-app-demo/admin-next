import { Button, Card, Dropdown, Grid, Input, Menu, Message, Select, Space, Table, Tag } from '@arco-design/web-react'
import { IconMore, IconPlus, IconSearch } from '@arco-design/web-react/icon'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { progressRows } from '../../data/mock'
import { getAllJobs, getJobProfileById, upsertJobProfile } from '../../lib/jobsStore'

const { Row, Col } = Grid

export default function JobsPage() {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const jobs = useMemo(() => getAllJobs(), [version])
  const [keywordDraft, setKeywordDraft] = useState('')
  const [statusDraft, setStatusDraft] = useState('all')
  const [companyDraft, setCompanyDraft] = useState('all')
  const [countryDraft, setCountryDraft] = useState('all')
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'all',
    company: 'all',
    country: 'all',
  })
  const [pageSize, setPageSize] = useState(10)

  const companyOptions = ['all', ...Array.from(new Set(jobs.map((job) => job.company)))]
  const countryOptions = ['all', ...Array.from(new Set(jobs.map((job) => job.country)))]

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesKeyword =
        filters.keyword.length === 0 ||
        [job.title, job.company, job.country].some((value) =>
          value.toLowerCase().includes(filters.keyword.toLowerCase()),
        )
      const matchesStatus = filters.status === 'all' || job.status === filters.status
      const matchesCompany = filters.company === 'all' || job.company === filters.company
      const matchesCountry = filters.country === 'all' || job.country === filters.country
      return matchesKeyword && matchesStatus && matchesCompany && matchesCountry
    })
  }, [filters, jobs])

  const tableData = useMemo(
    () =>
      filteredJobs.map((job) => ({
        ...job,
        compensation: getJobProfileById(job.id)?.compensation || '-',
      })),
    [filteredJobs],
  )

  const listStats = useMemo(
    () => [
      { label: '岗位总数', value: jobs.length },
      { label: '在招岗位', value: jobs.filter((job) => job.status === '在招').length },
      { label: '总申请量', value: jobs.reduce((sum, job) => sum + job.applicants, 0) },
      { label: '待处理申请', value: progressRows.filter((row) => ['screening', 'assessment', 'passed'].includes(row.stage)).length },
    ],
    [jobs],
  )

  const pauseJob = (jobId: string) => {
    const profile = getJobProfileById(jobId)
    const applicants = getAllJobs().find((item) => item.id === jobId)?.applicants || 0
    if (!profile) return
    if (profile.status === '暂停') {
      Message.info('该岗位当前已经是暂停状态')
      return
    }
    upsertJobProfile({ ...profile, status: '暂停' }, applicants)
    setVersion((current) => current + 1)
    Message.success('岗位已暂停')
  }

  const parseCompensationValue = (value: string) => {
    const match = value.match(/([\d.]+)/)
    return Number(match?.[1] || 0)
  }

  const handleSearch = () => {
    setFilters({
      keyword: keywordDraft,
      status: statusDraft,
      company: companyDraft,
      country: countryDraft,
    })
  }

  return (
    <div className="next-admin-page">
      <Row gutter={[16, 16]}>
        {listStats.map((item) => (
          <Col key={item.label} xs={24} sm={12} xl={6}>
            <Card bordered={false} className="next-stat-card">
              <div className="next-stat-card__label">{item.label}</div>
              <div className="next-stat-card__value">{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} className="next-panel" style={{ marginTop: 16 }}>
        <div className="next-jobs-toolbar">
          <div className="next-jobs-toolbar__filters">
            <Input
              prefix={<IconSearch />}
              placeholder="搜索岗位 / 公司 / 国家"
              value={keywordDraft}
              onChange={setKeywordDraft}
              style={{ width: 260 }}
            />
            <Select value={statusDraft} style={{ width: 140 }} onChange={(value) => setStatusDraft(String(value))}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="在招">在招</Select.Option>
              <Select.Option value="暂停">暂停</Select.Option>
              <Select.Option value="关闭">关闭</Select.Option>
            </Select>
            <Select value={companyDraft} style={{ width: 180 }} onChange={(value) => setCompanyDraft(String(value))}>
              {companyOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option === 'all' ? '全部公司' : option}
                </Select.Option>
              ))}
            </Select>
            <Select value={countryDraft} style={{ width: 140 }} onChange={(value) => setCountryDraft(String(value))}>
              {countryOptions.map((option) => (
                <Select.Option key={option} value={option}>
                  {option === 'all' ? '全部国家' : option}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
              查询
            </Button>
          </div>

          <Button icon={<IconPlus />} onClick={() => navigate('/jobs/create')}>
            创建岗位
          </Button>
        </div>

        <Table
          rowKey="id"
          data={tableData}
          scroll={{ x: 1280 }}
          pagination={{
            pageSize,
            showJumper: true,
            showTotal: true,
            sizeCanChange: true,
            sizeOptions: [10, 20, 50, 100],
            onPageSizeChange: (value) => setPageSize(value),
          }}
          columns={[
            {
              title: '岗位名称',
              dataIndex: 'title',
              width: 220,
              fixed: 'left',
              sorter: (a, b) => String(a.title).localeCompare(String(b.title)),
              render: (value: string, record: { id: string }) => (
                <Button
                  type="text"
                  style={{ padding: 0, fontWeight: 600 }}
                  onClick={() => navigate(`/jobs/${record.id}`)}
                >
                  {value}
                </Button>
              ),
            },
            {
              title: '公司',
              dataIndex: 'company',
              width: 180,
              sorter: (a, b) => String(a.company).localeCompare(String(b.company)),
            },
            {
              title: '国家',
              dataIndex: 'country',
              width: 110,
              sorter: (a, b) => String(a.country).localeCompare(String(b.country)),
            },
            {
              title: '时薪范围',
              dataIndex: 'compensation',
              width: 160,
              sorter: (a, b) =>
                parseCompensationValue(String(a.compensation)) -
                parseCompensationValue(String(b.compensation)),
            },
            {
              title: '职位申请总数',
              dataIndex: 'applicants',
              width: 120,
              sorter: (a, b) => Number(a.applicants) - Number(b.applicants),
              render: (value: number) => <span style={{ fontWeight: 600 }}>{value}</span>,
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 110,
              sorter: (a, b) => String(a.status).localeCompare(String(b.status)),
              render: (value: string) => (
                <Tag color={value === '在招' ? 'green' : value === '暂停' ? 'orange' : 'gray'}>
                  {value}
                </Tag>
              ),
            },
            {
              title: '操作',
              dataIndex: 'actions',
              width: 180,
              fixed: 'right',
              render: (_: unknown, record: { id: string }) => (
                <Space className="next-table-action-group" align="center">
                  <Button
                    size="mini"
                    type="primary"
                    onClick={() => navigate(`/jobs/${record.id}`)}
                  >
                    查看岗位
                  </Button>
                  <Dropdown
                    droplist={
                      <Menu>
                        <Menu.Item key="preview" onClick={() => Message.info('C 端预览入口待接入')}>
                          预览 C 端
                        </Menu.Item>
                        <Menu.Item key="edit" onClick={() => navigate(`/jobs/create?editJobId=${record.id}`)}>
                          编辑岗位
                        </Menu.Item>
                        <Menu.Item key="pause" onClick={() => pauseJob(record.id)}>
                          暂停岗位
                        </Menu.Item>
                        <Menu.Item key="copy" onClick={() => navigate(`/jobs/create?copyFrom=${record.id}`)}>
                          复制岗位
                        </Menu.Item>
                      </Menu>
                    }
                    position="bl"
                    trigger="click"
                  >
                    <Button size="mini" type="secondary" icon={<IconMore />}>
                      更多操作
                    </Button>
                  </Dropdown>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
