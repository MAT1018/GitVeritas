import nacl from 'tweetnacl';

export function generateGPGKeyPair() {
  // Generate Ed25519 key pair (simulating GPG)
  const keyPair = nacl.sign.keyPair();

  // Create a mock fingerprint (first 8 bytes of public key as hex)
  const fingerprint = Buffer.from(keyPair.publicKey.slice(0, 8)).toString('hex').toUpperCase();

  return {
    publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
    privateKey: Buffer.from(keyPair.secretKey).toString('base64'),
    fingerprint
  };
}