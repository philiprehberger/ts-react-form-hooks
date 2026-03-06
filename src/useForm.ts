import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { z } from 'zod';

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => { fn(...args); timeoutId = null; }, delay);
  }) as T & { cancel: () => void };
  debouncedFn.cancel = () => { if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; } };
  return debouncedFn;
}

export interface UseFormOptions<T extends z.ZodObject<z.ZodRawShape>> {
  schema: T;
  initialValues: z.infer<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
}

export interface UseFormReturn<T extends z.ZodObject<z.ZodRawShape>> {
  values: z.infer<T>;
  errors: Record<keyof z.infer<T>, string | null>;
  touched: Record<keyof z.infer<T>, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof z.infer<T>, value: unknown) => void;
  setTouched: (field: keyof z.infer<T>) => void;
  setError: (field: keyof z.infer<T>, error: string | null) => void;
  validateField: (field: keyof z.infer<T>) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  handleSubmit: (onSubmit: (values: z.infer<T>) => Promise<void>) => (e: React.FormEvent) => void;
  getFieldProps: (field: keyof z.infer<T>) => {
    value: z.infer<T>[keyof z.infer<T>];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
  };
  getFieldState: (field: keyof z.infer<T>) => {
    value: z.infer<T>[keyof z.infer<T>];
    error: string | null;
    touched: boolean;
    isDirty: boolean;
  };
}

/**
 * Form management hook with Zod validation.
 * Supports debounced field validation, dirty tracking, and input binding helpers.
 */
export function useForm<T extends z.ZodObject<z.ZodRawShape>>({
  schema,
  initialValues,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  onSubmitSuccess,
  onSubmitError,
}: UseFormOptions<T>): UseFormReturn<T> {
  type FormValues = z.infer<T>;
  type FieldName = keyof FormValues;

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<FieldName, string | null>>({} as Record<FieldName, string | null>);
  const [touched, setTouchedState] = useState<Record<FieldName, boolean>>({} as Record<FieldName, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedInitialValues] = useState<FormValues>(() => initialValues);

  const validateField = useCallback(
    async (field: FieldName): Promise<string | null> => {
      try {
        const fieldSchema = schema.shape[field as string] as z.ZodTypeAny | undefined;
        if (fieldSchema) await fieldSchema.parseAsync(values[field]);
        setErrors((prev) => ({ ...prev, [field]: null }));
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const message = error.issues[0]?.message || 'Invalid value';
          setErrors((prev) => ({ ...prev, [field]: message }));
          return message;
        }
        return null;
      }
    },
    [schema, values]
  );

  type DebouncedValidateFn = ((field: FieldName) => void) & { cancel: () => void };
  const debouncedValidateRef = useRef<DebouncedValidateFn | null>(null);

  useEffect(() => {
    debouncedValidateRef.current = debounce(
      (field: FieldName) => { validateField(field); },
      debounceMs
    ) as DebouncedValidateFn;
    return () => { debouncedValidateRef.current?.cancel(); };
  }, [validateField, debounceMs]);

  const setValue = useCallback(
    (field: FieldName, value: unknown) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (validateOnChange && touched[field]) debouncedValidateRef.current?.(field);
    },
    [validateOnChange, touched]
  );

  const markTouched = useCallback(
    (field: FieldName) => {
      setTouchedState((prev) => ({ ...prev, [field]: true }));
      if (validateOnBlur) validateField(field);
    },
    [validateOnBlur, validateField]
  );

  const setError = useCallback((field: FieldName, error: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await schema.parseAsync(values);
      setErrors({} as Record<FieldName, string | null>);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string | null> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!newErrors[field]) newErrors[field] = issue.message;
        });
        setErrors(newErrors as Record<FieldName, string | null>);
      }
      return false;
    }
  }, [schema, values]);

  const handleSubmit = useCallback(
    (onSubmit: (values: FormValues) => Promise<void>) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        debouncedValidateRef.current?.cancel();

        const allTouched = Object.keys(initialValues).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<FieldName, boolean>
        );
        setTouchedState(allTouched);

        const valid = await validateForm();
        if (valid) {
          try {
            await onSubmit(values);
            onSubmitSuccess?.();
          } catch (error) {
            onSubmitError?.(error instanceof Error ? error : new Error('Submission failed'));
          }
        }
        setIsSubmitting(false);
      };
    },
    [values, validateForm, initialValues, onSubmitSuccess, onSubmitError]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<FieldName, string | null>);
    setTouchedState({} as Record<FieldName, boolean>);
    setIsSubmitting(false);
    debouncedValidateRef.current?.cancel();
  }, [initialValues]);

  const isValid = useMemo(() => {
    const errorValues = Object.values(errors);
    return errorValues.length === 0 || errorValues.every((e) => e === null);
  }, [errors]);

  const isDirty = useMemo(() => {
    return Object.keys(values).some((key) => values[key as FieldName] !== storedInitialValues[key as FieldName]);
  }, [values, storedInitialValues]);

  const getFieldProps = useCallback(
    (field: FieldName) => ({
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        let newValue: unknown;
        if (target.type === 'checkbox') newValue = (target as HTMLInputElement).checked;
        else if (target.type === 'number') newValue = target.value === '' ? '' : Number(target.value);
        else newValue = target.value;
        setValue(field, newValue);
      },
      onBlur: () => markTouched(field),
      'aria-invalid': !!(touched[field] && errors[field]),
    }),
    [values, touched, errors, setValue, markTouched]
  );

  const getFieldState = useCallback(
    (field: FieldName) => ({
      value: values[field],
      error: errors[field] || null,
      touched: touched[field] || false,
      isDirty: values[field] !== storedInitialValues[field],
    }),
    [values, errors, touched, storedInitialValues]
  );

  return {
    values, errors, touched, isSubmitting, isValid, isDirty,
    setValue, setTouched: markTouched, setError, validateField, validateForm,
    resetForm, handleSubmit, getFieldProps, getFieldState,
  };
}
