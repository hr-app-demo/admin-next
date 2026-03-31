import { Button, Checkbox, Input, Pagination, Popover, Select, Table } from '@arco-design/web-react'
import { IconSearch, IconSettings } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

export interface ProgressColumnDefinition<Row = any> {
  key: string
  title: string
  dataIndex?: string
  width: number
  minWidth?: number
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  render?: (value: any, row: Row, index: number) => ReactNode
  sorter?: ((a: Row, b: Row) => number) | boolean
  resizable?: boolean
}

interface SelectOptionItem {
  label: string
  value: string
}

interface ProgressStageTableProps<Row = any> {
  stageKey: string
  data: Row[]
  rowKey: string
  columns: ProgressColumnDefinition<Row>[]
  allColumnOptions: Array<{ key: string; title: string; disabled?: boolean }>
  visibleColumnKeys: string[]
  onVisibleColumnKeysChange: (keys: string[]) => void
  selectedRowKeys: Array<string | number>
  onSelectedRowKeysChange: (keys: Array<string | number>) => void
  keyword: string
  onKeywordChange: (value: string) => void
  nationality: string
  onNationalityChange: (value: string) => void
  nationalityOptions: SelectOptionItem[]
  education: string
  onEducationChange: (value: string) => void
  educationOptions: SelectOptionItem[]
  enableRowSelection?: boolean
  leftActions?: ReactNode
  rightActions?: ReactNode
}

export default function ProgressStageTable<Row extends Record<string, any>>({
  stageKey,
  data,
  rowKey,
  columns,
  allColumnOptions,
  visibleColumnKeys,
  onVisibleColumnKeysChange,
  selectedRowKeys,
  onSelectedRowKeysChange,
  keyword,
  onKeywordChange,
  nationality,
  onNationalityChange,
  nationalityOptions,
  education,
  onEducationChange,
  educationOptions,
  enableRowSelection = true,
  leftActions,
  rightActions,
}: ProgressStageTableProps<Row>) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [draftKeyword, setDraftKeyword] = useState(keyword)
  const [draftNationality, setDraftNationality] = useState(nationality)
  const [draftEducation, setDraftEducation] = useState(education)
  const [widthMapByStage, setWidthMapByStage] = useState<Record<string, Record<string, number>>>({})
  const dragRef = useRef<{
    stageKey: string
    key: string
    startX: number
    startWidth: number
    minWidth: number
  } | null>(null)

  useEffect(() => {
    setPage(1)
  }, [stageKey, keyword, nationality, education])

  useEffect(() => {
    setDraftKeyword(keyword)
    setDraftNationality(nationality)
    setDraftEducation(education)
  }, [stageKey, keyword, nationality, education])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [data.length, page, pageSize])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragRef.current) return
      const { stageKey: currentStageKey, key, startX, startWidth, minWidth } = dragRef.current
      const nextWidth = Math.max(minWidth, startWidth + event.clientX - startX)
      setWidthMapByStage((current) => ({
        ...current,
        [currentStageKey]: {
          ...(current[currentStageKey] || {}),
          [key]: nextWidth,
        },
      }))
    }

    const handleMouseUp = () => {
      dragRef.current = null
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const pagedData = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize],
  )

  const currentWidthMap = widthMapByStage[stageKey] || {}

  const tableColumns = useMemo(() => {
    return columns.map((column) => {
      const width =
        column.resizable === false
          ? column.width
          : currentWidthMap[column.key] ?? column.width
      return {
        ...column,
        width,
        title: (
          <div className="next-resizable-th">
            <span className="next-resizable-th__label">{column.title}</span>
            {column.resizable === false ? null : (
              <span
                className="next-resizable-th__handle"
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  dragRef.current = {
                    stageKey,
                    key: column.key,
                    startX: event.clientX,
                    startWidth: Number(width),
                    minWidth: column.minWidth || 96,
                  }
                  document.body.style.userSelect = 'none'
                  document.body.style.cursor = 'col-resize'
                }}
              />
            )}
          </div>
        ),
      }
    })
  }, [columns, currentWidthMap, stageKey])

  const totalTableWidth = useMemo(
    () => tableColumns.reduce((sum, item) => sum + Number(item.width || 140), 56),
    [tableColumns],
  )

  return (
    <>
      <div className="next-progress-toolbar">
        <div className="next-progress-toolbar__filters">
          <Input
            prefix={<IconSearch />}
            placeholder="搜索姓名 / 邮箱 / 地区"
            value={draftKeyword}
            onChange={setDraftKeyword}
            style={{ width: 260 }}
          />
          <Select
            value={draftNationality}
            style={{ width: 150 }}
            onChange={(value) => setDraftNationality(String(value))}
          >
            {nationalityOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <Select
            value={draftEducation}
            style={{ width: 150 }}
            onChange={(value) => setDraftEducation(String(value))}
          >
            {educationOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<IconSearch />}
            onClick={() => {
              onKeywordChange(draftKeyword)
              onNationalityChange(draftNationality)
              onEducationChange(draftEducation)
            }}
          >
            查询
          </Button>
          <Popover
            trigger="click"
            position="bottom"
            content={
              <div className="next-column-picker">
                {allColumnOptions.map((column) => (
                  <Checkbox
                    key={column.key}
                    checked={visibleColumnKeys.includes(column.key)}
                    disabled={column.disabled}
                    onChange={(checked) =>
                      onVisibleColumnKeysChange(
                        checked
                          ? [...visibleColumnKeys, column.key]
                          : visibleColumnKeys.filter((item) => item !== column.key),
                      )
                    }
                  >
                    {column.title}
                  </Checkbox>
                ))}
              </div>
            }
          >
            <Button icon={<IconSettings />}>列配置</Button>
          </Popover>
        </div>

        <div className="next-progress-toolbar__actions">
          {enableRowSelection ? (
            <span className="next-progress-toolbar__summary">已选 {selectedRowKeys.length} 人</span>
          ) : null}
          {leftActions}
          {rightActions}
        </div>
      </div>

      <Table
        className="next-progress-stage-table"
        rowKey={rowKey}
        data={pagedData}
        columns={tableColumns as any}
        scroll={{ x: totalTableWidth }}
        pagination={false}
        rowSelection={
          enableRowSelection
            ? {
                type: 'checkbox',
                fixed: true,
                selectedRowKeys,
                onChange: (keys) => onSelectedRowKeysChange(keys as Array<string | number>),
              }
            : undefined
        }
      />

      <div className="next-progress-table__footer">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={data.length}
          showJumper
          showTotal
          sizeCanChange
          sizeOptions={[10, 20, 50, 100]}
          onChange={(nextPage) => setPage(nextPage)}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize)
            setPage(1)
          }}
        />
      </div>
    </>
  )
}
