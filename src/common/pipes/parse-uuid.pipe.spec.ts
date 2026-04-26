import { describe, it, expect, beforeEach } from 'vitest';
import { ParseUuidPipe } from './parse-uuid.pipe';
import { ValidationError } from '../errors/app.error';

const VALID_UUID = 'c1a7f6b2-5e3d-4a9c-9f2a-8d7b1c0e6f45';
const INVALID_UUID = 'wrong_uuid';

describe('ParseUuidPipe', () => {
  let pipe: ParseUuidPipe;

  beforeEach(() => {
    pipe = new ParseUuidPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return the value when UUID is valid', () => {
    expect(pipe.transform(VALID_UUID)).toBe(VALID_UUID);
  });

  it('should throw ValidationError for a random string', () => {
    expect(() => pipe.transform(INVALID_UUID)).toThrow(ValidationError);
  });

  it('should throw ValidationError for an empty string', () => {
    expect(() => pipe.transform('')).toThrow(ValidationError);
  });

  it('should throw ValidationError for UUID v1 not v4 version', () => {
    expect(() =>
      pipe.transform('550e8400-e29b-11d4-a716-446655440000'),
    ).toThrow(ValidationError);
  });

  it('should throw ValidationError for UUID without dashes', () => {
    expect(() => pipe.transform('c1a7f6b25e3d4a9c9f2a8d7b1c0e6f45')).toThrow(
      ValidationError,
    );
  });

  it('should include the invalid value in the error message', () => {
    expect(() => pipe.transform(INVALID_UUID)).toThrow(
      `"${INVALID_UUID}" is not a valid UUID`,
    );
  });
});
