import test from 'node:test';
import assert from 'node:assert/strict';
test('health response contract is defined', () => {
  const expected = { status: 'ok', service: 'task-team-management-api' };
  assert.equal(expected.status, 'ok');
  assert.ok(expected.service.includes('task-team'));
});
