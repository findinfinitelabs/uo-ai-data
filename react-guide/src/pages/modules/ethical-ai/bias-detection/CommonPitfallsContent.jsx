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
  SimpleGrid,
  Alert,
  Anchor,
  Card,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconExternalLink,
} from '@tabler/icons-react';
import styles from '../EthicalAI.module.css';

export default function CommonPitfallsContent() {
  return (
    <Box>
      {/* Pitfalls */}
      <Title order={2} mb="md">Common Pitfalls to Avoid</Title>
      
      <Alert 
        icon={<IconAlertTriangle size={20} />} 
        title="Fairness-Accuracy Trade-off Misconception" 
        color="red"
        mb="md"
      >
        Many assume improving fairness always hurts accuracy. Research shows that with proper techniques, 
        {"you can often maintain or even improve accuracy while reducing bias. Don't use this as an excuse "}
        to skip bias mitigation.
      </Alert>

      <Paper p="lg" radius="md" className={styles.pitfallCard} mb="xl">
        <Title order={4} mb="md" c="red.8">🚫 Pitfalls That Will Get You in Trouble</Title>
        
        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">1</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Testing only on aggregate data</Text>
            <Text size="sm" c="dimmed">
              A model with 95% overall accuracy might have 70% accuracy for minority groups. 
              Always disaggregate your evaluation.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">2</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>{"Assuming \"blindness\" prevents bias"}</Text>
            <Text size="sm" c="dimmed">
              {"Removing protected attributes doesn't prevent discrimination. Proxy variables (zip code, name patterns, insurance type) can encode the same information."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">3</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>One-time bias check</Text>
            <Text size="sm" c="dimmed">
              Bias can emerge over time as data distributions shift. Implement continuous 
              monitoring, not just pre-deployment testing.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">4</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Ignoring intersectionality</Text>
            <Text size="sm" c="dimmed">
              A model might be fair for women overall and fair for Black patients overall, 
              but severely biased against Black women specifically. Check intersecting groups.
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Practical Checklist */}
      <Paper p="lg" radius="md" className={styles.successCard}>
        <Title order={4} mb="md" c="green.8">✅ Your Bias Detection Checklist</Title>
        
        <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
          <List.Item>Document demographic composition of training data</List.Item>
          <List.Item>Calculate performance metrics disaggregated by protected groups</List.Item>
          <List.Item>Test for proxy variables that correlate with protected attributes</List.Item>
          <List.Item>Compute at least 2 fairness metrics (demographic parity + equalized odds)</List.Item>
          <List.Item>Analyze intersectional groups (e.g., age + gender + race combinations)</List.Item>
          <List.Item>Compare model recommendations to historical outcomes for bias patterns</List.Item>
          <List.Item>Set up monitoring dashboards for ongoing bias detection</List.Item>
          <List.Item>Include diverse stakeholders in review of model outputs</List.Item>
        </List>
      </Paper>

      {/* Tools */}
      <Title order={2} mt="xl" mb="md">Recommended Tools</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group mb="sm">
            <Badge color="blue">Python</Badge>
            <Text fw={600}>IBM AI Fairness 360</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            Comprehensive toolkit with 70+ fairness metrics and 10+ bias mitigation algorithms.
          </Text>
          <Anchor href="https://aif360.mybluemix.net/" target="_blank" size="sm">
            Documentation <IconExternalLink size={12} />
          </Anchor>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group mb="sm">
            <Badge color="green">Python</Badge>
            <Text fw={600}>Fairlearn (Microsoft)</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            User-friendly library for assessing and improving fairness of ML models.
          </Text>
          <Anchor href="https://fairlearn.org/" target="_blank" size="sm">
            Documentation <IconExternalLink size={12} />
          </Anchor>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
