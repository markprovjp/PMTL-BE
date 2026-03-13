import * as React from 'react';
import { Field, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { useField } from '@strapi/admin/strapi-admin';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import {
  resolveEnumDisplayLabel,
  shouldTranslateEnumDisplay,
} from '../enum-display-labels';

type EnumerationOption = {
  disabled?: boolean;
  hidden?: boolean;
  label?: string;
  value: string;
};

type EnumerationInputProps = {
  attribute?: {
    enum?: string[];
  };
  disabled?: boolean;
  hint?: React.ReactNode;
  label?: React.ReactNode;
  name: string;
  options?: EnumerationOption[];
  placeholder?: string;
  required?: boolean;
  type: 'enumeration';
};

function getModelFromPathname(pathname: string) {
  const match = pathname.match(/\/content-manager\/(?:collection-types|single-types)\/([^/?]+)/);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

const TranslatedEnumerationInput = React.forwardRef<HTMLDivElement, EnumerationInputProps>(
  ({ attribute, disabled, hint, label, name, options, placeholder, required }, ref) => {
    const { formatMessage } = useIntl();
    const { value, error, onChange } = useField<string | undefined>(name);
    const location = useLocation();
    const model = getModelFromPathname(location.pathname);
    const shouldTranslate = shouldTranslateEnumDisplay(model);

    const normalizedOptions = React.useMemo(() => {
      if (Array.isArray(options) && options.length > 0) {
        return options;
      }

      if (Array.isArray(attribute?.enum)) {
        return attribute.enum.map((enumValue) => ({
          value: enumValue,
        }));
      }

      return [];
    }, [attribute?.enum, options]);

    const translatedOptions = React.useMemo(() => {
      return normalizedOptions
        .filter((option) => !option.hidden)
        .map((option) => ({
          ...option,
          label: shouldTranslate
            ? resolveEnumDisplayLabel(model, name, option.value)
            : (option.label ?? option.value),
        }));
    }, [model, name, normalizedOptions, shouldTranslate]);

    return (
      <Field.Root ref={ref} error={error} name={name} required={required}>
        <Field.Label>{label}</Field.Label>
        <SingleSelect
          value={value}
          onChange={(nextValue) => onChange(name, nextValue)}
          placeholder={
            placeholder ??
            formatMessage({
              id: 'components.InputSelect.option.placeholder',
              defaultMessage: 'Chọn tại đây',
            })
          }
          disabled={disabled}
        >
          {translatedOptions.map((option) => (
            <SingleSelectOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SingleSelectOption>
          ))}
        </SingleSelect>
        <Field.Hint>{hint}</Field.Hint>
        <Field.Error />
      </Field.Root>
    );
  }
);

TranslatedEnumerationInput.displayName = 'TranslatedEnumerationInput';

export { TranslatedEnumerationInput };
