"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const contributors_1 = require("./routes/contributors");
const verification_1 = require("./routes/verification");
const registry_1 = require("./routes/registry");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/contributors', contributors_1.contributorRoutes);
app.use('/api/verification', verification_1.verificationRoutes);
app.use('/api/registry', registry_1.registryRoutes);
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
