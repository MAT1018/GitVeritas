import { Router } from 'express';
import { createDID, createVC, storeCredential } from '../services/didvc';
import { generateGPGKeyPair } from '../services/gpg';

const router = Router();

// Mock GitHub OAuth - just accept username
router.post('/onboard', async (req, res) => {
  try {
    const { githubUsername } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username required' });
    }

    // Generate DID and key pair
    const { did, privateKey, publicKey } = createDID();

    // Generate GPG key pair (Ed25519)
    const { publicKey: gpgPublicKey, privateKey: gpgPrivateKey, fingerprint } = generateGPGKeyPair();

    // Issue Verifiable Credential
    const vc = await createVC({
      githubUsername,
      gpgPublicKeyFingerprint: fingerprint,
      issuedAt: new Date().toISOString(),
      issuerDID: did // Self-issued for prototype
    }, privateKey, did);

    // Store in mock wallet (in-memory for now)
    storeCredential(did, vc);

    res.json({
      did,
      vc,
      gpgPublicKey,
      gpgFingerprint: fingerprint,
      privateKey: gpgPrivateKey // In real app, never send private keys!
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to onboard contributor' });
  }
});

export { router as contributorRoutes };