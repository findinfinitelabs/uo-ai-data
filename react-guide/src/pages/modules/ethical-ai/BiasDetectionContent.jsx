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
  Code,
  Table,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconBulb,
  IconExternalLink,
  IconChartBar,
  IconUsers,
  IconScale,
  IconChartDots,
} from '@tabler/icons-react';
import styles from './EthicalAI.module.css';

export default function BiasDetectionContent() {
  return (
    <Box>
      {/* Introduction */}
      <Text size="lg" mb="lg">
        Bias in AI systems can lead to unfair outcomes that disproportionately affect certain groups. 
        Learning to detect and mitigate bias is essential for any data scientist or developer working with AI, 
        especially in high-stakes domains like healthcare.
      </Text>

      {/* Real-World Case Study */}
      <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
        <Group mb="md">
          <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
          <Text fw={700} size="lg">{"Amazon's AI Recruiting Tool (2018)"}</Text>
        </Group>
        
        <Text mb="md">
          {"Amazon developed an AI-powered recruiting tool to automate resume screening. The system was trained on 10 years of historical hiring data—which predominantly reflected male candidates in technical roles. The algorithm learned to penalize resumes containing words like \"women's\" (as in \"women's chess club captain\") and downgraded graduates of all-women's colleges."}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Box>
            <Text fw={600} c="red.7" mb="xs">What Went Wrong</Text>
            <List size="sm" spacing="xs">
              <List.Item>Training data reflected historical hiring bias</List.Item>
              <List.Item>No demographic parity testing before deployment</List.Item>
              <List.Item>Proxy variables (college names, activities) encoded gender</List.Item>
              <List.Item>Lack of diverse perspectives in development team</List.Item>
            </List>
          </Box>
          <Box>
            <Text fw={600} c="green.7" mb="xs">How It Was Discovered</Text>
            <List size="sm" spacing="xs">
              <List.Item>Internal audit revealed gender disparities</List.Item>
              <List.Item>Comparison of recommendations vs. actual performance</List.Item>
              <List.Item>Pattern analysis on rejected candidates</List.Item>
              <List.Item>Employee whistleblowing to leadership</List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Text size="sm" c="dimmed" fs="italic">
          <Text span fw={600}>Source: </Text>
          {"Reuters. (2018). \"Amazon scraps secret AI recruiting tool that showed bias against women.\""}
          <Anchor href="https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G" target="_blank" ml="xs">
            Read Article <IconExternalLink size={12} />
          </Anchor>
        </Text>
      </Paper>

      {/* Types of Bias */}
      <Title order={2} mb="md">Types of Bias to Watch For</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="red" size={40} radius="xl" mb="sm">
            <IconUsers size={20} />
          </ThemeIcon>
          <Text fw={600}>Selection Bias</Text>
          <Text size="sm" c="dimmed">
            {"Training data doesn't represent the full population. Example: Medical AI trained only on data from academic medical centers misses patterns common in community hospitals."}
          </Text>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="orange" size={40} radius="xl" mb="sm">
            <IconChartBar size={20} />
          </ThemeIcon>
          <Text fw={600}>Measurement Bias</Text>
          <Text size="sm" c="dimmed">
            Features are measured differently across groups. Example: Pain assessment tools validated 
            primarily on white patients may underestimate pain in Black patients.
          </Text>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <ThemeIcon color="grape" size={40} radius="xl" mb="sm">
            <IconScale size={20} />
          </ThemeIcon>
          <Text fw={600}>Historical Bias</Text>
          <Text size="sm" c="dimmed">
            Past discrimination is encoded in data. Example: Loan approval models trained on historical 
            data perpetuate redlining patterns.
          </Text>
        </Card>
      </SimpleGrid>

      {/* Tails of Distribution - Critical Section */}
      <Title order={2} mb="md">
        <Group gap="xs">
          <IconChartDots size={28} />
          {"The Tails Problem: Where Bias Hides"}
        </Group>
      </Title>

      <Alert 
        icon={<IconAlertTriangle size={20} />} 
        title="Even with massive data, you MUST evaluate the tails" 
        color="orange"
        mb="lg"
      >
        {"A model trained on 10 million patients can still fail catastrophically for rare conditions, unusual presentations, or underrepresented populations. Aggregate accuracy hides tail performance."}
      </Alert>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Box>
            <Text fw={700} mb="md" size="lg">📊 Visualizing the Problem</Text>
            <Paper p="md" bg="dark.7" radius="md" mb="md">
              <Text size="xs" c="dimmed" mb="xs" ta="center">Scatter Plot: Model Confidence vs. Actual Outcome</Text>
              <Code block style={{ color: '#a3e635', fontSize: '11px' }}>
{`                High │ ○○○○○○○○○○○○○○○○○○○○○  ← Majority: 95% accurate
                     │ ○○○○○○○○○○○○○○○○○○○○○
   Model             │ ○○○○○○○○○○○○○○○○○○○
   Confidence        │   ○○○○○○○○○○○○○○
                     │     ○○○○○○○○○
                     │       ●●●●●  ← TAILS: Only 60% accurate!
                     │         ●●●    (rare cases, minorities)
                 Low │           ●●
                     └──────────────────────────────────
                          Frequency in Training Data →`}
              </Code>
            </Paper>
            <Text size="sm" c="dimmed">
              {"The ● points represent tail cases—rare conditions, unusual demographics, edge cases. They're few in number but represent real patients who deserve accurate predictions."}
            </Text>
          </Box>

          <Box>
            <Text fw={700} mb="md" size="lg">🎯 Why Tails Matter in Healthcare</Text>
            <List size="sm" spacing="md">
              <List.Item>
                <Text span fw={600}>Rare diseases:</Text> {"A model might see only 50 cases of a rare cancer out of 1M records—but those 50 patients need accurate diagnosis"}
              </List.Item>
              <List.Item>
                <Text span fw={600}>Atypical presentations:</Text> {"Heart attacks present differently in women—if 80% of training data shows male symptoms, female cases are 'tails'"}
              </List.Item>
              <List.Item>
                <Text span fw={600}>Demographic minorities:</Text> {"If your training data is 85% white patients, performance for other groups is undertested"}
              </List.Item>
              <List.Item>
                <Text span fw={600}>Intersectionality:</Text> {"Elderly + female + minority + rare condition = extreme tail with almost no training examples"}
              </List.Item>
            </List>
          </Box>
        </SimpleGrid>

        <Divider my="lg" />

        <Text fw={700} mb="md" size="lg">🔍 How to Evaluate Tails</Text>
        <Paper p="md" className={styles.codeBlock}>
          <Code block style={{ background: 'transparent', color: '#d4d4d4' }}>
{`# Tail analysis for bias detection
import numpy as np
from scipy import stats

def evaluate_tails(df, predictions, actuals, confidence_scores):
    """
    Evaluate model performance on tail cases.
    NEVER skip this step, even with millions of samples!
    """
    
    # Method 1: Low-frequency subgroups
    group_counts = df.groupby(['age_group', 'ethnicity', 'diagnosis']).size()
    rare_groups = group_counts[group_counts < 100].index  # Groups with <100 samples
    
    for group in rare_groups:
        mask = (df['age_group'] == group[0]) & \\
               (df['ethnicity'] == group[1]) & \\
               (df['diagnosis'] == group[2])
        tail_accuracy = accuracy_score(actuals[mask], predictions[mask])
        print(f"TAIL GROUP {group}: {sum(mask)} samples, {tail_accuracy:.1%} accuracy")
    
    # Method 2: Confidence-based tails (model's uncertain predictions)
    low_confidence_mask = confidence_scores < np.percentile(confidence_scores, 10)
    tail_accuracy = accuracy_score(actuals[low_confidence_mask], 
                                   predictions[low_confidence_mask])
    print(f"LOW CONFIDENCE TAIL (bottom 10%): {tail_accuracy:.1%} accuracy")
    
    # Method 3: Feature-space outliers
    from sklearn.ensemble import IsolationForest
    outlier_detector = IsolationForest(contamination=0.05)
    outliers = outlier_detector.fit_predict(feature_matrix) == -1
    tail_accuracy = accuracy_score(actuals[outliers], predictions[outliers])
    print(f"FEATURE-SPACE OUTLIERS: {tail_accuracy:.1%} accuracy")
    
    # Method 4: Error concentration analysis
    errors = predictions != actuals
    # Check if errors cluster in specific subgroups
    for col in ['ethnicity', 'age_group', 'insurance_type']:
        error_rates = df.groupby(col).apply(lambda x: errors[x.index].mean())
        if error_rates.max() / error_rates.min() > 2:
            print(f"WARNING: Error rate varies >2x across {col}!")
            print(error_rates.sort_values(ascending=False))`}
          </Code>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="lg">
          <Paper p="md" radius="md" className={styles.pitfallCard}>
            <Text fw={600} c="red.7" mb="sm">❌ Common Tail Mistakes</Text>
            <List size="sm" spacing="xs">
              <List.Item>{"Reporting only aggregate accuracy (\"99% accurate!\")"}</List.Item>
              <List.Item>Excluding rare cases from test sets</List.Item>
              <List.Item>Not stratifying train/test splits by rare groups</List.Item>
              <List.Item>Ignoring low-confidence predictions</List.Item>
              <List.Item>Assuming more data fixes tail problems</List.Item>
            </List>
          </Paper>

          <Paper p="md" radius="md" className={styles.successCard}>
            <Text fw={600} c="green.7" mb="sm">✅ Best Practices</Text>
            <List size="sm" spacing="xs">
              <List.Item>Report min/max accuracy across ALL subgroups</List.Item>
              <List.Item>Set separate performance thresholds for tails</List.Item>
              <List.Item>Use stratified sampling to preserve rare cases</List.Item>
              <List.Item>Actively collect more data for underperforming groups</List.Item>
              <List.Item>Build separate models for tail populations if needed</List.Item>
            </List>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* Detection Strategies */}
      <Title order={2} mb="md">Bias Detection Strategies</Title>
      
      <Paper p="lg" radius="md" withBorder mb="xl">
        <Box mb="lg">
          <Group mb="sm">
            <Box className={styles.stepNumber}>1</Box>
            <Text fw={700}>Disaggregated Performance Analysis</Text>
          </Group>
          <Text size="sm" mb="sm">
            Never rely on aggregate metrics alone. Break down model performance by demographic groups.
          </Text>
          <Paper p="md" className={styles.codeBlock}>
            <Code block>
{`# Example: Disaggregated evaluation
from sklearn.metrics import classification_report

for group in ['male', 'female', 'non-binary']:
    mask = df['gender'] == group
    y_true_group = y_true[mask]
    y_pred_group = y_pred[mask]
    
    print(f"\\n=== Performance for {group} ===")
    print(classification_report(y_true_group, y_pred_group))
    
# Also check: accuracy, precision, recall, F1 by group
# Flag if any group has >10% worse performance`}
            </Code>
          </Paper>
        </Box>

        <Box mb="lg">
          <Group mb="sm">
            <Box className={styles.stepNumber}>2</Box>
            <Text fw={700}>Fairness Metrics Calculation</Text>
          </Group>
          <Text size="sm" mb="sm">
            Use established fairness metrics to quantify disparities.
          </Text>
          
          <Table striped withTableBorder mb="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Metric</Table.Th>
                <Table.Th>Definition</Table.Th>
                <Table.Th>Threshold</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td><Text fw={600}>Demographic Parity</Text></Table.Td>
                <Table.Td>Equal positive prediction rates across groups</Table.Td>
                <Table.Td>Ratio between 0.8 - 1.2</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Text fw={600}>Equalized Odds</Text></Table.Td>
                <Table.Td>Equal TPR and FPR across groups</Table.Td>
                <Table.Td>Difference &lt; 0.1</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td><Text fw={600}>Calibration</Text></Table.Td>
                <Table.Td>Predicted probabilities match actual outcomes per group</Table.Td>
                <Table.Td>Similar calibration curves</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Box>

        <Box>
          <Group mb="sm">
            <Box className={styles.stepNumber}>3</Box>
            <Text fw={700}>Proxy Variable Detection</Text>
          </Group>
          <Text size="sm" mb="sm">
            Identify features that may encode protected attributes indirectly.
          </Text>
          <Paper p="md" className={styles.codeBlock}>
            <Code block>
{`# Check correlation between features and protected attributes
import pandas as pd

protected_attrs = ['gender', 'race', 'age_group']
features = ['zip_code', 'insurance_type', 'referral_source']

for attr in protected_attrs:
    print(f"\\n=== Correlations with {attr} ===")
    for feat in features:
        # For categorical: use chi-square test
        # For continuous: use point-biserial correlation
        correlation = calculate_correlation(df[feat], df[attr])
        if abs(correlation) > 0.3:
            print(f"  WARNING: {feat} highly correlated ({correlation:.2f})")`}
            </Code>
          </Paper>
        </Box>
      </Paper>

      {/* Mitigation Strategies */}
      <Title order={2} mb="md">Bias Mitigation Strategies</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="blue" variant="light" mb="sm">PRE-PROCESSING</Badge>
          <Text fw={600} mb="xs">Data-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Oversample underrepresented groups</List.Item>
            <List.Item>Collect additional data for minority groups</List.Item>
            <List.Item>Re-weight training examples</List.Item>
            <List.Item>Remove or transform proxy variables</List.Item>
          </List>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="green" variant="light" mb="sm">IN-PROCESSING</Badge>
          <Text fw={600} mb="xs">Training-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Add fairness constraints to loss function</List.Item>
            <List.Item>Adversarial debiasing</List.Item>
            <List.Item>Fair representation learning</List.Item>
            <List.Item>Multi-objective optimization</List.Item>
          </List>
        </Card>
        
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Badge color="grape" variant="light" mb="sm">POST-PROCESSING</Badge>
          <Text fw={600} mb="xs">Output-Level Interventions</Text>
          <List size="sm" spacing="xs">
            <List.Item>Adjust decision thresholds by group</List.Item>
            <List.Item>Calibrate probabilities per group</List.Item>
            <List.Item>Reject option classification</List.Item>
            <List.Item>Human review for edge cases</List.Item>
          </List>
        </Card>
      </SimpleGrid>

      {/* Pitfalls */}
      <Title order={2} mb="md">Common Pitfalls to Avoid</Title>
      
      <Alert 
        icon={<IconAlertTriangle size={20} />} 
        title="Fairness-Accuracy Trade-off Misconception" 
        color="red"
        mb="md"
      >
        Many assume improving fairness always hurts accuracy. Research shows that with proper techniques, 
        {"you can often maintain or even improve accuracy while reducing bias. Don't use this as an excuse "}
        to skip bias mitigation.
      </Alert>

      <Paper p="lg" radius="md" className={styles.pitfallCard} mb="xl">
        <Title order={4} mb="md" c="red.8">🚫 Pitfalls That Will Get You in Trouble</Title>
        
        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">1</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Testing only on aggregate data</Text>
            <Text size="sm" c="dimmed">
              A model with 95% overall accuracy might have 70% accuracy for minority groups. 
              Always disaggregate your evaluation.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">2</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>{"Assuming \"blindness\" prevents bias"}</Text>
            <Text size="sm" c="dimmed">
              {"Removing protected attributes doesn't prevent discrimination. Proxy variables (zip code, name patterns, insurance type) can encode the same information."}
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">3</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>One-time bias check</Text>
            <Text size="sm" c="dimmed">
              Bias can emerge over time as data distributions shift. Implement continuous 
              monitoring, not just pre-deployment testing.
            </Text>
          </Box>
        </Box>

        <Box className={styles.checklistItem}>
          <ThemeIcon color="red" size={24} radius="xl">
            <Text fw={700} size="xs">4</Text>
          </ThemeIcon>
          <Box>
            <Text fw={600}>Ignoring intersectionality</Text>
            <Text size="sm" c="dimmed">
              A model might be fair for women overall and fair for Black patients overall, 
              but severely biased against Black women specifically. Check intersecting groups.
            </Text>
          </Box>
        </Box>
      </Paper>

      {/* Practical Checklist */}
      <Paper p="lg" radius="md" className={styles.successCard}>
        <Title order={4} mb="md" c="green.8">✅ Your Bias Detection Checklist</Title>
        
        <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
          <List.Item>Document demographic composition of training data</List.Item>
          <List.Item>Calculate performance metrics disaggregated by protected groups</List.Item>
          <List.Item>Test for proxy variables that correlate with protected attributes</List.Item>
          <List.Item>Compute at least 2 fairness metrics (demographic parity + equalized odds)</List.Item>
          <List.Item>Analyze intersectional groups (e.g., age + gender + race combinations)</List.Item>
          <List.Item>Compare model recommendations to historical outcomes for bias patterns</List.Item>
          <List.Item>Set up monitoring dashboards for ongoing bias detection</List.Item>
          <List.Item>Include diverse stakeholders in review of model outputs</List.Item>
        </List>
      </Paper>

      {/* Tools */}
      <Title order={2} mt="xl" mb="md">Recommended Tools</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group mb="sm">
            <Badge color="blue">Python</Badge>
            <Text fw={600}>IBM AI Fairness 360</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            Comprehensive toolkit with 70+ fairness metrics and 10+ bias mitigation algorithms.
          </Text>
          <Anchor href="https://aif360.mybluemix.net/" target="_blank" size="sm">
            Documentation <IconExternalLink size={12} />
          </Anchor>
        </Card>

        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group mb="sm">
            <Badge color="green">Python</Badge>
            <Text fw={600}>Fairlearn (Microsoft)</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            User-friendly library for assessing and improving fairness of ML models.
          </Text>
          <Anchor href="https://fairlearn.org/" target="_blank" size="sm">
            Documentation <IconExternalLink size={12} />
          </Anchor>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
