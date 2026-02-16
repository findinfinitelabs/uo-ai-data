import React from 'react';
import {
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Box,
} from '@mantine/core';
import {
  IconCircleCheck,
} from '@tabler/icons-react';
import styles from '../EthicalAI.module.css';

export default function CommonPitfallsContent() {
  return (
    <Box>
      <Text size="lg" mb="xl">
        Avoid these common mistakes when implementing ethical AI frameworks, and use the checklist 
        below to ensure comprehensive compliance.
      </Text>

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
