import React from 'react';
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
} from '@mantine/core';
import {
  IconCheck,
  IconInfoCircle,
  IconRobot,
  IconArrowRight,
  IconBrain,
  IconTool,
  IconRefresh,
  IconTarget,
} from '@tabler/icons-react';

export default function AgentContent() {
  return (
    <>
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">What are AI Agents?</Title>
        <Text size="md" mb="md">
          An <Text span fw={700}>AI Agent</Text> is an AI system that can autonomously perform 
          multi-step tasks by reasoning, planning, and using tools. Unlike simple chatbots that 
          just respond to single prompts, agents can:
        </Text>
        <List spacing="sm" mb="md">
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={24} radius="xl">
                <IconBrain size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Reason about problems</Text> - Break down complex tasks into steps
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={24} radius="xl">
                <IconTool size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Use tools</Text> - Search the web, run code, access databases
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={24} radius="xl">
                <IconRefresh size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Iterate and adapt</Text> - Learn from errors and try different approaches
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={24} radius="xl">
                <IconTarget size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Complete goals</Text> - Work until a task is done, not just respond once
          </List.Item>
        </List>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Chatbot vs Agent</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Group gap="xs" mb="xs">
              <Badge color="gray" variant="light">Traditional Chatbot</Badge>
            </Group>
            <Text size="sm" mb="sm" c="dimmed">Single prompt → Single response</Text>
            <List size="sm" spacing="xs">
              <List.Item>&quot;What&apos;s the weather?&quot; → Shows weather</List.Item>
              <List.Item>No memory between messages</List.Item>
              <List.Item>Can&apos;t take actions</List.Item>
              <List.Item>Needs explicit instructions each time</List.Item>
            </List>
          </Box>
          <Box>
            <Group gap="xs" mb="xs">
              <Badge color="indigo" variant="light">AI Agent</Badge>
            </Group>
            <Text size="sm" mb="sm" c="dimmed">Goal → Autonomous execution</Text>
            <List size="sm" spacing="xs">
              <List.Item>&quot;Book me a flight&quot; → Searches, compares, books</List.Item>
              <List.Item>Maintains context across steps</List.Item>
              <List.Item>Uses tools and APIs</List.Item>
              <List.Item>Figures out how to achieve goals</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Alert icon={<IconInfoCircle size={16} />} color="indigo" variant="light">
          <Text size="sm">
            <Text span fw={600}>Key insight:</Text> Agents turn AI from a &quot;question-answering machine&quot; 
            into a &quot;task-completing assistant.&quot; This is why agents are transforming how 
            businesses automate workflows.
          </Text>
        </Alert>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">How Agents Work</Title>
        <Text size="md" mb="md">
          Most agents follow a <Text span fw={600}>loop pattern</Text>:
        </Text>
        
        <Box mb="md" p="md" style={{ background: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
          <Group gap="sm" justify="center" wrap="wrap">
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">1</Text>
              <Text fw={600} size="sm">Observe</Text>
              <Text size="xs" c="dimmed">Get context</Text>
            </Paper>
            <IconArrowRight size={16} color="gray" />
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">2</Text>
              <Text fw={600} size="sm">Think</Text>
              <Text size="xs" c="dimmed">Plan next step</Text>
            </Paper>
            <IconArrowRight size={16} color="gray" />
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">3</Text>
              <Text fw={600} size="sm">Act</Text>
              <Text size="xs" c="dimmed">Use a tool</Text>
            </Paper>
            <IconArrowRight size={16} color="gray" />
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">4</Text>
              <Text fw={600} size="sm">Repeat</Text>
              <Text size="xs" c="dimmed">Until done</Text>
            </Paper>
          </Group>
        </Box>

        <Text size="md" mb="md">
          This is often called the <Text span fw={600}>ReAct pattern</Text> (Reasoning + Acting). 
          The agent reasons about what to do, takes an action, observes the result, and repeats 
          until the goal is achieved.
        </Text>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Agent Use Cases in Business</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="blue" size="lg" radius="xl">
                <IconRobot size={18} />
              </ThemeIcon>
              <Text fw={600}>Customer Support</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Agents that can look up orders, process refunds, and escalate issues automatically
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="green" size="lg" radius="xl">
                <IconRobot size={18} />
              </ThemeIcon>
              <Text fw={600}>Data Analysis</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Agents that query databases, generate reports, and visualize trends
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="orange" size="lg" radius="xl">
                <IconRobot size={18} />
              </ThemeIcon>
              <Text fw={600}>Research Assistant</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Agents that search the web, summarize articles, and compile findings
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="violet" size="lg" radius="xl">
                <IconRobot size={18} />
              </ThemeIcon>
              <Text fw={600}>Code Assistant</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Agents that write, test, and debug code across multiple files
            </Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Popular Agent Frameworks</Title>
        <Text size="md" mb="md">
          Several frameworks make it easier to build agents:
        </Text>
        
        <List spacing="md" mb="md">
          <List.Item>
            <Text span fw={600}>LangChain / LangGraph</Text>
            <Text size="sm" c="dimmed">
              Popular Python/JS framework for building agent workflows with tool integration
            </Text>
          </List.Item>
          <List.Item>
            <Text span fw={600}>CrewAI</Text>
            <Text size="sm" c="dimmed">
              Framework for building multi-agent systems where agents collaborate
            </Text>
          </List.Item>
          <List.Item>
            <Text span fw={600}>AutoGen (Microsoft)</Text>
            <Text size="sm" c="dimmed">
              Multi-agent conversation framework for complex task automation
            </Text>
          </List.Item>
          <List.Item>
            <Text span fw={600}>Claude Computer Use</Text>
            <Text size="sm" c="dimmed">
              Anthropic&apos;s agent capability for controlling desktop applications
            </Text>
          </List.Item>
        </List>

        <Divider my="md" />

        <Title order={4} mb="sm">Simple Agent Example (Conceptual)</Title>
        <Code block mb="md">
{`# Pseudocode for a simple research agent
def research_agent(question):
    plan = llm.think(f"How should I research: {question}?")
    
    while not done:
        action = llm.decide_next_action(plan, context)
        
        if action == "search":
            result = web_search(action.query)
        elif action == "read":
            result = read_page(action.url)
        elif action == "summarize":
            result = llm.summarize(context)
            done = True
        
        context.add(result)
    
    return result`}
        </Code>
      </Paper>

      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Agents + MCP = Powerful Combination</Title>
        <Text size="md" mb="md">
          MCP and Agents work together beautifully:
        </Text>
        <List spacing="sm" mb="md">
          <List.Item
            icon={
              <ThemeIcon color="pink" size={24} radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>MCP provides the tools</Text> - Secure access to databases, APIs, files
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="indigo" size={24} radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
            }
          >
            <Text span fw={600}>Agents provide the intelligence</Text> - Deciding when and how to use tools
          </List.Item>
        </List>
        
        <Alert icon={<IconInfoCircle size={16} />} color="grape" variant="light">
          <Text size="sm">
            <Text span fw={600}>Example:</Text> An agent could use MCP to query your sales database, 
            analyze trends, generate a report, and email it to stakeholders—all from a single 
            high-level request like &quot;Send me last quarter&apos;s sales summary.&quot;
          </Text>
        </Alert>
      </Paper>

      <Alert icon={<IconCheck size={16} />} color="green" variant="light">
        <Text size="sm">
          <Text span fw={600}>For this course:</Text> Understanding agents helps you see where AI 
          is heading. While we&apos;ll focus on foundational skills like prompting and RAG, 
          agents represent the next evolution of AI applications in business.
        </Text>
      </Alert>
    </>
  );
}
