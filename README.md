# @philiprehberger/react-form-hooks

[![CI](https://github.com/philiprehberger/react-form-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/react-form-hooks/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/react-form-hooks.svg)](https://www.npmjs.com/package/@philiprehberger/react-form-hooks)
[![Last updated](https://img.shields.io/github/last-commit/philiprehberger/react-form-hooks)](https://github.com/philiprehberger/react-form-hooks/commits/main)

Lightweight form management hook with Zod validation

## Installation

```bash
npm install @philiprehberger/react-form-hooks zod
```

## Usage

```tsx
import { useForm, validators } from '@philiprehberger/react-form-hooks';
import { z } from 'zod';

const schema = z.object({
  email: validators.email,
  password: validators.password,
});

function LoginForm() {
  const { errors, handleSubmit, getFieldProps } = useForm({
    schema,
    initialValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(async (values) => { await login(values); })}>
      <input {...getFieldProps('email')} />
      {errors.email && <span>{errors.email}</span>}

      <input type="password" {...getFieldProps('password')} />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Log In</button>
    </form>
  );
}
```

### Features

- Zod schema validation with debounced field-level validation
- `getFieldProps()` for easy input binding (handles checkbox, number, text)
- Dirty tracking, touched state, submit handling
- `FormProvider` / `useFormContext` for nested form components
- Common validators: email, password, phone, name, address, URL, slug, etc

## API

### `useForm(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | `z.ZodObject` | -- | Zod schema for validation |
| `initialValues` | `z.infer<T>` | -- | Initial form values |
| `validateOnChange` | `boolean` | `true` | Validate on value change |
| `validateOnBlur` | `boolean` | `true` | Validate on field blur |
| `debounceMs` | `number` | `300` | Debounce delay for field validation |
| `onSubmitSuccess` | `() => void` | -- | Callback after successful submit |
| `onSubmitError` | `(error: Error) => void` | -- | Callback on submit error |

#### Return value

| Property | Type | Description |
|----------|------|-------------|
| `values` | `z.infer<T>` | Current form values |
| `errors` | `Record<string, string \| null>` | Field error messages |
| `touched` | `Record<string, boolean>` | Fields the user has interacted with |
| `isSubmitting` | `boolean` | Whether the form is submitting |
| `isValid` | `boolean` | Whether all fields pass validation |
| `isDirty` | `boolean` | Whether any field differs from initial values |
| `setValue` | `(field, value) => void` | Set a field value |
| `setTouched` | `(field) => void` | Mark a field as touched |
| `setError` | `(field, error) => void` | Manually set a field error |
| `validateField` | `(field) => Promise<string \| null>` | Validate a single field |
| `validateForm` | `() => Promise<boolean>` | Validate the entire form |
| `resetForm` | `() => void` | Reset to initial values |
| `handleSubmit` | `(onSubmit) => (e) => void` | Submit handler wrapper |
| `getFieldProps` | `(field) => object` | Spread onto input elements for automatic binding |
| `getFieldState` | `(field) => object` | Get value, error, touched, and dirty state for a field |

### `validators`

Pre-built Zod validators: `email`, `password`, `passwordSimple`, `phone`, `phoneRequired`, `name`, `nameOptional`, `price`, `quantity`, `url`, `urlRequired`, `slug`, `rating`, `date`, `futureDate`, `checkbox`, `checkboxRequired`, `textContent(min, max)`, `address`.

### Utilities

| Function | Signature | Description |
|----------|-----------|-------------|
| `makeOptional` | `(schema: z.ZodObject) => z.ZodObject` | Make all fields in a schema optional |
| `pickFields` | `(schema: z.ZodObject, keys: string[]) => z.ZodObject` | Pick specific fields from a schema |
| `FormProvider` | `({ value, children }) => JSX.Element` | Provide form state via React context |
| `useFormContext` | `() => FormContextValue` | Access form state from a descendant component |

## Development

```bash
npm install
npm run build
npm test
```

## Support

If you find this project useful:

⭐ [Star the repo](https://github.com/philiprehberger/react-form-hooks)

🐛 [Report issues](https://github.com/philiprehberger/react-form-hooks/issues?q=is%3Aissue+is%3Aopen+label%3Abug)

💡 [Suggest features](https://github.com/philiprehberger/react-form-hooks/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

❤️ [Sponsor development](https://github.com/sponsors/philiprehberger)

🌐 [All Open Source Projects](https://philiprehberger.com/open-source-packages)

💻 [GitHub Profile](https://github.com/philiprehberger)

🔗 [LinkedIn Profile](https://www.linkedin.com/in/philiprehberger)

## License

[MIT](LICENSE)
