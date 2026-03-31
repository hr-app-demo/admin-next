import { Button, Descriptions, Input, Message, Modal, Radio, Table, Tag } from '@arco-design/web-react'
import { IconSearch } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJobs } from '../../lib/jobsStore'

interface JoinJobModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  candidateName: string
}

export default function JoinJobModal({
  visible,
  onVisibleChange,
  candidateName,
}: JoinJobModalProps) {
  const navigate = useNavigate()
  const jobs = useMemo(() => getAllJobs(), [])
  const [keywordDraft, setKeywordDraft] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')

  useEffect(() => {
    if (!visible) return
    setKeywordDraft('')
    setKeyword('')
    setSelectedJobId('')
  }, [visible])

  const filteredJobs = useMemo(
    () =>
      jobs.filter((item) =>
        keyword.length === 0
          ? true
          : [item.title, item.company, item.country]
              .some((value) => String(value).toLowerCase().includes(keyword.toLowerCase())),
      ),
    [jobs, keyword],
  )

  const selectedJob = useMemo(
    () => jobs.find((item) => item.id === selectedJobId) || null,
    [jobs, selectedJobId],
  )

  const handleJoin = () => {
    if (!selectedJob) {
      Message.warning('请先单选一个岗位')
      return
    }
    Message.success(`${candidateName} 已加入岗位 ${selectedJob.title}`)
    onVisibleChange(false)
  }

  return (
    <Modal
      title="加入岗位"
      visible={visible}
      style={{ width: 980 }}
      className="next-modal--70vh"
      onCancel={() => onVisibleChange(false)}
      onOk={handleJoin}
    >
      <div className="next-modal-stack" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="next-jobs-toolbar next-jobs-toolbar--modal">
          <div className="next-jobs-toolbar__filters">
            <Input
              prefix={<IconSearch />}
              placeholder="搜索岗位名称 / 公司 / 国家"
              value={keywordDraft}
              onChange={setKeywordDraft}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<IconSearch />} onClick={() => setKeyword(keywordDraft)}>
              查询
            </Button>
          </div>
        </div>

        <Table
          rowKey="id"
          data={filteredJobs}
          scroll={{ x: 760, y: 360 }}
          pagination={{
            pageSize: 6,
            showJumper: true,
            showTotal: true,
          }}
          columns={[
            {
              title: '',
              dataIndex: 'pick',
              width: 56,
              render: (_: unknown, record: any) => (
                <Radio checked={selectedJobId === record.id} onChange={() => setSelectedJobId(record.id)} />
              ),
            },
            {
              title: '岗位名称',
              dataIndex: 'title',
              width: 220,
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
            { title: '公司', dataIndex: 'company', width: 180 },
            { title: '国家', dataIndex: 'country', width: 120 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 120,
              render: (value: string) => (
                <Tag color={value === '在招' ? 'green' : value === '暂停' ? 'orange' : 'gray'}>
                  {value}
                </Tag>
              ),
            },
            { title: '申请数', dataIndex: 'applicants', width: 100 },
          ]}
        />

        <Descriptions
          column={1}
          data={[
            { label: '候选人', value: candidateName || '-' },
            { label: '当前选择岗位', value: selectedJob?.title || '-' },
          ]}
        />
      </div>
    </Modal>
  )
}
