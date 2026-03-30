import React from 'react';
import {
  Title,
  Text,
  Paper,
  Badge,
  Box,
  Table,
} from '@mantine/core';

export default function FrameworkComparisonContent() {
  return (
    <Box>
      <Text size="lg" mb="xl">
        Each framework has different legal status, geographic scope, and enforcement mechanisms. 
        This comparison helps you understand which frameworks apply to your AI project and their relative priorities.
      </Text>

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

      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">Key Insights</Title>
        
        <Text size="sm" mb="md">
          <Text span fw={600}>EU AI Act stands alone:</Text> It's the only legally binding framework with 
          real penalties. If your AI affects EU citizens, compliance is mandatory—not optional.
        </Text>

        <Text size="sm" mb="md">
          <Text span fw={600}>Voluntary doesn't mean ignorable:</Text> IEEE, OECD, and NIST frameworks 
          are increasingly referenced in insurance policies, procurement requirements, and legal due diligence. 
          Following them demonstrates good faith effort to build trustworthy AI.
        </Text>

        <Text size="sm">
          <Text span fw={600}>Healthcare AI faces highest scrutiny:</Text> All frameworks recognize healthcare 
          as a high-stakes domain. The EU AI Act categorizes most healthcare AI as "high-risk," triggering 
          extensive documentation and testing requirements.
        </Text>
      </Paper>
    </Box>
  );
}
