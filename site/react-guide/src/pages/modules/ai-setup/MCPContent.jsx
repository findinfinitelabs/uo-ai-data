import React from 'react';
import { Link } from 'react-router-dom';
import {
  Text,
  Paper,
  Title,
  List,
  ThemeIcon,
  Code,
  Alert,
  Anchor,
  Box,
  Badge,
  Group,
  Divider,
  SimpleGrid,
  Button,
} from '@mantine/core';
import {
  IconCheck,
  IconInfoCircle,
  IconPlug,
  IconDatabase,
  IconFileText,
  IconWorld,
  IconBrandGithub,
  IconAlertTriangle,
  IconShield,
  IconLock,
  IconX,
  IconHeart,
  IconArrowRight,
} from '@tabler/icons-react';

export default function MCPContent() {
  return (
    <>
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">What is Model Context Protocol (MCP)?</Title>
        <Text size="md" mb="md">
          <Text span fw={700}>Model Context Protocol (MCP)</Text> is an open standard developed by 
          Anthropic that enables AI models to securely connect to external data sources and tools. 
          Think of it as a <Text span fw={600}>universal adapter</Text> that lets AI assistants 
          access real-world information.
        </Text>
        <Text size="md" mb="md">
          Without MCP, AI models only know what they were trained on. With MCP, they can:
        </Text>
        <List spacing="sm" mb="md">
          <List.Item
            icon={
              <ThemeIcon color="pink" size={24} radius="xl">
                <IconDatabase size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Access databases</Text> - Query SQL, MongoDB, or other data stores
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="pink" size={24} radius="xl">
                <IconFileText size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Read files</Text> - Browse local or cloud file systems securely
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="pink" size={24} radius="xl">
                <IconWorld size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Call APIs</Text> - Interact with web services, Slack, GitHub, etc.
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="pink" size={24} radius="xl">
                <IconPlug size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Use custom tools</Text> - Run scripts, execute code, trigger workflows
          </List.Item>
        </List>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Why MCP Matters for Business</Title>
        <Text size="md" mb="md">
          For business applications, MCP solves a critical problem: 
          <Text span fw={600}> How do you give AI access to your company&apos;s data without 
          compromising security?</Text>
        </Text>
        
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Group gap="xs" mb="xs">
              <Badge color="red" variant="light">Without MCP</Badge>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Copy-paste data into prompts</List.Item>
              <List.Item>Risk exposing sensitive info</List.Item>
              <List.Item>Outdated information</List.Item>
              <List.Item>Manual, error-prone workflows</List.Item>
            </List>
          </Box>
          <Box>
            <Group gap="xs" mb="xs">
              <Badge color="green" variant="light">With MCP</Badge>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Secure, controlled data access</List.Item>
              <List.Item>Real-time information</List.Item>
              <List.Item>Audit trails and permissions</List.Item>
              <List.Item>Automated, reliable workflows</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Alert icon={<IconInfoCircle size={16} />} color="pink" variant="light">
          <Text size="sm">
            <Text span fw={600}>Example:</Text> An MCP server could let Claude access your 
            company&apos;s CRM to answer &quot;What&apos;s our top customer&apos;s order history?&quot; without 
            you having to manually look it up and paste it in.
          </Text>
        </Alert>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">How MCP Works</Title>
        <Text size="md" mb="md">
          MCP uses a <Text span fw={600}>client-server architecture</Text>:
        </Text>
        
        <Box mb="md" p="md" style={{ background: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
          <Group gap="lg" justify="center" wrap="wrap">
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center', minWidth: 120 }}>
              <Text size="xs" c="dimmed">AI Application</Text>
              <Text fw={600}>MCP Client</Text>
              <Text size="xs" c="dimmed">(Claude, VS Code)</Text>
            </Paper>
            <Text size="xl" c="dimmed">↔</Text>
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center', minWidth: 120 }}>
              <Text size="xs" c="dimmed">Your Tools</Text>
              <Text fw={600}>MCP Server</Text>
              <Text size="xs" c="dimmed">(Database, APIs)</Text>
            </Paper>
          </Group>
        </Box>

        <List spacing="sm" type="ordered">
          <List.Item>
            <Text span fw={600}>MCP Client</Text> - The AI application (like Claude Desktop or VS Code) 
            that needs access to external data
          </List.Item>
          <List.Item>
            <Text span fw={600}>MCP Server</Text> - A lightweight program you run that exposes 
            specific tools and data sources
          </List.Item>
          <List.Item>
            <Text span fw={600}>Protocol</Text> - Standardized JSON-RPC communication over stdio or HTTP
          </List.Item>
        </List>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Getting Started with MCP</Title>
        
        <Text size="md" mb="md">
          The easiest way to start is with <Text span fw={600}>Claude Desktop</Text>, which has 
          built-in MCP support:
        </Text>

        <List spacing="sm" type="ordered" mb="md">
          <List.Item>
            <Text span fw={600}>Install Claude Desktop</Text> - Download from{' '}
            <Anchor href="https://claude.ai/download" target="_blank">claude.ai/download</Anchor>
          </List.Item>
          <List.Item>
            <Text span fw={600}>Configure an MCP server</Text> - Edit your Claude Desktop config file
          </List.Item>
          <List.Item>
            <Text span fw={600}>Use the tools</Text> - Claude will automatically discover available tools
          </List.Item>
        </List>

        <Title order={4} mb="sm">Example: File System MCP Server</Title>
        <Text size="sm" mb="sm">
          Add this to your Claude Desktop config (<Code>~/Library/Application Support/Claude/claude_desktop_config.json</Code>):
        </Text>
        <Code block mb="md">
{`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/your/project"
      ]
    }
  }
}`}
        </Code>
        <Text size="sm" c="dimmed">
          Now Claude can read and navigate files in your project directory!
        </Text>
      </Paper>

      {/* Security Comparison Section */}
      <Paper p="lg" withBorder radius="md" mb="xl" style={{ borderColor: 'var(--mantine-color-orange-4)' }}>
        <Title order={3} mb="md">Security: With vs Without MCP</Title>
        <Text size="md" mb="md">
          When connecting AI to sensitive data like health information, security is critical. 
          Here&apos;s how the approaches compare:
        </Text>
        
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="md">
          <Paper p="md" withBorder radius="md" style={{ background: 'var(--mantine-color-red-0)', borderColor: 'var(--mantine-color-red-3)' }}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="red" size="lg" radius="xl">
                <IconX size={18} />
              </ThemeIcon>
              <Text fw={700} c="red.7">Without MCP</Text>
            </Group>
            <List size="sm" spacing="sm" icon={<ThemeIcon color="red" size={20} radius="xl"><IconAlertTriangle size={12} /></ThemeIcon>}>
              <List.Item>Copy API keys into chat prompts</List.Item>
              <List.Item>Share OAuth tokens in plain text</List.Item>
              <List.Item>No audit trail of data access</List.Item>
              <List.Item>Credentials stored in chat history</List.Item>
              <List.Item>Manual token refresh and rotation</List.Item>
              <List.Item>Risk of credential leakage in logs</List.Item>
            </List>
          </Paper>
          
          <Paper p="md" withBorder radius="md" style={{ background: 'var(--mantine-color-green-0)', borderColor: 'var(--mantine-color-green-3)' }}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="green" size="lg" radius="xl">
                <IconShield size={18} />
              </ThemeIcon>
              <Text fw={700} c="green.7">With MCP</Text>
            </Group>
            <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
              <List.Item>Credentials stored securely on your machine</List.Item>
              <List.Item>AI never sees raw API keys or tokens</List.Item>
              <List.Item>Built-in permission scoping</List.Item>
              <List.Item>Automatic token refresh handling</List.Item>
              <List.Item>Complete audit logs of every request</List.Item>
              <List.Item>Revoke access instantly if needed</List.Item>
            </List>
          </Paper>
        </SimpleGrid>

        <Alert icon={<IconLock size={16} />} color="blue" variant="light">
          <Text size="sm">
            <Text span fw={600}>Key insight:</Text> MCP acts as a security proxy. The AI requests 
            data through the MCP server, which handles authentication privately. The AI only receives 
            the data it needs—never the credentials to access it.
          </Text>
        </Alert>
      </Paper>

      {/* Maria Chen Case Study Teaser */}
      <Paper p="lg" withBorder radius="md" mb="xl" style={{ borderColor: 'var(--mantine-color-pink-4)', background: 'linear-gradient(135deg, #fce4ec 0%, #fff 100%)' }}>
        <Group gap="sm" mb="md">
          <ThemeIcon color="pink" size="lg" radius="xl">
            <IconHeart size={18} />
          </ThemeIcon>
          <Box>
            <Badge color="pink" size="sm" variant="filled" mb={4}>CASE STUDY</Badge>
            <Title order={4}>See MCP in Action: Maria Chen&apos;s Health Platform</Title>
          </Box>
        </Group>
        
        <Text size="md" mb="md">
          See how MCP connects multiple health devices—Oura Ring, Apple Watch, Strava, and more—to 
          create a unified AI health assistant. Follow Maria through a full day of contextual, 
          AI-powered insights that would be impossible without MCP&apos;s secure data integration.
        </Text>

        <Button 
          component={Link} 
          to="/case-study-health" 
          color="pink" 
          variant="light"
          rightSection={<IconArrowRight size={16} />}
        >
          Explore Maria&apos;s Connected Health Journey
        </Button>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Popular MCP Servers</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="gray" size="lg" radius="xl">
                <IconFileText size={18} />
              </ThemeIcon>
              <Text fw={600}>Filesystem</Text>
            </Group>
            <Text size="sm" c="dimmed">Read/write local files securely</Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="gray" size="lg" radius="xl">
                <IconBrandGithub size={18} />
              </ThemeIcon>
              <Text fw={600}>GitHub</Text>
            </Group>
            <Text size="sm" c="dimmed">Access repos, issues, PRs</Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="gray" size="lg" radius="xl">
                <IconDatabase size={18} />
              </ThemeIcon>
              <Text fw={600}>PostgreSQL</Text>
            </Group>
            <Text size="sm" c="dimmed">Query databases directly</Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="gray" size="lg" radius="xl">
                <IconWorld size={18} />
              </ThemeIcon>
              <Text fw={600}>Fetch</Text>
            </Group>
            <Text size="sm" c="dimmed">Make HTTP requests to APIs</Text>
          </Paper>
        </SimpleGrid>
        
        <Divider my="md" />
        
        <Text size="sm">
          Browse more at{' '}
          <Anchor href="https://github.com/modelcontextprotocol/servers" target="_blank">
            github.com/modelcontextprotocol/servers
          </Anchor>
        </Text>
      </Paper>

      <Alert icon={<IconCheck size={16} />} color="green" variant="light">
        <Text size="sm">
          <Text span fw={600}>For this course:</Text> MCP is optional but powerful. 
          If you want to build AI tools that interact with real business data, 
          understanding MCP will give you a significant advantage.
        </Text>
      </Alert>
    </>
  );
}
