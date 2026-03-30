import React from 'react';
import {
  Title,
  Text,
  Paper,
  List,
  Group,
  Box,
  Divider,
  SimpleGrid,
  Alert,
  Code,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBulb,
  IconChartDots,
} from '@tabler/icons-react';
import styles from '../EthicalAI.module.css';

export default function TailsProblemContent() {
  return (
    <Box>
      {/* Tails of Distribution - Critical Section */}
      <Title order={2} mb="md">
        <Group gap="xs">
          <IconChartDots size={28} />
          {"The Tails Problem: Where Bias Hides"}
        </Group>
      </Title>

      {/* Analogy Section */}
      <Paper p="xl" radius="md" withBorder mb="xl" bg="blue.0">
        <Group mb="md" align="flex-start">
          <IconBulb size={32} color="#1971c2" />
          <Box style={{ flex: 1 }}>
            <Text fw={700} size="lg" mb="xs" c="blue.9">Understanding Tails: The Restaurant Review Analogy</Text>
            <Text size="md" mb="md">
              Imagine you're building an AI that predicts restaurant ratings based on reviews. You have 100,000 reviews:
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="md">
              <Box>
                <Text fw={600} mb="xs" c="blue.8">The Center (Most Data):</Text>
                <List size="sm" spacing="xs">
                  <List.Item>85,000 reviews for chain restaurants (McDonald's, Starbucks, Chipotle)</List.Item>
                  <List.Item>Predictable patterns, consistent experience</List.Item>
                  <List.Item>Your AI performs great: <strong>95% accuracy!</strong></List.Item>
                </List>
              </Box>
              <Box>
                <Text fw={600} mb="xs" c="orange.8">The Tails (Rare Cases):</Text>
                <List size="sm" spacing="xs">
                  <List.Item>50 reviews for Ethiopian restaurants</List.Item>
                  <List.Item>30 reviews for kosher delis</List.Item>
                  <List.Item>20 reviews for vegan soul food places</List.Item>
                  <List.Item>Your AI performs terribly: <strong>55% accuracy</strong> 😱</List.Item>
                </List>
              </Box>
            </SimpleGrid>
            <Alert color="yellow" variant="light" mt="md">
              <Text size="sm" fw={600} mb="xs">The Dangerous Part:</Text>
              <Text size="sm">
                Your overall accuracy is still 94.5%! But for people who love Ethiopian food or need kosher options, 
                your AI is useless—or worse, actively misleading. <strong>In healthcare, those "tail" patients could die from wrong predictions.</strong>
              </Text>
            </Alert>
          </Box>
        </Group>
      </Paper>

      {/* Visual Graphic */}
      <Paper p="lg" radius="md" withBorder mb="xl" bg="gray.0">
        <Text fw={700} size="lg" mb="md" ta="center">📈 The Distribution Problem Visualized</Text>
        <Paper p="md" bg="dark.9" radius="md" mb="md">
          <Code block style={{ color: '#4ade80', fontSize: '12px', lineHeight: '1.4' }}>
{`
                           NORMAL DISTRIBUTION CURVE
                          (Your Training Data)

                                    ╱‾‾‾‾‾╲
                                   ╱       ╲
                                  ╱         ╲
                                 ╱           ╲
                               ╱               ╲
        ← LEFT TAIL          ╱                   ╲         RIGHT TAIL →
        (Underrepresented)  ╱    CENTER (Most)     ╲    (Underrepresented)
                           ╱      Common Cases       ╲
                          ╱      85-95% of data       ╲
        ●●●●           ╱╱         ○○○○○○○○○            ╲╲            ●●●●
        ●●●●●        ╱╱            ○○○○○○○○○             ╲╲         ●●●●●
        ●●●●●●     ╱╱              ○○○○○○○○○              ╲╲      ●●●●●●
        ───────────┴─────────────────────────────────────────┴───────────
       Rare         │                                       │        Rare
       diseases     │         Typical patients              │     conditions
       Minorities   │         Common symptoms               │     Edge cases
       Edge cases   │         Well-represented              │     Outliers
                    │                                       │
       📊 2-5%     │          📊 90-95%                    │    📊 2-5%
       FAIL RATE:  │          FAIL RATE:                   │    FAIL RATE:
       30-50% ⚠️   │          2-5% ✓                       │    30-50% ⚠️


                      ⚡ THE CRITICAL INSIGHT ⚡
        Your AI learns patterns from the CENTER but fails at the TAILS
                 Yet the tails represent REAL PATIENTS!
`}
          </Code>
        </Paper>
        <Alert icon={<IconAlertTriangle />} color="red" mt="md">
          <Text size="sm" fw={600} mb="xs">Why This Matters in Healthcare AI:</Text>
          <Text size="sm">
            A model with 95% overall accuracy might have 98% accuracy for white males age 40-60 (the center) 
            but only 60% accuracy for elderly Asian women with rare conditions (the tail). <strong>Publishing "95% accurate" 
            hides catastrophic failure for vulnerable populations.</strong>
          </Text>
        </Alert>
      </Paper>

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
        <Alert icon={<IconBulb />} color="yellow" variant="light" mb="md">
          <Text size="sm" fw={600} mb="xs">
            ⚡ Critical Code: Run ALL 4 methods to detect hidden bias in tail distributions
          </Text>
          <Text size="sm">
            Copy and adapt this code to your healthcare AI project. Each highlighted method catches different types of tail problems.
          </Text>
        </Alert>
        <Paper p="md" style={{ background: '#1e1e1e', borderRadius: '8px', border: '2px solid #ffd700' }}>
          <pre style={{ 
            margin: 0, 
            fontFamily: 'monospace', 
            fontSize: '13px', 
            lineHeight: '1.6',
            color: '#d4d4d4',
            overflow: 'auto'
          }}>
{`# Tail analysis for bias detection
import numpy as np
from scipy import stats

def evaluate_tails(df, predictions, actuals, confidence_scores):
    """
    Evaluate model performance on tail cases.
    NEVER skip this step, even with millions of samples!
    """
    
    `}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ METHOD 1: Low-frequency subgroups</span>{`
    group_counts = df.groupby(['age_group', 'ethnicity', 'diagnosis']).size()
    rare_groups = group_counts[group_counts < 100].index  # <100 samples
    
    for group in rare_groups:
        mask = (df['age_group'] == group[0]) & \\
               (df['ethnicity'] == group[1]) & \\
               (df['diagnosis'] == group[2])
        `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>tail_accuracy = accuracy_score(actuals[mask], predictions[mask])</span>{`
        print(f"TAIL: {sum(mask)} samples, {tail_accuracy:.1%} accuracy")
    
    `}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ METHOD 2: Confidence-based tails</span>{`
    low_confidence_mask = confidence_scores < np.percentile(confidence_scores, 10)
    `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>tail_accuracy = accuracy_score(actuals[low_confidence_mask], predictions[low_confidence_mask])</span>{`
    print(f"LOW CONFIDENCE TAIL (bottom 10%): {tail_accuracy:.1%} accuracy")
    
    `}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ METHOD 3: Feature-space outliers</span>{`
    from sklearn.ensemble import IsolationForest
    outlier_detector = IsolationForest(contamination=0.05)
    outliers = outlier_detector.fit_predict(feature_matrix) == -1
    `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>tail_accuracy = accuracy_score(actuals[outliers], predictions[outliers])</span>{`
    print(f"FEATURE-SPACE OUTLIERS: {tail_accuracy:.1%} accuracy")
    
    `}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ METHOD 4: Error concentration analysis</span>{`
    errors = predictions != actuals
    for col in ['ethnicity', 'age_group', 'insurance_type']:
        `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>error_rates = df.groupby(col).apply(lambda x: errors[x.index].mean())</span>{`
        if error_rates.max() / error_rates.min() > 2:
            print(f"WARNING: Error rate varies >2x across {col}!")
            print(error_rates.sort_values(ascending=False))`}
          </pre>
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
    </Box>
  );
}
