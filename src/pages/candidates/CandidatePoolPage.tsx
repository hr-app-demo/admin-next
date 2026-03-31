import { Button, Card, Dropdown, Input, Menu, Select, Space, Table, Tag } from '@arco-design/web-react'
import { IconMore, IconSearch } from '@arco-design/web-react/icon'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JoinJobModal from '../../components/shared/JoinJobModal'
import SendMailModal from '../../components/shared/SendMailModal'
import { candidateProfiles, candidates } from '../../data/mock'

type CandidateRow = (typeof candidates)[number] & {
  yearsOfExperience?: string
  preferredRate?: string
}

export default function CandidatePoolPage() {
  const navigate = useNavigate()
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRow | null>(null)
  const [emailVisible, setEmailVisible] = useState(false)
  const [jobVisible, setJobVisible] = useState(false)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState('all')
  const [educationDraft, setEducationDraft] = useState('all')
  const [statusDraft, setStatusDraft] = useState('all')
  const [filters, setFilters] = useState({
    keyword: '',
    location: 'all',
    education: 'all',
    status: 'all',
  })
  const [pageSize, setPageSize] = useState(10)

  const poolData = useMemo<CandidateRow[]>(
    () =>
      candidates.map((item) => ({
        ...item,
        yearsOfExperience: candidateProfiles[item.id]?.yearsOfExperience || '-',
        preferredRate: candidateProfiles[item.id]?.preferredRate || '-',
      })),
    [],
  )

  const locationOptions = useMemo(
    () => ['all', ...Array.from(new Set(poolData.map((item) => item.location)))],
    [poolData],
  )
  const educationOptions = useMemo(
    () => ['all', ...Array.from(new Set(poolData.map((item) => item.education)))],
    [poolData],
  )
  const statusOptions = useMemo(
    () => ['all', ...Array.from(new Set(poolData.map((item) => item.status)))],
    [poolData],
  )

  const filteredData = useMemo(() => {
    return poolData.filter((item) => {
      const matchesKeyword =
        filters.keyword.length === 0 ||
        [item.name, item.email, item.location]
          .some((value) => String(value).toLowerCase().includes(filters.keyword.toLowerCase()))

      const matchesLocation = filters.location === 'all' || item.location === filters.location
      const matchesEducation = filters.education === 'all' || item.education === filters.education
      const matchesStatus = filters.status === 'all' || item.status === filters.status

      return matchesKeyword && matchesLocation && matchesEducation && matchesStatus
    })
  }, [filters, poolData])

  const handleSearch = () => {
    setFilters({
      keyword: keywordDraft,
      location: locationDraft,
      education: educationDraft,
      status: statusDraft,
    })
  }

  const parseExperience = (value?: string) => Number(String(value || '').replace(/[^\d.]/g, '') || 0)
  const parseRate = (value?: string) => Number(String(value || '').replace(/[^\d.]/g, '') || 0)

  const openEmailModal = (candidate: CandidateRow) => {
    setSelectedCandidate(candidate)
    setEmailVisible(true)
  }

  const openJoinJobModal = (candidate: CandidateRow) => {
    setSelectedCandidate(candidate)
    setJobVisible(true)
  }

  return (
    <Card bordered={false} className="next-panel" title="总人才库">
      <div className="next-jobs-toolbar">
        <div className="next-jobs-toolbar__filters">
          <Input
            prefix={<IconSearch />}
            placeholder="搜索姓名 / 邮箱 / 所在地"
            value={keywordDraft}
            onChange={setKeywordDraft}
            style={{ width: 260 }}
          />
          <Select value={locationDraft} style={{ width: 160 }} onChange={(value) => setLocationDraft(String(value))}>
            {locationOptions.map((option) => (
              <Select.Option key={option} value={option}>
                {option === 'all' ? '全部所在地' : option}
              </Select.Option>
            ))}
          </Select>
          <Select value={educationDraft} style={{ width: 160 }} onChange={(value) => setEducationDraft(String(value))}>
            {educationOptions.map((option) => (
              <Select.Option key={option} value={option}>
                {option === 'all' ? '全部学历' : option}
              </Select.Option>
            ))}
          </Select>
          <Select value={statusDraft} style={{ width: 140 }} onChange={(value) => setStatusDraft(String(value))}>
            {statusOptions.map((option) => (
              <Select.Option key={option} value={option}>
                {option === 'all' ? '全部状态' : option}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
            查询
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        data={filteredData}
        scroll={{ x: 1080 }}
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
            title: '姓名',
            dataIndex: 'name',
            width: 160,
            sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
            render: (value: string, record: { id: number }) => (
              <Button
                type="text"
                style={{ padding: 0, fontWeight: 600 }}
                onClick={() => navigate(`/candidates/${record.id}?source=pool`)}
              >
                {value}
              </Button>
            ),
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            width: 220,
            sorter: (a, b) => String(a.email).localeCompare(String(b.email)),
          },
          {
            title: '所在地',
            dataIndex: 'location',
            width: 140,
            sorter: (a, b) => String(a.location).localeCompare(String(b.location)),
          },
          {
            title: '学历',
            dataIndex: 'education',
            width: 120,
            sorter: (a, b) => String(a.education).localeCompare(String(b.education)),
          },
          {
            title: '经验年限',
            dataIndex: 'yearsOfExperience',
            width: 120,
            sorter: (a, b) => parseExperience(a.yearsOfExperience) - parseExperience(b.yearsOfExperience),
          },
          {
            title: '期望时薪',
            dataIndex: 'preferredRate',
            width: 140,
            sorter: (a, b) => parseRate(a.preferredRate) - parseRate(b.preferredRate),
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            sorter: (a, b) => String(a.status).localeCompare(String(b.status)),
            render: (value: string) => (
              <Tag color={value === '在职' ? 'green' : 'gray'}>
                {value}
              </Tag>
            ),
          },
          {
            title: '操作',
            dataIndex: 'actions',
            width: 180,
            fixed: 'right',
            render: (_: unknown, record: any) => (
              <Space className="next-table-action-group" align="center">
                <Button type="primary" size="mini" onClick={() => navigate(`/candidates/${record.id}?source=pool`)}>
                  查看档案
                </Button>
                <Dropdown
                  droplist={
                    <Menu>
                      <Menu.Item key="email" onClick={() => openEmailModal(record)}>
                        发邮件
                      </Menu.Item>
                      <Menu.Item key="job" onClick={() => openJoinJobModal(record)}>
                        加入岗位
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

      <SendMailModal
        visible={emailVisible}
        onVisibleChange={setEmailVisible}
        recipientName={selectedCandidate?.name || ''}
        recipientEmail={selectedCandidate?.email || ''}
      />
      <JoinJobModal
        visible={jobVisible}
        onVisibleChange={setJobVisible}
        candidateName={selectedCandidate?.name || ''}
      />
    </Card>
  )
}
