const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateFine } = require('../dist/src/borrowing/fine-calculator.js');

describe('calculateFine', () => {
  it('charges nothing when returned on the due date', () => {
    assert.equal(calculateFine('2026-01-10', '2026-01-10'), 0);
  });

  it('charges nothing when returned before the due date', () => {
    assert.equal(calculateFine('2026-01-10', '2026-01-08'), 0);
  });

  it('charges the daily rate for each day late', () => {
    assert.equal(calculateFine('2026-01-10', '2026-01-13'), 30);
  });

  it('supports a custom daily rate', () => {
    assert.equal(calculateFine('2026-01-10', '2026-01-12', 25), 50);
  });

  it('rejects invalid dates and negative rates', () => {
    assert.throws(() => calculateFine('not-a-date', '2026-01-12'), RangeError);
    assert.throws(() => calculateFine('2026-01-10', '2026-01-12', -1), RangeError);
  });
});
