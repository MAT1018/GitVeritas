import { Router } from 'express';
import { verifyVC, getCredential } from '../services/didvc';

const router = Router();

// Simulate PR verification
router.post('/verify-pr', async (req, res) => {
  try {
    const { githubUsername, gpgSignature } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username required' });
    }

    // Look up contributor's VC
    const vc = getCredential(githubUsername);
    if (!vc) {
      return res.json({
        verified: false,
        status: 'Verification Failed — No valid credential found',
        explanation: 'Contributor not found in registry or no VC issued'
      });
    }

    // Verify VC signature
    const isVCValid = await verifyVC(vc);
    if (!isVCValid) {
      return res.json({
        verified: false,
        status: 'Verification Failed — Invalid Verifiable Credential',
        explanation: 'VC signature verification failed'
      });
    }

    // Check GPG fingerprint (mock - in real app, verify signature)
    // For prototype, assume signature contains fingerprint
    const vcPayload = JSON.parse(Buffer.from(vc.split('.')[1], 'base64').toString());
    const expectedFingerprint = vcPayload.vc.credentialSubject.gpgPublicKeyFingerprint;

    // Mock check: if signature includes fingerprint, verify
    const signatureValid = gpgSignature && gpgSignature.includes(expectedFingerprint);

    if (!signatureValid) {
      return res.json({
        verified: false,
        status: 'Verification Failed — GPG signature mismatch',
        explanation: 'Commit GPG fingerprint does not match the one in VC'
      });
    }

    res.json({
      verified: true,
      status: `Identity Verified — Contributor DID: ${vcPayload.iss}`,
      explanation: 'VC valid and GPG fingerprint matches'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Failed to verify PR' });
  }
});

export { router as verificationRoutes };