import React from 'react';
import Modal from '../Modal/Modal';
import './JudgeGuideModal.css';

export default function JudgeGuideModal({ isOpen, onClose, navigateTo }) {
  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="SMIT Final Hackathon — Judge Interactive Verification Walkthrough"
    maxWidth="max-w-xl"
  >
    <div className="space-y-3 text-xs text-slate-600">
      <p className="font-medium text-slate-800">
        Use these 1-click shortcuts to test every mandatory rubric requirement in MaintainIQ:
      </p>
      <div className="judge-step">
        <div>
          <div className="font-bold text-slate-900">1. Asset Registry & Duplicate Code Guard</div>
          <div>Try registering an asset with existing code <code>SMIT-AV-001</code> or print QR tags.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigateTo('/assets');
          }}
          className="btn btn-primary btn-sm shrink-0"
        >
          Open Assets
        </button>
      </div>

      <div className="judge-step">
        <div>
          <div className="font-bold text-slate-900">2. Public Mobile QR Scan Page</div>
          <div>View safe public fields for Classroom Projector 01 and submit a guest issue report.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigateTo('/public/assets/ast-proj-01');
          }}
          className="btn btn-primary btn-sm shrink-0"
        >
          Scan QR Demo
        </button>
      </div>

      <div className="judge-step">
        <div>
          <div className="font-bold text-slate-900">3. Deterministic Rule-Based AI Triage Studio</div>
          <div>Test projector/HDMI, AC/leakage, printer, PC, or pump rules & edit before creating an issue.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigateTo('/ai-triage');
          }}
          className="btn btn-primary btn-sm shrink-0"
        >
          Open AI Triage
        </button>
      </div>

      <div className="judge-step">
        <div>
          <div className="font-bold text-slate-900">4. Controlled Work Order Lifecycle & Repair Log</div>
          <div>Inspect ISS-2026-101, log parts & cost, resolve issue, and verify asset returns to Operational.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigateTo('/issues/iss-1001');
          }}
          className="btn btn-primary btn-sm shrink-0"
        >
          Open Work Order
        </button>
      </div>

      <div className="judge-step">
        <div>
          <div className="font-bold text-slate-900">5. Test 404 Not-Found Route</div>
          <div>Verify graceful handling of unknown routes.</div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigateTo('/non-existent-route-404');
          }}
          className="btn btn-secondary btn-sm shrink-0"
        >
          Trigger 404
        </button>
      </div>
    </div>
  </Modal>
  );
}
