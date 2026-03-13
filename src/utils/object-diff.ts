const DEFAULT_IGNORED_KEYS = new Set([
  'updatedAt',
  'createdAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'localizations',
  'locale',
]);

export function getChangedTopLevelFields(
  beforeValue: Record<string, unknown> | null | undefined,
  afterValue: Record<string, unknown> | null | undefined,
  ignoredKeys: Iterable<string> = DEFAULT_IGNORED_KEYS
): string[] {
  const ignored = new Set(ignoredKeys);
  const keys = new Set<string>([
    ...Object.keys(beforeValue ?? {}),
    ...Object.keys(afterValue ?? {}),
  ]);

  return Array.from(keys)
    .filter((key) => !ignored.has(key))
    .filter((key) => JSON.stringify(beforeValue?.[key]) !== JSON.stringify(afterValue?.[key]))
    .sort();
}
