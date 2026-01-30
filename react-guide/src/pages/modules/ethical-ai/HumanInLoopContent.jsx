import React from 'react';
import {
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  Card,
  SimpleGrid,
  Anchor,
  Alert,
  Timeline,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconExternalLink,
  IconUser,
  IconRobot,
  IconArrowsLeftRight,
  IconShieldCheck,
  IconEye,
  IconHandStop,
} from '@tabler/icons-react';
import styles from './EthicalAI.module.css';

export default function HumanInLoopContent() {
  return (
    <Box>
      {/* Introduction */}
      <Text size="lg" mb="lg">
        {"Human-in-the-loop (HITL) design ensures that humans remain central to AI-assisted decision making. In healthcare and other high-stakes domains, this isn't optional—it's essential for safety, accountability, and maintaining trust in AI systems."}
      </Text>

      {/* Real-World Case Study */}
      <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
        <Group mb="md">
          <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
          <Text fw={700} size="lg">Boeing 737 MAX MCAS System (2018-2019)</Text>
        </Group>
        
        <Text mb="md">
          {"The Boeing 737 MAX crashes that killed 346 people illustrate what happens when automated systems override human judgment without proper safeguards. The MCAS (Maneuvering Characteristics Augmentation System) repeatedly pushed the nose down based on faulty sensor data, and pilots couldn't effectively override it."}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Text fw={600} c="red.7" mb="xs">HITL Design Failures</Text>
            <List size="sm" spacing="xs">
              <List.Item>System relied on single sensor (no redundancy)</List.Item>
              <List.Item>Pilots not trained on MCAS existence or behavior</List.Item>
              <List.Item>Override procedure was counterintuitive and difficult</List.Item>
              <List.Item>System could activate repeatedly after being disabled</List.Item>
              <List.Item>No clear indication to pilots that MCAS was activating</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={600} c="green.7" mb="xs">Lessons for AI Systems</Text>
            <List size="sm" spacing="xs">
              <List.Item>Always provide clear, easy override mechanisms</List.Item>
              <List.Item>Make automated actions visible and understandable</List.Item>
              <List.Item>Train users on system behavior and limitations</List.Item>
              <List.Item>Design for graceful degradation when sensors fail</List.Item>
              <List.Item>Never let automation override human input without consent</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Alert color="orange" variant="light" mt="md" icon={<IconAlertTriangle size={16} />}>
          <Text size="sm">
            <Text span fw={600}>Healthcare parallel:</Text> An AI diagnostic system that repeatedly 
            overrides clinician judgment, provides unclear recommendations, or lacks easy override 
            mechanisms creates similar risks—just in a medical context.
          </Text>
        </Alert>

        <Text size="sm" c="dimmed" fs="italic" mt="md">
          <Text span fw={600}>Source: </Text>
          {"House Committee on Transportation and Infrastructure. (2020). \"Final Committee Report on the Boeing 737 MAX.\""}
          <Anchor href="https://transportation.house.gov/imo/media/doc/2020.09.15%20FINAL%20737%20MAX%20Report%20for%20Public%20Release.pdf" target="_blank" ml="xs">
            Read Report <IconExternalLink size={12} />
          </Anchor>
        </Text>
      </Paper>

      {/* HITL Patterns */}
      <Title order={2} mb="md">Human-in-the-Loop Design Patterns</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="blue" size={50} radius="xl">
              <IconUser size={26} />
            </ThemeIcon>
          </Group>
          <Badge color="blue" variant="filled" mb="sm">HUMAN-IN-THE-LOOP</Badge>
          <Title order={4} mb="sm">Full Human Control</Title>
          <Text size="sm" c="dimmed" mb="md">
            AI provides recommendations, but humans make every decision. AI never takes 
            autonomous action.
          </Text>
          <Text fw={600} size="sm" mb="xs">Best For:</Text>
          <List size="xs" spacing="xs">
            <List.Item>High-stakes medical diagnoses</List.Item>
            <List.Item>Treatment planning</List.Item>
            <List.Item>Legal decisions</List.Item>
            <List.Item>Novel or unusual cases</List.Item>
          </List>
          <Divider my="md" />
          <Text size="xs" c="dimmed">
            <Text span fw={600}>Example:</Text> Radiologist reviews every AI-flagged potential tumor, 
            AI never reports findings directly to patients.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="green" size={50} radius="xl">
              <IconArrowsLeftRight size={26} />
            </ThemeIcon>
          </Group>
          <Badge color="green" variant="filled" mb="sm">HUMAN-ON-THE-LOOP</Badge>
          <Title order={4} mb="sm">Supervised Autonomy</Title>
          <Text size="sm" c="dimmed" mb="md">
            AI can take actions autonomously within defined parameters, but humans monitor 
            and can intervene at any time.
          </Text>
          <Text fw={600} size="sm" mb="xs">Best For:</Text>
          <List size="xs" spacing="xs">
            <List.Item>Medication dosing within ranges</List.Item>
            <List.Item>Scheduling and logistics</List.Item>
            <List.Item>Routine monitoring alerts</List.Item>
            <List.Item>Pre-screening applications</List.Item>
          </List>
          <Divider my="md" />
          <Text size="xs" c="dimmed">
            <Text span fw={600}>Example:</Text> AI adjusts insulin pump dosing within MD-approved 
            ranges, alerts clinician for out-of-range situations.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.frameworkCard}>
          <Group mb="md">
            <ThemeIcon color="grape" size={50} radius="xl">
              <IconRobot size={26} />
            </ThemeIcon>
          </Group>
          <Badge color="grape" variant="filled" mb="sm">HUMAN-OUT-OF-THE-LOOP</Badge>
          <Title order={4} mb="sm">Full Automation</Title>
          <Text size="sm" c="dimmed" mb="md">
            AI operates autonomously with periodic human review. Human intervention is 
            exception-based, not routine.
          </Text>
          <Text fw={600} size="sm" mb="xs">Best For:</Text>
          <List size="xs" spacing="xs">
            <List.Item>Spam filtering</List.Item>
            <List.Item>Routine data validation</List.Item>
            <List.Item>Low-stakes recommendations</List.Item>
            <List.Item>Well-understood, low-risk tasks</List.Item>
          </List>
          <Divider my="md" />
          <Text size="xs" c="dimmed">
            <Text span fw={600}>⚠ Rarely appropriate for healthcare</Text> — use only for 
            administrative tasks with no patient impact.
          </Text>
        </Card>
      </SimpleGrid>

      {/* Design Principles */}
      <Title order={2} mb="md">Key Design Principles</Title>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Timeline active={-1} bulletSize={32} lineWidth={2}>
          <Timeline.Item 
            bullet={<ThemeIcon color="blue" size={32} radius="xl"><IconEye size={16} /></ThemeIcon>} 
            title="Transparency: Make AI Actions Visible"
          >
            <Text size="sm" c="dimmed" mt="xs" mb="md">
              Users must always be able to see what the AI is doing and why. Hidden automation 
              leads to over-reliance and inability to catch errors.
            </Text>
            <Paper p="md" bg="blue.0" radius="md">
              <Text size="sm" fw={600} mb="xs">Implementation Tips:</Text>
              <List size="sm" spacing="xs">
                <List.Item>Show confidence scores alongside predictions</List.Item>
                <List.Item>Highlight which factors drove the recommendation</List.Item>
                <List.Item>Clearly label AI-generated content</List.Item>
                <List.Item>Provide explanations at appropriate technical level</List.Item>
              </List>
            </Paper>
          </Timeline.Item>

          <Timeline.Item 
            bullet={<ThemeIcon color="green" size={32} radius="xl"><IconHandStop size={16} /></ThemeIcon>} 
            title="Override: Easy, Obvious, Always Available"
          >
            <Text size="sm" c="dimmed" mt="xs" mb="md">
              {"Humans must be able to override AI decisions quickly and easily. The override mechanism should be more prominent than the \"accept\" button."}
            </Text>
            <Paper p="md" bg="green.0" radius="md">
              <Text size="sm" fw={600} mb="xs">Implementation Tips:</Text>
              <List size="sm" spacing="xs">
                <List.Item>Place override button prominently, not buried in menus</List.Item>
                <List.Item>{"Allow override with single click (don't require justification to override)"}</List.Item>
                <List.Item>{"Optionally capture override reason for learning, but don't require it"}</List.Item>
                <List.Item>{"Never punish users for overriding (no \"are you sure?\" for overrides)"}</List.Item>
              </List>
            </Paper>
          </Timeline.Item>

          <Timeline.Item 
            bullet={<ThemeIcon color="grape" size={32} radius="xl"><IconShieldCheck size={16} /></ThemeIcon>} 
            title="Fail-Safe: Default to Human Control"
          >
            <Text size="sm" c="dimmed" mt="xs" mb="md">
              When AI systems fail, are uncertain, or encounter novel situations, they should 
              escalate to humans rather than guessing.
            </Text>
            <Paper p="md" bg="grape.0" radius="md">
              <Text size="sm" fw={600} mb="xs">Implementation Tips:</Text>
              <List size="sm" spacing="xs">
                <List.Item>Set confidence thresholds below which human review is required</List.Item>
                <List.Item>Detect out-of-distribution inputs and escalate automatically</List.Item>
                <List.Item>{"When sensor data is missing/corrupted, don't guess—ask human"}</List.Item>
                <List.Item>Design graceful degradation paths for system failures</List.Item>
              </List>
            </Paper>
          </Timeline.Item>

          <Timeline.Item 
            bullet={<ThemeIcon color="orange" size={32} radius="xl"><IconUser size={16} /></ThemeIcon>} 
            title="Calibration: Maintain Appropriate Trust"
          >
            <Text size="sm" c="dimmed" mt="xs" mb="md">
              Users should trust AI appropriately—neither too much (automation bias) nor too little 
              (dismissing valid recommendations).
            </Text>
            <Paper p="md" bg="orange.0" radius="md">
              <Text size="sm" fw={600} mb="xs">Implementation Tips:</Text>
              <List size="sm" spacing="xs">
                <List.Item>Train users on actual system accuracy, including error rates</List.Item>
                <List.Item>{"Show historical accuracy: \"This model is correct 87% of the time\""}</List.Item>
                <List.Item>Highlight cases where model was wrong (not just successes)</List.Item>
                <List.Item>{"Periodically test users to ensure they're still critically evaluating"}</List.Item>
              </List>
            </Paper>
          </Timeline.Item>
        </Timeline>
      </Paper>

      {/* Automation Bias */}
      <Title order={2} mb="md">Preventing Automation Bias</Title>
      
      <Alert color="orange" variant="light" mb="lg" icon={<IconAlertTriangle size={20} />}>
        <Text fw={600}>Automation Bias</Text>
        <Text size="sm">
          The tendency of humans to over-rely on automated systems, accepting their outputs without 
          sufficient scrutiny. This is one of the biggest risks in AI-assisted decision making.
        </Text>
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Paper p="lg" radius="md" className={styles.warningCard}>
          <Text fw={600} c="orange.8" mb="sm">⚠️ Signs of Automation Bias</Text>
          <List size="sm" spacing="xs">
            <List.Item>Users accept AI recommendations without checking</List.Item>
            <List.Item>Override rates are near zero (should be 5-20% for most systems)</List.Item>
            <List.Item>{"Users can't explain why they agree with AI"}</List.Item>
            <List.Item>Users feel uncomfortable disagreeing with AI</List.Item>
            <List.Item>Errors that should have been caught are missed</List.Item>
          </List>
        </Paper>

        <Paper p="lg" radius="md" className={styles.successCard}>
          <Text fw={600} c="green.8" mb="sm">✅ Countermeasures</Text>
          <List size="sm" spacing="xs">
            <List.Item>Require users to form independent judgment before seeing AI output</List.Item>
            <List.Item>Periodically present cases without AI assistance</List.Item>
            <List.Item>{"Introduce deliberate \"challenge\" cases where AI is wrong"}</List.Item>
            <List.Item>Track and discuss override rates in team meetings</List.Item>
            <List.Item>Celebrate catches of AI errors, not just agreements</List.Item>
          </List>
        </Paper>
      </SimpleGrid>

      {/* Real Implementation Example */}
      <Title order={2} mb="md">Example: Chest X-Ray AI with HITL</Title>
      
      <Paper p="lg" radius="md" withBorder mb="xl">
        <Text mb="md">
          {"Here's how a properly designed human-in-the-loop system for chest X-ray analysis might work:"}
        </Text>

        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          <Timeline.Item bullet={<Text size="xs" fw={700}>1</Text>} title="Radiologist Opens Case">
            <Text size="sm" c="dimmed">
              X-ray is displayed. AI analysis is NOT shown initially—radiologist forms independent impression.
            </Text>
          </Timeline.Item>

          <Timeline.Item bullet={<Text size="xs" fw={700}>2</Text>} title="Independent Assessment">
            <Text size="sm" c="dimmed">
              {"Radiologist documents initial findings: \"No acute findings\" or identifies areas of concern."}
            </Text>
          </Timeline.Item>

          <Timeline.Item bullet={<Text size="xs" fw={700}>3</Text>} title="AI Assistant Revealed">
            <Text size="sm" c="dimmed">
              {"AI findings are shown with heat maps, confidence scores, and similar historical cases. \"AI detected potential nodule (78% confidence) in right lower lobe.\""}
            </Text>
          </Timeline.Item>

          <Timeline.Item bullet={<Text size="xs" fw={700}>4</Text>} title="Comparison & Decision">
            <Text size="sm" c="dimmed">
              Radiologist compares their assessment with AI. If disagree, easy override with 
              optional reason. System logs both assessments.
            </Text>
          </Timeline.Item>

          <Timeline.Item bullet={<Text size="xs" fw={700}>5</Text>} title="Escalation Path">
            <Text size="sm" c="dimmed">
              If AI confidence is very low (&lt;50%) or very high (&gt;95%) but radiologist disagrees, 
              case is flagged for second radiologist review.
            </Text>
          </Timeline.Item>

          <Timeline.Item bullet={<Text size="xs" fw={700}>6</Text>} title="Feedback Loop">
            <Text size="sm" c="dimmed">
              Ground truth from biopsy/follow-up is captured and used to track AI and human accuracy 
              over time. Cases where human caught AI errors are used for retraining.
            </Text>
          </Timeline.Item>
        </Timeline>
      </Paper>

      {/* Pitfalls */}
      <Title order={2} mb="md">Common Pitfalls to Avoid</Title>
      
      <Paper p="lg" radius="md" className={styles.pitfallCard} mb="xl">
        <Title order={4} mb="md" c="red.8">🚫 HITL Design Mistakes</Title>
        
        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">1</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Showing AI recommendation first</Text>
            <Text size="sm" c="dimmed">
              {"Once humans see the AI's answer, they anchor on it. Always collect human judgment before revealing AI output for high-stakes decisions."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">2</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Making override difficult or punitive</Text>
            <Text size="sm" c="dimmed">
              Requiring justification, extra clicks, or supervisor approval to override AI 
              discourages healthy skepticism. Make accepting and overriding equally easy.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">3</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Measuring success only by AI adoption</Text>
            <Text size="sm" c="dimmed">
              {"Tracking \"AI acceptance rate\" as a success metric encourages automation bias. Measure patient outcomes, not AI agreement rates."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">4</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>{"Assuming \"human in the loop\" means the system is safe"}</Text>
            <Text size="sm" c="dimmed">
              A fatigued, rushed, or over-trusting human provides no safety benefit. HITL requires 
              proper training, time, and incentives to actually work.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">5</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Not providing context for AI uncertainty</Text>
            <Text size="sm" c="dimmed">
              {"Showing \"75% confidence\" means nothing without context. Users need to know: \"This model is usually 90% confident, so 75% is unusually low.\""}
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Success Checklist */}
      <Paper p="lg" radius="md" className={styles.successCard}>
        <Title order={4} mb="md" c="green.8">✅ Your HITL Design Checklist</Title>
        
        <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
          <List.Item>Choose appropriate HITL pattern based on risk level</List.Item>
          <List.Item>Design for human judgment BEFORE AI reveal (where possible)</List.Item>
          <List.Item>Make override mechanism prominent, easy, and unpunished</List.Item>
          <List.Item>Show confidence scores with appropriate context</List.Item>
          <List.Item>Explain AI reasoning in user-appropriate language</List.Item>
          <List.Item>Implement automatic escalation for low-confidence predictions</List.Item>
          <List.Item>Train users on system accuracy AND failure modes</List.Item>
          <List.Item>Monitor override rates (too low = automation bias risk)</List.Item>
          <List.Item>Create feedback loops to capture ground truth</List.Item>
          <List.Item>Test system behavior when AI component fails</List.Item>
          <List.Item>Design for graceful degradation to human-only workflow</List.Item>
          <List.Item>Periodically test users with AI-off scenarios</List.Item>
        </List>
      </Paper>
    </Box>
  );
}
