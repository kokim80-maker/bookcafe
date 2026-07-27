import * as XLSX from 'xlsx'

export interface CafeExcelRow {
  name: string
  address: string
  category: string
}

const REQUIRED_HEADERS = ['이름', '주소', '카테고리'] as const

export async function parseCafeExcelFile(file: File): Promise<CafeExcelRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false })

  const [headerRow, ...dataRows] = rows
  if (!headerRow) {
    throw new Error('엑셀에서 제목 행을 찾을 수 없습니다.')
  }

  const columnIndex = REQUIRED_HEADERS.map((header) =>
    headerRow.findIndex((cell) => String(cell).trim() === header),
  )
  const missingHeaders = REQUIRED_HEADERS.filter((_, i) => columnIndex[i] === -1)
  if (missingHeaders.length > 0) {
    throw new Error(`엑셀에 필요한 열이 없습니다: ${missingHeaders.join(', ')}`)
  }

  const [nameIndex, addressIndex, categoryIndex] = columnIndex

  return dataRows
    .filter((row) => row[nameIndex] != null && row[addressIndex] != null)
    .map((row) => ({
      name: String(row[nameIndex]).trim(),
      address: String(row[addressIndex]).trim(),
      category: String(row[categoryIndex] ?? '').trim(),
    }))
}
