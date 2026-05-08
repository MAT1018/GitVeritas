const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Local storage persisted in db.json
let credentials = {};

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ credentials: {} }, null, 2));
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    credentials = data.credentials || {};
  } catch (error) {
    console.error('Failed to load database:', error);
    credentials = {};
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({ credentials }, null, 2));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

loadDatabase();

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
  saveDatabase();

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

app.get('/api/registry/contributors/:did', (req, res) => {
  const { did } = req.params;
  const credential = Object.values(credentials).find((item) => item.did === did);

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
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: did.split(':')[2]
        }
      ]
    }
  });
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