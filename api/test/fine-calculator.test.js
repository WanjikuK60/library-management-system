const { calculateFine } = require('../dist/src/borrowing/fine-calculator.js');

describe('calculateFine', () => {
  it('charges nothing when returned on the due date', () => {
    expect(calculateFine('2026-01-10', '2026-01-10')).toBe(0);
  });

  it('charges nothing when returned before the due date', () => {
    expect(calculateFine('2026-01-10', '2026-01-08')).toBe(0);
  });

  it('charges the daily rate for each day late', () => {
    expect(calculateFine('2026-01-10', '2026-01-13')).toBe(30);
  });

  it('supports a custom daily rate', () => {
    expect(calculateFine('2026-01-10', '2026-01-12', 25)).toBe(50);
  });

  it('rejects invalid dates and negative rates', () => {
    expect(() => calculateFine('not-a-date', '2026-01-12')).toThrow(RangeError);
    expect(() => calculateFine('2026-01-10', '2026-01-12', -1)).toThrow(RangeError);
  });
});
