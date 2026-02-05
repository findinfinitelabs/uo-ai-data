import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Group,
  Box,
  List,
  ThemeIcon,
  Card,
  SimpleGrid,
  Alert,
  Timeline,
  Accordion,
} from '@mantine/core';
import {
  IconScale,
  IconAlertCircle,
  IconChartBar,
  IconDatabase,
  IconUser,
  IconMath,
  IconDoorEnter,
  IconStethoscope,
  IconFlask,
  IconClock,
} from '@tabler/icons-react';

const ExpertDeterminationPage = () => {
  // Patient journey with statistical de-identification approach
  const statisticalStages = [
    {
      id: 'arrival',
      title: 'Patient Arrival & Triage',
      icon: IconDoorEnter,
      color: 'blue',
      description: 'Initial patient contact and assessment',
      dataPoints: [
        'Arrival timestamp (generalized to hour)',
        'Age (converted to 10-year bands: 20-29, 30-39, etc.)',
        'Gender (kept if common)',
        'ZIP code (aggregated to 3-digit)',
        'Chief complaint (grouped into categories)'
      ],
      riskAnalysis: {
        k: 50,
        uniqueCombinations: 2,
        reidentificationRisk: 'Very Low (1 in 50)',
        mitigation: 'Time rounded, age banded, ZIP-3 used'
      }
    },
    {
      id: 'vitals',
      title: 'Vitals & Clinical Data',
      icon: IconStethoscope,
      color: 'teal',
      description: 'Physiological measurements and clinical observations',
      dataPoints: [
        'Blood pressure (exact values)',
        'Heart rate (exact values)',
        'Temperature (exact values)',
        'Weight (rounded to nearest 5 lbs)',
        'Height (rounded to nearest inch)',
        'Visit type (generalized categories)'
      ],
      riskAnalysis: {
        k: 100,
        uniqueCombinations: 1,
        reidentificationRisk: 'Minimal (1 in 100)',
        mitigation: 'Clinical values kept precise; demographic quasi-identifiers aggregated'
      }
    },
    {
      id: 'diagnosis',
      title: 'Diagnosis & Lab Results',
      icon: IconFlask,
      color: 'indigo',
      description: 'Test results and diagnostic codes',
      dataPoints: [
        'ICD-10 diagnosis codes (exact)',
        'Lab test results (exact values with units)',
        'Date of service (month and year only)',
        'Provider specialty (kept)',
        'Facility type (kept)',
        'Rare condition flag (suppressed if <5 cases)'
      ],
      riskAnalysis: {
        k: 30,
        uniqueCombinations: 3,
        reidentificationRisk: 'Low (1 in 30)',
        mitigation: 'Suppression of rare diagnoses; temporal aggregation'
      }
    },
    {
      id: 'treatment',
      title: 'Treatment & Outcomes',
      icon: IconMath,
      color: 'violet',
      description: 'Interventions and patient outcomes',
      dataPoints: [
        'Procedure codes (exact CPT codes)',
        'Medication names and dosages (kept)',
        'Length of stay (days, exact)',
        'Discharge disposition (categories)',
        'Readmission within 30 days (binary)',
        'Mortality (binary)'
      ],
      riskAnalysis: {
        k: 75,
        uniqueCombinations: 1,
        reidentificationRisk: 'Very Low (1 in 75)',
        mitigation: 'Outcome measures preserved; quasi-identifiers suppressed'
      }
    }
  ];

  const expertTechniques = [
    {
      technique: 'K-Anonymity',
      description: 'Ensure each record is indistinguishable from at least k-1 others',
      example: 'If Age=35, ZIP=97401, Gender=Female appears only once, generalize to Age=30-39, ZIP=974**, Gender=Female',
      kValue: 'Typically k ≥ 5 for low risk; k ≥ 10 for high assurance'
    },
    {
      technique: 'L-Diversity',
      description: 'Ensure sensitive attributes have at least L different values within each k-anonymous group',
      example: 'In a group of 10 patients with same quasi-identifiers, ensure at least 3 different diagnoses',
      kValue: 'l ≥ 3 recommended for health data'
    },
    {
      technique: 'T-Closeness',
      description: 'Ensure distribution of sensitive attributes in each group is close to overall distribution',
      example: 'If 10% of population has diabetes, each k-anonymous group should have ~10% diabetes',
      kValue: 't ≤ 0.2 (20% distance from overall distribution)'
    },
    {
      technique: 'Cell Suppression',
      description: 'Remove or generalize cells with very small counts',
      example: 'If only 2 patients have a rare disease, suppress that diagnosis or group with similar conditions',
      kValue: 'Suppress cells < 5 individuals'
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="indigo">
            <IconScale size={30} />
          </ThemeIcon>
          <Box>
            <Title order={1}>Expert Determination Method</Title>
            <Text c="dimmed">Statistical de-identification and risk analysis</Text>
          </Box>
        </Group>
      </Box>

      <Alert icon={<IconAlertCircle />} color="indigo" mb="xl">
        <Text fw={600} mb="xs">What is Expert Determination?</Text>
        <Text size="sm" mb="xs">
          Expert Determination is the second HIPAA-approved de-identification method. Unlike Safe Harbor (which requires removing 18 specific identifiers), 
          Expert Determination allows you to keep more data by using statistical methods to ensure the risk of re-identification is "very small."
        </Text>
        <Text size="sm">
          A qualified expert must apply statistical principles to determine that the risk of re-identification is very small, 
          documenting the methods and results. This approach is ideal for AI/ML projects that need more detailed data.
        </Text>
      </Alert>

      {/* Comparison with Safe Harbor */}
      <Paper p="lg" mb="xl" withBorder>
        <Title order={2} mb="md">Safe Harbor vs. Expert Determination</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="blue" size="lg" radius="md">
                <IconUser size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">Safe Harbor</Text>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Remove or generalize 18 specific identifiers</List.Item>
              <List.Item>No statistical expertise required</List.Item>
              <List.Item>Bright-line rule - clear compliance</List.Item>
              <List.Item>May lose valuable data (e.g., exact dates, precise locations)</List.Item>
              <List.Item>Easier to implement and audit</List.Item>
              <List.Item>Best for: Simple datasets, limited resources</List.Item>
            </List>
          </Card>

          <Card padding="lg" radius="md" withBorder bg="indigo.0">
            <Group mb="md">
              <ThemeIcon color="indigo" size="lg" radius="md">
                <IconScale size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">Expert Determination</Text>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Requires qualified statistical expert</List.Item>
              <List.Item>Risk-based approach using statistical methods</List.Item>
              <List.Item>Can retain more detailed data</List.Item>
              <List.Item>Must document methodology and risk analysis</List.Item>
              <List.Item>More complex but preserves data utility</List.Item>
              <List.Item>Best for: AI/ML projects, research requiring granular data</List.Item>
            </List>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Statistical Techniques */}
      <Paper p="lg" mb="xl" withBorder>
        <Title order={2} mb="md">Common Statistical Techniques</Title>
        <Text c="dimmed" mb="lg">
          Experts use various statistical methods to assess and minimize re-identification risk:
        </Text>

        <Accordion variant="contained">
          {expertTechniques.map((tech, idx) => (
            <Accordion.Item key={idx} value={tech.technique}>
              <Accordion.Control>
                <Group>
                  <ThemeIcon color="indigo" variant="light">
                    <IconMath size={18} />
                  </ThemeIcon>
                  <Text fw={600}>{tech.technique}</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" mb="md">{tech.description}</Text>
                <Paper p="md" bg="gray.0" radius="md" mb="md">
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Example:</Text>
                  <Text size="sm">{tech.example}</Text>
                </Paper>
                <Badge color="indigo" variant="light">{tech.kValue}</Badge>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Paper>

      {/* Patient Journey with Statistical Approach */}
      <Title order={2} mb="md">Patient Journey: Statistical De-identification</Title>
      <Text c="dimmed" mb="xl">
        See how Expert Determination preserves more detailed clinical data while maintaining low re-identification risk through statistical methods.
      </Text>

      <Timeline active={statisticalStages.length} bulletSize={40} lineWidth={3}>
        {statisticalStages.map((stage) => {
          const StageIcon = stage.icon;

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
                    K={stage.riskAnalysis.k}
                  </Badge>
                </Group>
              }
            >
              <Paper p="md" mb="xl" withBorder>
                <Text size="sm" mb="md">{stage.description}</Text>

                <Box mb="md">
                  <Text fw={600} size="sm" mb="xs">Data Retained:</Text>
                  <List size="sm" spacing="xs">
                    {stage.dataPoints.map((point, idx) => (
                      <List.Item key={idx}>{point}</List.Item>
                    ))}
                  </List>
                </Box>

                <Paper p="md" bg="indigo.0" radius="md">
                  <Group mb="xs">
                    <IconChartBar size={16} />
                    <Text fw={600} size="sm">Risk Analysis:</Text>
                  </Group>
                  <SimpleGrid cols={2} spacing="xs">
                    <Box>
                      <Text size="xs" c="dimmed">K-Anonymity:</Text>
                      <Text size="sm" fw={600}>K = {stage.riskAnalysis.k}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Unique Combinations:</Text>
                      <Text size="sm" fw={600}>{stage.riskAnalysis.uniqueCombinations}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Re-ID Risk:</Text>
                      <Text size="sm" fw={600} c="teal">{stage.riskAnalysis.reidentificationRisk}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Mitigation:</Text>
                      <Text size="xs">{stage.riskAnalysis.mitigation}</Text>
                    </Box>
                  </SimpleGrid>
                </Paper>
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* When to Use Expert Determination */}
      <Paper p="xl" mt="xl" withBorder bg="indigo.0">
        <Title order={3} mb="md">When to Use Expert Determination for AI Projects</Title>
        <List spacing="md" size="sm">
          <List.Item>
            <Text fw={600}>Predictive Modeling:</Text> When your AI model needs precise timestamps, exact ages, or detailed geographic data for accurate predictions
          </List.Item>
          <List.Item>
            <Text fw={600}>Rare Disease Research:</Text> When Safe Harbor would suppress too much data about uncommon conditions
          </List.Item>
          <List.Item>
            <Text fw={600}>Temporal Analysis:</Text> When you need exact dates/times to model disease progression or treatment timelines
          </List.Item>
          <List.Item>
            <Text fw={600}>Geographic Studies:</Text> When ZIP-3 is too coarse and you need ZIP-5 or street-level data
          </List.Item>
          <List.Item>
            <Text fw={600}>Linkage Studies:</Text> When combining multiple datasets and need unique (but anonymized) patient identifiers
          </List.Item>
          <List.Item>
            <Text fw={600}>Image Analysis:</Text> When you need medical images that may contain identifying features (with appropriate masking)
          </List.Item>
        </List>

        <Alert icon={<IconAlertCircle />} color="yellow" mt="lg">
          <Text fw={600} size="sm">Important:</Text>
          <Text size="sm">
            You must engage a qualified expert (statistician, privacy researcher) to perform and document the analysis. 
            Simply applying these techniques without proper expertise and documentation does NOT satisfy HIPAA requirements.
          </Text>
        </Alert>
      </Paper>
    </Container>
  );
};

export default ExpertDeterminationPage;
