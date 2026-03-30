import React from 'react';
import { Card, ThemeIcon, Badge, Text } from '@mantine/core';
import { IconClick } from '@tabler/icons-react';
import styles from './DataSpecs.module.css';

// Example card component for problem examples
export const ExampleCard = ({
  exampleKey,
  badge,
  title,
  description,
  onClick,
}) => {
  return (
    <Card
      shadow="xs"
      padding="lg"
      radius="md"
      withBorder
      className={styles.clickableCard}
      onClick={() => onClick(exampleKey)}
    >
      <Badge color="red" variant="light" mb="sm">
        {badge}
      </Badge>
      <Text fw={600} mb="xs">
        {title}
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      <Text size="xs" c="blue" fw={500}>
        <IconClick size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        Click to see Good vs. Bad example
      </Text>
    </Card>
  );
};

// Solution card component for solution examples
export const SolutionCard = ({
  solutionKey,
  icon: Icon,
  title,
  description,
  color,
  onClick,
}) => {
  return (
    <Card
      shadow="xs"
      padding="lg"
      radius="md"
      withBorder
      className={styles.clickableCard}
      onClick={() => onClick(solutionKey)}
    >
      <ThemeIcon color={color} size={40} radius="xl" mb="sm">
        <Icon size={20} />
      </ThemeIcon>
      <Text fw={600} mb="xs">
        {title}
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      <Text size="xs" c="green" fw={500}>
        <IconClick size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        Click to compare Traditional vs. AI
      </Text>
    </Card>
  );
};
