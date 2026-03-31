import { Button, Card, Space } from '@arco-design/web-react'
import { IconArrowLeft, IconLink } from '@arco-design/web-react/icon'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import JobOverviewHero from '../../components/jobs/JobOverviewHero'
import { getJobProfileById } from '../../lib/jobsStore'

export default function JobDetailPage() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const job = useMemo(() => (jobId ? getJobProfileById(jobId) : null), [jobId])
  if (!job) {
    return (
      <Card bordered={false} className="next-panel">
        未找到岗位详情。
      </Card>
    )
  }

  return (
    <div className="next-admin-page">
      <div className="next-job-detail__header">
        <Button icon={<IconArrowLeft />} onClick={() => navigate('/jobs')}>
          返回岗位列表
        </Button>
        <Space>
          <Button onClick={() => navigate(`/jobs/create?editJobId=${job.id}`)}>编辑岗位</Button>
          <Button
            type="primary"
            icon={<IconLink />}
            onClick={() => navigate(`/jobs/${job.id}/progress?stage=screening`)}
          >
            查看招聘进展
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="next-panel">
        <JobOverviewHero job={job} />
      </Card>

      <div className="next-job-detail__content-grid">
        <Card bordered={false} className="next-panel" title="岗位详情">
          <div
            className="next-job-detail__copy next-rich-editor__preview"
            dangerouslySetInnerHTML={{ __html: job.description || '<p>暂无岗位内容</p>' }}
          />
        </Card>

        {job.applicationSummary ? (
          <Card bordered={false} className="next-panel" title="申请情况总结">
            <div className="next-job-detail__summary-list">
              <div className="next-job-detail__summary-row">
                <span>申请人数</span>
                <strong>{job.applicationSummary.applicants}</strong>
              </div>
              <div className="next-job-detail__summary-row">
                <span>发起申请人数</span>
                <strong>{job.applicationSummary.applyStarters}</strong>
              </div>
              <div className="next-job-detail__summary-row">
                <span>总浏览量</span>
                <strong>{job.applicationSummary.totalViews}</strong>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
