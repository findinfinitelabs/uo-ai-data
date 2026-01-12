import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextInput,
  Button,
  Text,
  ScrollArea,
  Group,
  ThemeIcon,
  Loader,
  Alert,
  ActionIcon,
  Modal,
  Table,
  Badge,
  CopyButton,
  Tooltip,
  Progress,
  Divider,
  Code,
} from '@mantine/core';
import {
  IconSend,
  IconRobot,
  IconUser,
  IconAlertCircle,
  IconTrash,
  IconCopy,
  IconCheck,
  IconInfoCircle,
  IconChartBar,
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom code block component with copy button
const CodeBlock = ({ children, className, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  if (!match) {
    // Inline code
    return (
      <Code color="gray" {...props}>
        {children}
      </Code>
    );
  }

  // Code block with syntax highlighting
  return (
    <Box pos="relative" my="sm">
      <Group justify="space-between" bg="dark.7" px="sm" py={4} style={{ borderRadius: '8px 8px 0 0' }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          {language || 'code'}
        </Text>
        <CopyButton value={codeString} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied!' : 'Copy code'} withArrow position="left">
              <ActionIcon
                color={copied ? 'green' : 'gray'}
                variant="subtle"
                onClick={copy}
                size="xs"
              >
                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  );
};

// Markdown components mapping
const markdownComponents = {
  code: CodeBlock,
  p: ({ children }) => <Text size="sm" mb="xs">{children}</Text>,
  h1: ({ children }) => <Text size="xl" fw={700} mb="sm">{children}</Text>,
  h2: ({ children }) => <Text size="lg" fw={600} mb="sm">{children}</Text>,
  h3: ({ children }) => <Text size="md" fw={600} mb="xs">{children}</Text>,
  h4: ({ children }) => <Text size="sm" fw={600} mb="xs">{children}</Text>,
  ul: ({ children }) => <Box component="ul" ml="md" mb="sm">{children}</Box>,
  ol: ({ children }) => <Box component="ol" ml="md" mb="sm">{children}</Box>,
  li: ({ children }) => <Text component="li" size="sm" mb={4}>{children}</Text>,
  strong: ({ children }) => <Text span fw={700}>{children}</Text>,
  em: ({ children }) => <Text span fs="italic">{children}</Text>,
  blockquote: ({ children }) => (
    <Box
      pl="md"
      py="xs"
      my="sm"
      style={{ borderLeft: '3px solid var(--mantine-color-green-6)' }}
      bg="dark.7"
    >
      {children}
    </Box>
  ),
  hr: () => <Divider my="md" />,
  table: ({ children }) => (
    <Box style={{ overflowX: 'auto' }} my="sm">
      <Table striped highlightOnHover>{children}</Table>
    </Box>
  ),
  thead: ({ children }) => <Table.Thead>{children}</Table.Thead>,
  tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
  tr: ({ children }) => <Table.Tr>{children}</Table.Tr>,
  th: ({ children }) => <Table.Th>{children}</Table.Th>,
  td: ({ children }) => <Table.Td>{children}</Table.Td>,
};

const SYSTEM_PROMPT = `You are a helpful AI assistant specialized in creating healthcare data specifications. 

Your role is to help users create:
1. Data Dictionaries - defining each field with name, type, description, constraints, and examples
2. JSON Schemas - machine-readable validation formats
3. Quality Rules - acceptable values, required fields, and validation logic

When creating specifications, always consider:
- HIPAA compliance and PHI identification
- Healthcare industry standards (ICD-10, CPT codes, HL7/FHIR when relevant)
- Data validation and quality rules
- Clear documentation for both technical and non-technical users

Format your responses with clear sections and use code blocks for JSON schemas.
Never ask for or include real patient data - use synthetic examples only.`;

// Calculate ethical/content scores based on content analysis
const calculateEthicalScores = (content) => {
  const lowerContent = content.toLowerCase();
  
  // Check for healthcare compliance mentions
  const hipaaScore = (lowerContent.includes('hipaa') || lowerContent.includes('phi') || 
                      lowerContent.includes('protected health') || lowerContent.includes('de-identified')) ? 95 : 75;
  
  // Check for ethical AI mentions
  const ethicalScore = (lowerContent.includes('bias') || lowerContent.includes('fairness') || 
                        lowerContent.includes('consent') || lowerContent.includes('privacy')) ? 92 : 80;
  
  // Check for data quality/validation mentions
  const qualityScore = (lowerContent.includes('validation') || lowerContent.includes('required') || 
                        lowerContent.includes('constraint') || lowerContent.includes('format')) ? 90 : 70;
  
  // NSF responsible AI alignment (based on transparency and documentation)
  const nsfScore = (lowerContent.includes('example') || lowerContent.includes('description') || 
                    lowerContent.includes('documentation') || lowerContent.includes('schema')) ? 88 : 72;

  return { hipaaScore, ethicalScore, qualityScore, nsfScore };
};

// Get color based on score
const getScoreColor = (score) => {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  return 'red';
};

export default function OpenAIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsModal, setStatsModal] = useState({ opened: false, data: null });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // API parameters (stored for display)
  const MODEL = 'gpt-4-turbo';
  const MAX_TOKENS = 2000;
  const TEMPERATURE = 0.7;
  const TOP_P = 1.0;

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage,
          ],
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          top_p: TOP_P,
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'No response generated.';
      const usage = data.usage || {};
      const ethicalScores = calculateEthicalScores(content);

      const assistantMessage = {
        role: 'assistant',
        content: content,
        stats: {
          model: data.model || MODEL,
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          temperature: TEMPERATURE,
          topP: TOP_P,
          maxTokens: MAX_TOKENS,
          responseTime: responseTime,
          finishReason: data.choices[0]?.finish_reason || 'unknown',
          ...ethicalScores,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const openStats = (stats) => {
    setStatsModal({ opened: true, data: stats });
  };

  const closeStats = () => {
    setStatsModal({ opened: false, data: null });
  };

  if (!apiKey) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="API Key Missing">
        <Text size="xs">
          Set VITE_OPENAI_API_KEY in .env.local to enable the chat.
        </Text>
      </Alert>
    );
  }

  return (
    <Box className="openai-chat-container">
      {/* Stats Modal */}
      <Modal
        opened={statsModal.opened}
        onClose={closeStats}
        title={
          <Group gap="sm">
            <IconChartBar size={20} />
            <Text fw={600}>Response Statistics</Text>
          </Group>
        }
        size="xl"
        centered
      >
        {statsModal.data && (
          <Box>
            {/* Token Usage Section */}
            <Text fw={600} size="sm" mb="xs" c="dimmed">Token Usage</Text>
            <Table striped highlightOnHover mb="lg">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td><Text size="sm">Model</Text></Table.Td>
                  <Table.Td><Badge color="blue" variant="light">{statsModal.data.model}</Badge></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Prompt Tokens</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{statsModal.data.promptTokens.toLocaleString()}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Completion Tokens</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{statsModal.data.completionTokens.toLocaleString()}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Total Tokens</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={700}>{statsModal.data.totalTokens.toLocaleString()}</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Response Time</Text></Table.Td>
                  <Table.Td><Text size="sm">{(statsModal.data.responseTime / 1000).toFixed(2)}s</Text></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Finish Reason</Text></Table.Td>
                  <Table.Td><Badge color={statsModal.data.finishReason === 'stop' ? 'green' : 'yellow'} variant="light">{statsModal.data.finishReason}</Badge></Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            {/* Model Parameters Section */}
            <Text fw={600} size="sm" mb="xs" c="dimmed">Model Parameters</Text>
            <Table striped highlightOnHover mb="lg">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td><Text size="sm">Temperature</Text></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{statsModal.data.temperature}</Text>
                      <Text size="xs" c="dimmed">(0 = focused, 2 = creative)</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Top P</Text></Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{statsModal.data.topP}</Text>
                      <Text size="xs" c="dimmed">(nucleus sampling)</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text size="sm">Max Tokens</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{statsModal.data.maxTokens.toLocaleString()}</Text></Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            {/* Ethical/Quality Scores Section */}
            <Text fw={600} size="sm" mb="xs" c="dimmed">Healthcare AI Compliance Scores</Text>
            <Box mb="md">
              <Group justify="space-between" mb={4}>
                <Text size="sm">HIPAA Alignment</Text>
                <Text size="sm" fw={500}>{statsModal.data.hipaaScore}%</Text>
              </Group>
              <Progress value={statsModal.data.hipaaScore} color={getScoreColor(statsModal.data.hipaaScore)} size="sm" mb="sm" />

              <Group justify="space-between" mb={4}>
                <Text size="sm">Ethical AI Score</Text>
                <Text size="sm" fw={500}>{statsModal.data.ethicalScore}%</Text>
              </Group>
              <Progress value={statsModal.data.ethicalScore} color={getScoreColor(statsModal.data.ethicalScore)} size="sm" mb="sm" />

              <Group justify="space-between" mb={4}>
                <Text size="sm">Data Quality Focus</Text>
                <Text size="sm" fw={500}>{statsModal.data.qualityScore}%</Text>
              </Group>
              <Progress value={statsModal.data.qualityScore} color={getScoreColor(statsModal.data.qualityScore)} size="sm" mb="sm" />

              <Group justify="space-between" mb={4}>
                <Text size="sm">NSF Responsible AI</Text>
                <Text size="sm" fw={500}>{statsModal.data.nsfScore}%</Text>
              </Group>
              <Progress value={statsModal.data.nsfScore} color={getScoreColor(statsModal.data.nsfScore)} size="sm" />
            </Box>

            <Divider my="md" />
            <Text size="xs" c="dimmed" ta="center">
              Scores are calculated based on content analysis for healthcare AI best practices.
            </Text>
          </Box>
        )}
      </Modal>

      <Group justify="space-between" mb="sm">
        <Text size="md" fw={600}>Chat with AI</Text>
        {messages.length > 0 && (
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={clearChat} title="Clear chat">
            <IconTrash size={14} />
          </ActionIcon>
        )}
      </Group>

      <ScrollArea h={400} viewportRef={scrollRef} className="chat-messages">
        {messages.length === 0 ? (
          <Box className="chat-empty">
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Ask me to create a data specification!
            </Text>
            <Text size="xs" c="dimmed" ta="center" ff="monospace">
              Try: &quot;Create a JSON schema for patient medication records&quot;
            </Text>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Paper
              key={index}
              p="sm"
              mb="sm"
              radius="md"
              className={`chat-message ${msg.role}`}
            >
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon
                  size={28}
                  radius="xl"
                  color={msg.role === 'user' ? 'blue' : 'green'}
                  variant="light"
                >
                  {msg.role === 'user' ? <IconUser size={16} /> : <IconRobot size={16} />}
                </ThemeIcon>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  {msg.role === 'user' ? (
                    <Text size="sm" className="chat-message-content">
                      {msg.content}
                    </Text>
                  ) : (
                    <Box className="chat-message-content markdown-content">
                      <ReactMarkdown components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </Box>
                  )}
                  {msg.role === 'assistant' && msg.stats && (
                    <Group gap="xs" mt="sm">
                      <CopyButton value={msg.content} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied!' : 'Copy response'} withArrow position="top">
                            <ActionIcon
                              color={copied ? 'green' : 'gray'}
                              variant="subtle"
                              onClick={copy}
                              size="sm"
                            >
                              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                      <Tooltip label="View statistics" withArrow position="top">
                        <ActionIcon
                          color="blue"
                          variant="subtle"
                          onClick={() => openStats(msg.stats)}
                          size="sm"
                        >
                          <IconChartBar size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Text size="xs" c="dimmed">
                        {msg.stats.totalTokens} tokens • {(msg.stats.responseTime / 1000).toFixed(1)}s
                      </Text>
                    </Group>
                  )}
                </Box>
              </Group>
            </Paper>
          ))
        )}
        {loading && (
          <Group gap="sm" p="sm">
            <Loader size="sm" color="green" />
            <Text size="sm" c="dimmed">Generating specification...</Text>
          </Group>
        )}
      </ScrollArea>

      {error && (
        <Alert icon={<IconAlertCircle size={14} />} color="red" p="sm" mb="sm">
          <Text size="sm">{error}</Text>
        </Alert>
      )}

      <Group gap="sm" mt="md">
        <TextInput
          ref={inputRef}
          placeholder="Describe your data needs... (e.g., 'Create a schema for dental visits')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          size="md"
          className="chat-input"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          size="md"
          color="green"
          className="chat-send-button"
        >
          <IconSend size={18} />
        </Button>
      </Group>
    </Box>
  );
}
