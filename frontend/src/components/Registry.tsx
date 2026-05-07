import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface Contributor {
  did: string;
  githubUsername: string;
  vcStatus: string;
  vc: string;
  issuedAt: string;
}

interface RegistryProps {
  contributors: Contributor[];
}

function Registry({ contributors }: RegistryProps) {
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleViewDetails = async (contributor: Contributor) => {
    setSelectedContributor(contributor);
    try {
      const response = await axios.get(`${API_BASE}/registry/contributors/${contributor.did}`);
      setDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Contributor Registry</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Contributors</h3>
          <div className="space-y-2">
            {contributors.length === 0 ? (
              <p className="text-gray-500">No contributors yet. Start by onboarding!</p>
            ) : (
              contributors.map((contributor) => (
                <div
                  key={contributor.did}
                  onClick={() => handleViewDetails(contributor)}
                  className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{contributor.githubUsername}</p>
                    <p className="text-sm text-gray-600 truncate">{contributor.did}</p>
                  </div>
                  <span className="text-green-600 font-medium">{contributor.vcStatus}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Trust Chain</h3>
          {details ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700">ISSUER DID</h4>
                <code className="block bg-blue-50 p-2 rounded text-xs break-all">
                  {details.did}
                </code>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div>
                <h4 className="font-medium text-sm text-gray-700">VERIFIABLE CREDENTIAL</h4>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>Subject:</strong> {details.decodedVC.sub}
                  </p>
                  <p className="text-sm">
                    <strong>GitHub:</strong> {details.decodedVC.vc.credentialSubject.githubUsername}
                  </p>
                  <p className="text-sm">
                    <strong>GPG Fingerprint:</strong> {details.decodedVC.vc.credentialSubject.gpgPublicKeyFingerprint}
                  </p>
                </div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div>
                <h4 className="font-medium text-sm text-gray-700">CONTRIBUTOR DID</h4>
                <code className="block bg-purple-50 p-2 rounded text-xs break-all">
                  {details.did}
                </code>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a contributor to view the trust chain</p>
          )}
        </div>
      </div>

      {details && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">DID Document</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(details.didDocument, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Decoded VC Payload</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(details.decodedVC, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registry;