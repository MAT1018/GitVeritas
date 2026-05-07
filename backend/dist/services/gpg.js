"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGPGKeyPair = generateGPGKeyPair;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
function generateGPGKeyPair() {
    // Generate Ed25519 key pair (simulating GPG)
    const keyPair = tweetnacl_1.default.sign.keyPair();
    // Create a mock fingerprint (first 8 bytes of public key as hex)
    const fingerprint = Buffer.from(keyPair.publicKey.slice(0, 8)).toString('hex').toUpperCase();
    return {
        publicKey: Buffer.from(keyPair.publicKey).toString('base64'),
        privateKey: Buffer.from(keyPair.secretKey).toString('base64'),
        fingerprint
    };
}
