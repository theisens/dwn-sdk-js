import { authenticate } from '../../src/core/auth.js';
import { DwnErrorCode } from '../../src/core/dwn-error.js';
import { expect } from 'chai';
import { DidDht, UniversalResolver } from '@web5/dids';

describe('Auth', () => {
  describe('authenticate()', () => {
    it('should throw if given JWS is `undefined`', async () => {
      const jws = undefined;
      await expect(authenticate(jws, new UniversalResolver({ didResolvers: [DidDht] }))).to.be.rejectedWith(DwnErrorCode.AuthenticateJwsMissing);
    });
  });
});