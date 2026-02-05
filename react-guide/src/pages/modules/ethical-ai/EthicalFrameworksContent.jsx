import React from 'react';
import {
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  Card,
  SimpleGrid,
  Anchor,
  Alert,
  Timeline,
  Table,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconExternalLink,
  IconGavel,
  IconWorld,
  IconBuilding,
  IconCertificate,
  IconBook,
} from '@tabler/icons-react';
import styles from './EthicalAI.module.css';

export default function EthicalFrameworksContent() {
  return (
    <Box>
      {/* Introduction */}
      <Text size="lg" mb="lg">
        Ethical AI frameworks provide structured approaches to building responsible AI systems. 
        Understanding these frameworks—from voluntary guidelines to legally binding regulations—helps 
        data scientists navigate the complex landscape of AI ethics and ensure compliance.
      </Text>

      {/* Real-World Case Study */}
      <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
        <Group mb="md">
          <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
          <Text fw={700} size="lg">EU AI Act Enforcement: Clearview AI (2022-2024)</Text>
        </Group>
        
        <Text mb="md">
          Clearview AI, a facial recognition company, scraped billions of images from social media 
          to build a facial recognition database sold to law enforcement. Multiple EU data protection 
          authorities found the company in violation of GDPR and emerging AI regulations.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Text fw={600} c="red.7" mb="xs">Violations Identified</Text>
            <List size="sm" spacing="xs">
              <List.Item>No legal basis for data collection (GDPR Art. 6)</List.Item>
              <List.Item>No consent from individuals whose faces were used</List.Item>
              <List.Item>Processing of biometric data without explicit consent</List.Item>
              <List.Item>Failed to respond to data subject access requests</List.Item>
              <List.Item>No transparency about data processing</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={600} c="orange.7" mb="xs">Consequences</Text>
            <List size="sm" spacing="xs">
              <List.Item>€20 million fine from Italian DPA (2022)</List.Item>
              <List.Item>€20 million fine from Greek DPA (2022)</List.Item>
              <List.Item>£7.5 million fine from UK ICO (2022)</List.Item>
              <List.Item>Ordered to delete all EU citizen data</List.Item>
              <List.Item>Banned from operating in multiple countries</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Text size="sm" c="dimmed" fs="italic">
          <Text span fw={600}>Lesson: </Text>
          {"Even if technology is innovative, it must comply with existing data protection laws and emerging AI-specific regulations. \"Move fast and break things\" doesn't work with AI ethics."}
        </Text>
      </Paper>

      {/* Major Frameworks */}
      <Title order={2} mb="md">Major Ethical AI Frameworks</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
        {/* EU AI Act */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="blue" size={50} radius="xl">
              <IconWorld size={26} />
            </ThemeIcon>
            <Box>
              <Badge color="blue" variant="filled" mb="xs">LEGALLY BINDING</Badge>
              <Title order={4}>EU AI Act</Title>
            </Box>
          </Group>
          
          <Text size="sm" mb="md">
            {"The world's first comprehensive AI law. Categorizes AI systems by risk level with corresponding requirements."}
          </Text>

          <Text fw={600} size="sm" mb="xs">Risk Categories:</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item><Text span c="red" fw={600}>Unacceptable:</Text> Social scoring, real-time biometric ID in public</List.Item>
            <List.Item><Text span c="orange" fw={600}>High-Risk:</Text> Healthcare AI, hiring systems, credit scoring</List.Item>
            <List.Item><Text span c="yellow.7" fw={600}>Limited:</Text> Chatbots, emotion recognition (transparency required)</List.Item>
            <List.Item><Text span c="green" fw={600}>Minimal:</Text> Spam filters, video games (no requirements)</List.Item>
          </List>

          <Text fw={600} size="sm" mb="xs">Requirements for High-Risk AI:</Text>
          <List size="xs" spacing="xs">
            <List.Item>Risk management system</List.Item>
            <List.Item>Data governance requirements</List.Item>
            <List.Item>Technical documentation</List.Item>
            <List.Item>Human oversight measures</List.Item>
            <List.Item>Accuracy, robustness, cybersecurity</List.Item>
          </List>

          <Divider my="md" />
          <Text size="xs" c="dimmed">Effective: August 2024 (phased implementation through 2027)</Text>
        </Card>

        {/* IEEE Ethically Aligned Design */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="grape" size={50} radius="xl">
              <IconCertificate size={26} />
            </ThemeIcon>
            <Box>
              <Badge color="grape" variant="filled" mb="xs">INDUSTRY STANDARD</Badge>
              <Title order={4}>IEEE Ethically Aligned Design</Title>
            </Box>
          </Group>
          
          <Text size="sm" mb="md">
            Comprehensive framework from IEEE covering ethical considerations for autonomous and 
            intelligent systems across their entire lifecycle.
          </Text>

          <Text fw={600} size="sm" mb="xs">Core Principles:</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item><Text span fw={600}>Human Rights:</Text> Respect fundamental rights and freedoms</List.Item>
            <List.Item><Text span fw={600}>Well-being:</Text> Prioritize human well-being as success metric</List.Item>
            <List.Item><Text span fw={600}>Data Agency:</Text> Users control their own data</List.Item>
            <List.Item><Text span fw={600}>Effectiveness:</Text> Measure by achievement of intended goals</List.Item>
            <List.Item><Text span fw={600}>Transparency:</Text> Make operations understandable</List.Item>
            <List.Item><Text span fw={600}>Accountability:</Text> Clear responsibility chains</List.Item>
            <List.Item><Text span fw={600}>Awareness of Misuse:</Text> Prevent malicious use</List.Item>
            <List.Item><Text span fw={600}>Competence:</Text> Creators must understand ethics</List.Item>
          </List>

          <Anchor href="https://ethicsinaction.ieee.org/" target="_blank" size="sm">
            Full Framework <IconExternalLink size={12} />
          </Anchor>
        </Card>

        {/* OECD AI Principles */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="teal" size={50} radius="xl">
              <IconBuilding size={26} />
            </ThemeIcon>
            <Box>
              <Badge color="teal" variant="filled" mb="xs">INTERNATIONAL</Badge>
              <Title order={4}>OECD AI Principles</Title>
            </Box>
          </Group>
          
          <Text size="sm" mb="md">
            Adopted by 46 countries, these principles guide trustworthy AI development and have 
            influenced national AI strategies globally.
          </Text>

          <Text fw={600} size="sm" mb="xs">Five Principles:</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item><Text span fw={600}>Inclusive Growth:</Text> Benefit people and planet</List.Item>
            <List.Item><Text span fw={600}>Human-Centered Values:</Text> Respect rule of law and human rights</List.Item>
            <List.Item><Text span fw={600}>Transparency:</Text> Enable understanding of AI systems</List.Item>
            <List.Item><Text span fw={600}>Robustness & Safety:</Text> Secure and resilient</List.Item>
            <List.Item><Text span fw={600}>Accountability:</Text> Organizations responsible for AI systems</List.Item>
          </List>

          <Anchor href="https://oecd.ai/en/ai-principles" target="_blank" size="sm">
            OECD AI Policy Observatory <IconExternalLink size={12} />
          </Anchor>
        </Card>

        {/* NIST AI RMF */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="orange" size={50} radius="xl">
              <IconGavel size={26} />
            </ThemeIcon>
            <Box>
              <Badge color="orange" variant="filled" mb="xs">US STANDARD</Badge>
              <Title order={4}>NIST AI Risk Management Framework</Title>
            </Box>
          </Group>
          
          <Text size="sm" mb="md">
            Voluntary framework for managing AI risks. Increasingly referenced in US federal 
            procurement and becoming de facto standard for US-based AI development.
          </Text>

          <Text fw={600} size="sm" mb="xs">Four Core Functions:</Text>
          <List size="sm" spacing="xs" mb="md">
            <List.Item><Text span fw={600}>GOVERN:</Text> Cultivate culture of risk management</List.Item>
            <List.Item><Text span fw={600}>MAP:</Text> Understand context and identify risks</List.Item>
            <List.Item><Text span fw={600}>MEASURE:</Text> Analyze and assess risks</List.Item>
            <List.Item><Text span fw={600}>MANAGE:</Text> Prioritize and respond to risks</List.Item>
          </List>

          <Anchor href="https://www.nist.gov/itl/ai-risk-management-framework" target="_blank" size="sm">
            Full Framework <IconExternalLink size={12} />
          </Anchor>
        </Card>
      </SimpleGrid>

      {/* Comparison Table */}
      <Title order={2} mb="md">Framework Comparison</Title>
      
      <Paper p="md" radius="md" withBorder mb="xl" style={{ overflowX: 'auto' }}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Aspect</Table.Th>
              <Table.Th>EU AI Act</Table.Th>
              <Table.Th>IEEE EAD</Table.Th>
              <Table.Th>OECD</Table.Th>
              <Table.Th>NIST AI RMF</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={600}>Legal Status</Table.Td>
              <Table.Td><Badge color="red" size="sm">Binding Law</Badge></Table.Td>
              <Table.Td><Badge color="blue" size="sm">Voluntary</Badge></Table.Td>
              <Table.Td><Badge color="blue" size="sm">Voluntary</Badge></Table.Td>
              <Table.Td><Badge color="blue" size="sm">Voluntary</Badge></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Geographic Scope</Table.Td>
              <Table.Td>EU + Global Reach*</Table.Td>
              <Table.Td>Global</Table.Td>
              <Table.Td>46 Countries</Table.Td>
              <Table.Td>United States</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Penalties</Table.Td>
              <Table.Td>Up to €35M or 7% revenue</Table.Td>
              <Table.Td>None</Table.Td>
              <Table.Td>None</Table.Td>
              <Table.Td>None (yet)</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Focus</Table.Td>
              <Table.Td>Risk classification</Table.Td>
              <Table.Td>Design principles</Table.Td>
              <Table.Td>National policy</Table.Td>
              <Table.Td>Risk management</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Healthcare Relevance</Table.Td>
              <Table.Td>High-risk category</Table.Td>
              <Table.Td>Sector-specific guidance</Table.Td>
              <Table.Td>General principles</Table.Td>
              <Table.Td>Use case profiles</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Text size="xs" c="dimmed" mt="sm">
          *EU AI Act applies to any AI system affecting EU citizens, regardless of where the provider is located.
        </Text>
      </Paper>

      {/* Practical Application */}
      <Title order={2} mb="md">Applying Frameworks in Practice</Title>
      
      <Timeline active={-1} bulletSize={24} lineWidth={2} mb="xl">
        <Timeline.Item bullet={<IconBook size={12} />} title="Step 1: Identify Applicable Frameworks">
          <Text size="sm" c="dimmed" mt="xs">
            {"Determine which frameworks apply based on your geographic scope, industry, and AI application type. For healthcare AI targeting global markets, you'll likely need to consider EU AI Act, FDA guidance, and HIPAA alongside voluntary frameworks."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 2: Classify Your System's Risk Level">
          <Text size="sm" c="dimmed" mt="xs">
            {"Under EU AI Act, most healthcare diagnostic AI qualifies as \"high-risk.\" This triggers mandatory requirements for documentation, testing, and monitoring. Map your system against each framework's risk taxonomy."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 3: Create Compliance Documentation">
          <Text size="sm" c="dimmed" mt="xs">
            {"Build documentation that satisfies multiple frameworks simultaneously. A single \"Model Card\" can address transparency requirements from EU AI Act, IEEE EAD, and NIST AI RMF."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 4: Implement Required Controls">
          <Text size="sm" c="dimmed" mt="xs">
            For high-risk AI: implement human oversight mechanisms, establish data governance, create risk 
            management systems, and ensure technical robustness through testing.
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 5: Establish Ongoing Monitoring">
          <Text size="sm" c="dimmed" mt="xs">
            Frameworks require continuous monitoring, not just pre-deployment compliance. Set up dashboards 
            to track fairness metrics, accuracy degradation, and incident reports.
          </Text>
        </Timeline.Item>
      </Timeline>

      {/* Pitfalls */}
      <Title order={2} mb="md">Common Pitfalls to Avoid</Title>
      
      <Paper p="lg" radius="md" className={styles.pitfallCard} mb="xl">
        <Title order={4} mb="md" c="red.8">🚫 Framework Implementation Mistakes</Title>
        
        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">1</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>{"\"We're US-based, EU AI Act doesn't apply\""}</Text>
            <Text size="sm" c="dimmed">
              {"Wrong. If your AI system affects EU citizens (including EU patients in clinical trials or using your health app), you're subject to EU AI Act. This is similar to how GDPR works."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">2</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Treating frameworks as checkbox exercises</Text>
            <Text size="sm" c="dimmed">
              Frameworks are meant to guide genuine ethical practice, not just generate paperwork. 
              Regulators are increasingly looking at whether controls are actually effective, not just documented.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">3</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Waiting until deployment to consider compliance</Text>
            <Text size="sm" c="dimmed">
              Framework requirements should be integrated from the design phase. Retrofitting compliance 
              is expensive and often impossible without significant rework.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">4</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>{"Ignoring voluntary frameworks because they're not laws"}</Text>
            <Text size="sm" c="dimmed">
              {"Voluntary frameworks like NIST AI RMF are increasingly referenced in contracts, insurance requirements, and procurement standards. They also provide legal \"due diligence\" evidence."}
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Success Checklist */}
      <Paper p="lg" radius="md" className={styles.successCard}>
        <Title order={4} mb="md" c="green.8">✅ Your Framework Compliance Checklist</Title>
        
        <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
          <List.Item>Inventory all applicable frameworks based on geography and use case</List.Item>
          <List.Item>Classify AI system risk level under each framework</List.Item>
          <List.Item>Create unified documentation that addresses multiple frameworks</List.Item>
          <List.Item>Designate a responsible person/team for AI governance</List.Item>
          <List.Item>Implement human oversight mechanisms appropriate to risk level</List.Item>
          <List.Item>Establish data governance procedures meeting highest applicable standard</List.Item>
          <List.Item>Create incident response procedures for AI failures</List.Item>
          <List.Item>Schedule regular compliance reviews (quarterly minimum)</List.Item>
          <List.Item>Train development team on applicable framework requirements</List.Item>
          <List.Item>Maintain audit trail of all compliance activities</List.Item>
        </List>
      </Paper>
    </Box>
  );
}
