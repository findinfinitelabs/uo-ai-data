import React from 'react';
import { Box, Text, Code } from '@mantine/core';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Code block component for modals
export const ModalCodeBlock = ({ children, className, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  if (!match) {
    return (
      <Code color="gray" {...props}>
        {children}
      </Code>
    );
  }

  return (
    <Box my="sm">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
        {language}
      </Text>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '8px', fontSize: '12px' }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  );
};

// Markdown components configuration for modals
export const modalMarkdownComponents = {
  code: ModalCodeBlock,
  p: ({ children }) => (
    <Text size="sm" mb="xs">
      {children}
    </Text>
  ),
  strong: ({ children }) => (
    <Text span fw={700}>
      {children}
    </Text>
  ),
  ul: ({ children }) => (
    <Box component="ul" ml="md" mb="sm">
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Text component="li" size="sm" mb={4}>
      {children}
    </Text>
  ),
};
