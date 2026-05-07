const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage
const credentials = {};

// Mock DID generation
function createDID() {
  // Simple mock DID
  const did = `did:key:z6Mk${Math.random().toString(36).substr(2, 9)}`;
  return { did, privateKey: 'mock', publicKey: 'mock' };
}

// Mock VC creation
function createVC(credentialSubject, privateKey, issuerDID) {
  const vc = {
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'ContributorCredential'],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject
    }
  };
  // Mock JWT
  return `eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9.${Buffer.from(JSON.stringify(vc)).toString('base64')}.mocksignature`;
}

// Mock verification
function verifyVC(vc) {
  return true; // Mock
}

// Routes
app.post('/api/contributors/onboard', (req, res) => {
  const { githubUsername } = req.body;
  if (!githubUsername) return res.status(400).json({ error: 'GitHub username required' });

  const { did } = createDID();
  const vc = createVC({
    githubUsername,
    gpgPublicKeyFingerprint: 'A1B2C3D4',
    issuedAt: new Date().toISOString()
  }, 'mock', did);

  credentials[githubUsername] = { did, vc, githubUsername };

  res.json({ did, vc, gpgFingerprint: 'A1B2C3D4' });
});

app.get('/api/registry/contributors', (req, res) => {
  const contributors = Object.values(credentials).map(({ did, vc, githubUsername }) => ({
    did,
    githubUsername,
    vcStatus: 'Verified ✅',
    vc,
    issuedAt: new Date().toISOString()
  }));
  res.json(contributors);
});

app.post('/api/verification/verify-pr', (req, res) => {
  const { githubUsername } = req.body;
  const vc = credentials[githubUsername]?.vc;
  if (!vc) {
    return res.json({
      verified: false,
      status: 'Verification Failed — No valid credential found'
    });
  }
  res.json({
    verified: true,
    status: `Identity Verified — Contributor DID: ${credentials[githubUsername].did}`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});