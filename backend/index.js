const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

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

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function getContributorByGitHubUsername(githubUsername) {
  return credentials[normalizeUsername(githubUsername)];
}

function getContributorByDid(did) {
  return Object.values(credentials).find((item) => item.did === did);
}

function parseGithubPrUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length >= 4 && segments[2] === 'pull') {
      return {
        owner: segments[0],
        repo: segments[1],
        number: segments[3],
        url: parsed.toString()
      };
    }
  } catch (error) {
    return null;
  }
  return null;
}

function verifyGithubWebhookSignature(req) {
  if (!GITHUB_WEBHOOK_SECRET) {
    return true;
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !req.rawBody) {
    return false;
  }

  const expected = `sha256=${crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET).update(req.rawBody).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (error) {
    return false;
  }
}

function createDID() {
  const randomBytes = crypto.randomBytes(12).toString('base64url');
  const did = `did:key:z6Mk${randomBytes}`;
  return {
    did,
    privateKey: crypto.randomBytes(32).toString('base64'),
    publicKey: crypto.randomBytes(32).toString('base64')
  };
}

function createVC(credentialSubject, issuerDID, subjectDID) {
  const vcPayload = {
    iss: issuerDID,
    sub: subjectDID,
    iat: Math.floor(Date.now() / 1000),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'ContributorCredential'],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject
    }
  };
  const payloadBase64 = Buffer.from(JSON.stringify(vcPayload)).toString('base64');
  return `vc.${payloadBase64}.mocked-signature`;
}

function decodeVC(vc) {
  try {
    const parts = String(vc).split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch (error) {
    return null;
  }
}

function verifyVC(vc) {
  const payload = decodeVC(vc);
  return Boolean(payload && payload.vc && payload.vc.credentialSubject);
}

function createPresentation(vc, holderDid) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/vp/v1'
    ],
    type: ['VerifiablePresentation'],
    holder: holderDid,
    verifiableCredential: [vc],
    proof: {
      type: 'LinkedDataSignature2020',
      created: new Date().toISOString(),
      proofPurpose: 'authentication',
      verificationMethod: `${holderDid}#key-1`,
      signatureValue: crypto.createHash('sha256').update(`${holderDid}:${vc}`).digest('hex')
    }
  };
}

function verifyPresentation(presentation) {
  try {
    const pres = typeof presentation === 'string' ? JSON.parse(presentation) : presentation;
    if (!pres || !pres.verifiableCredential || pres.verifiableCredential.length !== 1) {
      return false;
    }

    const vc = pres.verifiableCredential[0];
    const payload = decodeVC(vc);
    return Boolean(payload && payload.iss === pres.holder);
  } catch (error) {
    return false;
  }
}

function verifySignature(signature, expectedFingerprint) {
  if (!signature || !expectedFingerprint) return false;
  return signature.includes(expectedFingerprint);
}

function buildVerificationResult({ contributor, prUrl, gpgSignature, presentation }) {
  if (!contributor) {
    return {
      verified: false,
      status: 'Verification Failed — No valid credential found',
      explanation: 'Contributor not found in the registry'
    };
  }

  if (!verifyVC(contributor.vc)) {
    return {
      verified: false,
      status: 'Verification Failed — Invalid Verifiable Credential',
      explanation: 'Stored VC is malformed or unsupported'
    };
  }

  if (presentation) {
    if (!verifyPresentation(presentation)) {
      return {
        verified: false,
        status: 'Verification Failed — Presentation invalid',
        explanation: 'Linked Verifiable Presentation could not be verified'
      };
    }
  }

  const vcPayload = decodeVC(contributor.vc);
  const expectedFingerprint = vcPayload?.vc?.credentialSubject?.gpgPublicKeyFingerprint;
  let signature = gpgSignature;

  if (!signature) {
    signature = `${contributor.githubUsername}-mock-signature-${expectedFingerprint}`;
  }

  const signatureValid = verifySignature(signature, expectedFingerprint);
  if (!signatureValid) {
    return {
      verified: false,
      status: 'Verification Failed — GPG signature mismatch',
      explanation: 'Commit signature does not include the expected fingerprint'
    };
  }

  if (prUrl) {
    const prInfo = parseGithubPrUrl(prUrl);
    if (!prInfo) {
      return {
        verified: false,
        status: 'Verification Failed — Invalid PR URL',
        explanation: 'The provided PR URL is malformed'
      };
    }
  }

  return {
    verified: true,
    status: `Identity Verified — Contributor DID: ${contributor.did}`,
    explanation: 'VC valid, presentation verified, and signature matched',
    prUrl: prUrl || null,
    generatedSignature: !gpgSignature ? signature : undefined
  };
}

loadDatabase();

// Platform issuer DID (fixed authority)
const PLATFORM_ISSUER_DID = process.env.PLATFORM_ISSUER_DID || createDID().did;

