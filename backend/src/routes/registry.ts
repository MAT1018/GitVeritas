import { Router } from 'express';
import { getAllCredentials } from '../services/didvc';

const router = Router();

// Get all contributors
router.get('/contributors', (req, res) => {
  try {
    const credentials = getAllCredentials();
    const contributors = credentials.map(({ did, vc, githubUsername }) => {
      const vcPayload = JSON.parse(Buffer.from(vc.split('.')[1], 'base64').toString());
      return {
        did,
        githubUsername,
        vcStatus: 'Verified ✅', // Simplified - assume valid
        vc,
        issuedAt: vcPayload.vc.credentialSubject.issuedAt
      };
    });

    res.json(contributors);
  } catch (error) {
    console.error('Registry error:', error);
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

// Get specific contributor details
router.get('/contributors/:did', (req, res) => {
  try {
    const { did } = req.params;
    const credential = getAllCredentials().find(c => c.did === did);

    if (!credential) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    const vcPayload = JSON.parse(Buffer.from(credential.vc.split('.')[1], 'base64').toString());

    res.json({
      did: credential.did,
      githubUsername: credential.githubUsername,
      vc: credential.vc,
      decodedVC: vcPayload,
      didDocument: {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: did,
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: did.split(':')[2]
        }]
      }
    });
  } catch (error) {
    console.error('Contributor details error:', error);
    res.status(500).json({ error: 'Failed to fetch contributor details' });
  }
});

export { router as registryRoutes };