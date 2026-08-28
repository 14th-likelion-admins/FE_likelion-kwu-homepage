/**
 * 매거진 본문의 행/열 구조를 다루는 순수 함수 모음.
 * 에디터와 렌더러가 같은 정규화를 공유해야 해서 별도 모듈로 뒀다.
 *
 * 저장 형태:
 *   blocks: [{ id, type: 'row', items: [{ id, type: 'text' | 'image', ... }] }]
 *
 * 행 개념이 없던 시절에는 blocks가 텍스트/이미지 블록의 평평한 배열이었다.
 * toRows가 그런 데이터를 한 칸짜리 행으로 감싸 흡수하므로, 기존 매거진을
 * 따로 마이그레이션하지 않아도 된다.
 */

export const MAX_COLUMNS = 4

export const createId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createTextItem = () => ({ id: createId(), type: 'text', text: '', style: 'paragraph' })
export const createImageItem = () => ({ id: createId(), type: 'image', url: '', caption: '', width: 'full' })
export const createRow = (items) => ({ id: createId(), type: 'row', items })

/** 누락 필드를 기본값으로 메워 제어 컴포넌트가 깨지지 않게 한다. */
const normalizeItem = (item) => (item?.type === 'image'
  // width는 레이아웃 폭('full'|'half'), pixelWidth/pixelHeight는 실제 픽셀 크기다.
  // 픽셀 크기는 업로드 시점에만 알 수 있어, 예전에 올린 이미지에는 없다.
  ? {
    ...item,
    id: item.id || createId(),
    type: 'image',
    url: item.url ?? '',
    caption: item.caption ?? '',
    width: item.width ?? 'full',
    pixelWidth: Number(item.pixelWidth) || null,
    pixelHeight: Number(item.pixelHeight) || null,
  }
  : { ...item, id: item?.id || createId(), type: 'text', text: item?.text ?? '', style: item?.style ?? 'paragraph' })

export function toRows(blocks) {
  if (!Array.isArray(blocks)) return []
  return blocks
    .map((block) => (block?.type === 'row'
      ? createRowFrom(block)
      : createRow([normalizeItem(block)])))
    .filter((row) => row.items.length > 0)
}

const createRowFrom = (block) => ({
  id: block.id || createId(),
  type: 'row',
  items: (Array.isArray(block.items) ? block.items : []).map(normalizeItem).slice(0, MAX_COLUMNS),
})

export function findItem(rows, itemId) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const itemIndex = rows[rowIndex].items.findIndex((item) => item.id === itemId)
    if (itemIndex >= 0) return { rowIndex, itemIndex, item: rows[rowIndex].items[itemIndex] }
  }
  return null
}

export function updateItem(rows, itemId, updates) {
  return rows.map((row) => (row.items.some((item) => item.id === itemId)
    ? { ...row, items: row.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)) }
    : row))
}

/** 항목을 지우고, 그 결과 비어버린 행도 함께 걷어낸다. */
export function removeItem(rows, itemId) {
  return rows
    .map((row) => ({ ...row, items: row.items.filter((item) => item.id !== itemId) }))
    .filter((row) => row.items.length > 0)
}

/** gapIndex 위치에 항목을 혼자 담은 새 행을 만든다. */
export function moveItemToNewRow(rows, itemId, gapIndex) {
  const found = findItem(rows, itemId)
  if (!found) return rows

  const alone = rows[found.rowIndex].items.length === 1
  // 이미 그 자리에 혼자 있으면 아무것도 바뀌지 않는다.
  if (alone && (gapIndex === found.rowIndex || gapIndex === found.rowIndex + 1)) return rows

  const remaining = removeItem(rows, itemId)
  // 원래 행이 통째로 사라졌고 그 행이 목표 지점보다 앞이면 한 칸 당겨진다.
  const target = alone && found.rowIndex < gapIndex ? gapIndex - 1 : gapIndex
  return [...remaining.slice(0, target), createRow([found.item]), ...remaining.slice(target)]
}

/** 항목을 특정 행의 atIndex 자리로 옮긴다. 열이 가득 찬 행에는 넣지 않는다. */
export function moveItemToRow(rows, itemId, targetRowId, atIndex) {
  const found = findItem(rows, itemId)
  if (!found) return rows

  if (rows[found.rowIndex].id === targetRowId) {
    const items = [...rows[found.rowIndex].items]
    items.splice(found.itemIndex, 1)
    // 자기 자신을 빼고 나면 뒤쪽 목표 위치가 한 칸 당겨진다.
    const target = clamp(atIndex > found.itemIndex ? atIndex - 1 : atIndex, items.length)
    items.splice(target, 0, found.item)
    return rows.map((row, index) => (index === found.rowIndex ? { ...row, items } : row))
  }

  const targetRow = rows.find((row) => row.id === targetRowId)
  if (!targetRow || targetRow.items.length >= MAX_COLUMNS) return rows

  return removeItem(rows, itemId).map((row) => {
    if (row.id !== targetRowId) return row
    const items = [...row.items]
    items.splice(clamp(atIndex, items.length), 0, found.item)
    return { ...row, items }
  })
}

/** 항목을 같은 행 안에서 좌우로 한 칸 민다. */
export function shiftItemWithinRow(rows, itemId, direction) {
  const found = findItem(rows, itemId)
  if (!found) return rows
  const target = found.itemIndex + direction
  if (target < 0 || target >= rows[found.rowIndex].items.length) return rows
  return rows.map((row, index) => {
    if (index !== found.rowIndex) return row
    const items = [...row.items]
    ;[items[found.itemIndex], items[target]] = [items[target], items[found.itemIndex]]
    return { ...row, items }
  })
}

/** 항목을 위/아래 이웃 행의 끝에 붙여 열로 만든다. */
export function mergeItemIntoNeighborRow(rows, itemId, direction) {
  const found = findItem(rows, itemId)
  if (!found) return rows
  const neighbor = rows[found.rowIndex + direction]
  if (!neighbor || neighbor.items.length >= MAX_COLUMNS) return rows
  return moveItemToRow(rows, itemId, neighbor.id, direction < 0 ? neighbor.items.length : 0)
}

/** rowIndex 다음에 새 행을 끼워 넣는다. */
export function insertRowAfter(rows, rowIndex, item) {
  return [...rows.slice(0, rowIndex + 1), createRow([item]), ...rows.slice(rowIndex + 1)]
}

export function appendItemToRow(rows, rowId, item) {
  return rows.map((row) => (row.id === rowId && row.items.length < MAX_COLUMNS
    ? { ...row, items: [...row.items, item] }
    : row))
}

const clamp = (value, max) => Math.max(0, Math.min(value, max))
