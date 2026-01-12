import React from 'react';
import { Card, Text, Button, Group } from '@mantine/core';

export function ModuleCard({ title, summary, href }) {
  return (
    <Card shadow="md" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Text fw={700}>{title}</Text>
      </Group>
      <Text c="dimmed" size="sm" mb="md">
        {summary}
      </Text>
      <Button component="a" href={href} target="_blank" rel="noreferrer" variant="filled">
        Open module
      </Button>
    </Card>
  );
}
