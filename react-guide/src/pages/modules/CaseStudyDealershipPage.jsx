import React, { useState } from 'react';
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
} from '@tabler/icons-react';

export default function CaseStudyDealershipPage() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showTicketGenerator, setShowTicketGenerator] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  // Sample vehicle data
  const vehicles = [
    {
      id: 'VIN12345ABC',
      year: 2020,
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
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const randomMileage = randomVehicle.mileage + Math.floor(Math.random() * 500);
    const randomCost = (Math.random() * 300 + 50).toFixed(2);

    const ticket = {
      ticketId: `SVC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      vehicle: randomVehicle,
      serviceType: randomService,
      mileage: randomMileage,
      estimatedCost: randomCost,
      priority: Math.random() > 0.7 ? 'High' : 'Normal',
      status: 'Pending',
    };

    setGeneratedTicket(ticket);
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
  "vin": "VIN12345ABC",
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
  "vin": "VIN12345ABC",
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "trim": "SE",
  "engineType": "2.5L 4-Cyl",
  "transmission": "Automatic",
  "color": "Silver",
  "currentMileage": 45230,
  "purchaseDate": "2020-03-15",
  "warranty": {
    "basic": "Expired",
    "powertrain": "Active until 60,000 mi",
    "expirationDate": "2025-03-15"
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
  "vehicles": ["VIN12345ABC"],
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
          <Text size="sm" fw={600}>2020 Toyota Camry SE - VIN: VIN12345ABC</Text>
          <Text size="sm">Current Mileage: 45,230 miles | Owner: Sarah Johnson | Last Service: Feb 15, 2024</Text>
        </Alert>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            {/* 3D Rotatable Car Model */}
            <Box style={{ position: 'relative', background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)', borderRadius: 12, padding: '20px', minHeight: 450 }}>
              <model-viewer
                src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf"
                alt="Interactive 3D vehicle model"
                auto-rotate
                camera-controls
                camera-orbit="45deg 75deg 5m"
                min-camera-orbit="auto auto 3m"
                max-camera-orbit="auto auto 10m"
                style={{
                  width: '100%',
                  height: '380px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  backgroundColor: '#f8f9fa'
                }}
                exposure="1.0"
                shadow-intensity="1.5"
                auto-rotate-delay="500"
                rotation-per-second="20deg"
              >
                <div slot="progress-bar" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--mantine-color-blue-6)',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  Loading 3D Vehicle...
                </div>
              </model-viewer>
              
              <Text size="xs" c="dimmed" ta="center" mb="md">
                🖱️ Drag to rotate • Scroll to zoom • Auto-rotating 360° • (Using sample vehicle model)
              </Text>

              {/* Clickable part indicators */}
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {vehicleParts.map((part) => {
                  const Icon = part.icon;
                  return (
                    <Button
                      key={part.id}
                      variant={selectedPart?.id === part.id ? 'filled' : 'light'}
                      color={part.color}
                      size="sm"
                      leftSection={<Icon size={16} />}
                      onClick={() => setSelectedPart(part)}
                      rightSection={
                        part.condition < 70 ? (
                          <Badge size="xs" color="orange" circle>!</Badge>
                        ) : null
                      }
                    >
                      {part.name}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
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
