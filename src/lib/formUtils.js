export const textOrUndefined = (value) => {
  const trimmed = (value ?? '').toString().trim();
  return trimmed === '' ? undefined : trimmed;
};

export const numberOrUndefined = (value) => {
  const trimmed = (value ?? '').toString().trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const partsToArray = (value) =>
  (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

export const arrayToParts = (value) => (Array.isArray(value) ? value.join(', ') : '');