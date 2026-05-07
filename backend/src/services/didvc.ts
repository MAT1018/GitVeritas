import { createJWT, verifyJWT, decodeJWT, EdDSASigner, EdDSAVerifier } from 'did-jwt';
import nacl from 'tweetnacl';

// In-memory storage for prototype
const credentials: { [key: string]: { did: string; vc: string; githubUsername: string } } = {};

export function createDID() {
  // Generate Ed25519 key pair
  const keyPair = nacl.sign.keyPair();

  // Create did:key from public key
  const publicKeyMultibase = Buffer.from([0xed, 0x01, ...keyPair.publicKey]).toString('base64url');
  const did = `did:key:z${publicKeyMultibase}`;

  return {
    did,
    privateKey: keyPair.secretKey,
    publicKey: keyPair.publicKey
  };
}

export async function createVC(credentialSubject: any, privateKey: Uint8Array, issuerDID: string) {
  const signer = EdDSASigner(privateKey);

  const vcPayload = {
    sub: issuerDID, // Subject is the contributor's DID
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'ContributorCredential'],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject
    }
  };

  const vc = await createJWT(vcPayload, { issuer: issuerDID, signer });
  return vc;
}

export async function verifyVC(vc: string): Promise<boolean> {
  try {
    // For did:key, we need to extract the public key from the DID
    const decoded = decodeJWT(vc);
    const issuerDID = decoded.payload.iss;
    const publicKeyMultibase = issuerDID.split(':')[2];
    const publicKey = Buffer.from(publicKeyMultibase, 'base64url').subarray(2); // Remove multicodec prefix

    const verifier = EdDSAVerifier(publicKey);
    await verifyJWT(vc, { resolver: { resolve: async () => ({ didDocument: { verificationMethod: [{ publicKeyMultibase }] } }) } });
    return true;
  } catch (error) {
    console.error('VC verification failed:', error);
    return false;
  }
}

export function storeCredential(did: string, vc: string) {
  // Extract githubUsername from VC
  const decoded = decodeJWT(vc);
  const githubUsername = decoded.payload.vc.credentialSubject.githubUsername;
  credentials[githubUsername] = { did, vc, githubUsername };
}

export function getCredential(githubUsername: string) {
  return credentials[githubUsername]?.vc;
}

export function getAllCredentials() {
  return Object.values(credentials);
}