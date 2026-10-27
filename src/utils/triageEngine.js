// Deterministic rule-based AI triage engine (original section 3)

export const TRIAGE_RULES = [
  {
    id: 'projector_hdmi',
    keywords: ['projector', 'hdmi', 'display', 'screen', 'flicker', 'purple', 'lamp', 'no signal', 'lens', 'beamer'],
    category: 'AV & Classroom Tech',
    priority: 'High',
    titlePrefix: 'AV Projection & Signal Integrity Fault',
    possibleCauses: [
      'Damaged or bent HDMI connector pins or degraded long-run HDMI cable (>10m)',
      'Optical polarizer heat degradation or projector lamp approaching end-of-life hours',
      'EDID resolution/refresh handshake failure between presenter laptop and scaler'
    ],
    safeInitialChecks: [
      'Test using a verified 2-meter HDMI patch cord directly into Input HDMI-1',
      'Inspect the projector air intake filter for dust buildup causing thermal throttling',
      'Force laptop display settings to 1920x1080 at 60Hz duplicate mode'
    ],
    safetyNotice: 'Do not look directly into the projector lens beam while powered on, and allow the cooling fan to finish before unplugging.'
  },
  {
    id: 'ac_leakage',
    keywords: ['ac', 'air conditioner', 'leak', 'leaking', 'water', 'drip', 'cooling', 'warm', 'hvac', 'split', 'ice', 'compressor'],
    category: 'HVAC & Climate Control',
    priority: 'High',
    titlePrefix: 'HVAC Condensate Drainage / Cooling Performance Issue',
    possibleCauses: [
      'Biofilm or dust blockage inside the PVC condensate drain pan and gravity hose',
      'Blocked return air nylon mesh filters causing evaporator coil icing and overflow',
      'Low refrigerant charge or faulty capacitor on outdoor condenser unit'
    ],
    safeInitialChecks: [
      'Switch off the AC wall breaker immediately if water is dripping near power outlets or computers',
      'Open the front panel and inspect the removable dust filters for heavy clogging',
      'Check if the outdoor condensate drain pipe is discharging water freely'
    ],
    safetyNotice: 'SAFETY WARNING: Water dripping near electrical trunking creates a shock and short-circuit hazard. Isolate power before inspection.'
  },
  {
    id: 'printer_paper',
    keywords: ['printer', 'paper', 'jam', 'toner', 'streak', 'duplex', 'tray', 'print', 'spooler', 'roller'],
    category: 'Office Equipment',
    priority: 'Low',
    titlePrefix: 'Laser Printer Feed & Paper Path Obstruction',
    possibleCauses: [
      'Worn or glazed rubber pickup and separation rollers in main paper cassette',
      'High-humidity paper curl or misaligned paper width/length tray guides',
      'Toner scatter or torn paper fragment blocking optical registration sensors'
    ],
    safeInitialChecks: [
      'Remove the paper stack, fan the sheets, and reload with tray guides snug against the edges',
      'Open the rear access door and gently pull any jammed sheet in the direction of paper travel',
      'Wipe rubber pickup rollers with a lint-free microfiber cloth dampened with water'
    ],
    safetyNotice: 'CAUTION: The internal fuser assembly reaches 190°C during operation. Wait 15 minutes after powering off before touching internal rollers.'
  },
  {
    id: 'computer_slow',
    keywords: ['computer', 'pc', 'workstation', 'slow', 'freeze', 'lag', 'boot', 'docker', 'blue screen', 'bsod', 'overheat', 'fan', 'ram'],
    category: 'IT & Lab Computing',
    priority: 'Medium',
    titlePrefix: 'Workstation Performance Degradation & Thermal Throttling',
    possibleCauses: [
      'CPU thermal paste degradation or dust-impacted heatsink causing thermal throttling',
      'System SSD nearing 95%+ capacity from container images, temp logs, or swap thrashing',
      'Failing memory module or corrupted OS background service'
    ],
    safeInitialChecks: [
      'Open Task Manager / Resource Monitor to verify CPU clock speed, temperature, and disk usage',
      'Clear unused Docker volumes/caches and verify at least 15% free NVMe disk space',
      'Confirm front intake and rear exhaust chassis fans are spinning smoothly without rattle'
    ],
    safetyNotice: 'Always shut down and unplug the power cord and wear an ESD ground strap before opening the computer chassis.'
  },
  {
    id: 'pump_noise',
    keywords: ['pump', 'noise', 'grinding', 'motor', 'water tank', 'pressure', 'impeller', 'bearing', 'vibration', 'leakage', 'valve'],
    category: 'Plumbing & Utilities',
    priority: 'Critical',
    titlePrefix: 'Centrifugal Water Pump Mechanical / Bearing Fault',
    possibleCauses: [
      'Seized rotor drive-end ball bearing or worn silicon-carbide mechanical shaft seal',
      'Suction line air ingress or empty underground tank causing impeller cavitation',
      'Phase imbalance or thermal overload relay tripping under locked-rotor current'
    ],
    safeInitialChecks: [
      'STOP EQUIPMENT: Turn off the pump isolator switch immediately to prevent motor winding burnout',
      'Verify water level in the primary underground suction reservoir',
      'Visually inspect the pump baseplate for shaft seal water weepage without touching moving shafts'
    ],
    safetyNotice: 'CRITICAL SAFETY ALERT: Lock out the 3-phase electrical supply before approaching the pump. Never touch rotating shaft couplings.'
  },
  {
    id: 'elevator_safety',
    keywords: ['elevator', 'lift', 'door', 'stuck', 'cabin', 'floor', 'alarm', 'jerk', 'leveling', 'hoist', 'spark', 'smoke', 'fire'],
    category: 'Vertical Transport & Safety',
    priority: 'Critical',
    titlePrefix: 'Vertical Transport / Electrical Safety Hazard',
    possibleCauses: [
      'Infrared door safety curtain misalignment or landing door interlock contact fault',
      'VFD drive leveling encoder drift or brake contactor wear',
      'Electrical control panel fault requiring certified OEM lift engineer'
    ],
    safeInitialChecks: [
      'EVACUATE / BARRICADE: Place "Out of Service" cones at all landing doors immediately',
      'Confirm via cabin intercom whether any passengers are inside before switching off main power',
      'Contact certified elevator/electrical engineering contractor — do not attempt DIY repair'
    ],
    safetyNotice: 'HAZARD WARNING: Stop using this equipment immediately. Barricade the area and contact a certified safety technician.'
  }
];

