import { Card, Grid, Space, Tag } from '@arco-design/web-react'
import { operatorMap, type FieldType, fieldTypeLabels } from '../../data/formConfig'

const { Row, Col } = Grid

const fieldTypes = Object.keys(operatorMap) as FieldType[]

export default function AutomationSettingsPage() {
  return (
    <div className="next-admin-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card bordered={false} className="next-panel" title="自动筛选规则中心">
            <div className="next-job-detail__list" style={{ marginBottom: 16 }}>
              <div className="next-job-detail__list-item">
                第 3 步的规则不是手写文案，而是根据第 2 步勾选出的字段自动生成。
              </div>
              <div className="next-job-detail__list-item">
                只有被标记为“用于自动筛选”的字段，才会进入规则构建器。
              </div>
              <div className="next-job-detail__list-item">
                规则支持 `全部满足` 或 `任一满足` 两种组合方式，便于后续接真正的规则引擎。
              </div>
            </div>

            <div className="next-settings-dictionary__stack">
              {fieldTypes.map((fieldType) => (
                <div key={fieldType} className="next-job-create__rule-card">
                  <div className="next-job-create__rule-card-top">
                    <div>
                      <strong>{fieldTypeLabels[fieldType]}</strong>
                      <div className="next-job-create__field-card-key">{fieldType}</div>
                    </div>
                    <Tag>{operatorMap[fieldType].length} 个操作符</Tag>
                  </div>

                  <Space wrap style={{ marginTop: 14 }}>
                    {operatorMap[fieldType].map((operator) => (
                      <Tag key={operator.value} color="arcoblue">
                        {operator.label}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card bordered={false} className="next-panel" title="规则设计建议">
            <div className="next-job-detail__list">
              <div className="next-job-detail__list-item">
                文本类字段优先做关键词匹配，不要直接在第 3 步塞复杂正则。
              </div>
              <div className="next-job-detail__list-item">
                选择类字段应统一从字典取值，这样岗位复制和模板复用时不需要再同步选项。
              </div>
              <div className="next-job-detail__list-item">
                文件类字段建议优先用“已上传 / 未上传”，最适合简历、身份证、合同回传判断。
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
