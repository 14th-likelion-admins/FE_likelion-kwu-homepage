/**
 * 매거진 본문 텍스트용 초경량 마크다운 렌더러.
 * 외부 라이브러리 없이 굵게/기울임/링크/코드/목록/인용/줄바꿈만 지원한다.
 * dangerouslySetInnerHTML을 쓰지 않고 React 엘리먼트를 직접 만들어 XSS를 원천 차단한다.
 */

const INLINE_PATTERN = /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g

export function renderInline(text, keyBase) {
  const nodes = []
  let lastIndex = 0
  let key = 0
  let match

  INLINE_PATTERN.lastIndex = 0
  while ((match = INLINE_PATTERN.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[2] !== undefined) nodes.push(<strong key={`${keyBase}-${key++}`}>{match[2]}</strong>)
    else if (match[3] !== undefined) nodes.push(<strong key={`${keyBase}-${key++}`}>{match[3]}</strong>)
    else if (match[4] !== undefined) nodes.push(<code key={`${keyBase}-${key++}`} className='rounded bg-white/10 px-1.5 py-0.5 text-[0.9em]'>{match[4]}</code>)
    else if (match[5] !== undefined) nodes.push(<em key={`${keyBase}-${key++}`}>{match[5]}</em>)
    else if (match[6] !== undefined) nodes.push(<em key={`${keyBase}-${key++}`}>{match[6]}</em>)
    else if (match[7] !== undefined) nodes.push(<a key={`${keyBase}-${key++}`} href={match[8]} target='_blank' rel='noopener noreferrer' className='underline decoration-orange-300/70 underline-offset-2 hover:text-orange-200'>{match[7]}</a>)
    lastIndex = INLINE_PATTERN.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

const withLineBreaks = (lines, keyBase) => lines.map((line, index) => (
  <span key={index}>{index > 0 && <br />}{renderInline(line, `${keyBase}-${index}`)}</span>
))

function renderList(lines, ordered, keyBase) {
  const marker = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/
  const items = lines.map((line, index) => <li key={index}>{renderInline(line.replace(marker, ''), `${keyBase}-li-${index}`)}</li>)
  return ordered
    ? <ol key={keyBase} className='list-decimal space-y-1 pl-5'>{items}</ol>
    : <ul key={keyBase} className='list-disc space-y-1 pl-5'>{items}</ul>
}

function renderBlock(block, keyBase) {
  const lines = block.split('\n')

  if (lines.every((line) => /^>\s?/.test(line))) {
    return <blockquote key={keyBase} className='border-l-2 border-white/30 pl-4 text-white/75'>
      {withLineBreaks(lines.map((line) => line.replace(/^>\s?/, '')), `${keyBase}-q`)}
    </blockquote>
  }

  const heading = lines.length === 1 && block.match(/^(#{1,3})\s+(.*)$/)
  if (heading) {
    const Tag = ['h4', 'h5', 'h6'][heading[1].length - 1]
    return <Tag key={keyBase} className='font-semibold text-white'>{renderInline(heading[2], keyBase)}</Tag>
  }

  if (lines.every((line) => /^\s*[-*]\s+/.test(line))) return renderList(lines, false, keyBase)
  if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) return renderList(lines, true, keyBase)

  return <p key={keyBase}>{withLineBreaks(lines, keyBase)}</p>
}

/** 빈 줄 하나 이상으로 문단을 나누고, 각 블록을 목록/인용/제목/문단 중 하나로 렌더링한다. */
export function renderMarkdown(text) {
  if (!text) return null
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => renderBlock(block, `md-${index}`))
}
