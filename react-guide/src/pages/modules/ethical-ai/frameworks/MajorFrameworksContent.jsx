import React, { useState } from 'react';
import {
  Title,
  Text,
  Card,
  List,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  SimpleGrid,
  Anchor,
  Alert,
  Modal,
} from '@mantine/core';
import {
  IconExternalLink,
  IconGavel,
  IconWorld,
  IconBuilding,
  IconCertificate,
  IconBriefcase,
} from '@tabler/icons-react';
import styles from '../EthicalAI.module.css';

export default function MajorFrameworksContent() {
  const [openModal, setOpenModal] = useState(null);

  const closeModal = () => setOpenModal(null);

  return (
    <Box>
      <Text size="lg" mb="xl">
        Four major frameworks shape the ethical AI landscape globally. Understanding their scope, 
        requirements, and legal status is essential for compliant AI development.
      </Text>

      <Alert icon={<IconBriefcase size={16} />} color="blue" variant="light" mb="xl">
        <Text size="sm" fw={600} mb={4}>💼 For Business Students</Text>
        <Text size="sm">
          Click any framework card below to see how it impacts your future career working with data and AI.
        </Text>
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
        {/* EU AI Act */}
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder 
          className={styles.frameworkCard}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpenModal('eu-ai-act')}
        >
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
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder 
          className={styles.frameworkCard}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpenModal('ieee')}
        >
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
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder 
          className={styles.frameworkCard}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpenModal('oecd')}
        >
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
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder 
          className={styles.frameworkCard}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpenModal('nist')}
        >
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

      {/* Modals for Career Impact */}
      <Modal opened={openModal === 'eu-ai-act'} onClose={closeModal} size="lg" title="EU AI Act: Career Impact">
        <Box p="md" style={{ background: 'rgba(66, 135, 245, 0.05)', borderRadius: '8px' }}>
          <Group mb="md">
            <IconBriefcase size={24} color="#4287f5" />
            <Text fw={600} size="lg" c="blue.7">How This Impacts Your Career</Text>
          </Group>
          <List size="sm" spacing="md">
            <List.Item>
              <Text span fw={600}>Global reach:</Text> If you work for any company selling to EU customers (even if you're US-based), you must comply. This affects most multinational businesses.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Career opportunities:</Text> Companies need AI compliance officers, data governance specialists, and ethical AI consultants. Understanding EU AI Act makes you valuable.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Financial stakes:</Text> Fines up to €35M or 7% of global revenue. Your employer will invest heavily in compliance—be the person who knows how.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Practical impact:</Text> Any customer-facing AI you build (chatbots, recommendation engines, credit scoring, hiring tools) needs risk classification and documentation.
            </List.Item>
            <List.Item>
              <Text span fw={600}>First-mover advantage:</Text> Most companies are still figuring this out. Learning it now gives you 2-3 years head start over peers.
            </List.Item>
          </List>
        </Box>
      </Modal>

      <Modal opened={openModal === 'ieee'} onClose={closeModal} size="lg" title="IEEE Ethically Aligned Design: Career Impact">
        <Box p="md" style={{ background: 'rgba(190, 75, 219, 0.05)', borderRadius: '8px' }}>
          <Group mb="md">
            <IconBriefcase size={24} color="#be4bdb" />
            <Text fw={600} size="lg" c="grape.7">How This Impacts Your Career</Text>
          </Group>
          <List size="sm" spacing="md">
            <List.Item>
              <Text span fw={600}>Professional credibility:</Text> IEEE is the world's largest technical professional organization. Knowing their standards demonstrates competence to employers.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Industry certifications:</Text> Many AI certifications and professional credentials reference IEEE guidelines. This framework appears on job descriptions for AI product managers and ML engineers.
            </List.Item>
            <List.Item>
              <Text span fw={600}>RFP requirements:</Text> Government and enterprise RFPs (Request for Proposals) increasingly require IEEE alignment. If you're in consulting or sales, you'll see this.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Risk mitigation:</Text> Following IEEE principles reduces legal liability and builds customer trust—making your projects more likely to succeed and get funded.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Cross-industry applicability:</Text> IEEE covers healthcare, finance, manufacturing, and autonomous systems. Learn once, apply everywhere in your career.
            </List.Item>
          </List>
        </Box>
      </Modal>

      <Modal opened={openModal === 'oecd'} onClose={closeModal} size="lg" title="OECD AI Principles: Career Impact">
        <Box p="md" style={{ background: 'rgba(18, 184, 134, 0.05)', borderRadius: '8px' }}>
          <Group mb="md">
            <IconBriefcase size={24} color="#12b886" />
            <Text fw={600} size="lg" c="teal.7">How This Impacts Your Career</Text>
          </Group>
          <List size="sm" spacing="md">
            <List.Item>
              <Text span fw={600}>Government influence:</Text> Adopted by 46 countries including US, UK, Canada, Japan, and most of Europe. Shapes national AI policy and regulation.
            </List.Item>
            <List.Item>
              <Text span fw={600}>International business:</Text> If you work for a multinational or plan to work across borders, OECD provides a common language and shared expectations.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Policy careers:</Text> Interested in AI policy, government consulting, or working at international organizations? OECD principles are foundational knowledge.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Enterprise requirements:</Text> Large companies and government contractors often require OECD alignment in their AI governance frameworks.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Stakeholder communication:</Text> OECD's high-level principles help you explain AI ethics to executives, board members, and non-technical stakeholders.
            </List.Item>
          </List>
        </Box>
      </Modal>

      <Modal opened={openModal === 'nist'} onClose={closeModal} size="lg" title="NIST AI Risk Management Framework: Career Impact">
        <Box p="md" style={{ background: 'rgba(253, 126, 20, 0.05)', borderRadius: '8px' }}>
          <Group mb="md">
            <IconBriefcase size={24} color="#fd7e14" />
            <Text fw={600} size="lg" c="orange.7">How This Impacts Your Career</Text>
          </Group>
          <List size="sm" spacing="md">
            <List.Item>
              <Text span fw={600}>Federal contracts:</Text> Required for US government AI projects (defense, healthcare, infrastructure). The federal government is the world's largest buyer of technology.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Enterprise standard:</Text> Becoming the de facto standard for Fortune 500 companies in the US. If you work for a large company, you'll likely use NIST.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Insurance requirement:</Text> Some cyber insurance policies now require NIST AI RMF compliance for AI systems coverage. This trend is accelerating.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Practical tools:</Text> NIST provides templates, playbooks, and implementation guides you can use immediately—not just theory. Real career value on day one.
            </List.Item>
            <List.Item>
              <Text span fw={600}>Job market demand:</Text> "NIST AI RMF" is appearing in more data scientist and ML engineer job postings. Employers want people who can implement it.
            </List.Item>
          </List>
        </Box>
      </Modal>
    </Box>
  );
}
