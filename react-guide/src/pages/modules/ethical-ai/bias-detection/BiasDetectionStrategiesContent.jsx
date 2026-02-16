import React from 'react';
import {
  Title,
  Text,
  Paper,
  Group,
  Box,
  Alert,
  Table,
} from '@mantine/core';
import {
  IconBulb,
} from '@tabler/icons-react';
import styles from '../EthicalAI.module.css';

export default function BiasDetectionStrategiesContent() {
  return (
    <Box>
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
          <Alert icon={<IconBulb />} color="yellow" variant="light" mb="md">
            <Text size="sm" fw={600} mb="xs">
              ⚡ Critical: Test EACH demographic group separately
            </Text>
            <Text size="sm">
              Aggregate accuracy can hide serious disparities. Always disaggregate by gender, ethnicity, age groups.
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
{`# Example: Disaggregated evaluation
from sklearn.metrics import classification_report

`}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ LOOP THROUGH ALL DEMOGRAPHIC GROUPS</span>{`
for group in ['male', 'female', 'non-binary']:
    `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>mask = df['gender'] == group</span>{`
    y_true_group = y_true[mask]
    y_pred_group = y_pred[mask]
    
    print(f"\\n=== Performance for {group} ===")
    `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>print(classification_report(y_true_group, y_pred_group))</span>{`
    
# Also check: accuracy, precision, recall, F1 by group
# `}<span style={{ 
      background: '#661a1a', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ff6b6b',
      fontWeight: 'bold'
    }}>{'Flag if any group has >10% worse performance'}</span>
            </pre>
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
          <Alert icon={<IconBulb />} color="yellow" variant="light" mb="md">
            <Text size="sm" fw={600} mb="xs">
              ⚡ Critical: Detect features that leak protected attributes
            </Text>
            <Text size="sm">
              Zip code can encode race, insurance type can encode socioeconomic status. Check correlations &gt;0.3.
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
{`# Check correlation between features and protected attributes
import pandas as pd

protected_attrs = ['gender', 'race', 'age_group']
features = ['zip_code', 'insurance_type', 'referral_source']

`}<span style={{ 
      background: '#264f78', 
      padding: '3px 8px', 
      borderRadius: '4px', 
      color: '#4fc3f7',
      fontWeight: 'bold'
    }}>⚡ TEST ALL FEATURE-ATTRIBUTE PAIRS</span>{`
for attr in protected_attrs:
    print(f"\\n=== Correlations with {attr} ===")
    for feat in features:
        # For categorical: use chi-square test
        # For continuous: use point-biserial correlation
        `}<span style={{ 
      background: '#4a4a00', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ffd700',
      fontWeight: 'bold'
    }}>correlation = calculate_correlation(df[feat], df[attr])</span>{`
        `}<span style={{ 
      background: '#661a1a', 
      padding: '2px 6px', 
      borderRadius: '3px', 
      color: '#ff6b6b',
      fontWeight: 'bold'
    }}>{'if abs(correlation) > 0.3:'}</span>{`
            print(f"  WARNING: {feat} highly correlated ({correlation:.2f})")`}
            </pre>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
