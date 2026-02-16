import React from 'react';
import {
  Title,
  Text,
  Box,
  Timeline,
} from '@mantine/core';
import {
  IconBook,
} from '@tabler/icons-react';

export default function PracticalApplicationContent() {
  return (
    <Box>
      <Text size="lg" mb="xl">
        Implementing ethical frameworks isn't just about checking boxes—it's about integrating 
        responsible AI practices into your development workflow from day one.
      </Text>

      <Timeline active={-1} bulletSize={24} lineWidth={2} mb="xl">
        <Timeline.Item bullet={<IconBook size={12} />} title="Step 1: Identify Applicable Frameworks">
          <Text size="sm" c="dimmed" mt="xs">
            {"Determine which frameworks apply based on your geographic scope, industry, and AI application type. For healthcare AI targeting global markets, you'll likely need to consider EU AI Act, FDA guidance, and HIPAA alongside voluntary frameworks."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 2: Classify Your System's Risk Level">
          <Text size="sm" c="dimmed" mt="xs">
            {"Under EU AI Act, most healthcare diagnostic AI qualifies as \"high-risk.\" This triggers mandatory requirements for documentation, testing, and monitoring. Map your system against each framework's risk taxonomy."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 3: Create Compliance Documentation">
          <Text size="sm" c="dimmed" mt="xs">
            {"Build documentation that satisfies multiple frameworks simultaneously. A single \"Model Card\" can address transparency requirements from EU AI Act, IEEE EAD, and NIST AI RMF."}
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 4: Implement Required Controls">
          <Text size="sm" c="dimmed" mt="xs">
            For high-risk AI: implement human oversight mechanisms, establish data governance, create risk 
            management systems, and ensure technical robustness through testing.
          </Text>
        </Timeline.Item>

        <Timeline.Item bullet={<IconBook size={12} />} title="Step 5: Establish Ongoing Monitoring">
          <Text size="sm" c="dimmed" mt="xs">
            Frameworks require continuous monitoring, not just pre-deployment compliance. Set up dashboards 
            to track fairness metrics, accuracy degradation, and incident reports.
          </Text>
        </Timeline.Item>
      </Timeline>

      <Box
        p="lg"
        style={{
          background: 'linear-gradient(135deg, rgba(66, 135, 245, 0.1), rgba(66, 135, 245, 0.05))',
          borderLeft: '4px solid #4287f5',
          borderRadius: '8px',
        }}
      >
        <Title order={4} mb="sm">💡 Pro Tip: Start Early</Title>
        <Text size="sm">
          Framework requirements should be integrated from the design phase. Retrofitting compliance 
          after development is expensive and often impossible without significant rework. Build ethical 
          considerations into your AI project charter and sprint planning from day one.
        </Text>
      </Box>
    </Box>
  );
}
