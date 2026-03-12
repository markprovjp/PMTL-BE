/**
 * Hook to translate enumeration field options using i18n
 * Applies Vietnamese labels to enum dropdowns in Strapi admin
 */

import { useIntl } from 'react-intl'

export const useEnumTranslation = (contentType: string, fieldName: string, enumValues: string[]) => {
  const { formatMessage } = useIntl()

  return enumValues.map((value) => {
    // Try multiple i18n key formats
    const keys = [
      `api::${contentType}.${contentType}.${fieldName}.enum.${value}`,
      `content-manager.content-types.api::${contentType}.${contentType}.${fieldName}.enum.${value}`,
      value,
    ]

    let label = value // fallback to raw value

    for (const key of keys) {
      try {
        const translated = formatMessage({ id: key, defaultMessage: value })
        if (translated !== key) {
          label = translated
          break
        }
      } catch {
        // Continue to next key
      }
    }

    return { value, label }
  })
}
