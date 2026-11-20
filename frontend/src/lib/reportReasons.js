export const REPORT_REASONS = [
  { value: 'violence', label: 'Violence or graphic content', hint: 'Fighting, weapons, blood or harm to people' },
  { value: 'nudity', label: 'Nudity or sexual content', hint: 'Explicit or inappropriate images, video or text' },
  { value: 'hate', label: 'Hate speech or harassment', hint: 'Insults, discrimination or bullying' },
  { value: 'misleading', label: 'Misleading or wrong information', hint: 'Steps that are incorrect or unsafe to follow' },
  { value: 'outdated', label: 'Outdated information', hint: 'No longer matches how the machines work' },
  { value: 'spam', label: 'Spam or unrelated', hint: 'Ads, links or content that does not belong here' },
  { value: 'other', label: 'Something else', hint: 'Describe the problem below' },
]

const OLD = { incorrect: 'Incorrect', unsafe: 'Unsafe', duplicate: 'Duplicate' }

export const reasonLabel = (v) => REPORT_REASONS.find((r) => r.value === v)?.label || OLD[v] || v