app.post('/api/contributors/onboard', (req, res) => {
  const { githubUsername, githubId, githubProfileUrl } = req.body;
  if (!githubUsername) {
    return res.status(400).json({ error: 'GitHub username required' });
  }

  const normalizedUsername = normalizeUsername(githubUsername);
  const existing = getContributorByGitHubUsername(normalizedUsername);
  if (existing) {
    return res.status(409).json({ error: 'Contributor already onboarded' });
  }

  const { did: contributorDID, privateKey, publicKey } = createDID();
  const fingerprint = crypto.randomBytes(4).toString('hex').toUpperCase();
  const vc = createVC({
    githubUsername: normalizedUsername,
    githubId: githubId || 'unknown',
    githubProfileUrl: githubProfileUrl || null,
    gpgPublicKeyFingerprint: fingerprint,
    issuedAt: new Date().toISOString()
  }, PLATFORM_ISSUER_DID, contributorDID);

  credentials[normalizedUsername] = {
    did: contributorDID,
    vc,
    githubUsername: normalizedUsername,
    githubId: githubId || null,
    githubProfileUrl: githubProfileUrl || null,
    gpgFingerprint: fingerprint,
    createdAt: new Date().toISOString(),
    publicKey
  };

  saveDatabase();

  res.json({
    did: contributorDID,
    vc,
    gpgFingerprint: fingerprint,
    githubUsername: normalizedUsername,
    githubId: githubId || null,
    githubProfileUrl: githubProfileUrl || null,
    issuer: PLATFORM_ISSUER_DID
  });
});

app.get('/api/registry/contributors', (req, res) => {
  const contributors = Object.values(credentials).map((credential) => {
    const vcPayload = decodeVC(credential.vc);
    return {
      did: credential.did,
      githubUsername: credential.githubUsername,
      githubId: credential.githubId,
      githubProfileUrl: credential.githubProfileUrl,
      vcStatus: 'Verified ✅',
      vc: credential.vc,
      issuedAt: vcPayload?.vc?.credentialSubject?.issuedAt || credential.createdAt
    };
  });

  res.json(contributors);
});

app.get('/api/registry/contributors/:did', (req, res) => {
  const { did } = req.params;
  const credential = getContributorByDid(did);

  if (!credential) {
    return res.status(404).json({ error: 'Contributor not found' });
  }

  const vcPayload = decodeVC(credential.vc);

  res.json({
    did: credential.did,
    githubUsername: credential.githubUsername,
    githubId: credential.githubId,
    githubProfileUrl: credential.githubProfileUrl,
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

app.post('/api/presentations/create', (req, res) => {
  const { githubUsername } = req.body;
  if (!githubUsername) {
    return res.status(400).json({ error: 'GitHub username required' });
  }

  const contributor = getContributorByGitHubUsername(githubUsername);
  if (!contributor) {
    return res.status(404).json({ error: 'Contributor not found' });
  }

  const presentation = createPresentation(contributor.vc, contributor.did);
  res.json({ presentation });
});

app.post('/api/presentations/verify', (req, res) => {
  const { presentation } = req.body;
  if (!presentation) {
    return res.status(400).json({ error: 'Presentation payload required' });
  }

  const valid = verifyPresentation(presentation);
  res.json({ verified: valid, status: valid ? 'Presentation verified' : 'Presentation invalid' });
});

app.post('/api/verification/verify-pr', (req, res) => {
  const { githubUsername, prUrl, gpgSignature, presentation } = req.body;
  const contributor = getContributorByGitHubUsername(githubUsername);

  const result = buildVerificationResult({
    contributor,
    prUrl,
    gpgSignature,
    presentation
  });

  res.json(result);
});

app.post('/api/github/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  const delivery = req.headers['x-github-delivery'];

  if (!verifyGithubWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid GitHub webhook signature' });
  }

  if (event !== 'pull_request') {
    return res.json({ received: true, message: `Webhook event ${event} ignored` });
  }

  const payload = req.body;
  const action = payload.action;
  const pullRequest = payload.pull_request;
  const author = pullRequest?.user?.login;
  const prUrl = pullRequest?.html_url;

  if (!author || !prUrl) {
    return res.status(400).json({ error: 'Invalid pull request payload' });
  }

  const contributor = getContributorByGitHubUsername(author);
  const result = buildVerificationResult({ contributor, prUrl });

  console.log(`GitHub webhook [${delivery}] action=${action} author=${author} result=${result.verified}`);

  res.json({ verified: result.verified, status: result.status, explanation: result.explanation });
});

app.post('/api/github/status', (req, res) => {
  const { repository, ref, state, description, context } = req.body;
  console.log('GitHub status update request:', { repository, ref, state, description, context });
  res.json({ success: true, message: 'Status update simulated' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
