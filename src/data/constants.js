// Seed data & shared constants (original section 1)

export const STORAGE_VERSION = 'maintainiq_v1.3_smit';
export const STORAGE_KEY = 'maintainiq_platform_store';

export const TECHNICIANS = [
  { id: 'tech-01', name: 'Bilal Ahmed', specialty: 'HVAC & Mechanical', badge: 'Sr. Technician' },
  { id: 'tech-02', name: 'Sara Khan', specialty: 'IT, AV & Electronics', badge: 'Lead Systems Tech' },
  { id: 'tech-03', name: 'Usman Tariq', specialty: 'Electrical & Elevators', badge: 'Certified Electrician' },
  { id: 'tech-04', name: 'Zainab Raza', specialty: 'Plumbing & Pumps', badge: 'Facilities Specialist' }
];

export const ASSET_CATEGORIES = [
  'AV & Classroom Tech',
  'HVAC & Climate Control',
  'IT & Lab Computing',
  'Office Equipment',
  'Vertical Transport & Safety',
  'Plumbing & Utilities',
  'Electrical Infrastructure'
];

export const ASSET_STATUSES = [
  'Operational',
  'Issue Reported',
  'Under Inspection',
  'Under Maintenance',
  'Out of Service',
  'Retired'
];

export const ASSET_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

export const ISSUE_STATUSES = [
  'Reported',
  'Assigned',
  'Inspection Started',
  'Maintenance In Progress',
  'Waiting for Parts',
  'Resolved',
  'Closed',
  'Reopened'
];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ALLOWED_TRANSITIONS = {
  'Reported': ['Assigned', 'Inspection Started', 'Maintenance In Progress'],
  'Assigned': ['Inspection Started', 'Maintenance In Progress', 'Waiting for Parts'],
  'Inspection Started': ['Maintenance In Progress', 'Waiting for Parts', 'Resolved'],
  'Maintenance In Progress': ['Waiting for Parts', 'Resolved'],
  'Waiting for Parts': ['Maintenance In Progress', 'Resolved'],
  'Resolved': ['Closed', 'Reopened'],
  'Closed': ['Reopened'],
  'Reopened': ['Assigned', 'Inspection Started', 'Maintenance In Progress', 'Resolved']
};

export const INITIAL_SETTINGS = {
  organizationName: 'SMIT Main Campus Facilities',
  campusLocation: 'Bahadurabad & Gulshan Campus, Karachi',
  isDemoSeed: true
};

