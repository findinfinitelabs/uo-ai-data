import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  List,
  Alert,
  SimpleGrid,
  Breadcrumbs,
  Button,
  Modal,
  Code,
  Stack,
  Table,
  RingProgress,
  Grid,
  Accordion,
  Card,
  Timeline,
  Anchor,
  Progress,
  ScrollArea,
  Tabs,
  Stepper,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCar,
  IconTool,
  IconEngine,
  IconCircleCheck,
  IconAlertTriangle,
  IconDisc,
  IconBolt,
  IconDroplet,
  IconWind,
  IconArrowRight,
  IconUser,
  IconFileText,
  IconChartLine,
  IconDownload,
  IconDatabase,
  IconBrain,
  IconTerminal2,
  IconPlayerPlay,
  IconCheck,
  IconRobot,
  IconRefresh,
} from '@tabler/icons-react';

export default function CaseStudyDealershipPage() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showTicketGenerator, setShowTicketGenerator] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  // Fine-tuning pipeline state
  const [bulkTickets, setBulkTickets] = useState([]);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [jsonlReady, setJsonlReady] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [trainingPhase, setTrainingPhase] = useState('idle');
  const [activeStep, setActiveStep] = useState(0);
  const trainingIntervalRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trainingLogs]);

  useEffect(() => {
    return () => { if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current); };
  }, []);

  // Sample vehicle data
  const vehicles = [
    {
      id: '4T1BF3FK9SU100001',
      year: 2025,
      make: 'Toyota',
      model: 'Camry',
      trim: 'SE',
      mileage: 45230,
      owner: 'Sarah Johnson',
      lastService: '2024-01-15',
      serviceCount: 12,
    },
    {
      id: 'VIN67890XYZ',      
      year: 2022,
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX-L',
      mileage: 28450,
      owner: 'Michael Chen',
      lastService: '2024-02-10',
      serviceCount: 6,
    },
  ];

  // Vehicle parts with callout positions
  const vehicleParts = [
    { 
      id: 'engine', 
      name: 'Engine', 
      icon: IconEngine, 
      color: 'red', 
      x: 65, 
      y: 15,
      status: 'Good',
      lastService: '2024-02-15',
      nextDue: 50000,
      currentMileage: 45230,
      condition: 92,
      services: [
        'Oil Change - Every 5,000 miles',
        'Air Filter - Every 15,000 miles', 
        'Spark Plugs - Every 30,000 miles'
      ],
      recentCost: '$79.99',
      aiPrediction: 'Next oil change recommended at 50,000 miles (approximately 3 weeks)'
    },
    { 
      id: 'brakes', 
      name: 'Brakes', 
      icon: IconDisc, 
      color: 'orange', 
      x: 8, 
      y: 65,
      status: 'Fair',
      lastService: '2024-01-10',
      nextDue: 60000,
      currentMileage: 45230,
      condition: 68,
      services: [
        'Brake Pads - Every 25,000-70,000 miles',
        'Brake Fluid - Every 2 years',
        'Rotor Inspection - Annual'
      ],
      recentCost: '$425.50',
      aiPrediction: 'Rear brake pads approaching 40% - recommend inspection at 55,000 miles'
    },
    { 
      id: 'tires', 
      name: 'Tires', 
      icon: IconCircleCheck, 
      color: 'blue', 
      x: 8, 
      y: 85,
      status: 'Good',
      lastService: '2023-12-05',
      nextDue: 51000,
      currentMileage: 45230,
      condition: 85,
      services: [
        'Rotation - Every 6,000 miles',
        'Alignment - Annually',
        'Replacement - Every 40,000-60,000 miles'
      ],
      recentCost: '$45.00',
      aiPrediction: 'Tire rotation due at 51,000 miles. Tread depth good (7/32")'
    },
    { 
      id: 'battery', 
      name: 'Battery', 
      icon: IconBolt, 
      color: 'yellow', 
      x: 50, 
      y: 20,
      status: 'Good',
      lastService: '2023-11-20',
      nextDue: null,
      currentMileage: 45230,
      condition: 95,
      services: [
        'Load Test - Annually',
        'Terminal Cleaning - As needed',
        'Replacement - Every 3-5 years'
      ],
      recentCost: '$185.00',
      aiPrediction: 'Battery health excellent. Expected lifespan until 2027'
    },
    { 
      id: 'transmission', 
      name: 'Transmission', 
      icon: IconTool, 
      color: 'grape', 
      x: 38, 
      y: 50,
      status: 'Good',
      lastService: '2023-08-15',
      nextDue: 60000,
      currentMileage: 45230,
      condition: 90,
      services: [
        'Fluid Check - Every 30,000 miles',
        'Fluid Change - Every 60,000 miles',
        'Filter Replacement - Every 60,000 miles'
      ],
      recentCost: '$0.00',
      aiPrediction: 'Transmission fluid change due at 60,000 miles (approximately 8 months)'
    },
    { 
      id: 'ac', 
      name: 'A/C System', 
      icon: IconWind, 
      color: 'cyan', 
      x: 50, 
      y: 35,
      status: 'Good',
      lastService: '2023-06-01',
      nextDue: null,
      currentMileage: 45230,
      condition: 88,
      services: [
        'Performance Check - Seasonal',
        'Refrigerant Recharge - Every 2-3 years',
        'Cabin Filter - Every 15,000 miles'
      ],
      recentCost: '$0.00',
      aiPrediction: 'A/C system performing well. Recommend seasonal check before summer'
    },
  ];

  // Service ticket types
  const serviceTypes = [
    { value: 'oil_change', label: 'Oil Change', parts: ['oil', 'filter'], labor: 0.5 },
    { value: 'brake_service', label: 'Brake Service', parts: ['brakes', 'rotors'], labor: 2.0 },
    { value: 'tire_rotation', label: 'Tire Rotation', parts: ['tires'], labor: 0.75 },
    { value: 'battery_replacement', label: 'Battery Replacement', parts: ['battery'], labor: 0.5 },
    { value: 'ac_recharge', label: 'A/C Recharge', parts: ['ac', 'refrigerant'], labor: 1.0 },
    { value: 'engine_tune', label: 'Engine Tune-Up', parts: ['engine', 'spark_plugs'], labor: 1.5 },
  ];

  // Sample service history for selected vehicle
  const serviceHistory = selectedVehicle ? [
    {
      date: '2024-02-15',
      type: 'Oil Change',
      mileage: 45230,
      technician: 'Mike Rodriguez',
      cost: 79.99,
      parts: ['Oil Filter', 'Synthetic Oil (5qt)'],
      notes: 'Routine maintenance. No issues detected.',
    },
    {
      date: '2024-01-10',
      type: 'Brake Service',
      mileage: 44100,
      technician: 'Lisa Chen',
      cost: 425.50,
      parts: ['Front Brake Pads', 'Brake Fluid'],
      notes: 'Front pads at 20%. Replaced per recommendation.',
    },
    {
      date: '2023-12-05',
      type: 'Tire Rotation',
      mileage: 43500,
      technician: 'James Wilson',
      cost: 45.00,
      parts: [],
      notes: 'Rotated and balanced. Tire pressure adjusted.',
    },
    {
      date: '2023-11-20',
      type: 'Battery Replacement',
      mileage: 43200,
      technician: 'Mike Rodriguez',
      cost: 185.00,
      parts: ['Group 24F Battery'],
      notes: 'Battery failed load test. Replaced under warranty.',
    },
  ] : [];

  const generateTicket = () => {
    const randomService = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const camry = vehicles[0]; // Always use the 2025 Toyota Camry SE
    const randomMileage = camry.mileage + Math.floor(Math.random() * 500);
    const randomCost = (Math.random() * 300 + 50).toFixed(2);

    const ticket = {
      ticketId: `SVC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      vehicle: camry,
      serviceType: randomService,
      mileage: randomMileage,
      estimatedCost: randomCost,
      priority: Math.random() > 0.7 ? 'High' : 'Normal',
      status: 'Pending',
    };

    setGeneratedTicket(ticket);
  };

  // ── Bulk generation ──────────────────────────────────────────────────────
  const technicians = ['Mike Rodriguez', 'Lisa Chen', 'James Wilson', 'Maria Santos', 'David Park', 'Ashley Turner'];
  const serviceNoteTemplates = {
    oil_change: ['Routine maintenance. No issues detected.', 'Changed oil and filter. Noted minor oil seepage at valve cover — monitoring.', 'Full synthetic oil change completed. Checked and topped all fluids.'],
    brake_service: ['Front pads at 20%. Replaced per recommendation.', 'Rear brakes serviced. Rotors resurfaced within spec.', 'Emergency brake adjusted. All pad thickness within tolerance.'],
    tire_rotation: ['Rotated and balanced. Tire pressure adjusted to 32 PSI.', 'Rotation complete. Noted uneven wear on front left — recommend alignment.', 'All tires rotated and inspected. Tread depth 6/32" average.'],
    battery_replacement: ['Battery failed load test. Replaced under 3-year warranty.', 'Proactive replacement at 60-month mark. Tested charging system — OK.', 'Battery replaced after cold-start failure. Alternator output checked — normal.'],
    ac_recharge: ['Recharged with R-1234yf. System pressure nominal.', 'Found minor leak at high-pressure fitting. Repaired and recharged.', 'Seasonal A/C check. Cabin filter replaced during service.'],
    engine_tune: ['Replaced spark plugs and air filter. Fuel injector cleaner added.', 'Full tune-up completed. Noted slight carbon buildup on plugs — normal for mileage.', 'Throttle body cleaned. Idle reset performed after tune-up.'],
  };

  const generateBulkTickets = () => {
    setIsGeneratingBulk(true);
    setJsonlReady(false);
    setBulkTickets([]);
    setActiveStep(1);
    setTimeout(() => {
      const camry = vehicles[0];
      const count = 1000;
      const generated = [];
      const baseMileage = 10000;
      for (let i = 0; i < count; i++) {
        const svc = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const mileage = baseMileage + Math.floor(i * 45) + Math.floor(Math.random() * 200);
        const notes = serviceNoteTemplates[svc.value];
        const note = notes[Math.floor(Math.random() * notes.length)];
        const cost = (svc.labor * 125 + Math.random() * 80 + 20).toFixed(2);
        const daysAgo = count - i;
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        generated.push({
          ticketId: `SVC-${100000 + i}`,
          date,
          vin: camry.id,
          vehicle: `${camry.year} ${camry.make} ${camry.model} ${camry.trim}`,
          mileage,
          serviceType: svc.label,
          laborHours: svc.labor,
          parts: svc.parts,
          technician: technicians[Math.floor(Math.random() * technicians.length)],
          cost: parseFloat(cost),
          notes: note,
          priority: Math.random() > 0.8 ? 'High' : 'Normal',
        });
      }
      setBulkTickets(generated);
      setIsGeneratingBulk(false);
    }, 800);
  };

  const exportJSONL = () => {
    const camry = vehicles[0];
    const lines = bulkTickets.map(t => {
      const instruction = 'Analyze this vehicle service record and predict the next maintenance need and any risks.';
      const input = `Vehicle: ${t.vehicle} | VIN: ${t.vin} | Mileage: ${t.mileage.toLocaleString()} mi | Service: ${t.serviceType} | Labor: ${t.laborHours}h | Cost: $${t.cost} | Technician: ${t.technician} | Notes: ${t.notes}`;
      const milesUntilOil = 5000 - (t.mileage % 5000);
      const milesUntilRotation = 6000 - (t.mileage % 6000);
      const output = `Service completed at ${t.mileage.toLocaleString()} miles. Next oil change due at ${(t.mileage + milesUntilOil).toLocaleString()} miles. Tire rotation due at ${(t.mileage + milesUntilRotation).toLocaleString()} miles. Priority: ${t.priority}. ${t.notes}`;
      return JSON.stringify({ instruction, input, output });
    });
    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'camry-service-training.jsonl';
    a.click();
    URL.revokeObjectURL(url);
    setJsonlReady(true);
    setActiveStep(2);
  };

  // ── Axolotl fine-tuning simulation ───────────────────────────────────────
  const buildTrainingLogs = () => {
    const lossSteps = [];
    let loss = 2.45;
    for (let epoch = 1; epoch <= 3; epoch++) {
      for (let step = 1; step <= 42; step++) {
        loss = Math.max(0.08, loss - (Math.random() * 0.04 + 0.01));
        const lr = (2e-4 * Math.pow(0.95, (epoch - 1) * 42 + step)).toExponential(2);
        lossSteps.push(`[TRAIN] Epoch ${epoch}/3 | Step ${(epoch - 1) * 42 + step}/125 | Loss: ${loss.toFixed(4)} | LR: ${lr} | Elapsed: ${((epoch - 1) * 42 + step) * 3}s`);
      }
      lossSteps.push(`[EVAL]  Epoch ${epoch}/3 complete | Val Loss: ${(loss + 0.05).toFixed(4)} | Saved checkpoint → ./outputs/camry-lora/checkpoint-${epoch}`);
    }
    return [
      '[INFO] Axolotl v0.4.1 starting...',
      '[INFO] Loading config: camry-service.yml',
      '[INFO] Base model: meta-llama/Meta-Llama-3.1-8B',
      '[INFO] Quantization: 4-bit NF4 (bitsandbytes)',
      '[INFO] Loading tokenizer... ✓',
      '[INFO] Loading base model weights (8B params)... ✓',
      '[INFO] Applying LoRA adapters: r=16, alpha=32, dropout=0.05',
      '[INFO] Trainable parameters: 6,553,600 / 8,030,261,248 (0.082%)',
      '[INFO] Loading dataset: camry-service-training.jsonl',
      '[INFO] 1,000 training examples | 125 examples/batch | 125 steps/epoch',
      '[INFO] Formatting as Alpaca instruction template... ✓',
      '[INFO] Max sequence length: 512 tokens',
      '[INFO] Using AdamW 8-bit optimizer',
      '[INFO] Training on: AWS g4dn.xlarge (T4 GPU, 16GB VRAM)',
      '[INFO] ─────────────────────────────────────────────────────',
      '[INFO] Starting training run...',
      ...lossSteps,
      '[INFO] ─────────────────────────────────────────────────────',
      '[INFO] Training complete! Final loss: ' + loss.toFixed(4),
      '[INFO] Merging LoRA weights into base model...',
      '[INFO] Saving merged model → ./outputs/camry-lora-merged/',
      '[INFO] Converting to GGUF format (Q4_K_M quantization)...',
      '[INFO] GGUF export complete → camry-service-llm.Q4_K_M.gguf (4.8 GB)',
      '[INFO] ─────────────────────────────────────────────────────',
      '[SUCCESS] Model ready for Ollama!',
      '[INFO] To load in Ollama on your AWS instance:',
      '[INFO]   ollama create camry-service -f ./Modelfile',
      '[INFO]   ollama run camry-service',
      '[INFO] ─────────────────────────────────────────────────────',
    ];
  };

  const startFineTuning = () => {
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    setTrainingLogs([]);
    setTrainingProgress(0);
    setTrainingComplete(false);
    setTrainingPhase('training');
    setActiveStep(3);
    const logs = buildTrainingLogs();
    let idx = 0;
    trainingIntervalRef.current = setInterval(() => {
      if (idx >= logs.length) {
        clearInterval(trainingIntervalRef.current);
        setTrainingProgress(100);
        setTrainingComplete(true);
        setTrainingPhase('complete');
        setActiveStep(4);
        return;
      }
      setTrainingLogs(prev => [...prev, logs[idx]]);
      setTrainingProgress(Math.round((idx / logs.length) * 100));
      idx++;
    }, 120);
  };

  return (
    <Container size="lg" py="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs mb="md">
        <Anchor component={Link} to="/">
          <IconArrowLeft size={16} /> Home
        </Anchor>
        <Text>Case Studies</Text>
        <Text>Auto Dealership Service</Text>
      </Breadcrumbs>

      {/* Header */}
      <Paper p="xl" mb="xl" withBorder style={{ borderLeft: '4px solid var(--uo-green)' }}>
        <Group mb="md">
          <ThemeIcon size={60} radius="md" color="green">
            <IconCar size={32} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Badge color="green" mb="xs">CASE STUDY</Badge>
            <Title order={1}>Auto Dealership Service & Repair Analytics</Title>
            <Text size="lg" c="dimmed">
              Use AI to analyze service tickets, predict maintenance needs, and optimize parts inventory from dealership repairs and routine maintenance
            </Text>
          </Box>
        </Group>
      </Paper>

      {/* Business Challenge */}
      <Title order={2} mb="md">The Business Challenge</Title>
      <Paper p="lg" mb="xl" withBorder>
        <Text mb="md">
          <Text span fw={700}>Precision Auto Group</Text> operates 12 dealership service centers across the Pacific Northwest,
          servicing over 15,000 vehicles annually. They want to use AI to:
        </Text>
        <List spacing="md" size="sm">
          <List.Item>
            <Text span fw={600}>Predict maintenance needs:</Text> Identify vehicles due for service before customers call
          </List.Item>
          <List.Item>
            <Text span fw={600}>Optimize parts inventory:</Text> Forecast which parts to stock based on service patterns
          </List.Item>
          <List.Item>
            <Text span fw={600}>Improve technician scheduling:</Text> Match service complexity with technician expertise
          </List.Item>
          <List.Item>
            <Text span fw={600}>Reduce customer wait times:</Text> Predict service duration more accurately
          </List.Item>
          <List.Item>
            <Text span fw={600}>Increase customer retention:</Text> Proactive outreach for recommended maintenance
          </List.Item>
        </List>
      </Paper>

      {/* Data Sources */}
      <Title order={2} mb="md">Data Sources for Service Analytics</Title>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="xl">
        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon color="blue" size={40} radius="xl" mb="md">
            <IconFileText size={22} />
          </ThemeIcon>
          <Text fw={600} mb="sm">Service Tickets</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item>Ticket ID, Date, Mileage</List.Item>
            <List.Item>Service type & description</List.Item>
            <List.Item>Parts used & quantities</List.Item>
            <List.Item>Labor hours & cost</List.Item>
            <List.Item>Technician notes</List.Item>
          </List>
          <Code block style={{ fontSize: '10px' }}>
{`{
  "ticketId": "SVC-45230",
  "date": "2024-02-15",
  "vin": "4T1BF3FK9SU100001",
  "mileage": 45230,
  "serviceType": "Oil Change",
  "parts": [
    {
      "partId": "OIL-5W30-5QT",
      "name": "Synthetic Oil",
      "quantity": 5,
      "cost": 45.99
    },
    {
      "partId": "FILTER-OIL-24",
      "name": "Oil Filter",
      "quantity": 1,
      "cost": 12.50
    }
  ],
  "laborHours": 0.5,
  "laborCost": 65.00,
  "technicianId": "TECH-102",
  "technicianNotes": "Oil at 30% life. No leaks detected. Tire pressure adjusted.",
  "totalCost": 123.49,
  "status": "Completed"
}`}
          </Code>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon color="green" size={40} radius="xl" mb="md">
            <IconCar size={22} />
          </ThemeIcon>
          <Text fw={600} mb="sm">Vehicle Information</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item>VIN, Make, Model, Year</List.Item>
            <List.Item>Trim level & options</List.Item>
            <List.Item>Current mileage</List.Item>
            <List.Item>Purchase date</List.Item>
            <List.Item>Warranty status</List.Item>
          </List>
          <Code block style={{ fontSize: '10px' }}>
{`{
  "vin": "4T1BF3FK9SU100001",
  "year": 2025,
  "make": "Toyota",
  "model": "Camry",
  "trim": "SE",
  "engineType": "2.5L 4-Cyl Hybrid",
  "transmission": "eCVT",
  "color": "Midnight Black Metallic",
  "currentMileage": 45230,
  "purchaseDate": "2025-03-15",
  "warranty": {
    "basic": "Active until 2028",
    "powertrain": "Active until 60,000 mi",
    "expirationDate": "2030-03-15"
  },
  "lastServiceDate": "2024-02-15",
  "nextServiceDue": 50000
}`}
          </Code>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <ThemeIcon color="orange" size={40} radius="xl" mb="md">
            <IconUser size={22} />
          </ThemeIcon>
          <Text fw={600} mb="sm">Customer Data</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item>Customer ID & name</List.Item>
            <List.Item>Contact information</List.Item>
            <List.Item>Service history</List.Item>
            <List.Item>Preferred service center</List.Item>
            <List.Item>Communication preferences</List.Item>
          </List>
          <Code block style={{ fontSize: '10px' }}>
{`{
  "customerId": "CUST-8472",
  "name": "Sarah Johnson",
  "email": "sarah.j@email.com",
  "phone": "(503) 555-0123",
  "address": {
    "street": "1234 Oak St",
    "city": "Portland",
    "state": "OR",
    "zip": "97201"
  },
  "vehicles": ["4T1BF3FK9SU100001"],
  "preferredLocation": "Downtown Portland",
  "memberSince": "2020-03-15",
  "totalVisits": 12,
  "lifetimeValue": 2847.33,
  "communicationPrefs": {
    "email": true,
    "sms": true,
    "reminders": true
  }
}`}
          </Code>
        </Card>
      </SimpleGrid>

      {/* Interactive Vehicle Diagram */}
      <Title order={2} mb="md">Interactive Vehicle Service Map</Title>
      <Paper p="lg" mb="xl" withBorder>
        <Alert color="blue" mb="lg" icon={<IconAlertTriangle />}>
          <Text size="sm" fw={600}>2025 Toyota Camry SE - VIN: 4T1BF3FK9SU100001</Text>
          <Text size="sm">Current Mileage: 15,230 miles | Owner: Sarah Johnson | Last Service: Feb 15, 2026</Text>
        </Alert>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            {/* Toyota Camry Image */}
            <Box style={{ position: 'relative', background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)', borderRadius: 12, overflow: 'hidden' }}>
              <img
                src="https://tmna.aemassets.toyota.com/is/image/toyota/toyota/vehicles/2025/camry/mlp/scrollytelling/CAM_MY26_NA-CAMP_Overview_Performance_Tech__TCOM_LCH_New_ENG_10_TCOM_Scrollytelling_NA-New_ENG_10_16x9Vide_TYCK3081000H.png?fmt=jpeg&qlt=90&dpr=on,3&wid=1400"
                alt="2025 Toyota Camry"
                style={{ width: '100%', display: 'block', borderRadius: 12 }}
              />
              <Box style={{ position: 'absolute', bottom: 8, right: 12 }}>
                <Badge color="dark" variant="filled" size="sm">2025 Toyota Camry SE</Badge>
              </Box>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            {/* Part selector buttons stacked vertically */}
            <Stack gap="xs" mb="md">
              {vehicleParts.map((part) => {
                const Icon = part.icon;
                const isDue = part.nextDue && part.currentMileage >= part.nextDue - 2000;
                const milesUntilDue = part.nextDue ? part.nextDue - part.currentMileage : null;
                const statusColor = part.condition >= 85 ? 'green' : part.condition >= 70 ? 'yellow' : 'orange';
                return (
                  <Button
                    key={part.id}
                    variant={selectedPart?.id === part.id ? 'filled' : 'light'}
                    color={isDue ? 'orange' : part.color}
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedPart(part)}
                    styles={{ inner: { justifyContent: 'space-between', width: '100%' } }}
                    leftSection={<Icon size={16} />}
                    rightSection={
                      <Group gap={4}>
                        {isDue && <Badge size="xs" color="red" variant="filled">Due Soon</Badge>}
                        {milesUntilDue && !isDue && (
                          <Text size="xs" c="dimmed">+{milesUntilDue.toLocaleString()} mi</Text>
                        )}
                        {!part.nextDue && (
                          <Text size="xs" c="dimmed">Annual</Text>
                        )}
                        <Badge size="xs" color={statusColor} variant="dot">{part.condition}%</Badge>
                      </Group>
                    }
                  >
                    {part.name}
                  </Button>
                );
              })}
            </Stack>
            {selectedPart ? (
              <Paper p="md" withBorder>
                <Group mb="md">
                  {(() => {
                    const SelectedIcon = selectedPart.icon;
                    return (
                      <ThemeIcon color={selectedPart.color} size={40} radius="xl">
                        <SelectedIcon size={22} />
                      </ThemeIcon>
                    );
                  })()}
                  <Box style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text fw={700} size="lg">{selectedPart.name}</Text>
                      <Badge color={selectedPart.condition >= 85 ? 'green' : selectedPart.condition >= 70 ? 'yellow' : 'orange'}>
                        {selectedPart.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">Last service: {selectedPart.lastService}</Text>
                  </Box>
                </Group>

                {/* Condition Ring */}
                <Group mb="md" justify="center">
                  <RingProgress
                    size={100}
                    thickness={8}
                    sections={[{ 
                      value: selectedPart.condition, 
                      color: selectedPart.condition >= 85 ? 'green' : selectedPart.condition >= 70 ? 'yellow' : 'orange' 
                    }]}
                    label={
                      <Box style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700}>{selectedPart.condition}%</Text>
                        <Text size="xs" c="dimmed">Health</Text>
                      </Box>
                    }
                  />
                </Group>

                <Divider mb="md" />
                
                <Text size="sm" fw={600} mb="xs">Maintenance Schedule:</Text>
                <List size="sm" spacing="xs" mb="md">
                  {selectedPart.services.map((service, idx) => (
                    <List.Item key={idx}>{service}</List.Item>
                  ))}
                </List>

                {selectedPart.recentCost !== '$0.00' && (
                  <Paper p="xs" bg="gray.0" mb="md">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Last Service Cost:</Text>
                      <Text size="sm" fw={600}>{selectedPart.recentCost}</Text>
                    </Group>
                  </Paper>
                )}

                {selectedPart.nextDue && (
                  <Alert color="blue" mb="md">
                    <Text size="xs" fw={600}>Next Service Due:</Text>
                    <Text size="xs">{selectedPart.nextDue.toLocaleString()} miles</Text>
                  </Alert>
                )}

                <Alert color="green" icon={<IconChartLine size={16} />}>
                  <Text size="xs" fw={600}>AI Prediction:</Text>
                  <Text size="xs">{selectedPart.aiPrediction}</Text>
                </Alert>
              </Paper>
            ) : (
              <Alert icon={<IconAlertTriangle />} color="blue">
                <Text size="sm" fw={600} mb="xs">Select a Component</Text>
                <Text size="sm">Click any button above to see detailed service information, maintenance schedules, and AI-powered predictions for that vehicle component.</Text>
              </Alert>
            )}
          </Grid.Col>
        </Grid>
      </Paper>

      {/* AI Service Ticket Generator */}
      <Title order={2} mb="md">AI Service Ticket Generator</Title>
      <Paper p="lg" mb="xl" withBorder>
        <Text c="dimmed" mb="lg">
          Generate realistic synthetic service tickets for training AI models to predict maintenance needs
        </Text>

        <Group mb="lg">
          <Button
            leftSection={<IconTool size={16} />}
            onClick={() => {
              generateTicket();
              setShowTicketGenerator(true);
            }}
            color="green"
          >
            Generate Service Ticket
          </Button>
          
          {generatedTicket && (
            <Button
              leftSection={<IconDownload size={16} />}
              variant="light"
              color="blue"
              onClick={() => {
                const dataStr = JSON.stringify(generatedTicket, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const link = document.createElement('a');
                link.setAttribute('href', dataUri);
                link.setAttribute('download', `service-ticket-${generatedTicket.ticketId}.json`);
                link.click();
              }}
            >
              Download JSON
            </Button>
          )}
        </Group>

        {generatedTicket && (
          <Paper p="md" withBorder bg="blue.0">
            <Stack gap="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed">Ticket ID</Text>
                  <Text fw={700}>{generatedTicket.ticketId}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Date</Text>
                  <Text fw={700}>{generatedTicket.date}</Text>
                </Box>
                <Badge color={generatedTicket.priority === 'High' ? 'red' : 'blue'}>
                  {generatedTicket.priority} Priority
                </Badge>
              </Group>

              <Divider />

              <Box>
                <Text size="xs" c="dimmed">Vehicle</Text>
                <Text fw={700}>
                  {generatedTicket.vehicle.year} {generatedTicket.vehicle.make} {generatedTicket.vehicle.model}
                </Text>
                <Text size="sm" c="dimmed">VIN: {generatedTicket.vehicle.id} | Mileage: {generatedTicket.mileage.toLocaleString()}</Text>
              </Box>

              <Box>
                <Text size="xs" c="dimmed">Service Type</Text>
                <Text fw={700}>{generatedTicket.serviceType.label}</Text>
                <Text size="sm" c="dimmed">Estimated Labor: {generatedTicket.serviceType.labor} hours</Text>
              </Box>

              <Box>
                <Text size="xs" c="dimmed">Estimated Cost</Text>
                <Text fw={700} size="lg" c="green">${generatedTicket.estimatedCost}</Text>
              </Box>

              <Code block>{JSON.stringify(generatedTicket, null, 2)}</Code>
            </Stack>
          </Paper>
        )}
      </Paper>

      {/* ── Fine-Tuning Pipeline ─────────────────────────── */}
      <Title order={2} mb="xs">Fine-Tune Llama 3.1 on Your Service Data</Title>
      <Text c="dimmed" mb="lg">
        Follow the steps below to generate synthetic training data, export it in JSONL format,
        configure Axolotl, and run a LoRA fine-tune on your AWS Ollama instance.
      </Text>

      <Stepper active={activeStep} mb="xl" color="green">
        <Stepper.Step label="Start" description="Ready" />
        <Stepper.Step label="Generate" description="1,000 tickets" />
        <Stepper.Step label="Export JSONL" description="Training format" />
        <Stepper.Step label="Configure" description="Axolotl YAML" />
        <Stepper.Step label="Train" description="LoRA fine-tune" />
      </Stepper>

      {/* Step 1 — Generate bulk tickets */}
      <Paper p="lg" mb="md" withBorder>
        <Group mb="md">
          <ThemeIcon size={36} radius="xl" color="blue" variant="light">
            <IconDatabase size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700}>Step 1: Generate 1,000 Synthetic Service Tickets</Text>
            <Text size="sm" c="dimmed">Creates varied, realistic service records for the 2025 Toyota Camry SE</Text>
          </Box>
          {bulkTickets.length > 0 && <Badge color="green" leftSection={<IconCheck size={12} />}>Done — {bulkTickets.length.toLocaleString()} tickets</Badge>}
        </Group>
        <Button
          leftSection={isGeneratingBulk ? null : <IconDatabase size={16} />}
          loading={isGeneratingBulk}
          color="blue"
          onClick={generateBulkTickets}
          disabled={isGeneratingBulk}
        >
          {isGeneratingBulk ? 'Generating...' : bulkTickets.length > 0 ? 'Regenerate 1,000 Tickets' : 'Generate 1,000 Tickets'}
        </Button>

        {bulkTickets.length > 0 && (
          <Paper p="md" bg="gray.0" mt="md" radius="md">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">Preview — first 3 records</Text>
            <Code block style={{ fontSize: '11px' }}>
              {JSON.stringify(bulkTickets.slice(0, 3), null, 2)}
            </Code>
          </Paper>
        )}
      </Paper>

      {/* Step 2 — Export JSONL */}
      <Paper p="lg" mb="md" withBorder style={{ opacity: bulkTickets.length === 0 ? 0.5 : 1 }}>
        <Group mb="md">
          <ThemeIcon size={36} radius="xl" color="cyan" variant="light">
            <IconFileText size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700}>Step 2: Export as JSONL Training File</Text>
            <Text size="sm" c="dimmed">Converts tickets to Alpaca instruction-tuning format for Axolotl</Text>
          </Box>
          {jsonlReady && <Badge color="green" leftSection={<IconCheck size={12} />}>Downloaded</Badge>}
        </Group>

        <Paper p="md" bg="dark.9" radius="md" mb="md">
          <Text size="xs" c="dimmed" mb="xs">JSONL format — each line is one training example:</Text>
          <Code block style={{ fontSize: '11px', color: '#a3e635' }}>
{`{"instruction":"Analyze this vehicle service record and predict the next maintenance need.",
 "input":"Vehicle: 2025 Toyota Camry SE | VIN: 4T1BF3FK9SU100001 | Mileage: 45,230 mi | Service: Oil Change | Cost: $79.99 | Notes: Routine maintenance",
 "output":"Service completed at 45,230 miles. Next oil change due at 50,230 miles. Tire rotation due at 46,500 miles. Priority: Normal. Routine maintenance."}
{"instruction":"Analyze this vehicle service record and predict the next maintenance need.",
 "input":"Vehicle: 2025 Toyota Camry SE | VIN: 4T1BF3FK9SU100001 | Mileage: 38,100 mi | Service: Brake Service | Cost: $425.50 | Notes: Front pads at 20%. Replaced.",
 "output":"Brake service performed at 38,100 miles. Next brake inspection due at 63,100 miles. Oil change due at 40,000 miles. Priority: High."}`}
          </Code>
        </Paper>

        <Button
          leftSection={<IconDownload size={16} />}
          color="cyan"
          disabled={bulkTickets.length === 0}
          onClick={exportJSONL}
        >
          Download camry-service-training.jsonl
        </Button>
      </Paper>

      {/* Step 3 — Axolotl Config */}
      <Paper p="lg" mb="md" withBorder style={{ opacity: !jsonlReady ? 0.5 : 1 }}>
        <Group mb="md">
          <ThemeIcon size={36} radius="xl" color="grape" variant="light">
            <IconTool size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700}>Step 3: Axolotl Configuration</Text>
            <Text size="sm" c="dimmed">LoRA fine-tune config for Llama 3.1 8B on AWS g4dn.xlarge</Text>
          </Box>
        </Group>
        <Paper p="md" bg="dark.9" radius="md">
          <Code block style={{ fontSize: '11px', color: '#93c5fd' }}>
{`# camry-service.yml — Axolotl LoRA config
base_model: meta-llama/Meta-Llama-3.1-8B
model_type: LlamaForCausalLM
tokenizer_type: AutoTokenizer

load_in_4bit: true          # 4-bit NF4 quantization (fits in 16GB VRAM)
strict: false

datasets:
  - path: camry-service-training.jsonl
    type: alpaca             # instruction / input / output format

dataset_prepared_path: ./prepared_data
output_dir: ./outputs/camry-lora

sequence_len: 512
sample_packing: true

adapter: lora
lora_r: 16                  # rank — higher = more capacity, more memory
lora_alpha: 32              # scaling factor
lora_dropout: 0.05
lora_target_linear: true
lora_target_modules:
  - q_proj
  - v_proj

gradient_accumulation_steps: 4
micro_batch_size: 4
num_epochs: 3
optimizer: adamw_bnb_8bit
lr_scheduler: cosine
learning_rate: 0.0002

train_on_inputs: false
group_by_length: false
bf16: auto
fp16: false
tf32: false

logging_steps: 1
flash_attention: false
warmup_steps: 10
eval_steps: 25
save_steps: 50`}
          </Code>
        </Paper>
      </Paper>

      {/* Step 4 — Train */}
      <Paper p="lg" mb="xl" withBorder style={{ opacity: !jsonlReady ? 0.5 : 1 }}>
        <Group mb="md">
          <ThemeIcon size={36} radius="xl" color="orange" variant="light">
            <IconBrain size={20} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text fw={700}>Step 4: Run Fine-Tuning with Axolotl</Text>
            <Text size="sm" c="dimmed">Streams live training output from your AWS instance</Text>
          </Box>
          {trainingComplete && <Badge color="green" size="lg" leftSection={<IconCheck size={14} />}>Training Complete</Badge>}
        </Group>

        <Group mb="md">
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            color="orange"
            disabled={!jsonlReady || trainingPhase === 'training'}
            loading={trainingPhase === 'training'}
            onClick={startFineTuning}
          >
            {trainingPhase === 'training' ? 'Training in Progress...' : trainingComplete ? 'Re-run Fine-Tune' : 'Start Fine-Tuning on AWS'}
          </Button>
          {trainingPhase === 'training' && (
            <Text size="sm" c="dimmed">Simulating AWS g4dn.xlarge training run...</Text>
          )}
        </Group>

        {trainingLogs.length > 0 && (
          <>
            <Group mb="xs" justify="space-between">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">Training Output</Text>
              <Text size="xs" c="dimmed">{trainingProgress}%</Text>
            </Group>
            <Progress value={trainingProgress} color={trainingComplete ? 'green' : 'orange'} mb="xs" animated={!trainingComplete} />
            <ScrollArea h={340} style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #30363d' }}>
              <Box p="md" style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}>
                {trainingLogs.map((line, i) => (
                  <Text
                    key={i}
                    style={{
                      color: line.startsWith('[SUCCESS]') ? '#4ade80'
                        : line.startsWith('[EVAL]') ? '#60a5fa'
                        : line.startsWith('[TRAIN]') ? '#d4d4d4'
                        : line.startsWith('[INFO]') ? '#9ca3af'
                        : '#e5e7eb',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace: 'pre',
                    }}
                  >
                    {line}
                  </Text>
                ))}
                <div ref={logsEndRef} />
              </Box>
            </ScrollArea>
          </>
        )}

        {trainingComplete && (
          <Alert icon={<IconRobot size={18} />} color="green" mt="md" title="Model ready — load it in Ollama">
            <Code block style={{ fontSize: '11px' }}>
{`# SSH into your AWS EKS node, then:
cp camry-service-llm.Q4_K_M.gguf /usr/share/ollama/.ollama/models/

# Create a Modelfile
cat > Modelfile <<EOF
FROM camry-service-llm.Q4_K_M.gguf
SYSTEM "You are an expert Toyota Camry service advisor. Analyze service data and predict maintenance needs accurately."
EOF

# Register and run
ollama create camry-service -f ./Modelfile
ollama run camry-service "What maintenance does VIN 4T1BF3FK9SU100001 need at 50,000 miles?"`}
            </Code>
          </Alert>
        )}
      </Paper>

      {/* Vehicle Service History */}
      <Title order={2} mb="md">Service History Graph</Title>
      <Paper p="lg" mb="xl" withBorder>
        <Text c="dimmed" mb="lg">
          Select a vehicle to view its complete service history and AI-generated insights
        </Text>

        <Group mb="lg">
          {vehicles.map((vehicle) => (
            <Button
              key={vehicle.id}
              variant={selectedVehicle?.id === vehicle.id ? 'filled' : 'light'}
              color="blue"
              onClick={() => setSelectedVehicle(vehicle)}
            >
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Button>
          ))}
        </Group>

        {selectedVehicle && (
          <>
            <Paper p="md" mb="lg" withBorder bg="gray.0">
              <Grid>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed">Vehicle</Text>
                  <Text fw={700}>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</Text>
                  <Text size="sm" c="dimmed">{selectedVehicle.trim}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed">Owner</Text>
                  <Text fw={700}>{selectedVehicle.owner}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed">Current Mileage</Text>
                  <Text fw={700}>{selectedVehicle.mileage.toLocaleString()} mi</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="xs" c="dimmed">Total Services</Text>
                  <Text fw={700}>{selectedVehicle.serviceCount}</Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Timeline active={serviceHistory.length} bulletSize={24} lineWidth={2} mb="lg">
              {serviceHistory.map((service, idx) => (
                <Timeline.Item
                  key={idx}
                  bullet={<IconCircleCheck size={12} />}
                  title={service.type}
                >
                  <Text size="sm" c="dimmed" mb="xs">{service.date} • {service.mileage.toLocaleString()} miles</Text>
                  <Text size="sm" mb="xs">Technician: {service.technician}</Text>
                  {service.parts.length > 0 && (
                    <Text size="sm" mb="xs">Parts: {service.parts.join(', ')}</Text>
                  )}
                  <Text size="sm" mb="xs">Cost: ${service.cost}</Text>
                  <Text size="sm" fs="italic" c="dimmed">{service.notes}</Text>
                </Timeline.Item>
              ))}
            </Timeline>

            {/* AI Insights */}
            <Alert icon={<IconChartLine />} color="green" title="AI-Generated Insights">
              <List size="sm" spacing="xs">
                <List.Item>
                  <Text span fw={600}>Next recommended service:</Text> Oil change at 50,000 miles (estimated 3 weeks based on avg. 250 miles/week)
                </List.Item>
                <List.Item>
                  <Text span fw={600}>Predictive alert:</Text> Front brake pads due for inspection at 60,000 miles (18 months)
                </List.Item>
                <List.Item>
                  <Text span fw={600}>Cost prediction:</Text> Estimated annual service costs: $850 (based on vehicle age and service patterns)
                </List.Item>
                <List.Item>
                  <Text span fw={600}>Customer retention:</Text> Owner is due for outreach - last service was 30 days ago
                </List.Item>
              </List>
            </Alert>
          </>
        )}
      </Paper>

      {/* Business Impact */}
      <Title order={2} mb="md">Business Impact</Title>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="xl">
        <Card padding="lg" radius="md" withBorder>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: 35, color: 'green' }]}
            label={
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xl">35%</Text>
                <Text size="xs" c="dimmed">Increase</Text>
              </Box>
            }
            mb="md"
          />
          <Text fw={600} mb="xs">Parts Inventory Efficiency</Text>
          <Text size="sm" c="dimmed">
            AI predicts which parts to stock, reducing overstock by 35% and stockouts by 60%
          </Text>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: 42, color: 'blue' }]}
            label={
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xl">42%</Text>
                <Text size="xs" c="dimmed">Increase</Text>
              </Box>
            }
            mb="md"
          />
          <Text fw={600} mb="xs">Proactive Service Bookings</Text>
          <Text size="sm" c="dimmed">
            Customers contacted before service is due = 42% more bookings, increasing revenue
          </Text>
        </Card>

        <Card padding="lg" radius="md" withBorder>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: 28, color: 'orange' }]}
            label={
              <Box style={{ textAlign: 'center' }}>
                <Text fw={700} size="xl">28%</Text>
                <Text size="xs" c="dimmed">Reduction</Text>
              </Box>
            }
            mb="md"
          />
          <Text fw={600} mb="xs">Service Time Accuracy</Text>
          <Text size="sm" c="dimmed">
            AI predicts service duration within 15 minutes, reducing customer wait time by 28%
          </Text>
        </Card>
      </SimpleGrid>

      {/* How It Works */}
      <Title order={2} mb="md">How AI Powers Service Analytics</Title>
      <Accordion variant="contained" mb="xl">
        <Accordion.Item value="data-collection">
          <Accordion.Control>Step 1: Data Collection from Service Systems</Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              Service tickets, vehicle information, and customer data are automatically synced from:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item>Service management system (RO Writer, CDK, Reynolds & Reynolds)</List.Item>
              <List.Item>Parts inventory database</List.Item>
              <List.Item>Customer relationship management (CRM) system</List.Item>
              <List.Item>Vehicle manufacturer telematics data (if available)</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="ai-training">
          <Accordion.Control>Step 2: Training AI Models on Service Patterns</Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              AI models are trained to:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item>Predict when vehicles need specific services based on mileage, age, and service history</List.Item>
              <List.Item>Estimate service duration for accurate scheduling</List.Item>
              <List.Item>Forecast parts demand to optimize inventory</List.Item>
              <List.Item>Identify high-value service opportunities (e.g., customers due for major maintenance)</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="deployment">
          <Accordion.Control>Step 3: Deployment & Real-Time Predictions</Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              The AI system continuously:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item>Analyzes service history to predict upcoming maintenance needs</List.Item>
              <List.Item>Sends proactive service reminders to customers before they call</List.Item>
              <List.Item>Suggests optimal service appointment times based on shop capacity</List.Item>
              <List.Item>Recommends parts to order based on predicted demand</List.Item>
              <List.Item>Generates service advisor talking points for upselling opportunities</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Next Steps */}
      <Paper p="xl" withBorder bg="green.0">
        <Title order={3} mb="md">Try It Yourself</Title>
        <Text mb="lg">
          Ready to build your own automotive service AI? Start with these modules:
        </Text>
        <List spacing="md" size="sm">
          <List.Item icon={<IconCircleCheck size={16} color="var(--uo-green)" />}>
            <Text span fw={600}>Module 1:</Text> Define data specifications for service tickets, vehicle info, and parts inventory
          </List.Item>
          <List.Item icon={<IconCircleCheck size={16} color="var(--uo-green)" />}>
            <Text span fw={600}>Module 5:</Text> Generate synthetic service ticket data for training AI models
          </List.Item>
          <List.Item icon={<IconCircleCheck size={16} color="var(--uo-green)" />}>
            <Text span fw={600}>Module 6:</Text> Train models to predict service needs and optimize operations
          </List.Item>
        </List>

        <Group mt="lg">
          <Button component={Link} to="/module-1" color="green" leftSection={<IconArrowRight size={16} />}>
            Start with Data Specifications
          </Button>
          <Button component={Link} to="/module-5" variant="light" color="green">
            Generate Synthetic Data
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
