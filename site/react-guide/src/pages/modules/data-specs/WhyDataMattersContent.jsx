import React, { useState } from 'react';
import {
  Title,
  Text,
  Paper,
  ThemeIcon,
  Group,
  Box,
  SimpleGrid,
  Alert,
  Blockquote,
} from '@mantine/core';
import {
  IconBulb,
  IconAlertCircle,
  IconFileText,
  IconCode,
  IconChecklist,
} from '@tabler/icons-react';
import { ExampleCard, SolutionCard } from './Cards';
import { ExampleModal, SolutionModal } from './Modals';
import styles from './DataSpecs.module.css';

const WhyDataMattersContent = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);
  const [solutionModalOpened, setSolutionModalOpened] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);

  const openExample = (exampleKey) => {
    setSelectedExample(exampleKey);
    setModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedExample(null);
  };

  const openSolution = (solutionKey) => {
    setSelectedSolution(solutionKey);
    setSolutionModalOpened(true);
  };

  const closeSolutionModal = () => {
    setSolutionModalOpened(false);
    setSelectedSolution(null);
  };

  return (
    <>
      <ExampleModal
        opened={modalOpened}
        onClose={closeModal}
        exampleKey={selectedExample}
      />
      <SolutionModal
        opened={solutionModalOpened}
        onClose={closeSolutionModal}
        solutionKey={selectedSolution}
      />

      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        withBorder
        mb="xl"
        className={styles.hero}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color="green" size={48} radius="xl">
            <IconBulb size={24} />
          </ThemeIcon>
          <Box>
            <Title order={3}>Data - The Foundation of AI Success</Title>
            <Text c="dimmed">
              85% of AI projects fail to reach production — most due to data
              issues (Gartner)
            </Text>
          </Box>
        </Group>
        <Text size="md" mb="md">
          In healthcare AI, the difference between a successful project and a
          costly failure often comes down to one thing:{' '}
          <Text span fw={700} c="green">
            how well you defined your data requirements upfront
          </Text>
          .
        </Text>
      </Paper>

      <Paper 
        p="xl" 
        mb="xl" 
        withBorder 
        radius="md"
        style={{ 
          background: 'linear-gradient(135deg, var(--mantine-color-red-0) 0%, var(--mantine-color-orange-0) 100%)',
          borderLeft: '4px solid var(--mantine-color-red-6)'
        }}
      >
        <Group gap="md" mb="md" align="center">
          <ThemeIcon size={48} radius="xl" color="red" variant="light">
            <IconAlertCircle size={28} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Title order={3} className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Why Most AI Projects Fail
            </Title>
          </Box>
        </Group>
        
        <Text size="sm" c="dimmed" mb="md">
          Click each card to see a good vs. bad example
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <ExampleCard
            exampleKey="garbage-in-garbage-out"
            badge="Problem"
            title="Garbage In, Garbage Out"
            description="AI models are only as good as their training data. Poorly defined data leads to models that hallucinate, make biased predictions, or simply don't work."
            onClick={openExample}
          />
          <ExampleCard
            exampleKey="scope-creep"
            badge="Problem"
            title="Scope Creep"
            description='Without clear specifications, projects expand endlessly. "Just add one more field" becomes a death spiral of changing requirements.'
            onClick={openExample}
          />
          <ExampleCard
            exampleKey="compliance-nightmares"
            badge="Problem"
            title="Compliance Nightmares"
            description="Healthcare data without proper specifications often violates HIPAA. You can't de-identify data if you don't know what fields contain PHI."
            onClick={openExample}
          />
          <ExampleCard
            exampleKey="integration-failures"
            badge="Problem"
            title="Integration Failures"
            description="When data formats don't match between systems, integrations break. Specifications ensure everyone speaks the same language."
            onClick={openExample}
          />
        </SimpleGrid>
      </Paper>

      <Title order={3} mb="md" className={styles.sectionTitle}>
        The Solution: Data Specifications
      </Title>
      <Text size="md" mb="md">
        A <Text span fw={600}>data specification</Text> is a formal document
        that defines exactly what data you need, how it should be structured,
        and what rules it must follow.
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Click each card to see Traditional vs. AI-Powered approaches
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <SolutionCard
          solutionKey="data-dictionary"
          icon={IconFileText}
          title="Data Dictionary"
          description="Defines each field: name, type, description, constraints, and examples."
          color="green"
          onClick={openSolution}
        />
        <SolutionCard
          solutionKey="json-schema"
          icon={IconCode}
          title="JSON Schema"
          description="Machine-readable format that can automatically validate data."
          color="blue"
          onClick={openSolution}
        />
        <SolutionCard
          solutionKey="quality-rules"
          icon={IconChecklist}
          title="Quality Rules"
          description="Defines acceptable values, required fields, and validation logic."
          color="grape"
          onClick={openSolution}
        />
      </SimpleGrid>

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Key Insight"
        color="green"
        mb="xl"
      >
        <Text size="sm">
          When teams integrate AI and data agents into their workflow, data
          definitions are created on the fly and become more understandable
          across the enterprise — eliminating silos and accelerating
          collaboration.
        </Text>
      </Alert>

      <Blockquote color="green" icon={<IconBulb size={24} />} mb="xl">
        <Text size="md" fs="italic">
          &quot;Without data, you&apos;re just another person with an opinion.&quot;
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          — W. Edwards Deming
        </Text>
      </Blockquote>
    </>
  );
};

export default WhyDataMattersContent;
