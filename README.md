# @philiprehberger/react-form-hooks

[![CI](https://github.com/philiprehberger/react-form-hooks/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/react-form-hooks/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/react-form-hooks.svg)](https://www.npmjs.com/package/@philiprehberger/react-form-hooks)
[![License](https://img.shields.io/github/license/philiprehberger/react-form-hooks)](LICENSE)

Lightweight form management hook with Zod validation.

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

## Features

- Zod schema validation with debounced field-level validation
- `getFieldProps()` for easy input binding (handles checkbox, number, text)
- Dirty tracking, touched state, submit handling
- `FormProvider` / `useFormContext` for nested form components
- Common validators: email, password, phone, name, address, URL, slug, etc.

## License

MIT
