"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDID = createDID;
exports.createVC = createVC;
exports.verifyVC = verifyVC;
exports.storeCredential = storeCredential;
exports.getCredential = getCredential;
exports.getAllCredentials = getAllCredentials;
const did_jwt_1 = require("did-jwt");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
// In-memory storage for prototype
const credentials = {};
function createDID() {
    // Generate Ed25519 key pair
    const keyPair = tweetnacl_1.default.sign.keyPair();
    // Create did:key from public key
    const publicKeyMultibase = Buffer.from([0xed, 0x01, ...keyPair.publicKey]).toString('base64url');
    const did = `did:key:z${publicKeyMultibase}`;
    return {
        did,
        privateKey: keyPair.secretKey,
        publicKey: keyPair.publicKey
    };
}
async function createVC(credentialSubject, privateKey, issuerDID) {
    const signer = (0, did_jwt_1.EdDSASigner)(privateKey);
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
    const vc = await (0, did_jwt_1.createJWT)(vcPayload, { issuer: issuerDID, signer });
    return vc;
}
async function verifyVC(vc) {
    try {
        // For did:key, we need to extract the public key from the DID
        const decoded = (0, did_jwt_1.decodeJWT)(vc);
        const issuerDID = decoded.payload.iss;
        const publicKeyMultibase = issuerDID.split(':')[2];
        const publicKey = Buffer.from(publicKeyMultibase, 'base64url').subarray(2); // Remove multicodec prefix
        const verifier = (0, did_jwt_1.EdDSAVerifier)(publicKey);
        await (0, did_jwt_1.verifyJWT)(vc, { resolver: { resolve: async () => ({ didDocument: { verificationMethod: [{ publicKeyMultibase }] } }) } });
        return true;
    }
    catch (error) {
        console.error('VC verification failed:', error);
        return false;
    }
}
function storeCredential(did, vc) {
    // Extract githubUsername from VC
    const decoded = (0, did_jwt_1.decodeJWT)(vc);
    const githubUsername = decoded.payload.vc.credentialSubject.githubUsername;
    credentials[githubUsername] = { did, vc, githubUsername };
}
function getCredential(githubUsername) {
    return credentials[githubUsername]?.vc;
}
function getAllCredentials() {
    return Object.values(credentials);
}
