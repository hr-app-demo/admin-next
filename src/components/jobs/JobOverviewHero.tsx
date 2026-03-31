import { Space, Tag } from '@arco-design/web-react'
import type { ReactNode } from 'react'
import type { JobProfile } from '../../data/mock'

interface JobOverviewHeroProps {
  job: JobProfile
  actions?: ReactNode
}

export default function JobOverviewHero({ job, actions }: JobOverviewHeroProps) {
  return (
    <div className="next-job-detail__hero">
      <div className="next-job-detail__hero-top">
        <div className="next-job-detail__hero-main">
          <div className="next-job-detail__title-row">
            <div className="next-section-title">{job.title}</div>
            <Tag color={job.status === '在招' ? 'green' : job.status === '暂停' ? 'orange' : 'gray'}>
              {job.status}
            </Tag>
          </div>
          <div className="next-job-detail__info-row">
            <div className="next-job-detail__info-item">
              <span>公司</span>
              <strong>{job.company}</strong>
            </div>
            <div className="next-job-detail__info-item">
              <span>国家</span>
              <strong>{job.country}</strong>
            </div>
            <div className="next-job-detail__info-item">
              <span>时薪范围</span>
              <strong>{job.compensation}</strong>
            </div>
          </div>
          <div className="next-job-detail__people-row">
            <div className="next-job-detail__person-block">
              <span>负责人</span>
              <div className="next-job-detail__owner-tags">
                <Tag bordered color="arcoblue">
                  {job.owner}
                </Tag>
              </div>
            </div>
            <div className="next-job-detail__person-block">
              <span>协作人</span>
              <div className="next-job-detail__owner-tags">
                {(job.collaborators || []).length ? (
                  job.collaborators?.map((item) => (
                    <Tag key={item} bordered>
                      {item}
                    </Tag>
                  ))
                ) : (
                  <span className="next-job-detail__empty">暂无协作人</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {actions ? <Space className="next-job-detail__hero-actions">{actions}</Space> : null}
      </div>
    </div>
  )
}
