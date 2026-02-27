import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Timeline,
  Badge,
  Group,
  Box,
  List,
  ThemeIcon,
  Divider,
  Card,
  SimpleGrid,
  Alert,
  Modal,
  Button,
  Anchor,
  Textarea,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconUser,
  IconClock,
  IconHeart,
  IconStethoscope,
  IconFlask,
  IconPill,
  IconCreditCard,
  IconCalendar,
  IconAlertCircle,
  IconDoorEnter,
  IconInfoCircle,
  IconBuildingBank,
  IconShield,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';

const SafeHarborPage = () => {
  const [activeStage, setActiveStage] = useState(null);
  const [policyModalOpened, setPolicyModalOpened] = useState(false);

  // The 18 HIPAA Safe Harbor identifiers
  const identifiers = [
    { id: 1, name: 'Names', description: 'Individual, relatives, employers' },
    { id: 2, name: 'Geographic Subdivisions', description: 'Smaller than state (except first 3 ZIP digits if 20,000+ people)' },
    { id: 3, name: 'Dates', description: 'Birth, admission, discharge, death (keep year only)' },
    { id: 4, name: 'Phone Numbers', description: 'All telephone numbers' },
    { id: 5, name: 'Fax Numbers', description: 'All fax numbers' },
    { id: 6, name: 'Email Addresses', description: 'All email addresses' },
    { id: 7, name: 'Social Security Numbers', description: 'All SSNs' },
    { id: 8, name: 'Medical Record Numbers', description: 'All MRNs' },
    { id: 9, name: 'Health Plan Numbers', description: 'Health plan beneficiary numbers' },
    { id: 10, name: 'Account Numbers', description: 'All account numbers' },
    { id: 11, name: 'Certificate/License Numbers', description: 'All certificate or license numbers' },
    { id: 12, name: 'Vehicle Identifiers', description: 'License plates, serial numbers' },
    { id: 13, name: 'Device Identifiers', description: 'Device identifiers and serial numbers' },
    { id: 14, name: 'URLs', description: 'Web URLs' },
    { id: 15, name: 'IP Addresses', description: 'Internet Protocol addresses' },
    { id: 16, name: 'Biometric Identifiers', description: 'Fingerprints, voiceprints' },
    { id: 17, name: 'Photos', description: 'Full-face photos and comparable images' },
    { id: 18, name: 'Unique Identifiers', description: 'Any other unique identifying number, characteristic, or code' },
  ];

  // Patient journey stages with required identifiers
  const journeyStages = [
    {
      id: 'entrance',
      title: 'Security/Entrance',
      icon: IconDoorEnter,
      color: 'blue',
      description: 'Patient arrives at the medical facility and passes through security checkpoint',
      identifiersNeeded: [1, 17],
      identifierDetails: 'Security may visually verify identity using name and facial recognition',
      dataCollected: ['Visual identification', 'Name verification'],
      aiUseCase: 'Facial recognition systems may be used for facility access control',
      deidentificationNote: 'In de-identified datasets, remove names and avoid full-face photos'
    },
    {
      id: 'registration',
      title: 'Registration/Check-in',
      icon: IconUser,
      color: 'teal',
      description: 'Patient checks in and provides personal and insurance information',
      identifiersNeeded: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      identifierDetails: 'Comprehensive collection of demographic and contact information',
      dataCollected: [
        'Full name, address (street, city, state, ZIP)',
        'Date of birth',
        'Phone and fax numbers',
        'Email address',
        'SSN',
        'Medical record number (MRN)',
        'Insurance/health plan ID',
        'Driver license number'
      ],
      aiUseCase: 'AI systems match patient records and verify insurance eligibility',
      deidentificationNote: 'Replace with randomized IDs; use ZIP-3 only if population ≥ 20,000; keep birth year only'
    },
    {
      id: 'waiting',
      title: 'Waiting Room',
      icon: IconClock,
      color: 'gray',
      description: 'Patient waits to be called for their appointment',
      identifiersNeeded: [1, 3],
      identifierDetails: 'Name used for calling patient; date/time of appointment tracked',
      dataCollected: ['Name for patient calling', 'Appointment time', 'Wait time metrics'],
      aiUseCase: 'AI optimizes scheduling and wait time predictions',
      deidentificationNote: 'Remove names from wait logs; generalize timestamps to hour-level'
    },
    {
      id: 'triage',
      title: 'Triage/Vitals',
      icon: IconHeart,
      color: 'red',
      description: 'Initial assessment of patient condition and vital signs measurement',
      identifiersNeeded: [1, 8, 13],
      identifierDetails: 'Patient identified by name and MRN; medical devices record measurements',
      dataCollected: [
        'Blood pressure, heart rate, temperature',
        'Device serial numbers (thermometer, BP cuff)',
        'Medical equipment IDs',
        'Timestamp of measurements'
      ],
      aiUseCase: 'AI analyzes vital signs for early warning of deterioration',
      deidentificationNote: 'Remove patient name/MRN; strip device serial numbers; keep clinical values'
    },
    {
      id: 'consultation',
      title: 'Doctor Consultation',
      icon: IconStethoscope,
      color: 'indigo',
      description: 'Patient examined by healthcare provider',
      identifiersNeeded: [1, 8, 3, 17],
      identifierDetails: 'Patient identified by name/MRN; photos may be taken for documentation',
      dataCollected: [
        'Clinical notes',
        'Diagnosis codes',
        'Medical images or photos',
        'Physician observations',
        'Visit timestamp'
      ],
      aiUseCase: 'AI assists with differential diagnosis, clinical documentation, and image analysis',
      deidentificationNote: 'Remove patient identifiers; de-face medical images; generalize dates'
    },
    {
      id: 'lab',
      title: 'Lab/Diagnostic Tests',
      icon: IconFlask,
      color: 'violet',
      description: 'Patient undergoes laboratory tests or imaging studies',
      identifiersNeeded: [1, 8, 10, 13],
      identifierDetails: 'Specimens labeled with name, MRN, accession numbers; imaging equipment records device IDs',
      dataCollected: [
        'Lab test results',
        'Specimen accession numbers',
        'Imaging study IDs (X-ray, MRI, CT)',
        'Device identifiers (scanner serial numbers)',
        'DICOM metadata'
      ],
      aiUseCase: 'AI interprets medical imaging, predicts lab abnormalities, and flags critical results',
      deidentificationNote: 'Remove patient identifiers from lab reports; strip DICOM metadata tags; anonymize accession numbers'
    },
    {
      id: 'treatment',
      title: 'Treatment/Procedure',
      icon: IconPill,
      color: 'pink',
      description: 'Patient receives treatment or undergoes medical procedures',
      identifiersNeeded: [1, 8, 13, 16],
      identifierDetails: 'Patient verified using name, MRN, and sometimes biometrics; implantable devices have serial numbers',
      dataCollected: [
        'Procedure codes',
        'Implant serial numbers (pacemakers, stents)',
        'Biometric verification for medication dispensing',
        'Treatment timestamps',
        'Provider signatures'
      ],
      aiUseCase: 'AI monitors anesthesia levels, assists in robotic surgery, and tracks implantable device performance',
      deidentificationNote: 'Replace identifiers with study codes; remove device serial numbers; strip biometric data'
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy/Medication',
      icon: IconPill,
      color: 'orange',
      description: 'Patient receives prescribed medications',
      identifiersNeeded: [1, 3, 8, 11],
      identifierDetails: 'Prescriptions tied to name, MRN, DOB; pharmacist license number recorded',
      dataCollected: [
        'Medication names and dosages',
        'Prescription numbers',
        'Pharmacist license number',
        'Dispensing timestamps',
        'Drug interaction alerts'
      ],
      aiUseCase: 'AI checks for drug interactions, dosing errors, and adherence predictions',
      deidentificationNote: 'Remove patient identifiers; strip prescription numbers; remove pharmacist licenses'
    },
    {
      id: 'billing',
      title: 'Billing/Checkout',
      icon: IconCreditCard,
      color: 'yellow',
      description: 'Patient settles payment and receives billing information',
      identifiersNeeded: [1, 7, 8, 9, 10],
      identifierDetails: 'Full financial and insurance information required',
      dataCollected: [
        'Insurance claim numbers',
        'SSN for billing',
        'Account numbers',
        'Payment card data',
        'Billing codes (CPT, ICD-10)',
        'Cost and payment amounts'
      ],
      aiUseCase: 'AI predicts claim denials, optimizes billing codes, and detects fraud',
      deidentificationNote: 'Remove all financial identifiers (SSN, account numbers, claim IDs); aggregate costs'
    },
    {
      id: 'followup',
      title: 'Follow-up Scheduling',
      icon: IconCalendar,
      color: 'green',
      description: 'Patient schedules future appointments',
      identifiersNeeded: [1, 3, 4, 6, 8],
      identifierDetails: 'Contact information and MRN used for appointment reminders',
      dataCollected: [
        'Future appointment dates',
        'Phone numbers for reminders',
        'Email addresses for confirmations',
        'MRN for record linking',
        'Preferred contact methods'
      ],
      aiUseCase: 'AI sends personalized appointment reminders, predicts no-show risk, and optimizes scheduling',
      deidentificationNote: 'Remove all contact information; replace MRN with study ID; generalize appointment dates'
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="blue">
            <IconShieldCheck size={30} />
          </ThemeIcon>
          <Box>
            <Title order={1}>HIPAA Safe Harbor De-identification Method</Title>
            <Text c="dimmed">Understanding the 18 identifiers through a patient journey</Text>
          </Box>
        </Group>
      </Box>

      <Alert icon={<IconAlertCircle />} color="blue" mb="xl">
        <Text fw={600} mb="xs">What is the Safe Harbor Method?</Text>
        <Text size="sm">
          The HIPAA Safe Harbor method is one of two ways to de-identify protected health information (PHI). 
          To properly de-identify data under this method, you must remove or generalize all 18 identifier categories listed below. 
          Once properly de-identified, the data is no longer considered PHI and can be used more freely for research, AI training, and analytics.
        </Text>
      </Alert>

      {/* The 18 Identifiers */}
      <Modal
        opened={policyModalOpened}
        onClose={() => setPolicyModalOpened(false)}
        title="What is a Data Policy?"
        size="lg"
        centered
      >
        <Box>
          <Group mb="md">
            <ThemeIcon size={40} radius="md" color="blue" variant="light">
              <IconShield size={24} />
            </ThemeIcon>
            <Box>
              <Text fw={600} size="lg">Data Policy Definition</Text>
              <Text size="sm" c="dimmed">A formal framework for data governance</Text>
            </Box>
          </Group>

          <Text mb="md">
            A <strong>data policy</strong> is a formal document that establishes rules, guidelines, and procedures 
            for how an organization collects, stores, processes, shares, and protects data throughout its lifecycle.
          </Text>

          <Divider my="md" />

          <Title order={4} mb="md">Key Components of a Data Policy</Title>
          <List spacing="sm" mb="md">
            <List.Item>
              <Text fw={600}>Data Classification:</Text> Categorizing data by sensitivity (public, internal, confidential, restricted)
            </List.Item>
            <List.Item>
              <Text fw={600}>Access Controls:</Text> Who can access what data and under what circumstances
            </List.Item>
            <List.Item>
              <Text fw={600}>Data Handling Procedures:</Text> How data should be collected, stored, transmitted, and disposed of
            </List.Item>
            <List.Item>
              <Text fw={600}>Compliance Requirements:</Text> Legal and regulatory obligations (HIPAA, GDPR, etc.)
            </List.Item>
            <List.Item>
              <Text fw={600}>Breach Response:</Text> Procedures for handling data incidents and breaches
            </List.Item>
            <List.Item>
              <Text fw={600}>Audit and Monitoring:</Text> How compliance is tracked and verified
            </List.Item>
          </List>

          <Divider my="md" />

          <Title order={4} mb="md">How It Fits Into Business</Title>
          <Paper p="md" bg="blue.0" radius="md" mb="md">
            <Group mb="xs">
              <IconBuildingBank size={20} />
              <Text fw={600}>Business Integration</Text>
            </Group>
            <Text size="sm" mb="xs">
              A data policy serves as the foundation for:
            </Text>
            <List size="sm" spacing="xs">
              <List.Item>Protecting the organization from legal liability and regulatory fines</List.Item>
              <List.Item>Building customer trust through transparent data practices</List.Item>
              <List.Item>Enabling secure data-driven decision making and AI initiatives</List.Item>
              <List.Item>Establishing accountability across departments and roles</List.Item>
              <List.Item>Reducing risk of data breaches and associated costs</List.Item>
              <List.Item>Supporting business continuity and disaster recovery</List.Item>
            </List>
          </Paper>

          <Alert icon={<IconInfoCircle />} color="green" mb="md">
            <Text size="sm" fw={600} mb="xs">For Healthcare AI:</Text>
            <Text size="sm">
              Your data policy must explicitly address the 18 HIPAA identifiers and specify 
              de-identification methods (Safe Harbor or Expert Determination) to ensure compliance 
              when using patient data for AI training and analytics.
            </Text>
          </Alert>

          <Divider my="md" />

          <Title order={4} mb="md">Prompt to Create Your Policy</Title>
          <Text size="sm" mb="sm" c="dimmed">
            Use this prompt with an AI assistant or as a guide to write your data policy:
          </Text>
          <Paper p="md" bg="gray.0" radius="md" mb="md" style={{ position: 'relative' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed">AI Prompt Template</Text>
              <CopyButton value={`Create a comprehensive data handling and de-identification policy for a healthcare AI project that addresses all 18 HIPAA Safe Harbor identifiers. The policy should include:

1. An executive summary explaining the purpose and scope of the policy
2. Definitions of key terms (PHI, de-identification, Safe Harbor method)
3. A detailed section for each of the 18 HIPAA identifiers with:
   - What the identifier is and examples
   - When and where it's collected in our healthcare workflow
   - Specific procedures for removing or generalizing it
   - Technical implementation details
   - Exceptions or special cases

4. Data lifecycle procedures:
   - Collection and initial storage
   - Processing and analysis
   - De-identification workflow
   - Quality assurance and validation
   - Secure disposal

5. Roles and responsibilities:
   - Data steward
   - Privacy officer
   - IT security team
   - Department heads
   - External partners/vendors

6. Compliance and audit:
   - Documentation requirements
   - Regular audit procedures
   - Re-identification risk assessment
   - Incident response procedures

7. Training requirements for staff

8. Policy review and update schedule

The 18 HIPAA Safe Harbor Identifiers to address:
1. Names (individual, relatives, employers)
2. Geographic subdivisions smaller than state (except first 3 ZIP digits if population ≥ 20,000)
3. Dates (birth, admission, discharge, death - keep year only)
4. Phone numbers
5. Fax numbers
6. Email addresses
7. Social Security Numbers
8. Medical Record Numbers (MRNs)
9. Health Plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers and serial numbers
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers
17. Full-face photos and comparable images
18. Any other unique identifying number, characteristic, or code

Format the policy in a professional business document style with clear sections, numbered lists, and practical examples relevant to a healthcare AI system that processes patient data for training machine learning models.`}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy prompt'} withArrow position="left">
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              readOnly
              autosize
              minRows={8}
              maxRows={15}
              value={`Create a comprehensive data handling and de-identification policy for a healthcare AI project that addresses all 18 HIPAA Safe Harbor identifiers. The policy should include:

1. An executive summary explaining the purpose and scope of the policy
2. Definitions of key terms (PHI, de-identification, Safe Harbor method)
3. A detailed section for each of the 18 HIPAA identifiers with:
   - What the identifier is and examples
   - When and where it's collected in our healthcare workflow
   - Specific procedures for removing or generalizing it
   - Technical implementation details
   - Exceptions or special cases

4. Data lifecycle procedures:
   - Collection and initial storage
   - Processing and analysis
   - De-identification workflow
   - Quality assurance and validation
   - Secure disposal

5. Roles and responsibilities:
   - Data steward
   - Privacy officer
   - IT security team
   - Department heads
   - External partners/vendors

6. Compliance and audit:
   - Documentation requirements
   - Regular audit procedures
   - Re-identification risk assessment
   - Incident response procedures

7. Training requirements for staff

8. Policy review and update schedule

The 18 HIPAA Safe Harbor Identifiers to address:
1. Names (individual, relatives, employers)
2. Geographic subdivisions smaller than state (except first 3 ZIP digits if population ≥ 20,000)
3. Dates (birth, admission, discharge, death - keep year only)
4. Phone numbers
5. Fax numbers
6. Email addresses
7. Social Security Numbers
8. Medical Record Numbers (MRNs)
9. Health Plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers and serial numbers
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers
17. Full-face photos and comparable images
18. Any other unique identifying number, characteristic, or code

Format the policy in a professional business document style with clear sections, numbered lists, and practical examples relevant to a healthcare AI system that processes patient data for training machine learning models.`}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  backgroundColor: 'white',
                },
              }}
            />
          </Paper>

          <Group justify="flex-end">
            <Button onClick={() => setPolicyModalOpened(false)}>Got it</Button>
          </Group>
        </Box>
      </Modal>

      <Paper p="lg" mb="xl" withBorder>
        <Title order={2} mb="md">The 18 HIPAA Safe Harbor Identifiers</Title>
        <Text c="dimmed" mb="lg">All of these must be removed or generalized for proper de-identification:</Text>
        <Text fw={700} size="lg" mb="lg">
          Assignment: Write a{' '}
          <Anchor
            component="button"
            type="button"
            onClick={() => setPolicyModalOpened(true)}
            fw={700}
            c="blue"
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            policy
          </Anchor>
          {' '}that includes all of these identifiers and how they should be handled.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {identifiers.map((identifier) => (
            <Card key={identifier.id} padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm">{identifier.id}. {identifier.name}</Text>
                <Badge size="sm">{identifier.id}</Badge>
              </Group>
              <Text size="xs" c="dimmed">{identifier.description}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Paper>

      {/* Patient Journey Timeline */}
      <Title order={2} mb="md">Patient Journey: Identifiers at Each Stage</Title>
      <Text c="dimmed" mb="xl">
        Follow a patient&apos;s journey through a healthcare facility to see which identifiers are collected and used at each stage.
        Click on any stage to see details about de-identification requirements and AI use cases.
      </Text>

      <Timeline active={journeyStages.length} bulletSize={40} lineWidth={3}>
        {journeyStages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isActive = activeStage === stage.id;

          return (
            <Timeline.Item
              key={stage.id}
              bullet={
                <ThemeIcon size={40} variant="filled" radius="xl" color={stage.color}>
                  <StageIcon size={20} />
                </ThemeIcon>
              }
              title={
                <Group gap="xs">
                  <Text fw={600} size="lg">{stage.title}</Text>
                  <Badge color={stage.color} variant="light">
                    {stage.identifiersNeeded.length} Identifiers
                  </Badge>
                </Group>
              }
            >
              <Paper
                p="md"
                mb="xl"
                withBorder
                onClick={() => setActiveStage(isActive ? null : stage.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                bg={isActive ? `${stage.color}.0` : 'white'}
              >
                <Text size="sm" mb="md">{stage.description}</Text>

                <Group gap="xs" mb="md">
                  <Text size="xs" fw={600} c="dimmed">Identifiers Used:</Text>
                  {stage.identifiersNeeded.map((id) => (
                    <Badge key={id} size="sm" variant="filled" color={stage.color}>
                      #{id}
                    </Badge>
                  ))}
                </Group>

                {isActive && (
                  <>
                    <Divider my="md" />

                    <Box mb="md">
                      <Text fw={600} size="sm" mb="xs">Why These Identifiers?</Text>
                      <Text size="sm" c="dimmed">{stage.identifierDetails}</Text>
                    </Box>

                    <Box mb="md">
                      <Text fw={600} size="sm" mb="xs">Data Collected:</Text>
                      <List size="sm" spacing="xs">
                        {stage.dataCollected.map((item, idx) => (
                          <List.Item key={idx}>{item}</List.Item>
                        ))}
                      </List>
                    </Box>

                    <Box mb="md">
                      <Text fw={600} size="sm" mb="xs">AI Use Case:</Text>
                      <Text size="sm" c="dimmed">{stage.aiUseCase}</Text>
                    </Box>

                    <Paper p="md" bg="yellow.0" radius="md">
                      <Group mb="xs">
                        <IconAlertCircle size={16} />
                        <Text fw={600} size="sm">De-identification Requirement:</Text>
                      </Group>
                      <Text size="sm">{stage.deidentificationNote}</Text>
                    </Paper>
                  </>
                )}
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* Summary */}
      <Paper p="xl" mt="xl" withBorder bg="blue.0">
        <Title order={3} mb="md">Key Takeaways for AI Projects</Title>
        <List spacing="md" size="sm">
          <List.Item>
            <Text fw={600}>Comprehensive Removal Required:</Text> All 18 identifier categories must be addressed to properly de-identify under Safe Harbor method
          </List.Item>
          <List.Item>
            <Text fw={600}>Context Matters:</Text> Different healthcare processes collect different identifiers - understand your data flow
          </List.Item>
          <List.Item>
            <Text fw={600}>AI Training Implications:</Text> De-identified data can be used for AI training without individual patient authorization
          </List.Item>
          <List.Item>
            <Text fw={600}>Device and Technical IDs:</Text> Do not forget non-obvious identifiers like device serial numbers, IP addresses, and URLs
          </List.Item>
          <List.Item>
            <Text fw={600}>Generalization vs. Removal:</Text> Some identifiers like dates and ZIP codes can be generalized instead of completely removed
          </List.Item>
          <List.Item>
            <Text fw={600}>Documentation:</Text> Maintain detailed records of your de-identification process for compliance audits
          </List.Item>
        </List>
      </Paper>
    </Container>
  );
};

export default SafeHarborPage;
