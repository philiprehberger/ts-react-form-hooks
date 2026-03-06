import { createContext, useContext, type ReactNode } from 'react';
import { type z } from 'zod';

export interface FormContextValue<T extends Record<string, unknown>> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: unknown) => void;
  setTouched: (field: keyof T) => void;
  setError: (field: keyof T, error: string | null) => void;
  validateField: (field: keyof T) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => (e: React.FormEvent) => void;
  getFieldProps: (field: keyof T) => {
    value: unknown;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
  };
}

const FormContext = createContext<FormContextValue<Record<string, unknown>> | undefined>(undefined);

interface FormProviderProps<T extends Record<string, unknown>> {
  value: FormContextValue<T>;
  children: ReactNode;
}

/**
 * Provide form state to descendant components via context.
 */
export function FormProvider<T extends Record<string, unknown>>({
  value,
  children,
}: FormProviderProps<T>) {
  return (
    <FormContext.Provider value={value as FormContextValue<Record<string, unknown>>}>
      {children}
    </FormContext.Provider>
  );
}

/**
 * Access form context from a descendant component.
 */
export function useFormContext<T extends Record<string, unknown>>(): FormContextValue<T> {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used within a FormProvider');
  return context as FormContextValue<T>;
}

export type FormSchema<T> = z.ZodType<T>;
export type FormValues<T extends z.ZodTypeAny> = z.infer<T>;
