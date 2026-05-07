"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contributorRoutes = void 0;
const express_1 = require("express");
const didvc_1 = require("../services/didvc");
const gpg_1 = require("../services/gpg");
const router = (0, express_1.Router)();
exports.contributorRoutes = router;
// Mock GitHub OAuth - just accept username
router.post('/onboard', async (req, res) => {
    try {
        const { githubUsername } = req.body;
        if (!githubUsername) {
            return res.status(400).json({ error: 'GitHub username required' });
        }
        // Generate DID and key pair
        const { did, privateKey, publicKey } = (0, didvc_1.createDID)();
        // Generate GPG key pair (Ed25519)
        const { publicKey: gpgPublicKey, privateKey: gpgPrivateKey, fingerprint } = (0, gpg_1.generateGPGKeyPair)();
        // Issue Verifiable Credential
        const vc = await (0, didvc_1.createVC)({
            githubUsername,
            gpgPublicKeyFingerprint: fingerprint,
            issuedAt: new Date().toISOString(),
            issuerDID: did // Self-issued for prototype
        }, privateKey, did);
        // Store in mock wallet (in-memory for now)
        (0, didvc_1.storeCredential)(did, vc);
        res.json({
            did,
            vc,
            gpgPublicKey,
            gpgFingerprint: fingerprint,
            privateKey: gpgPrivateKey // In real app, never send private keys!
        });
    }
    catch (error) {
        console.error('Onboarding error:', error);
        res.status(500).json({ error: 'Failed to onboard contributor' });
    }
});