export const INITIAL_ASSETS = [
  {
    id: 'ast-proj-01',
    assetCode: 'SMIT-AV-001',
    name: 'Classroom Projector 01',
    category: 'AV & Classroom Tech',
    model: 'Epson EB-2250U WUXGA 5000L',
    location: 'Block A — Auditorium Lab 101',
    condition: 'Fair',
    status: 'Issue Reported',
    lastServiceDate: '2026-08-14',
    nextServiceDate: '2026-11-14',
    assignedTechnician: 'Sara Khan',
    createdAt: '2026-01-10T09:00:00Z',
    publicDescription: 'Ceiling-mounted 5000-lumen projector serving Lab 101 lectures and hackathon presentations. Connect via podium HDMI port 1.'
  },
  {
    id: 'ast-ac-02',
    assetCode: 'SMIT-HVAC-002',
    name: 'Air Conditioner 02',
    category: 'HVAC & Climate Control',
    model: 'Gree 2.0 Ton Inverter Split (GS-24PITH)',
    location: 'Block B — Web & Mobile Lab 204',
    condition: 'Poor',
    status: 'Under Maintenance',
    lastServiceDate: '2026-06-20',
    nextServiceDate: '2026-10-15',
    assignedTechnician: 'Bilal Ahmed',
    createdAt: '2026-01-12T10:30:00Z',
    publicDescription: '2-Ton DC Inverter split cooling unit located on the east wall of Lab 204. Keep thermostat between 22°C and 24°C.'
  },
  {
    id: 'ast-comp-03',
    assetCode: 'SMIT-IT-003',
    name: 'Lab Computer 03',
    category: 'IT & Lab Computing',
    model: 'Dell OptiPlex 7090 Tower (Core i7 / 32GB)',
    location: 'Block A — AI & Data Science Lab 102',
    condition: 'Good',
    status: 'Under Inspection',
    lastServiceDate: '2026-09-05',
    nextServiceDate: '2026-12-05',
    assignedTechnician: 'Sara Khan',
    createdAt: '2026-02-01T08:15:00Z',
    publicDescription: 'Workstation #03 in Row 1 of the AI Lab. Pre-configured with Node.js, Python, Docker, and VS Code for student sessions.'
  },
  {
    id: 'ast-prn-04',
    assetCode: 'SMIT-OFC-004',
    name: 'Office Printer 04',
    category: 'Office Equipment',
    model: 'HP LaserJet Pro MFP M428fdw',
    location: 'Admin Block — Ground Floor Reception',
    condition: 'Excellent',
    status: 'Operational',
    lastServiceDate: '2026-10-02',
    nextServiceDate: '2027-01-02',
    assignedTechnician: 'Sara Khan',
    createdAt: '2026-02-14T11:00:00Z',
    publicDescription: 'High-speed duplex monochrome laser multifunction printer for admission slips, student certificates, and faculty worksheets.'
  },
  {
    id: 'ast-elev-05',
    assetCode: 'SMIT-VTS-005',
    name: 'Elevator 05',
    category: 'Vertical Transport & Safety',
    model: 'Sigma Passenger Lift 1000kg (8-Stop)',
    location: 'Main Tower — Central Lobby Shaft B',
    condition: 'Excellent',
    status: 'Operational',
    lastServiceDate: '2026-09-28',
    nextServiceDate: '2026-10-28',
    assignedTechnician: 'Usman Tariq',
    createdAt: '2026-01-05T07:45:00Z',
    publicDescription: 'Main passenger elevator serving Ground to 7th Floor. Maximum load 1000 kg (13 persons). In case of emergency, press the yellow alarm bell.'
  },
  {
    id: 'ast-pump-06',
    assetCode: 'SMIT-UTL-006',
    name: 'Water Pump 06',
    category: 'Plumbing & Utilities',
    model: 'Grundfos CM 10-3 Centrifugal Booster 3HP',
    location: 'Basement Utility Room — Tank Sector C',
    condition: 'Critical',
    status: 'Out of Service',
    lastServiceDate: '2026-05-10',
    nextServiceDate: '2026-10-01',
    assignedTechnician: 'Zainab Raza',
    createdAt: '2026-01-08T14:20:00Z',
    publicDescription: 'Primary 3HP overhead tank transfer pump supplying washrooms and drinking water filtration units on Floors 1–5.'
  }
];

