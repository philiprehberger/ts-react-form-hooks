import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('react-form-hooks', async () => {
  const mod = await import('../../dist/index.js');

  it('exports useForm as a function', () => {
    assert.ok(typeof mod.useForm === 'function');
  });

  it('exports validators as an object', () => {
    assert.ok(typeof mod.validators === 'object');
  });
});