export function runTriageAnalysis({ complaintText = '', asset = null, existingIssues = [] }) {
  const trimmed = String(complaintText || '').trim();
  if (trimmed.length < 10) {
    return {
      ok: false,
      error: 'Please enter a detailed complaint description (at least 10 characters) so the diagnostic engine can analyze symptoms.'
    };
  }

  const normalized = trimmed.toLowerCase();
  const combinedContext = `${normalized} ${asset ? (asset.name + ' ' + asset.category + ' ' + asset.model).toLowerCase() : ''}`;

  let matchedRule = null;
  let maxHits = 0;

  for (const rule of TRIAGE_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) hits += 2;
      else if (combinedContext.includes(kw)) hits += 1;
    }
    if (hits > maxHits) {
      maxHits = hits;
      matchedRule = rule;
    }
  }

  let recurringWarning = null;
  if (asset) {
    const assetIssues = existingIssues.filter((iss) => iss.assetId === asset.id);
    if (assetIssues.length >= 2) {
      recurringWarning = `Recurring Pattern Detected: ${asset.name} (${asset.assetCode}) has ${assetIssues.length} historical issues on record. Consider a full preventive overhaul.`;
    } else if (assetIssues.length === 1) {
      recurringWarning = `Asset History Note: ${asset.name} has 1 prior logged issue (${assetIssues[0].issueNumber}: "${assetIssues[0].title}"). Check if the root cause is related.`;
    }
  }

  const hasSafetyHazard = ['spark', 'smoke', 'fire', 'shock', 'burning', 'smell', 'stuck', 'grinding', 'seized', 'flood'].some(
    (hazardKw) => normalized.includes(hazardKw)
  );

  if (!matchedRule) {
    const snippet = trimmed.length > 48 ? trimmed.slice(0, 48).trim() + '...' : trimmed;
    return {
      ok: true,
      suggestion: {
        isSimulatedDemo: true,
        ruleMatched: 'generic_fallback',
        confidenceLabel: 'General Diagnostic Heuristics (Fallback Rule)',
        suggestedTitle: asset ? `${asset.name}: ${snippet}` : `Facility Maintenance Request: ${snippet}`,
        suggestedCategory: asset?.category || 'Office Equipment',
        suggestedPriority: hasSafetyHazard ? 'Critical' : 'Medium',
        possibleCauses: [
          'Normal mechanical wear, loose fastener/connector, or calibration drift',
          'Environmental dust, moisture, or power supply fluctuation at location',
          'Component nearing scheduled preventive service interval'
        ],
        safeInitialChecks: [
          'Visually inspect the exterior of the asset for obvious physical damage or loose cables',
          'Verify power indicator LEDs and confirm wall socket / breaker status',
          'Document the exact error code or symptom timing for the assigned technician'
        ],
        recurringWarning,
        safetyNotice: hasSafetyHazard
          ? 'SAFETY WARNING: Your report mentions potential electrical, thermal, or mechanical hazards. Stop using the equipment immediately, isolate power if safe, and await a qualified technician.'
          : 'Standard precaution: Do not open sealed equipment enclosures unless you are an authorized technician.'
      }
    };
  }

  const assetPrefix = asset ? `${asset.name} — ` : '';
  return {
    ok: true,
    suggestion: {
      isSimulatedDemo: true,
      ruleMatched: matchedRule.id,
      confidenceLabel: `Deterministic Rule Match (${matchedRule.id.replace('_', '/').toUpperCase()})`,
      suggestedTitle: `${assetPrefix}${matchedRule.titlePrefix}`,
      suggestedCategory: asset?.category || matchedRule.category,
      suggestedPriority: hasSafetyHazard ? 'Critical' : matchedRule.priority,
      possibleCauses: [...matchedRule.possibleCauses],
      safeInitialChecks: [...matchedRule.safeInitialChecks],
      recurringWarning,
      safetyNotice: matchedRule.safetyNotice
    }
  };
}
