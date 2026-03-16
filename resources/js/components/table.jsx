import React from 'react'
import { cn } from '@/lib/utils'
import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * @typedef {Object} Column
 * @property {string} key - Field key on the row object
 * @property {string} header - Column header label
 * @property {'left'|'right'|'center'} [align='left']
 * @property {string} [className] - Cell className (applied to both header and body cells)
 * @property {(row: object) => React.ReactNode} [render] - Custom cell renderer
 */

/**
 * Reusable data table component.
 * @param {Object} props
 * @param {Column[]} props.columns - Column definitions
 * @param {object[]} props.data - Array of row data
 * @param {string} [props.emptyMessage='No data.'] - Message when data is empty
 * @param {boolean} [props.loading] - Show loading state
 * @param {(row: object) => string|number} [props.getRowKey] - Row key for React (default: row => row.id)
 * @param {(row: object) => void} [props.onRowClick] - Optional row click handler
 * @param {(row: object) => React.ReactNode} [props.actions] - Optional render for actions column
 * @param {string} [props.actionsHeader='Actions'] - Header for actions column
 * @param {string} [props.className] - Table wrapper className
 * @param {string} [props.headerRowClassName] - Header row className
 */
export default function Table({
  columns = [],
  data = [],
  emptyMessage = 'No data.',
  loading = false,
  getRowKey = (row) => row?.id ?? row,
  onRowClick,
  actions,
  actionsHeader = 'Actions',
  className,
  headerRowClassName,
}) {
  const alignClass = (align) => {
    if (align === 'right') return 'text-right'
    if (align === 'center') return 'text-center'
    return 'text-left'
  }

  const colCount = columns.length + (actions ? 1 : 0)

  return (
    <BaseTable className={cn(className)}>
      <TableHeader>
        <TableRow className={headerRowClassName}>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                alignClass(col.align),
                col.className
              )}
            >
              {col.header}
            </TableHead>
          ))}
          {actions && (
            <TableHead className="text-right w-[1%] whitespace-nowrap">
              {actionsHeader}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">
              Loading…
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colCount} className="h-24 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow
              key={getRowKey(row)}
              className={onRowClick ? 'cursor-pointer' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(alignClass(col.align), col.className)}
                >
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </TableCell>
              ))}
              {actions && (
                <TableCell className="text-right w-[1%] whitespace-nowrap">
                  {actions(row)}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </BaseTable>
  )
}
