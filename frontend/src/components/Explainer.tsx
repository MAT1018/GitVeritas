import React from 'react';

function Explainer() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">How GitVeritas Works</h2>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4">What is a DID (Decentralized Identifier)?</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="mb-2">
              A DID is a unique identifier that is controlled by the entity it identifies.
              Unlike traditional identifiers (email, username), DIDs are:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Self-sovereign:</strong> You control your own identity</li>
              <li><strong>Portable:</strong> Works across different services</li>
              <li><strong>Cryptographically verifiable:</strong> Can prove ownership</li>
            </ul>
            <div className="mt-3">
              <p className="text-sm font-medium">Example DID (did:key):</p>
              <code className="block bg-white p-2 rounded text-xs mt-1">
                did:key:z6MkfrQC9BjPQ1A1J9gGjVL7C9d1ZQ9JzKJ9Vj8QXJGJgQK
              </code>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">What is a Verifiable Credential (VC)?</h3>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="mb-2">
              A VC is a tamper-proof credential containing claims about a subject.
              It's issued by a trusted party and can be verified by anyone.
            </p>
            <div className="mt-3">
              <p className="text-sm font-medium">Example VC Structure:</p>
              <pre className="bg-white p-3 rounded text-xs mt-1 overflow-auto">
{`{
  "vc": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "ContributorCredential"],
    "issuer": "did:key:z6MkfrQC9BjPQ1A1J9gGjVL7C9d1ZQ9JzKJ9Vj8QXJGJgQK",
    "credentialSubject": {
      "githubUsername": "johndoe",
      "gpgPublicKeyFingerprint": "A1B2C3D4E5F67890",
      "issuedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}`}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">What is a Verifiable Presentation (VP)?</h3>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="mb-2">
              A VP is a collection of VCs presented by the subject to prove claims.
              It's like showing your driver's license to prove your age.
            </p>
            <div className="mt-3">
              <p className="text-sm font-medium">Example VP (what a contributor might present):</p>
              <pre className="bg-white p-3 rounded text-xs mt-1 overflow-auto">
{`{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": "VerifiablePresentation",
  "verifiableCredential": [
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9..." // VC JWT
  ]
}`}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Old Way vs New Way</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Old Way: GitHub Email</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Relies on email verification</li>
                <li>• Easy to spoof with fake accounts</li>
                <li>• No cryptographic proof</li>
                <li>• Centralized control</li>
                <li>• Limited to GitHub's trust model</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">New Way: DID + VC</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Cryptographically verifiable identity</li>
                <li>• Self-sovereign (user controls identity)</li>
                <li>• Portable across platforms</li>
                <li>• Tamper-proof credentials</li>
                <li>• Decentralized trust model</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">The Verification Flow</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                <p><strong>Contributor Onboards:</strong> Creates DID, links GPG key, receives VC</p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                <p><strong>PR Submitted:</strong> GitHub webhook triggers verification</p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                <p><strong>VC Verification:</strong> Check VC signature and validity</p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                <p><strong>GPG Check:</strong> Verify commit signature matches VC fingerprint</p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                <p><strong>Status Update:</strong> Green checkmark allows merge</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Explainer;