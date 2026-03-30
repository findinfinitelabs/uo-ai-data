import React from 'react';
import {
  Title,
  Text,
  List,
  Badge,
  SimpleGrid,
  Card,
  Box,
} from '@mantine/core';

export default function BiasMitigationContent() {
  return (
    <Box>
      {/* Mitigation Strategies */}
      <Title order={2} mb="md">Bias Mitigation Strategies</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="blue" variant="light" mb="sm">PRE-PROCESSING</Badge>
          <Text fw={600} mb="xs">Data-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Oversample underrepresented groups</List.Item>
            <List.Item>Collect additional data for minority groups</List.Item>
            <List.Item>Re-weight training examples</List.Item>
            <List.Item>Remove or transform proxy variables</List.Item>
          </List>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="green" variant="light" mb="sm">IN-PROCESSING</Badge>
          <Text fw={600} mb="xs">Training-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Add fairness constraints to loss function</List.Item>
            <List.Item>Adversarial debiasing</List.Item>
            <List.Item>Fair representation learning</List.Item>
            <List.Item>Multi-objective optimization</List.Item>
          </List>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="grape" variant="light" mb="sm">POST-PROCESSING</Badge>
          <Text fw={600} mb="xs">Output-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Adjust decision thresholds by group</List.Item>
            <List.Item>Calibrate probabilities per group</List.Item>
            <List.Item>Reject option classification</List.Item>
            <List.Item>Human review for edge cases</List.Item>
          </List>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
