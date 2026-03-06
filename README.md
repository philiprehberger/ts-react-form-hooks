# @philiprehberger/react-form-hooks

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
