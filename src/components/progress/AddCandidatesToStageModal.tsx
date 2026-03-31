import { Button, Input, Message, Modal, Table, Tag } from '@arco-design/web-react'
import { IconSearch } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'

interface CandidateOption {
  id: number
  name: string
  email: string
  location: string
  education: string
  experience: string
  expectedRate: string
}

interface AddCandidatesToStageModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  jobTitle: string
  candidates: CandidateOption[]
  onConfirm: (candidateIds: number[]) => void
}

export default function AddCandidatesToStageModal({
  visible,
  onVisibleChange,
  jobTitle,
  candidates,
  onConfirm,
}: AddCandidatesToStageModalProps) {
  const [keywordDraft, setKeywordDraft] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  useEffect(() => {
    if (!visible) return
    setKeywordDraft('')
    setKeyword('')
    setSelectedRowKeys([])
  }, [visible])

  const filteredCandidates = useMemo(
    () =>
      candidates.filter((item) =>
        keyword.length === 0
          ? true
          : [item.name, item.email, item.location]
              .some((value) => String(value).toLowerCase().includes(keyword.toLowerCase())),
      ),
    [candidates, keyword],
  )

  const handleConfirm = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('请先选择要添加的候选人')
      return
    }
    onConfirm(selectedRowKeys)
    onVisibleChange(false)
  }

  return (
    <Modal
      title="添加候选人到待筛选名单"
      visible={visible}
      style={{ width: 1080 }}
      className="next-modal--70vh"
      onCancel={() => onVisibleChange(false)}
      onOk={handleConfirm}
    >
      <div className="next-modal-stack" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="next-jobs-toolbar next-jobs-toolbar--modal">
          <div className="next-jobs-toolbar__filters">
            <Input
              prefix={<IconSearch />}
              placeholder="搜索姓名 / 邮箱 / 所在地"
              value={keywordDraft}
              onChange={setKeywordDraft}
              style={{ width: 280 }}
            />
            <Button type="primary" icon={<IconSearch />} onClick={() => setKeyword(keywordDraft)}>
              查询
            </Button>
          </div>
          <Tag color="arcoblue">目标岗位：{jobTitle}</Tag>
        </div>

        <Table
          rowKey="id"
          data={filteredCandidates}
          scroll={{ x: 980 }}
          pagination={{
            pageSize: 8,
            showJumper: true,
            showTotal: true,
            sizeCanChange: true,
            sizeOptions: [8, 16, 32],
          }}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          columns={[
            { title: '姓名', dataIndex: 'name', width: 160 },
            { title: '邮箱', dataIndex: 'email', width: 220 },
            { title: '所在地', dataIndex: 'location', width: 140 },
            { title: '学历', dataIndex: 'education', width: 120 },
            { title: '经验年限', dataIndex: 'experience', width: 120 },
            { title: '期望时薪', dataIndex: 'expectedRate', width: 140 },
          ]}
        />
      </div>
    </Modal>
  )
}