export const INITIAL_ISSUES = [
  {
    id: 'iss-1001',
    issueNumber: 'ISS-2026-101',
    assetId: 'ast-proj-01',
    title: 'HDMI No Signal & Intermittent Purple Tint on Projection',
    description: 'During the morning React bootcamp lecture, the projector repeatedly drops the HDMI signal from the podium laptop and shows a purple flicker along the bottom border.',
    category: 'AV & Classroom Tech',
    priority: 'High',
    reporterName: 'Sir Kashif (Faculty Lead)',
    createdAt: '2026-10-23T09:30:00Z',
    assignedTechnician: 'Sara Khan',
    status: 'Reported',
    aiSuggestions: {
      isSimulatedDemo: true,
      ruleMatched: 'projector_hdmi',
      confidenceLabel: 'Deterministic Rule Match (AV/HDMI)',
      suggestedTitle: 'Projector HDMI Signal Drop & Optical Color Flicker',
      suggestedCategory: 'AV & Classroom Tech',
      suggestedPriority: 'High',
      possibleCauses: [
        'Degraded 15m in-wall HDMI cable or loose podium keystone coupler',
        'Overheating optical polarizer or lamp hours exceeding 3,500h threshold',
        'Display refresh rate mismatch (EDID handshake failure above 60Hz)'
      ],
      safeInitialChecks: [
        'Test with a known-good short HDMI patch cable directly at the ceiling mount or wall plate',
        'Check projector OSD menu for Lamp Hours and Internal Temp warnings',
        'Set laptop output resolution to 1920x1080 @ 60Hz and disable HDCP repeaters'
      ],
      recurringWarning: 'Notice: Classroom Projector 01 had a previous HDMI coupler replacement 2 months ago.',
      safetyNotice: 'Allow the projector cooling fan to complete its 90-second cycle before switching off mains power.'
    },
    maintenanceRecords: []
  },
  {
    id: 'iss-1002',
    issueNumber: 'ISS-2026-102',
    assetId: 'ast-ac-02',
    title: 'Indoor Unit Water Leakage & Weak Cooling Airflow',
    description: 'Water is dripping steadily from the right corner of the indoor split unit onto the cable trunking in Lab 204. Cooling output has also dropped significantly.',
    category: 'HVAC & Climate Control',
    priority: 'High',
    reporterName: 'Hamza Sheikh (Lab Coordinator)',
    createdAt: '2026-10-21T11:15:00Z',
    assignedTechnician: 'Bilal Ahmed',
    status: 'Maintenance In Progress',
    aiSuggestions: {
      isSimulatedDemo: true,
      ruleMatched: 'ac_leakage',
      confidenceLabel: 'Deterministic Rule Match (HVAC/Drainage)',
      suggestedTitle: 'Split AC Condensate Drain Blockage & Evaporator Icing',
      suggestedCategory: 'HVAC & Climate Control',
      suggestedPriority: 'High',
      possibleCauses: [
        'Algae/dust sludge blocking the PVC condensate drain line',
        'Clogged return air mesh filters causing evaporator coil freeze-up',
        'Low R410A refrigerant pressure causing partial coil frosting'
      ],
      safeInitialChecks: [
        'Power off the AC breaker immediately if water is near electrical sockets',
        'Inspect and rinse the removable nylon dust filters under the front cover',
        'Verify outdoor drain hose outlet for steady water discharge'
      ],
      recurringWarning: 'High usage lab environment — drain flushing recommended every 90 days.',
      safetyNotice: 'SAFETY ALERT: Isolate electrical trunking below the indoor unit before starting wet drainage work.'
    },
    maintenanceRecords: [
      {
        id: 'mr-2001',
        date: '2026-10-22',
        technician: 'Bilal Ahmed',
        inspectionFindings: 'Condensate drain pan overflowed due to biofilm blockage in the 3/4-inch PVC line; evaporator fins heavily dusted.',
        workPerformed: 'Vacuum-flushed condensate drain line with nitrogen pulse, chemically washed evaporator coil, and sanitized air filters.',
        partsReplaced: 'PVC Drain Elbow Seal & Antibacterial Pan Tablet',
        cost: 1850,
        timeSpent: '2.5 hrs',
        finalCondition: 'Good',
        notes: 'Monitoring for 24 hours under full student load before marking Resolved.'
      }
    ]
  },
  {
    id: 'iss-1003',
    issueNumber: 'ISS-2026-103',
    assetId: 'ast-comp-03',
    title: 'Severe Thermal Throttling & Slow Boot During Docker Builds',
    description: 'Workstation 03 takes 6+ minutes to boot and freezes whenever students run container builds or local LLM embeddings.',
    category: 'IT & Lab Computing',
    priority: 'Medium',
    reporterName: 'Ayesha Siddiqui (Teaching Assistant)',
    createdAt: '2026-10-22T14:40:00Z',
    assignedTechnician: 'Sara Khan',
    status: 'Inspection Started',
    aiSuggestions: {
      isSimulatedDemo: true,
      ruleMatched: 'computer_slow',
      confidenceLabel: 'Deterministic Rule Match (IT/Performance)',
      suggestedTitle: 'Workstation CPU Thermal Throttling & NVMe Storage Saturation',
      suggestedCategory: 'IT & Lab Computing',
      suggestedPriority: 'Medium',
      possibleCauses: [
        'Dried CPU thermal paste or dust-clogged heatsink fan causing 100°C throttling',
        'NVMe SSD >95% full from dangling Docker images and temp caches',
        'Failing RAM DIMM or background runaway OS indexing process'
      ],
      safeInitialChecks: [
        'Check Task Manager / resource monitor for CPU frequency and disk queue length',
        'Run `docker system prune` to reclaim unused container volumes',
        'Verify chassis intake fan spin and listen for bearing rattle'
      ],
      recurringWarning: null,
      safetyNotice: 'Ensure electrostatic discharge (ESD) wrist strap is worn before opening the workstation chassis.'
    },
    maintenanceRecords: []
  },
  {
    id: 'iss-1004',
    issueNumber: 'ISS-2026-104',
    assetId: 'ast-pump-06',
    title: 'Loud Metallic Grinding Noise & Impeller Seizure on Pump 06',
    description: 'Water Pump 06 emits a loud metallic screeching sound and trips the thermal overload relay within 20 seconds of startup. Upper floor tanks are at 30%.',
    category: 'Plumbing & Utilities',
    priority: 'Critical',
    reporterName: 'Tariq Mehmood (Building Supervisor)',
    createdAt: '2026-10-20T08:10:00Z',
    assignedTechnician: 'Zainab Raza',
    status: 'Waiting for Parts',
    aiSuggestions: {
      isSimulatedDemo: true,
      ruleMatched: 'pump_noise',
      confidenceLabel: 'Deterministic Rule Match (Mechanical/Pump)',
      suggestedTitle: 'Centrifugal Pump Drive Bearing Failure & Cavitation Lock',
      suggestedCategory: 'Plumbing & Utilities',
      suggestedPriority: 'Critical',
      possibleCauses: [
        'Seized front rotor ball bearing (6205-2RS) due to mechanical seal weepage',
        'Suction line air ingress causing severe impeller cavitation',
        'Foreign debris lodged inside the stainless steel diffuser stage'
      ],
      safeInitialChecks: [
        'LOCKOUT/TAGOUT: Switch off the 3-phase isolator immediately to prevent motor winding burnout',
        'Check underground suction tank foot-valve water level',
        'Inspect pump shaft coupling cover for signs of rust water leakage'
      ],
      recurringWarning: 'Pump 06 is overdue for scheduled preventive overhaul by 23 days.',
      safetyNotice: 'CRITICAL SAFETY WARNING: Stop operating the pump immediately. Lock out the 400V 3-phase breaker before touching the pump housing.'
    },
    maintenanceRecords: [
      {
        id: 'mr-2002',
        date: '2026-10-20',
        technician: 'Zainab Raza',
        inspectionFindings: 'Drive-end bearing seized and silicon-carbide mechanical shaft seal worn out. Motor windings tested healthy via megger check.',
        workPerformed: 'Dismantled pump wet-end, extracted damaged bearing and seal. Ordered OEM Grundfos seal kit.',
        partsReplaced: 'SKF 6205-2Z Bearing (Installed); awaiting OEM Mechanical Seal Kit',
        cost: 6400,
        timeSpent: '3.5 hrs',
        finalCondition: 'Poor',
        notes: 'Switched building supply to standby Pump 07 while awaiting OEM seal delivery.'
      }
    ]
  },
  {
    id: 'iss-1005',
    issueNumber: 'ISS-2026-105',
    assetId: 'ast-prn-04',
    title: 'Frequent Paper Jam in Tray 2 Duplexer Assembly',
    description: 'Sheets jam halfway through double-sided printing when printing batches larger than 20 pages.',
    category: 'Office Equipment',
    priority: 'Low',
    reporterName: 'Noman Ali (Admissions Desk)',
    createdAt: '2026-10-01T10:00:00Z',
    assignedTechnician: 'Sara Khan',
    status: 'Resolved',
    aiSuggestions: {
      isSimulatedDemo: true,
      ruleMatched: 'printer_paper',
      confidenceLabel: 'Deterministic Rule Match (Office/Printer)',
      suggestedTitle: 'Pickup Roller Wear & Duplex Path Paper Dust Accumulation',
      suggestedCategory: 'Office Equipment',
      suggestedPriority: 'Low',
      possibleCauses: [
        'Glazed rubber pickup and separation rollers in Tray 2',
        'Damp or curled 70gsm paper stock sticking in the fuser exit',
        'Paper dust obstructing the rear duplex optical registration sensor'
      ],
      safeInitialChecks: [
        'Fan the paper ream and verify Tray 2 width/length guides are snug',
        'Open rear duplex door and gently remove any torn paper scraps',
        'Wipe rubber pickup rollers with a lint-free cloth dampened with distilled water'
      ],
      recurringWarning: null,
      safetyNotice: 'Caution: The fuser unit inside the rear door operates at 190°C. Allow 15 minutes to cool before touching internal black rollers.'
    },
    maintenanceRecords: [
      {
        id: 'mr-2003',
        date: '2026-10-02',
        technician: 'Sara Khan',
        inspectionFindings: 'Tray 2 separation roller rubber was worn smooth after 45,000 pages.',
        workPerformed: 'Replaced Tray 2 pickup & separation roller kit, cleaned optical paper path sensors with compressed air, and ran 50-page duplex test.',
        partsReplaced: 'HP RM2-5452 Tray 2 Roller Kit',
        cost: 3200,
        timeSpent: '1.0 hr',
        finalCondition: 'Excellent',
        notes: 'Printer restored to full operational status.'
      }
    ]
  }
];

