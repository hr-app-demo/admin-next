import { Button, Card, Grid, Radio } from '@arco-design/web-react'
import { IconArrowRight, IconPlus } from '@arco-design/web-react/icon'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardMetrics } from '../../data/mock'

const { Row, Col } = Grid

type DashboardRange = 'day' | 'week' | 'month'

const rangeLabels: Record<DashboardRange, string> = {
  day: '每日',
  week: '每周',
  month: '每月',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<DashboardRange>('day')
  const stats = dashboardMetrics[range]

  const quickActions = [
    {
      title: 'Create New Job',
      description: '快速发布新岗位并进入岗位配置流程。',
      actionLabel: '新建岗位',
      onClick: () => navigate('/jobs/create'),
      primary: true,
    },
    {
      title: 'View Candidates',
      description: '查看总人才库，继续筛选和跟进候选人。',
      actionLabel: '查看人才库',
      onClick: () => navigate('/candidates'),
    },
    {
      title: 'View Applications',
      description: '回到岗位管理，按岗位继续查看申请情况。',
      actionLabel: '查看申请',
      onClick: () => navigate('/jobs'),
    },
  ]

  return (
    <div className="next-admin-page">
      <Card bordered={false} className="next-panel">
        <div className="next-dashboard__toolbar">
          <div>
            <div className="next-section-title">核心经营数据</div>
            <div className="next-section-copy">
              按 {rangeLabels[range]} 查看测试题总量、申请、成功签约和在职数据。
            </div>
          </div>
          <Radio.Group
            type="button"
            value={range}
            onChange={(value) => setRange(value as DashboardRange)}
          >
            <Radio value="day">每日</Radio>
            <Radio value="week">每周</Radio>
            <Radio value="month">每月</Radio>
          </Radio.Group>
        </div>

        <Row gutter={[16, 16]}>
          {stats.map((item) => (
            <Col key={item.label} xs={24} sm={12} xl={6}>
              <Card bordered={false} className="next-stat-card">
                <div className="next-stat-card__label">{item.label}</div>
                <div className="next-stat-card__value">{item.value}</div>
                <div className="next-stat-card__note">{item.note}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card bordered={false} className="next-panel" style={{ marginTop: 16 }} title="快捷操作">
        <div className="next-dashboard__actions">
          {quickActions.map((item) => (
            <button
              key={item.title}
              type="button"
              className={`next-dashboard__action-card${item.primary ? ' is-primary' : ''}`}
              onClick={item.onClick}
            >
              <div className="next-dashboard__action-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
              <Button
                type={item.primary ? 'primary' : 'secondary'}
                icon={item.primary ? <IconPlus /> : <IconArrowRight />}
              >
                {item.actionLabel}
              </Button>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
