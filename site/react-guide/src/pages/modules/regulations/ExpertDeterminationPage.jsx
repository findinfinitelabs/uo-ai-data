import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Group,
  Box,
  List,
  ThemeIcon,
  Card,
  SimpleGrid,
  Alert,
  Timeline,
  Accordion,
  Table,
  Divider,
  Button,
  Radio,
  Progress,
} from '@mantine/core';
import {
  IconScale,
  IconAlertCircle,
  IconChartBar,
  IconDatabase,
  IconUser,
  IconMath,
  IconDoorEnter,
  IconStethoscope,
  IconFlask,
  IconClock,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

// Quiz Questions
const QUIZ_QUESTIONS = [
  {
    id: 'k-anon-1',
    technique: 'K-Anonymity',
    question: 'Looking at the K-Anonymity example, which records share the same quasi-identifiers (Age, ZIP, Gender) after generalization?',
    options: [
      'Records 1 and 2',
      'Records 1 and 3',
      'Records 2 and 3',
      'All three records'
    ],
    correctAnswer: 1,
    explanation: 'After generalization, Records 1 and 3 both have Age=30-39, ZIP=974**, and Gender=Female, making them indistinguishable.'
  },
  {
    id: 'k-anon-2',
    technique: 'K-Anonymity',
    question: 'In the K-Anonymity example, what k-value was achieved for the group containing Records 1 and 3?',
    options: [
      'k = 1',
      'k = 2',
      'k = 5',
      'k = 10'
    ],
    correctAnswer: 1,
    explanation: 'Records 1 and 3 form a group of 2 indistinguishable records, achieving k=2. However, this is still below the recommended k≥5 for healthcare data.'
  },
  {
    id: 'k-anon-3',
    technique: 'K-Anonymity',
    question: 'Why is k=2 considered insufficient for healthcare data?',
    options: [
      'It\'s too computationally expensive',
      'Only 2 records are too small a group to prevent re-identification',
      'HIPAA requires k≥100',
      'It removes too much useful data'
    ],
    correctAnswer: 1,
    explanation: 'With only 2 indistinguishable records, there\'s a 50% chance of correctly guessing which person a record belongs to. k≥5 or k≥10 provides better protection.'
  },
  {
    id: 'l-div-1',
    technique: 'L-Diversity',
    question: 'In the L-Diversity "Before" table, all 5 records achieve k-anonymity (k=5). Why is this still a privacy problem?',
    options: [
      'The ZIP codes are too specific',
      'All records have the same diagnosis (Diabetes)',
      'The age ranges are too narrow',
      'There aren\'t enough records'
    ],
    correctAnswer: 1,
    explanation: 'Even with k=5, an attacker who knows someone is in this group can infer with 100% certainty that they have Diabetes, since all records share the same diagnosis.'
  },
  {
    id: 'l-div-2',
    technique: 'L-Diversity',
    question: 'How many different diagnoses appear in the L-Diversity "After" table?',
    options: [
      '1 diagnosis',
      '2 diagnoses',
      '3 diagnoses',
      '5 diagnoses'
    ],
    correctAnswer: 2,
    explanation: 'The "After" table shows 3 different diagnoses: Diabetes, Hypertension, and Asthma, satisfying the l≥3 requirement for l-diversity.'
  },
  {
    id: 't-close-1',
    technique: 'T-Closeness',
    question: 'In the T-Closeness example, what is the Diabetes rate in the "bad" group compared to the population?',
    options: [
      '10% vs. 10% (same)',
      '12% vs. 10% (slightly higher)',
      '60% vs. 10% (much higher)',
      '2% vs. 10% (lower)'
    ],
    correctAnswer: 2,
    explanation: 'The "bad" group has 60% Diabetes while the population has only 10%, a difference of 50% (distance = 0.5), which violates t≤0.2.'
  },
  {
    id: 't-close-2',
    technique: 'T-Closeness',
    question: 'Why is the "bad" group a privacy risk even if it has k-anonymity and l-diversity?',
    options: [
      'The group is too small',
      'It reveals that this group has unusually high diabetes rates',
      'It doesn\'t have enough different diagnoses',
      'The ZIP codes are not generalized enough'
    ],
    correctAnswer: 1,
    explanation: 'The extremely high diabetes rate (60% vs. 10% population) reveals sensitive information about this group\'s health status, even if individuals can\'t be identified.'
  },
  {
    id: 't-close-3',
    technique: 'T-Closeness',
    question: 'The "good" group has 12% Diabetes vs. 10% population. Does this satisfy t≤0.2?',
    options: [
      'No, distance is 0.12',
      'No, distance is 0.22',
      'Yes, distance is 0.02',
      'Yes, distance is 0.2'
    ],
    correctAnswer: 2,
    explanation: 'The distance is |12% - 10%| = 2% = 0.02, which is well below the threshold of 0.2 (20%), satisfying t-closeness.'
  },
  {
    id: 'cell-sup-1',
    technique: 'Cell Suppression',
    question: 'Why is a count of 2 patients with a rare disease considered risky to publish?',
    options: [
      'It\'s statistically insignificant',
      'Small counts make it easier to identify individuals',
      'It violates k-anonymity',
      'HIPAA prohibits publishing any disease counts'
    ],
    correctAnswer: 1,
    explanation: 'With only 2 patients, anyone who knows about one case can easily identify the second person, or community members might recognize both individuals.'
  },
  {
    id: 'cell-sup-2',
    technique: 'Cell Suppression',
    question: 'What is the standard threshold for cell suppression in healthcare data?',
    options: [
      'Suppress cells with < 2 individuals',
      'Suppress cells with < 5 individuals',
      'Suppress cells with < 10 individuals',
      'Suppress cells with < 100 individuals'
    ],
    correctAnswer: 1,
    explanation: 'The standard rule is to suppress cells containing fewer than 5 individuals to prevent re-identification.'
  },
];

const ExpertDeterminationPage = () => {
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Save progress to localStorage when quiz is completed
  useEffect(() => {
    if (quizSubmitted) {
      const progressData = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progressData['expert-determination-quiz'] = {
        score: quizScore,
        totalQuestions: QUIZ_QUESTIONS.length,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem('learningProgress', JSON.stringify(progressData));
    }
  }, [quizSubmitted, quizScore]);

  const handleQuizSubmit = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('quiz-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };


  // Patient journey with statistical de-identification approach
  const statisticalStages = [
    {
      id: 'arrival',
      title: 'Patient Arrival & Triage',
      icon: IconDoorEnter,
      color: 'blue',
      description: 'Initial patient contact and assessment',
      dataPoints: [
        'Arrival timestamp (generalized to hour)',
        'Age (converted to 10-year bands: 20-29, 30-39, etc.)',
        'Gender (kept if common)',
        'ZIP code (aggregated to 3-digit)',
        'Chief complaint (grouped into categories)'
      ],
      riskAnalysis: {
        k: 50,
        uniqueCombinations: 2,
        reidentificationRisk: 'Very Low (1 in 50)',
        mitigation: 'Time rounded, age banded, ZIP-3 used'
      }
    },
    {
      id: 'vitals',
      title: 'Vitals & Clinical Data',
      icon: IconStethoscope,
      color: 'teal',
      description: 'Physiological measurements and clinical observations',
      dataPoints: [
        'Blood pressure (exact values)',
        'Heart rate (exact values)',
        'Temperature (exact values)',
        'Weight (rounded to nearest 5 lbs)',
        'Height (rounded to nearest inch)',
        'Visit type (generalized categories)'
      ],
      riskAnalysis: {
        k: 100,
        uniqueCombinations: 1,
        reidentificationRisk: 'Minimal (1 in 100)',
        mitigation: 'Clinical values kept precise; demographic quasi-identifiers aggregated'
      }
    },
    {
      id: 'diagnosis',
      title: 'Diagnosis & Lab Results',
      icon: IconFlask,
      color: 'indigo',
      description: 'Test results and diagnostic codes',
      dataPoints: [
        'ICD-10 diagnosis codes (exact)',
        'Lab test results (exact values with units)',
        'Date of service (month and year only)',
        'Provider specialty (kept)',
        'Facility type (kept)',
        'Rare condition flag (suppressed if <5 cases)'
      ],
      riskAnalysis: {
        k: 30,
        uniqueCombinations: 3,
        reidentificationRisk: 'Low (1 in 30)',
        mitigation: 'Suppression of rare diagnoses; temporal aggregation'
      }
    },
    {
      id: 'treatment',
      title: 'Treatment & Outcomes',
      icon: IconMath,
      color: 'violet',
      description: 'Interventions and patient outcomes',
      dataPoints: [
        'Procedure codes (exact CPT codes)',
        'Medication names and dosages (kept)',
        'Length of stay (days, exact)',
        'Discharge disposition (categories)',
        'Readmission within 30 days (binary)',
        'Mortality (binary)'
      ],
      riskAnalysis: {
        k: 75,
        uniqueCombinations: 1,
        reidentificationRisk: 'Very Low (1 in 75)',
        mitigation: 'Outcome measures preserved; quasi-identifiers suppressed'
      }
    }
  ];

  const expertTechniques = [
    {
      technique: 'K-Anonymity',
      description: 'Ensure each record is indistinguishable from at least k-1 others',
      example: 'If Age=35, ZIP=97401, Gender=Female appears only once, generalize to Age=30-39, ZIP=974**, Gender=Female',
      kValue: 'Typically k ≥ 5 for low risk; k ≥ 10 for high assurance',
      detailedExample: {
        before: [
          { name: 'Record 1', age: 35, zip: '97401', gender: 'Female', diagnosis: 'Diabetes' },
          { name: 'Record 2', age: 42, zip: '97401', gender: 'Male', diagnosis: 'Hypertension' },
          { name: 'Record 3', age: 38, zip: '97403', gender: 'Female', diagnosis: 'Asthma' }
        ],
        after: [
          { name: 'Record 1', age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' },
          { name: 'Record 2', age: '40-49', zip: '974**', gender: 'Male', diagnosis: 'Hypertension' },
          { name: 'Record 3', age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Asthma' }
        ],
        explanation: 'After generalization, Records 1 and 3 are now indistinguishable based on quasi-identifiers (Age, ZIP, Gender), achieving k=2 for that group. In practice, you would need k≥5 or k≥10.'
      },
      questions: [
        'Looking at the "After" table, which records share the same quasi-identifiers (Age, ZIP, Gender)?',
        'What k-value did we achieve for the group containing Records 1 and 3?',
        'Why is k=2 considered insufficient for healthcare data? What would you recommend?',
        'If you had a dataset with 1,000 patients from the same city, what generalization strategies would you use to achieve k≥10?',
        'Can you still identify individual patients after k-anonymization? Why or why not?'
      ]
    },
    {
      technique: 'L-Diversity',
      description: 'Ensure sensitive attributes have at least L different values within each k-anonymous group',
      example: 'In a group of 10 patients with same quasi-identifiers, ensure at least 3 different diagnoses',
      kValue: 'l ≥ 3 recommended for health data',
      detailedExample: {
        before: [
          { age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '974**', gender: 'Female', diagnosis: 'Diabetes' }
        ],
        after: [
          { age: '30-39', zip: '97***', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '97***', gender: 'Female', diagnosis: 'Diabetes' },
          { age: '30-39', zip: '97***', gender: 'Female', diagnosis: 'Hypertension' },
          { age: '30-39', zip: '97***', gender: 'Female', diagnosis: 'Asthma' },
          { age: '30-39', zip: '97***', gender: 'Female', diagnosis: 'Asthma' }
        ],
        explanation: 'K-anonymity alone (k=5) is insufficient here because all records have the same diagnosis. An attacker could infer anyone in this group has Diabetes. L-diversity (l=3) requires at least 3 different diagnoses, so we generalize ZIP further to create larger groups with diverse diagnoses.'
      },
      questions: [
        'In the "Before" table, all 5 records have k-anonymity (k=5). Why is this still a privacy problem?',
        'How many different diagnoses appear in the "After" table? Does this satisfy l≥3?',
        'If an attacker knows someone is in the "Before" group, what can they infer about that person\'s diagnosis?',
        'Why did we need to further generalize the ZIP code (974** → 97***) to achieve l-diversity?',
        'Can you think of a real-world scenario where k-anonymity exists but l-diversity is violated?'
      ]
    },
    {
      technique: 'T-Closeness',
      description: 'Ensure distribution of sensitive attributes in each group is close to overall distribution',
      example: 'If 10% of population has diabetes, each k-anonymous group should have ~10% diabetes',
      kValue: 't ≤ 0.2 (20% distance from overall distribution)',
      detailedExample: {
        population: { Diabetes: '10%', Hypertension: '40%', Asthma: '30%', Other: '20%' },
        badGroup: { Diabetes: '60%', Hypertension: '20%', Asthma: '10%', Other: '10%' },
        goodGroup: { Diabetes: '12%', Hypertension: '42%', Asthma: '28%', Other: '18%' },
        explanation: 'The "bad" group has 60% Diabetes vs. 10% in the population (distance = 0.5), revealing that this group has unusually high diabetes rates. The "good" group has 12% Diabetes (distance = 0.02), staying close to the population distribution. T-closeness requires the distance to be ≤ 0.2.'
      },
      questions: [
        'Calculate: What is the difference between the "bad" group\'s Diabetes rate (60%) and the population rate (10%)?',
        'Why is the "bad" group a privacy risk even if it has k-anonymity and l-diversity?',
        'What sensitive information could an attacker infer about people in the "bad" group?',
        'The "good" group has 12% Diabetes vs. 10% population. Does this satisfy t≤0.2? (Hint: distance = |12%-10%| = 2% = 0.02)',
        'If you were creating a research dataset, why might you prefer t-closeness over just l-diversity?'
      ]
    },
    {
      technique: 'Cell Suppression',
      description: 'Remove or generalize cells with very small counts',
      example: 'If only 2 patients have a rare disease, suppress that diagnosis or group with similar conditions',
      kValue: 'Suppress cells < 5 individuals',
      detailedExample: {
        before: [
          { condition: 'Common Cold', count: 1234 },
          { condition: 'Hypertension', count: 892 },
          { condition: 'Diabetes', count: 456 },
          { condition: 'Rare Genetic Disorder X', count: 2 },
          { condition: 'Asthma', count: 567 }
        ],
        after: [
          { condition: 'Common Cold', count: 1234 },
          { condition: 'Hypertension', count: 892 },
          { condition: 'Diabetes', count: 456 },
          { condition: 'Rare Conditions (grouped)', count: '<5' },
          { condition: 'Asthma', count: 567 }
        ],
        explanation: 'Only 2 patients have "Rare Genetic Disorder X". Publishing this could lead to re-identification. We suppress the exact count and group it with other rare conditions, or report it as "<5" to protect privacy while maintaining data utility.'
      },
      questions: [
        'Why is a count of 2 patients considered risky to publish?',
        'What are two strategies shown in the "After" table for handling rare conditions?',
        'If you worked at a small rural hospital with only 3 HIV patients, how would you report this in a public dataset?',
        'What is the standard threshold for cell suppression in healthcare data?',
        'How does cell suppression balance privacy protection with data utility for researchers?'
      ]
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="indigo">
            <IconScale size={30} />
          </ThemeIcon>
          <Box>
            <Title order={1}>Expert Determination Method</Title>
            <Text c="dimmed">Statistical de-identification and risk analysis</Text>
          </Box>
        </Group>
      </Box>

      <Alert icon={<IconAlertCircle />} color="indigo" mb="xl">
        <Text fw={600} mb="xs">What is Expert Determination?</Text>
        <Text size="sm" mb="xs">
          Expert Determination is the second HIPAA-approved de-identification method. Unlike Safe Harbor (which requires removing 18 specific identifiers), 
          Expert Determination allows you to keep more data by using statistical methods to ensure the risk of re-identification is "very small."
        </Text>
        <Text size="sm">
          A qualified expert must apply statistical principles to determine that the risk of re-identification is very small, 
          documenting the methods and results. This approach is ideal for AI/ML projects that need more detailed data.
        </Text>
      </Alert>

      {/* Comparison with Safe Harbor */}
      <Paper p="lg" mb="xl" withBorder>
        <Title order={2} mb="md">Safe Harbor vs. Expert Determination</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon color="blue" size="lg" radius="md">
                <IconUser size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">Safe Harbor</Text>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Remove or generalize 18 specific identifiers</List.Item>
              <List.Item>No statistical expertise required</List.Item>
              <List.Item>Bright-line rule - clear compliance</List.Item>
              <List.Item>May lose valuable data (e.g., exact dates, precise locations)</List.Item>
              <List.Item>Easier to implement and audit</List.Item>
              <List.Item>Best for: Simple datasets, limited resources</List.Item>
            </List>
          </Card>

          <Card padding="lg" radius="md" withBorder bg="indigo.0">
            <Group mb="md">
              <ThemeIcon color="indigo" size="lg" radius="md">
                <IconScale size={20} />
              </ThemeIcon>
              <Text fw={600} size="lg">Expert Determination</Text>
            </Group>
            <List size="sm" spacing="xs">
              <List.Item>Requires qualified statistical expert</List.Item>
              <List.Item>Risk-based approach using statistical methods</List.Item>
              <List.Item>Can retain more detailed data</List.Item>
              <List.Item>Must document methodology and risk analysis</List.Item>
              <List.Item>More complex but preserves data utility</List.Item>
              <List.Item>Best for: AI/ML projects, research requiring granular data</List.Item>
            </List>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Statistical Techniques */}
      <Paper p="lg" mb="xl" withBorder>
        <Title order={2} mb="md">Common Statistical Techniques</Title>
        <Text c="dimmed" mb="lg">
          Experts use various statistical methods to assess and minimize re-identification risk:
        </Text>

        <Accordion variant="contained">
          {expertTechniques.map((tech, idx) => (
            <Accordion.Item key={idx} value={tech.technique}>
              <Accordion.Control>
                <Group>
                  <ThemeIcon color="indigo" variant="light">
                    <IconMath size={18} />
                  </ThemeIcon>
                  <Text fw={600}>{tech.technique}</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" mb="md">{tech.description}</Text>
                <Paper p="md" bg="gray.0" radius="md" mb="md">
                  <Text size="xs" fw={600} c="dimmed" mb="xs">Quick Example:</Text>
                  <Text size="sm">{tech.example}</Text>
                </Paper>
                
                {/* Detailed Example */}
                {tech.detailedExample && (
                  <Box mb="md">
                    <Text fw={600} size="sm" mb="md">Detailed Example:</Text>
                    
                    {/* K-Anonymity, L-Diversity, Cell Suppression */}
                    {(tech.technique === 'K-Anonymity' || tech.technique === 'L-Diversity' || tech.technique === 'Cell Suppression') && (
                      <>
                        <Text size="sm" fw={600} mb="xs">Before:</Text>
                        <Table mb="md" striped withTableBorder>
                          <Table.Thead>
                            <Table.Tr>
                              {tech.technique === 'Cell Suppression' ? (
                                <>
                                  <Table.Th>Condition</Table.Th>
                                  <Table.Th>Count</Table.Th>
                                </>
                              ) : (
                                <>
                                  <Table.Th>Record</Table.Th>
                                  <Table.Th>Age</Table.Th>
                                  <Table.Th>ZIP</Table.Th>
                                  <Table.Th>Gender</Table.Th>
                                  <Table.Th>Diagnosis</Table.Th>
                                </>
                              )}
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {tech.detailedExample.before.map((row, i) => (
                              <Table.Tr key={i}>
                                {tech.technique === 'Cell Suppression' ? (
                                  <>
                                    <Table.Td>{row.condition}</Table.Td>
                                    <Table.Td>{row.count}</Table.Td>
                                  </>
                                ) : (
                                  <>
                                    <Table.Td>{row.name}</Table.Td>
                                    <Table.Td>{row.age}</Table.Td>
                                    <Table.Td>{row.zip}</Table.Td>
                                    <Table.Td>{row.gender}</Table.Td>
                                    <Table.Td>{row.diagnosis}</Table.Td>
                                  </>
                                )}
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                        
                        <Text size="sm" fw={600} mb="xs">After Applying {tech.technique}:</Text>
                        <Table mb="md" striped withTableBorder>
                          <Table.Thead>
                            <Table.Tr>
                              {tech.technique === 'Cell Suppression' ? (
                                <>
                                  <Table.Th>Condition</Table.Th>
                                  <Table.Th>Count</Table.Th>
                                </>
                              ) : (
                                <>
                                  <Table.Th>Record</Table.Th>
                                  <Table.Th>Age</Table.Th>
                                  <Table.Th>ZIP</Table.Th>
                                  <Table.Th>Gender</Table.Th>
                                  <Table.Th>Diagnosis</Table.Th>
                                </>
                              )}
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {tech.detailedExample.after.map((row, i) => (
                              <Table.Tr key={i}>
                                {tech.technique === 'Cell Suppression' ? (
                                  <>
                                    <Table.Td>{row.condition}</Table.Td>
                                    <Table.Td>{row.count}</Table.Td>
                                  </>
                                ) : (
                                  <>
                                    <Table.Td>{row.name}</Table.Td>
                                    <Table.Td>{row.age}</Table.Td>
                                    <Table.Td>{row.zip}</Table.Td>
                                    <Table.Td>{row.gender}</Table.Td>
                                    <Table.Td>{row.diagnosis}</Table.Td>
                                  </>
                                )}
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </>
                    )}
                    
                    {/* T-Closeness */}
                    {tech.technique === 'T-Closeness' && (
                      <>
                        <SimpleGrid cols={3} spacing="md" mb="md">
                          <Paper p="md" withBorder>
                            <Text size="xs" fw={600} c="dimmed" mb="xs">Overall Population</Text>
                            <List size="sm" spacing={4}>
                              <List.Item>Diabetes: {tech.detailedExample.population.Diabetes}</List.Item>
                              <List.Item>Hypertension: {tech.detailedExample.population.Hypertension}</List.Item>
                              <List.Item>Asthma: {tech.detailedExample.population.Asthma}</List.Item>
                              <List.Item>Other: {tech.detailedExample.population.Other}</List.Item>
                            </List>
                          </Paper>
                          
                          <Paper p="md" withBorder bg="red.0">
                            <Text size="xs" fw={600} c="red" mb="xs">❌ Bad Group (Violates T-Closeness)</Text>
                            <List size="sm" spacing={4}>
                              <List.Item>Diabetes: {tech.detailedExample.badGroup.Diabetes}</List.Item>
                              <List.Item>Hypertension: {tech.detailedExample.badGroup.Hypertension}</List.Item>
                              <List.Item>Asthma: {tech.detailedExample.badGroup.Asthma}</List.Item>
                              <List.Item>Other: {tech.detailedExample.badGroup.Other}</List.Item>
                            </List>
                          </Paper>
                          
                          <Paper p="md" withBorder bg="teal.0">
                            <Text size="xs" fw={600} c="teal" mb="xs">✓ Good Group (Satisfies T-Closeness)</Text>
                            <List size="sm" spacing={4}>
                              <List.Item>Diabetes: {tech.detailedExample.goodGroup.Diabetes}</List.Item>
                              <List.Item>Hypertension: {tech.detailedExample.goodGroup.Hypertension}</List.Item>
                              <List.Item>Asthma: {tech.detailedExample.goodGroup.Asthma}</List.Item>
                              <List.Item>Other: {tech.detailedExample.goodGroup.Other}</List.Item>
                            </List>
                          </Paper>
                        </SimpleGrid>
                      </>
                    )}
                    
                    <Alert color="indigo" variant="light">
                      <Text size="sm">{tech.detailedExample.explanation}</Text>
                    </Alert>
                  </Box>
                )}
                
                <Badge color="indigo" variant="light">{tech.kValue}</Badge>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Paper>

      {/* Patient Journey with Statistical Approach */}
      <Title order={2} mb="md">Patient Journey: Statistical De-identification</Title>
      <Text c="dimmed" mb="xl">
        See how Expert Determination preserves more detailed clinical data while maintaining low re-identification risk through statistical methods.
      </Text>

      <Timeline active={statisticalStages.length} bulletSize={40} lineWidth={3}>
        {statisticalStages.map((stage) => {
          const StageIcon = stage.icon;

          return (
            <Timeline.Item
              key={stage.id}
              bullet={
                <ThemeIcon size={40} variant="filled" radius="xl" color={stage.color}>
                  <StageIcon size={20} />
                </ThemeIcon>
              }
              title={
                <Group gap="xs">
                  <Text fw={600} size="lg">{stage.title}</Text>
                  <Badge color={stage.color} variant="light">
                    K={stage.riskAnalysis.k}
                  </Badge>
                </Group>
              }
            >
              <Paper p="md" mb="xl" withBorder>
                <Text size="sm" mb="md">{stage.description}</Text>

                <Box mb="md">
                  <Text fw={600} size="sm" mb="xs">Data Retained:</Text>
                  <List size="sm" spacing="xs">
                    {stage.dataPoints.map((point, idx) => (
                      <List.Item key={idx}>{point}</List.Item>
                    ))}
                  </List>
                </Box>

                <Paper p="md" bg="indigo.0" radius="md">
                  <Group mb="xs">
                    <IconChartBar size={16} />
                    <Text fw={600} size="sm">Risk Analysis:</Text>
                  </Group>
                  <SimpleGrid cols={2} spacing="xs">
                    <Box>
                      <Text size="xs" c="dimmed">K-Anonymity:</Text>
                      <Text size="sm" fw={600}>K = {stage.riskAnalysis.k}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Unique Combinations:</Text>
                      <Text size="sm" fw={600}>{stage.riskAnalysis.uniqueCombinations}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Re-ID Risk:</Text>
                      <Text size="sm" fw={600} c="teal">{stage.riskAnalysis.reidentificationRisk}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" c="dimmed">Mitigation:</Text>
                      <Text size="xs">{stage.riskAnalysis.mitigation}</Text>
                    </Box>
                  </SimpleGrid>
                </Paper>
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* When to Use Expert Determination */}
      <Paper p="xl" mt="xl" withBorder bg="indigo.0">
        <Title order={3} mb="md">When to Use Expert Determination for AI Projects</Title>
        <List spacing="md" size="sm">
          <List.Item>
            <Text fw={600}>Predictive Modeling:</Text> When your AI model needs precise timestamps, exact ages, or detailed geographic data for accurate predictions
          </List.Item>
          <List.Item>
            <Text fw={600}>Rare Disease Research:</Text> When Safe Harbor would suppress too much data about uncommon conditions
          </List.Item>
          <List.Item>
            <Text fw={600}>Temporal Analysis:</Text> When you need exact dates/times to model disease progression or treatment timelines
          </List.Item>
          <List.Item>
            <Text fw={600}>Geographic Studies:</Text> When ZIP-3 is too coarse and you need ZIP-5 or street-level data
          </List.Item>
          <List.Item>
            <Text fw={600}>Linkage Studies:</Text> When combining multiple datasets and need unique (but anonymized) patient identifiers
          </List.Item>
          <List.Item>
            <Text fw={600}>Image Analysis:</Text> When you need medical images that may contain identifying features (with appropriate masking)
          </List.Item>
        </List>

        <Alert icon={<IconAlertCircle />} color="yellow" mt="lg">
          <Text fw={600} size="sm">Important:</Text>
          <Text size="sm">
            You must engage a qualified expert (statistician, privacy researcher) to perform and document the analysis. 
            Simply applying these techniques without proper expertise and documentation does NOT satisfy HIPAA requirements.
          </Text>
        </Alert>
      </Paper>

      {/* Knowledge Check Quiz */}
      <Paper p="lg" mb="xl" withBorder bg="blue.0">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="blue">
            <IconAlertCircle size={30} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Knowledge Check: Expert Determination Methods</Title>
            <Text c="dimmed">Test your understanding of statistical de-identification techniques</Text>
          </Box>
        </Group>

        {!quizSubmitted ? (
          <>
            <Alert icon={<IconAlertCircle />} color="blue" mb="xl">
              <Text size="sm">
                Answer all {QUIZ_QUESTIONS.length} questions to test your understanding of K-Anonymity, L-Diversity, T-Closeness, and Cell Suppression. 
                Your progress will be saved automatically when you submit.
              </Text>
            </Alert>

            <Box mb="xl">
              <Group mb="md">
                <Text size="sm" fw={600}>Progress:</Text>
                <Text size="sm" c="dimmed">
                  {Object.keys(quizAnswers).length} of {QUIZ_QUESTIONS.length} answered
                </Text>
              </Group>
              <Progress 
                value={(Object.keys(quizAnswers).length / QUIZ_QUESTIONS.length) * 100} 
                size="lg" 
                radius="xl"
                color="blue"
              />
            </Box>

            {QUIZ_QUESTIONS.map((q, idx) => (
              <Paper key={q.id} p="lg" mb="lg" withBorder>
                <Group mb="sm">
                  <Badge color="indigo" variant="light">{q.technique}</Badge>
                  <Text size="sm" c="dimmed">Question {idx + 1} of {QUIZ_QUESTIONS.length}</Text>
                </Group>
                <Text fw={600} mb="md">{q.question}</Text>
                
                <Radio.Group
                  value={quizAnswers[q.id]?.toString()}
                  onChange={(value) => setQuizAnswers({ ...quizAnswers, [q.id]: parseInt(value) })}
                >
                  {q.options.map((option, optIdx) => (
                    <Radio
                      key={optIdx}
                      value={optIdx.toString()}
                      label={option}
                      mb="sm"
                    />
                  ))}
                </Radio.Group>
              </Paper>
            ))}

            <Group justify="center">
              <Button
                size="lg"
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== QUIZ_QUESTIONS.length}
              >
                Submit Quiz
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Alert 
              id="quiz-results"
              icon={quizScore >= QUIZ_QUESTIONS.length * 0.7 ? <IconCheck /> : <IconX />} 
              color={quizScore >= QUIZ_QUESTIONS.length * 0.7 ? 'teal' : 'red'}
              mb="xl"
              title={quizScore >= QUIZ_QUESTIONS.length * 0.7 ? '🎉 Great Job!' : '📚 Keep Learning'}
            >
              <Text size="lg" fw={600} mb="sm">
                You scored {quizScore} out of {QUIZ_QUESTIONS.length} ({Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%)
              </Text>
              <Text size="sm">
                {quizScore >= QUIZ_QUESTIONS.length * 0.7
                  ? 'Excellent understanding of Expert Determination methods! You\'re ready to apply these techniques.'
                  : 'Review the examples above and try again. Understanding these privacy techniques is crucial for HIPAA compliance.'}
              </Text>
            </Alert>

            <Progress 
              value={(quizScore / QUIZ_QUESTIONS.length) * 100} 
              size="xl" 
              radius="xl"
              color={quizScore >= QUIZ_QUESTIONS.length * 0.7 ? 'teal' : 'orange'}
              mb="xl"
            />

            {QUIZ_QUESTIONS.map((q, idx) => {
              const userAnswer = quizAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <Paper key={q.id} p="lg" mb="lg" withBorder bg={isCorrect ? 'teal.0' : 'red.0'}>
                  <Group mb="sm">
                    <ThemeIcon color={isCorrect ? 'teal' : 'red'} variant="light">
                      {isCorrect ? <IconCheck size={20} /> : <IconX size={20} />}
                    </ThemeIcon>
                    <Badge color="indigo" variant="light">{q.technique}</Badge>
                    <Text size="sm" c="dimmed">Question {idx + 1}</Text>
                  </Group>
                  
                  <Text fw={600} mb="md">{q.question}</Text>
                  
                  <Box mb="md">
                    {q.options.map((option, optIdx) => {
                      const isThisCorrect = optIdx === q.correctAnswer;
                      const isUserChoice = optIdx === userAnswer;
                      
                      return (
                        <Paper
                          key={optIdx}
                          p="sm"
                          mb="xs"
                          withBorder
                          bg={
                            isThisCorrect ? 'teal.1' : 
                            isUserChoice && !isCorrect ? 'red.1' : 
                            'white'
                          }
                        >
                          <Group>
                            {isThisCorrect && <IconCheck size={16} color="green" />}
                            {isUserChoice && !isCorrect && <IconX size={16} color="red" />}
                            <Text size="sm" fw={isThisCorrect ? 600 : 400}>
                              {option}
                            </Text>
                          </Group>
                        </Paper>
                      );
                    })}
                  </Box>
                  
                  <Alert icon={<IconAlertCircle />} color="blue" variant="light">
                    <Text size="sm" fw={600} mb="xs">Explanation:</Text>
                    <Text size="sm">{q.explanation}</Text>
                  </Alert>
                </Paper>
              );
            })}

            <Group justify="center">
              <Button
                size="lg"
                variant="outline"
                onClick={handleQuizReset}
              >
                Retake Quiz
              </Button>
            </Group>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ExpertDeterminationPage;
