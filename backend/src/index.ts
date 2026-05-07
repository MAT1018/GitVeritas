import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { contributorRoutes } from './routes/contributors';
import { verificationRoutes } from './routes/verification';
import { registryRoutes } from './routes/registry';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contributors', contributorRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/registry', registryRoutes);

// DID Document resolver (stretch goal)
app.get('/api/did/:did', (req, res) => {
  // Mock resolver for did:key
  const did = req.params.did;
  // For simplicity, return a basic DID Document
  res.json({
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    verificationMethod: [{
      id: `${did}#key-1`,
      type: 'Ed25519VerificationKey2020',
      controller: did,
      publicKeyMultibase: did.split(':')[2] // Simplified
    }]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});