export const INITIAL_HISTORY = [
  {
    id: 'hst-3008',
    assetId: 'ast-proj-01',
    issueId: 'iss-1001',
    timestamp: '2026-10-23T09:30:00Z',
    actor: 'Sir Kashif (Faculty Lead)',
    eventType: 'ISSUE_REPORTED',
    description: 'Reported High priority issue ISS-2026-101: HDMI No Signal & Intermittent Purple Tint on Classroom Projector 01.'
  },
  {
    id: 'hst-3007',
    assetId: 'ast-comp-03',
    issueId: 'iss-1003',
    timestamp: '2026-10-22T14:40:00Z',
    actor: 'Ayesha Siddiqui (TA)',
    eventType: 'ISSUE_REPORTED',
    description: 'Reported issue ISS-2026-103: Severe Thermal Throttling & Slow Boot During Docker Builds on Lab Computer 03.'
  },
  {
    id: 'hst-3006',
    assetId: 'ast-ac-02',
    issueId: 'iss-1002',
    timestamp: '2026-10-22T16:10:00Z',
    actor: 'Bilal Ahmed',
    eventType: 'MAINTENANCE_LOGGED',
    description: 'Flushed PVC condensate drain line and chemically cleaned evaporator coil on Air Conditioner 02 (Cost: PKR 1,850).'
  },
  {
    id: 'hst-3005',
    assetId: 'ast-ac-02',
    issueId: 'iss-1002',
    timestamp: '2026-10-21T11:15:00Z',
    actor: 'Hamza Sheikh (Lab Coordinator)',
    eventType: 'ISSUE_REPORTED',
    description: 'Reported High priority issue ISS-2026-102: Indoor Unit Water Leakage & Weak Cooling Airflow on Air Conditioner 02.'
  },
  {
    id: 'hst-3004',
    assetId: 'ast-pump-06',
    issueId: 'iss-1004',
    timestamp: '2026-10-20T13:45:00Z',
    actor: 'Zainab Raza',
    eventType: 'STATUS_CHANGED',
    description: 'Updated ISS-2026-104 to Waiting for Parts and placed Water Pump 06 Out of Service pending OEM Mechanical Seal Kit.'
  },
  {
    id: 'hst-3003',
    assetId: 'ast-pump-06',
    issueId: 'iss-1004',
    timestamp: '2026-10-20T08:10:00Z',
    actor: 'Tariq Mehmood (Building Supervisor)',
    eventType: 'ISSUE_REPORTED',
    description: 'Reported CRITICAL issue ISS-2026-104: Loud Metallic Grinding Noise & Impeller Seizure on Water Pump 06.'
  },
  {
    id: 'hst-3002',
    assetId: 'ast-prn-04',
    issueId: 'iss-1005',
    timestamp: '2026-10-02T15:20:00Z',
    actor: 'Sara Khan',
    eventType: 'MAINTENANCE_LOGGED',
    description: 'Logged maintenance record on Office Printer 04 (Replaced HP RM2-5452 Roller Kit, Cost: PKR 3,200) and marked issue ISS-2026-105 Resolved.'
  }
];
