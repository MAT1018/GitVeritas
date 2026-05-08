import React from 'react';

function Explainer() {
  return (
    <div className="animated-rise mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="section-title">How GitVeritas Works</h2>
        <p className="section-subtitle">A cryptographic trust fabric for high-integrity open source contribution.</p>
      </div>

      <section className="glass-panel p-6">
        <h3 className="text-xl font-semibold text-white">DID: Self-owned identity</h3>
        <p className="mt-3 text-sm text-slate-200">
          Decentralized identifiers are portable, cryptographically verifiable IDs controlled by the contributor.
        </p>
        <code className="code-shell mt-3 break-all">did:key:z6MkfrQC9BjPQ1A1J9gGjVL7C9d1ZQ9JzKJ9Vj8QXJGJgQK</code>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white">Verifiable Credential</h3>
          <p className="mt-3 text-sm text-slate-200">Tamper-evident claims signed by a trusted issuer.</p>
          <pre className="code-shell mt-3 overflow-auto">{`{
  "type": ["VerifiableCredential", "ContributorCredential"],
  "issuer": "did:key:...",
  "credentialSubject": { "githubUsername": "johndoe" }
}`}</pre>
        </article>

        <article className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white">Verifiable Presentation</h3>
          <p className="mt-3 text-sm text-slate-200">Contributor submits proof set during verification.</p>
          <pre className="code-shell mt-3 overflow-auto">{`{
  "type": "VerifiablePresentation",
  "verifiableCredential": ["eyJ0eXAiOiJKV1QiLCJhbGciOi..."]
}`}</pre>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel border-rose-300/25 bg-rose-300/10 p-6">
          <h3 className="text-xl font-semibold text-rose-100">Legacy Trust Model</h3>
          <ul className="mt-3 space-y-2 text-sm text-rose-50">
            <li>Relies on mutable account metadata</li>
            <li>Weak cryptographic binding to contributor identity</li>
            <li>Platform-centered trust assumptions</li>
          </ul>
        </div>
        <div className="glass-panel border-emerald-300/25 bg-emerald-300/10 p-6">
          <h3 className="text-xl font-semibold text-emerald-100">DID + VC Trust Model</h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50">
            <li>Portable, user-controlled identity anchors</li>
            <li>Signed and independently verifiable assertions</li>
            <li>End-to-end integrity checks before merge</li>
          </ul>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h3 className="text-xl font-semibold text-white">Verification Flow</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            'Onboard and issue DID + VC',
            'PR triggers verification job',
            'Validate VC signature',
            'Match commit GPG fingerprint',
            'Publish merge-ready status'
          ].map((step, index) => (
            <div key={step} className="rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Step {index + 1}</p>
              <p className="mt-2 text-sm text-slate-100">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Explainer;
