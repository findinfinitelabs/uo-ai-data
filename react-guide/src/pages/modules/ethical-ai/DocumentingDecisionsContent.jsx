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
  Table,
  Accordion,
  Code,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconExternalLink,
  IconFileText,
  IconClipboardList,
  IconHistory,
  IconUsers,
} from '@tabler/icons-react';
import styles from './EthicalAI.module.css';

export default function DocumentingDecisionsContent() {
  return (
    <Box>
      {/* Introduction */}
      <Text size="lg" mb="lg">
        {"Proper documentation of AI systems is not just good practice—it's increasingly a legal requirement. Documentation enables transparency, supports auditing, and provides crucial context when AI systems produce unexpected results or cause harm."}
      </Text>

      {/* Real-World Case Study */}
      <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
        <Group mb="md">
          <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
          <Text fw={700} size="lg">COMPAS Recidivism Algorithm (ProPublica Investigation, 2016)</Text>
        </Group>
        
        <Text mb="md">
          {"COMPAS (Correctional Offender Management Profiling for Alternative Sanctions) was used by courts across the US to predict recidivism risk. ProPublica's investigation revealed the algorithm was twice as likely to falsely flag Black defendants as future criminals compared to white defendants."}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Text fw={600} c="red.7" mb="xs">Documentation Failures</Text>
            <List size="sm" spacing="xs">
              <List.Item>No public documentation of training data sources</List.Item>
              <List.Item>Risk score methodology kept as trade secret</List.Item>
              <List.Item>No disclosure of known limitations or error rates</List.Item>
              <List.Item>{"Defendants couldn't challenge scores they couldn't understand"}</List.Item>
              <List.Item>Judges used scores without understanding confidence levels</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={600} c="green.7" mb="xs">What Documentation Could Have Prevented</Text>
            <List size="sm" spacing="xs">
              <List.Item>Clear accuracy metrics by demographic would show disparity</List.Item>
              <List.Item>Stated limitations would prevent misuse in sentencing</List.Item>
              <List.Item>Training data documentation would reveal bias sources</List.Item>
              <List.Item>Confidence intervals would inform judicial discretion</List.Item>
              <List.Item>Version history would enable auditing over time</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Text size="sm" c="dimmed" fs="italic">
          <Text span fw={600}>Source: </Text>
          {"Angwin, J., et al. (2016). \"Machine Bias.\" ProPublica."}
          <Anchor href="https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing" target="_blank" ml="xs">
            Read Investigation <IconExternalLink size={12} />
          </Anchor>
        </Text>
      </Paper>

      {/* Model Cards */}
      <Title order={2} mb="md">Model Cards: The Industry Standard</Title>
      
      <Text mb="md">
        Model Cards, introduced by Google in 2018, have become the standard format for AI system documentation. 
        They provide a structured way to communicate model details, intended use, and limitations.
      </Text>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Group mb="md">
          <ThemeIcon color="blue" size={40} radius="xl">
            <IconFileText size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="lg">Model Card Template</Text>
            <Text size="sm" c="dimmed">Required sections for comprehensive documentation</Text>
          </Box>
        </Group>

        <Accordion variant="contained" mb="lg">
          <Accordion.Item value="details">
            <Accordion.Control>
              <Group>
                <Badge color="blue">Section 1</Badge>
                <Text fw={600}>Model Details</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Model name and version:</Text>{" e.g., \"DiabetesRiskPredictor v2.3.1\""}</List.Item>
                <List.Item><Text span fw={600}>Model type:</Text> Classification, regression, NLP, etc.</List.Item>
                <List.Item><Text span fw={600}>Model date:</Text> Training/release dates</List.Item>
                <List.Item><Text span fw={600}>Model developers:</Text> Team, organization, contact info</List.Item>
                <List.Item><Text span fw={600}>Model license:</Text> Terms of use</List.Item>
                <List.Item><Text span fw={600}>Citation:</Text> How to reference in publications</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="intended-use">
            <Accordion.Control>
              <Group>
                <Badge color="green">Section 2</Badge>
                <Text fw={600}>Intended Use</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Primary intended uses:</Text> What the model should be used for</List.Item>
                <List.Item><Text span fw={600}>Primary intended users:</Text> Who should use it (clinicians, researchers, etc.)</List.Item>
                <List.Item><Text span fw={600}>Out-of-scope uses:</Text> Explicit list of what NOT to use it for</List.Item>
              </List>
              <Alert color="orange" variant="light" mt="md" icon={<IconAlertTriangle size={16} />}>
                <Text size="sm" fw={600}>Example Out-of-Scope Statement:</Text>
                <Text size="sm">
                  {"\"This model should NOT be used as the sole basis for clinical decisions. It is intended as a decision support tool and requires clinical judgment for final diagnosis.\""}
                </Text>
              </Alert>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="factors">
            <Accordion.Control>
              <Group>
                <Badge color="grape">Section 3</Badge>
                <Text fw={600}>Factors</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Relevant factors:</Text> Groups, instruments, environments that affect performance</List.Item>
                <List.Item><Text span fw={600}>Evaluation factors:</Text> What was actually tested</List.Item>
              </List>
              <Paper p="md" mt="md" bg="gray.0" radius="md">
                <Text size="sm" fw={600} mb="xs">Example:</Text>
                <Text size="sm">
                  {"\"Model was evaluated across age groups (18-30, 31-50, 51-70, 70+), gender (male, female), and ethnicity (White, Black, Hispanic, Asian, Other). Performance was not evaluated for patients under 18 or in emergency care settings.\""}
                </Text>
              </Paper>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="metrics">
            <Accordion.Control>
              <Group>
                <Badge color="orange">Section 4</Badge>
                <Text fw={600}>Metrics</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Performance metrics:</Text> Accuracy, precision, recall, F1, AUC</List.Item>
                <List.Item><Text span fw={600}>Decision thresholds:</Text> How predictions are converted to decisions</List.Item>
                <List.Item><Text span fw={600}>Confidence intervals:</Text> Statistical uncertainty of metrics</List.Item>
              </List>
              <Table striped withTableBorder mt="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Metric</Table.Th>
                    <Table.Th>Overall</Table.Th>
                    <Table.Th>Male</Table.Th>
                    <Table.Th>Female</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Accuracy</Table.Td>
                    <Table.Td>0.87 (±0.02)</Table.Td>
                    <Table.Td>0.88 (±0.03)</Table.Td>
                    <Table.Td>0.86 (±0.03)</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Sensitivity</Table.Td>
                    <Table.Td>0.82 (±0.03)</Table.Td>
                    <Table.Td>0.84 (±0.04)</Table.Td>
                    <Table.Td>0.80 (±0.04)</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Specificity</Table.Td>
                    <Table.Td>0.91 (±0.02)</Table.Td>
                    <Table.Td>0.91 (±0.03)</Table.Td>
                    <Table.Td>0.91 (±0.03)</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="data">
            <Accordion.Control>
              <Group>
                <Badge color="teal">Section 5</Badge>
                <Text fw={600}>Training & Evaluation Data</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Training data:</Text> Sources, size, collection methodology</List.Item>
                <List.Item><Text span fw={600}>Evaluation data:</Text> Test set characteristics</List.Item>
                <List.Item><Text span fw={600}>Preprocessing:</Text> Data cleaning, transformation steps</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="limitations">
            <Accordion.Control>
              <Group>
                <Badge color="red">Section 6</Badge>
                <Text fw={600}>Ethical Considerations & Limitations</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item><Text span fw={600}>Known limitations:</Text> Where the model fails</List.Item>
                <List.Item><Text span fw={600}>Sensitive uses:</Text> Potential for harm</List.Item>
                <List.Item><Text span fw={600}>Bias considerations:</Text> Known or potential biases</List.Item>
                <List.Item><Text span fw={600}>Recommendations:</Text> How to mitigate risks</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Anchor href="https://modelcards.withgoogle.com/about" target="_blank" size="sm">
          {"View Google's Model Card Examples"} <IconExternalLink size={12} />
        </Anchor>
      </Paper>

      {/* Datasheets */}
      <Title order={2} mb="md">Datasheets for Datasets</Title>
      
      <Text mb="md">
        Just as model cards document models, datasheets document datasets. This is critical because 
        data quality and composition directly affect model behavior.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="blue" size={40} radius="xl" mb="sm">
            <IconClipboardList size={20} />
          </ThemeIcon>
          <Text fw={600}>Motivation</Text>
          <List size="sm" spacing="xs" mt="xs">
            <List.Item>Why was the dataset created?</List.Item>
            <List.Item>Who created it and who funded it?</List.Item>
            <List.Item>What tasks is it intended for?</List.Item>
          </List>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="green" size={40} radius="xl" mb="sm">
            <IconUsers size={20} />
          </ThemeIcon>
          <Text fw={600}>Composition</Text>
          <List size="sm" spacing="xs" mt="xs">
            <List.Item>What do instances represent?</List.Item>
            <List.Item>How many instances are there?</List.Item>
            <List.Item>Is there missing data?</List.Item>
          </List>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="grape" size={40} radius="xl" mb="sm">
            <IconHistory size={20} />
          </ThemeIcon>
          <Text fw={600}>Collection Process</Text>
          <List size="sm" spacing="xs" mt="xs">
            <List.Item>How was data collected?</List.Item>
            <List.Item>Who collected it?</List.Item>
            <List.Item>Was consent obtained?</List.Item>
          </List>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="orange" size={40} radius="xl" mb="sm">
            <IconAlertTriangle size={20} />
          </ThemeIcon>
          <Text fw={600}>Uses & Limitations</Text>
          <List size="sm" spacing="xs" mt="xs">
            <List.Item>What should it NOT be used for?</List.Item>
            <List.Item>What are potential harms?</List.Item>
            <List.Item>Are there representativeness issues?</List.Item>
          </List>
        </Card>
      </SimpleGrid>

      {/* Decision Logs */}
      <Title order={2} mb="md">Decision Logs & Audit Trails</Title>
      
      <Text mb="md">
        Beyond static documentation, you need logging systems that capture individual predictions 
        and the context in which they were made.
      </Text>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Text fw={600} mb="md">What to Log for Each Prediction</Text>
        
        <Paper p="md" className={styles.codeBlock} mb="md">
          <Code block>
{`{
  "prediction_id": "pred_2024_03_15_001234",
  "timestamp": "2024-03-15T14:32:17Z",
  "model_version": "diabetes_risk_v2.3.1",
  
  // Input context (anonymized)
  "input_features": {
    "age_group": "50-60",
    "bmi_category": "overweight",
    "has_family_history": true,
    "a1c_range": "5.7-6.4"
  },
  
  // Output
  "prediction": "high_risk",
  "confidence": 0.78,
  "risk_score": 0.82,
  
  // Explanation
  "top_contributing_factors": [
    {"feature": "a1c_range", "contribution": 0.35},
    {"feature": "family_history", "contribution": 0.28},
    {"feature": "bmi_category", "contribution": 0.22}
  ],
  
  // Context
  "requesting_user_role": "primary_care_physician",
  "clinical_context": "annual_checkup",
  
  // Outcome (added later)
  "human_decision": "referred_to_specialist",
  "human_agreed_with_model": true,
  "override_reason": null
}`}
          </Code>
        </Paper>

        <Alert color="blue" variant="light" icon={<IconCircleCheck size={16} />}>
          <Text size="sm">
            <Text span fw={600}>Why this matters:</Text> When an adverse event occurs, this log allows 
            you to reconstruct exactly what the model saw, what it predicted, and how the prediction 
            was used. This is essential for both learning from mistakes and regulatory compliance.
          </Text>
        </Alert>
      </Paper>

      {/* Pitfalls */}
      <Title order={2} mb="md">Common Pitfalls to Avoid</Title>
      
      <Paper p="lg" radius="md" className={styles.pitfallCard} mb="xl">
        <Title order={4} mb="md" c="red.8">🚫 Documentation Mistakes</Title>
        
        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">1</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Documenting once and forgetting</Text>
            <Text size="sm" c="dimmed">
              Documentation must be updated with each model version, retraining, or significant 
              performance change. Outdated documentation is worse than no documentation.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">2</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Only documenting successes</Text>
            <Text size="sm" c="dimmed">
              The most valuable documentation is about limitations, failure modes, and edge cases. 
              Be brutally honest about where your model struggles.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">3</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Treating proprietary concerns as excuse for opacity</Text>
            <Text size="sm" c="dimmed">
              {"You can document behavior, limitations, and appropriate use without revealing trade secrets. COMPAS's secrecy didn't protect the company—it amplified criticism."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">4</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Writing documentation only for technical audiences</Text>
            <Text size="sm" c="dimmed">
              End users (clinicians, patients, judges) need plain-language documentation. 
              Create layered documentation: executive summary, user guide, and technical details.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">5</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Failing to log human overrides</Text>
            <Text size="sm" c="dimmed">
              {"When humans disagree with model predictions, that's valuable signal! Log it with reasons. High override rates might indicate model problems."}
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Success Checklist */}
      <Paper p="lg" radius="md" className={styles.successCard}>
        <Title order={4} mb="md" c="green.8">✅ Your Documentation Checklist</Title>
        
        <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
          <List.Item>Create a Model Card for every production model</List.Item>
          <List.Item>Document training data with a datasheet</List.Item>
          <List.Item>Specify intended use AND out-of-scope uses explicitly</List.Item>
          <List.Item>Report metrics disaggregated by relevant demographic groups</List.Item>
          <List.Item>Include confidence intervals on all performance metrics</List.Item>
          <List.Item>Document known limitations and failure modes honestly</List.Item>
          <List.Item>Create plain-language summaries for non-technical users</List.Item>
          <List.Item>Implement prediction logging with context</List.Item>
          <List.Item>Track and log human overrides with reasons</List.Item>
          <List.Item>Version documentation alongside model versions</List.Item>
          <List.Item>Schedule quarterly documentation reviews</List.Item>
          <List.Item>Make documentation accessible to all stakeholders</List.Item>
        </List>
      </Paper>
    </Box>
  );
}
