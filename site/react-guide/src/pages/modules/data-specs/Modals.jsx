import React from 'react';
import {
  Modal,
  Text,
  Paper,
  Group,
  Box,
  ThemeIcon,
  SimpleGrid,
  List,
} from '@mantine/core';
import {
  IconX,
  IconCheck,
  IconArrowRight,
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { exampleData } from './exampleData';
import { solutionExamples } from './solutionExamples';
import { modalMarkdownComponents } from './ModalCodeBlock';
import styles from './DataSpecs.module.css';

// Example modal for Good vs Bad comparisons
export const ExampleModal = ({ opened, onClose, exampleKey }) => {
  if (!exampleKey) return null;

  const example = exampleData[exampleKey];
  if (!example) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700} size="lg">
            {example.title}
          </Text>
        </Group>
      }
      size="90%"
      centered
    >
      <Text size="sm" c="dimmed" mb="lg">
        {example.description}
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Bad Example */}
        <Paper p="md" radius="md" withBorder bg="red.0">
          <Group gap="xs" mb="md">
            <ThemeIcon color="red" size={28} radius="xl">
              <IconX size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600} c="red.7">
                {example.bad.title}
              </Text>
              <Text size="xs" c="dimmed">
                {example.bad.description}
              </Text>
            </Box>
          </Group>
          <Box mb="md">
            <ReactMarkdown components={modalMarkdownComponents}>
              {example.bad.code}
            </ReactMarkdown>
          </Box>
          <Text size="sm" fw={600} mb="xs" c="red.7">
            Issues:
          </Text>
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon color="red" size={16} radius="xl">
                <IconX size={10} />
              </ThemeIcon>
            }
          >
            {example.bad.issues.map((issue, idx) => (
              <List.Item key={idx}>{issue}</List.Item>
            ))}
          </List>
        </Paper>

        {/* Good Example */}
        <Paper p="md" radius="md" withBorder bg="green.0">
          <Group gap="xs" mb="md">
            <ThemeIcon color="green" size={28} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600} c="green.7">
                {example.good.title}
              </Text>
              <Text size="xs" c="dimmed">
                {example.good.description}
              </Text>
            </Box>
          </Group>
          <Box mb="md">
            <ReactMarkdown components={modalMarkdownComponents}>
              {example.good.code}
            </ReactMarkdown>
          </Box>

          {/* Highlights Section with Arrows */}
          {example.good.highlights && (
            <Paper
              p="sm"
              mb="md"
              radius="sm"
              bg="green.1"
              withBorder
              className={styles.highlightContainer}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon color="green" size={20} radius="xl" variant="light">
                  <IconArrowRight size={12} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="green.8">
                  Key Best Practices:
                </Text>
              </Group>
              {example.good.highlights.map((highlight, idx) => (
                <Group key={idx} gap="xs" mb={4} wrap="nowrap">
                  <Text
                    size="xs"
                    ff="monospace"
                    c="green.9"
                    fw={500}
                    className={styles.highlightLine}
                  >
                    {highlight.line}
                  </Text>
                  <Text size="xs" c="green.7" fw={600}>
                    {highlight.label}
                  </Text>
                </Group>
              ))}
            </Paper>
          )}

          <Text size="sm" fw={600} mb="xs" c="green.7">
            Benefits:
          </Text>
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon color="green" size={16} radius="xl">
                <IconCheck size={10} />
              </ThemeIcon>
            }
          >
            {example.good.benefits.map((benefit, idx) => (
              <List.Item key={idx}>{benefit}</List.Item>
            ))}
          </List>
        </Paper>
      </SimpleGrid>
    </Modal>
  );
};

// Solution modal for Traditional vs AI comparisons
export const SolutionModal = ({ opened, onClose, solutionKey }) => {
  if (!solutionKey) return null;

  const solution = solutionExamples[solutionKey];
  if (!solution) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700} size="lg">
            {solution.title}
          </Text>
        </Group>
      }
      size="90%"
      centered
    >
      <Text size="sm" c="dimmed" mb="lg">
        {solution.description}
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Traditional Approach */}
        <Paper p="md" radius="md" withBorder bg="gray.0">
          <Group gap="xs" mb="md">
            <ThemeIcon color="gray" size={28} radius="xl">
              <IconX size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600} c="gray.7">
                {solution.traditional.title}
              </Text>
              <Text size="xs" c="dimmed">
                {solution.traditional.subtitle}
              </Text>
            </Box>
          </Group>
          <Box mb="md">
            <ReactMarkdown components={modalMarkdownComponents}>
              {solution.traditional.code}
            </ReactMarkdown>
          </Box>
          <Text size="sm" fw={600} mb="xs" c="gray.7">
            Limitations:
          </Text>
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon color="gray" size={16} radius="xl">
                <IconX size={10} />
              </ThemeIcon>
            }
          >
            {solution.traditional.issues.map((issue, idx) => (
              <List.Item key={idx}>{issue}</List.Item>
            ))}
          </List>
        </Paper>

        {/* AI-Powered Approach */}
        <Paper p="md" radius="md" withBorder bg="green.0">
          <Group gap="xs" mb="md">
            <ThemeIcon color="green" size={28} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
            <Box>
              <Text fw={600} c="green.7">
                {solution.ai.title}
              </Text>
              <Text size="xs" c="dimmed">
                {solution.ai.subtitle}
              </Text>
            </Box>
          </Group>
          <Box mb="md">
            <ReactMarkdown components={modalMarkdownComponents}>
              {solution.ai.code}
            </ReactMarkdown>
          </Box>

          {/* Highlights Section */}
          {solution.ai.highlights && (
            <Paper
              p="sm"
              mb="md"
              radius="sm"
              bg="green.1"
              withBorder
              className={styles.highlightContainer}
            >
              <Group gap="xs" mb="xs">
                <ThemeIcon color="green" size={20} radius="xl" variant="light">
                  <IconArrowRight size={12} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="green.8">
                  AI Advantages:
                </Text>
              </Group>
              {solution.ai.highlights.map((highlight, idx) => (
                <Group key={idx} gap="xs" mb={4} wrap="nowrap">
                  <Text
                    size="xs"
                    ff="monospace"
                    c="green.9"
                    fw={500}
                    className={styles.highlightLine}
                  >
                    {highlight.line}
                  </Text>
                  <Text size="xs" c="green.7" fw={600}>
                    {highlight.label}
                  </Text>
                </Group>
              ))}
            </Paper>
          )}

          <Text size="sm" fw={600} mb="xs" c="green.7">
            Benefits:
          </Text>
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon color="green" size={16} radius="xl">
                <IconCheck size={10} />
              </ThemeIcon>
            }
          >
            {solution.ai.benefits.map((benefit, idx) => (
              <List.Item key={idx}>{benefit}</List.Item>
            ))}
          </List>
        </Paper>
      </SimpleGrid>
    </Modal>
  );
};
