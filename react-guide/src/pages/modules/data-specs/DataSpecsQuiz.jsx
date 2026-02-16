import React, { useState, useRef, useEffect } from 'react';
import {
  Title,
  Text,
  Paper,
  ThemeIcon,
  Group,
  Box,
  Alert,
  Button,
  Textarea,
  Badge,
  Card,
  Progress,
  Stack,
  Loader,
  Divider,
  RingProgress,
  Center,
  Transition,
  ActionIcon,
  Tooltip,
  Modal,
  Code,
  ScrollArea,
  Table,
  Mark,
} from '@mantine/core';
import {
  IconUser,
  IconHeartbeat,
  IconDeviceWatch,
  IconFileText,
  IconBrain,
  IconCheck,
  IconX,
  IconRefresh,
  IconArrowRight,
  IconTrophy,
  IconAlertCircle,
  IconSparkles,
  IconCircleDot,
  IconDatabase,
  IconWand,
  IconBuildingFactory,
  IconChartLine,
  IconTruck,
  IconShieldCheck,
  IconCreditCard,
  IconAlertTriangle,
  IconReportAnalytics,
} from '@tabler/icons-react';
import styles from './DataSpecs.module.css';

// Patient Persona
const PATIENT_PERSONA = {
  name: 'Maria Chen',
  age: 52,
  avatar: '👩🏻',
  occupation: 'Marketing Executive',
  location: 'Portland, OR',
  healthConditions: ['Active', 'Pre-diabetic', 'High Stress'],
  healthGoals: 'Monitor cardiovascular health and stress levels',
  dataSources: [
    { name: 'Oura Ring', type: 'Wearable', icon: IconCircleDot },
    { name: 'Apple Watch', type: 'Wearable', icon: IconDeviceWatch },
    { name: "Doctor's EHR", type: 'Medical Records', icon: IconFileText },
  ],
  scenario: `Maria is a 52-year-old marketing executive who recently had a health scare with elevated blood pressure. She wants to combine her Oura Ring data (sleep stages, HRV, readiness scores), Apple Watch data (heart rate, steps, activity), and her doctor's electronic health records to get personalized insights about her cardiovascular risk and daily habits that might affect her health.`,
  highlightedScenario: (
    <>
      Maria is a 52-year-old marketing executive who recently had a health scare with <Mark color="red">elevated blood pressure</Mark>. She wants to <Mark color="cyan">combine her Oura Ring data</Mark> (sleep stages, HRV, readiness scores), <Mark color="cyan">Apple Watch data</Mark> (heart rate, steps, activity), and her <Mark color="cyan">doctor&apos;s electronic health records</Mark> to get <Mark color="yellow">personalized insights</Mark> about her cardiovascular risk and daily habits that might affect her health.
    </>
  ),
};

// Sample Apple Watch HealthKit Data
const APPLE_WATCH_SAMPLE_DATA = {
  title: 'Apple Watch HealthKit Export',
  description: 'Sample data exported from Apple Health (HealthKit) showing heart rate, steps, and sleep data.',
  records: [
    { type: 'HKQuantityTypeIdentifierHeartRate', value: 72, unit: 'count/min', startDate: '2026-01-12T08:30:00-08:00', endDate: '2026-01-12T08:30:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierHeartRate', value: 68, unit: 'count/min', startDate: '2026-01-12T08:35:00-08:00', endDate: '2026-01-12T08:35:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierHeartRate', value: 85, unit: 'count/min', startDate: '2026-01-12T09:15:00-08:00', endDate: '2026-01-12T09:15:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierStepCount', value: 1247, unit: 'count', startDate: '2026-01-12T07:00:00-08:00', endDate: '2026-01-12T08:00:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierStepCount', value: 892, unit: 'count', startDate: '2026-01-12T08:00:00-08:00', endDate: '2026-01-12T09:00:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKCategoryTypeIdentifierSleepAnalysis', value: 'AsleepCore', unit: '', startDate: '2026-01-11T23:15:00-08:00', endDate: '2026-01-12T01:30:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKCategoryTypeIdentifierSleepAnalysis', value: 'AsleepDeep', unit: '', startDate: '2026-01-12T01:30:00-08:00', endDate: '2026-01-12T03:00:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKCategoryTypeIdentifierSleepAnalysis', value: 'AsleepREM', unit: '', startDate: '2026-01-12T03:00:00-08:00', endDate: '2026-01-12T04:15:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN', value: 42.5, unit: 'ms', startDate: '2026-01-12T06:00:00-08:00', endDate: '2026-01-12T06:00:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
    { type: 'HKQuantityTypeIdentifierRestingHeartRate', value: 58, unit: 'count/min', startDate: '2026-01-12T00:00:00-08:00', endDate: '2026-01-12T00:00:00-08:00', sourceName: 'Apple Watch', device: 'Apple Watch Series 9' },
  ],
  jsonSample: `{
  "ExportDate": "2026-01-12T10:00:00-08:00",
  "Me": {
    "DateOfBirth": "1974-03-15",
    "BiologicalSex": "Female",
    "BloodType": "NotSet",
    "FitzpatrickSkinType": "NotSet"
  },
  "Record": [
    {
      "type": "HKQuantityTypeIdentifierHeartRate",
      "sourceName": "Apple Watch",
      "sourceVersion": "10.2",
      "device": "Apple Watch Series 9",
      "unit": "count/min",
      "creationDate": "2026-01-12T08:30:15-08:00",
      "startDate": "2026-01-12T08:30:00-08:00",
      "endDate": "2026-01-12T08:30:00-08:00",
      "value": "72"
    },
    {
      "type": "HKQuantityTypeIdentifierStepCount",
      "sourceName": "Apple Watch",
      "unit": "count",
      "startDate": "2026-01-12T07:00:00-08:00",
      "endDate": "2026-01-12T08:00:00-08:00",
      "value": "1247"
    }
  ]
}`,
};

// Sample Oura Ring Data (Oura Cloud API v2 format)
const OURA_RING_SAMPLE_DATA = {
  title: 'Oura Ring Cloud API Data',
  description: 'Sample data from Oura Cloud API v2 showing sleep, readiness, and HRV metrics.',
  records: [
    { type: 'daily_sleep', metric: 'Sleep Score', value: 82, unit: 'score', day: '2026-01-12' },
    { type: 'daily_sleep', metric: 'Deep Sleep', value: 5400, unit: 'seconds', day: '2026-01-12' },
    { type: 'daily_sleep', metric: 'REM Sleep', value: 6300, unit: 'seconds', day: '2026-01-12' },
    { type: 'daily_sleep', metric: 'Sleep Efficiency', value: 91, unit: '%', day: '2026-01-12' },
    { type: 'daily_readiness', metric: 'Readiness Score', value: 78, unit: 'score', day: '2026-01-12' },
    { type: 'daily_readiness', metric: 'HRV Balance', value: 65, unit: 'contributor', day: '2026-01-12' },
    { type: 'daily_readiness', metric: 'Resting HR', value: 56, unit: 'bpm', day: '2026-01-12' },
    { type: 'daily_readiness', metric: 'Body Temp Deviation', value: -0.2, unit: '°C', day: '2026-01-12' },
    { type: 'daily_activity', metric: 'Activity Score', value: 85, unit: 'score', day: '2026-01-12' },
    { type: 'daily_activity', metric: 'Steps', value: 8472, unit: 'count', day: '2026-01-12' },
  ],
  jsonSample: `{
  "data": [
    {
      "id": "sleep-2026-01-12",
      "day": "2026-01-12",
      "score": 82,
      "contributors": {
        "deep_sleep": 78,
        "efficiency": 91,
        "latency": 85,
        "rem_sleep": 72,
        "restfulness": 80,
        "timing": 88,
        "total_sleep": 85
      },
      "timestamp": "2026-01-12T07:30:00+00:00"
    }
  ]
}

// Detailed Sleep Document
{
  "id": "sleep-detail-2026-01-12",
  "average_breath": 14.5,
  "average_heart_rate": 54,
  "average_hrv": 42,
  "deep_sleep_duration": 5400,
  "efficiency": 91,
  "light_sleep_duration": 14400,
  "rem_sleep_duration": 6300,
  "total_sleep_duration": 26100,
  "bedtime_start": "2026-01-11T23:15:00-08:00",
  "bedtime_end": "2026-01-12T06:45:00-08:00"
}

// Daily Readiness
{
  "id": "readiness-2026-01-12",
  "score": 78,
  "contributors": {
    "activity_balance": 72,
    "body_temperature": 85,
    "hrv_balance": 65,
    "previous_day_activity": 80,
    "previous_night": 82,
    "recovery_index": 75,
    "resting_heart_rate": 88,
    "sleep_balance": 70
  },
  "temperature_deviation": -0.2,
  "temperature_trend_deviation": 0.1
}`,
};

// Sample EHR Data (FHIR format)
const EHR_SAMPLE_DATA = {
  title: "Doctor's EHR (FHIR Format)",
  description: 'Sample Electronic Health Record data in HL7 FHIR format showing patient vitals and conditions.',
  jsonSample: `{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "patient-maria-chen",
        "name": [{
          "family": "Chen",
          "given": ["Maria"]
        }],
        "birthDate": "1974-03-15",
        "gender": "female"
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "id": "bp-reading-001",
        "status": "final",
        "category": [{
          "coding": [{
            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
            "code": "vital-signs"
          }]
        }],
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "85354-9",
            "display": "Blood pressure panel"
          }]
        },
        "subject": { "reference": "Patient/patient-maria-chen" },
        "effectiveDateTime": "2026-01-10T14:30:00-08:00",
        "component": [
          {
            "code": { "coding": [{ "code": "8480-6", "display": "Systolic BP" }] },
            "valueQuantity": { "value": 142, "unit": "mmHg" }
          },
          {
            "code": { "coding": [{ "code": "8462-4", "display": "Diastolic BP" }] },
            "valueQuantity": { "value": 92, "unit": "mmHg" }
          }
        ]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "id": "condition-hypertension",
        "clinicalStatus": { "coding": [{ "code": "active" }] },
        "code": {
          "coding": [{
            "system": "http://snomed.info/sct",
            "code": "38341003",
            "display": "Hypertensive disorder"
          }]
        },
        "subject": { "reference": "Patient/patient-maria-chen" },
        "onsetDateTime": "2025-11-15"
      }
    }
  ]
}`,
  records: [
    { field: 'Patient ID', value: 'patient-maria-chen', system: 'Internal MRN' },
    { field: 'Name', value: 'Maria Chen', system: 'Demographics' },
    { field: 'DOB', value: '1974-03-15', system: 'Demographics' },
    { field: 'Systolic BP', value: '142 mmHg', system: 'LOINC 8480-6' },
    { field: 'Diastolic BP', value: '92 mmHg', system: 'LOINC 8462-4' },
    { field: 'Condition', value: 'Hypertensive disorder', system: 'SNOMED 38341003' },
    { field: 'Condition Onset', value: '2025-11-15', system: 'Clinical' },
  ],
};

// Quiz Questions based on Module 1 content
const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'Data Specifications',
    question: `Maria wants to track her heart rate from both her Apple Watch and her doctor's EHR. What potential issue might arise if these two data sources use different formats?`,
    hint: 'Think about the "Integration Failures" problem from the module.',
    expectedConcepts: ['format mismatch', 'integration', 'data format', 'inconsistent', 'schema', 'specification'],
    maxPoints: 20,
  },
  {
    id: 2,
    category: 'HIPAA Compliance',
    question: `When building an AI system to analyze Maria's health data, what field in her EHR would be considered Protected Health Information (PHI) that needs special handling?`,
    hint: 'Recall the PHI identifiers discussed in the compliance section.',
    expectedConcepts: ['name', 'date of birth', 'address', 'medical record number', 'social security', 'phi', 'hipaa', 'de-identify'],
    maxPoints: 20,
  },
  {
    id: 3,
    category: 'Data Dictionary',
    question: `You're creating a data dictionary for Maria's heart rate field. What three essential components should you include in the specification?`,
    hint: 'Think about what makes a complete field definition.',
    expectedConcepts: ['type', 'description', 'constraint', 'validation', 'example', 'format', 'required', 'name', 'range', 'unit'],
    maxPoints: 20,
  },
  {
    id: 4,
    category: 'Data Quality',
    question: `Maria's Apple Watch sometimes records impossible heart rate values (like 0 or 500 bpm). How would a proper data specification prevent these from corrupting your AI model?`,
    hint: 'Consider quality rules and validation.',
    expectedConcepts: ['validation', 'constraint', 'range', 'quality rule', 'minimum', 'maximum', 'filter', 'reject', 'bounds'],
    maxPoints: 20,
  },
  {
    id: 5,
    category: 'AI & Specifications',
    question: `Why is defining data specifications BEFORE building an AI model critical? What could happen to Maria's health insights if you skip this step?`,
    hint: 'Remember: "Garbage in, garbage out"',
    expectedConcepts: ['garbage in', 'garbage out', 'hallucinate', 'bias', 'incorrect', 'fail', 'training data', 'quality', 'trust'],
    maxPoints: 20,
  },
];

// AI Evaluation System Prompt
const EVALUATION_SYSTEM_PROMPT = `You are an AI grading assistant for a healthcare data course at the University of Oregon.

You are evaluating student answers about data specifications, HIPAA compliance, and AI in healthcare.

The patient scenario is:
"${PATIENT_PERSONA.scenario}"

When grading, be:
1. Encouraging but accurate
2. Specific about what was correct
3. Constructive about what could be improved
4. Reference the module concepts when relevant

Respond in this JSON format only:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback>",
  "correctConcepts": ["<list of concepts they got right>"],
  "missingConcepts": ["<important concepts they missed>"],
  "suggestion": "<one specific improvement suggestion>"
}`;

const DataSpecsQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [attempts, setAttempts] = useState({}); // Track attempts per question
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [dataModal, setDataModal] = useState({ opened: false, source: null });
  const [unifiedSchema, setUnifiedSchema] = useState(null);
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const scrollRef = useRef(null);

  const PASSING_SCORE = 80; // Must score 80+ to continue

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const totalScore = Object.values(evaluations).reduce((sum, e) => {
    const questionMaxPoints = QUIZ_QUESTIONS.find(q => q.id === e.questionId)?.maxPoints || 20;
    return sum + Math.round((e.score / 100) * questionMaxPoints);
  }, 0);

  const maxPossibleScore = QUIZ_QUESTIONS.reduce((sum, q) => sum + q.maxPoints, 0);
  const answeredCount = Object.keys(evaluations).length;
  const progressPercent = (answeredCount / QUIZ_QUESTIONS.length) * 100;

  // Save progress to localStorage when quiz is completed
  useEffect(() => {
    if (showResults && answeredCount === QUIZ_QUESTIONS.length) {
      const progressData = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progressData['data-specs-quiz'] = {
        score: totalScore,
        totalQuestions: maxPossibleScore,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem('learningProgress', JSON.stringify(progressData));
    }
  }, [showResults, answeredCount, totalScore, maxPossibleScore]);

  const evaluateAnswer = async (questionId, answer) => {
    if (!apiKey || apiKey === 'sk-your-key-here') {
      setError('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env.local file.');
      return;
    }

    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    // Increment attempt counter
    setAttempts(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1,
    }));

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Question (${question.category}): ${question.question}

Expected concepts to look for: ${question.expectedConcepts.join(', ')}

Student's answer: "${answer}"

Evaluate this answer and respond with the JSON format specified.`,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Parse JSON response
      let evaluation;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        // Fallback evaluation
        evaluation = {
          score: 50,
          feedback: content,
          correctConcepts: [],
          missingConcepts: [],
          suggestion: 'Please review the module materials.',
        };
      }

      setEvaluations(prev => ({
        ...prev,
        [questionId]: { ...evaluation, questionId },
      }));
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer,
      }));

    } catch (err) {
      setError(err.message || 'Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const question = QUIZ_QUESTIONS[currentQuestion];
    evaluateAnswer(question.id, currentAnswer);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setCurrentAnswer('');
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    // Clear current evaluation to allow retry
    const currentQ = QUIZ_QUESTIONS[currentQuestion];
    setEvaluations(prev => {
      const newEvals = { ...prev };
      delete newEvals[currentQ.id];
      return newEvals;
    });
    setCurrentAnswer('');
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setEvaluations({});
    setAttempts({});
    setCurrentAnswer('');
    setShowResults(false);
    setError(null);
  };

  // Generate unified schema from all three data sources
  const generateUnifiedSchema = async () => {
    if (!apiKey || apiKey === 'sk-your-key-here') {
      setError('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env.local file.');
      return;
    }

    setIsGeneratingSchema(true);
    setError(null);

    const schemaPrompt = `You are a healthcare data architect. Create a unified data schema that combines data from these three sources for a patient health monitoring AI system.

SOURCE 1 - Oura Ring (Oura Cloud API v2):
${OURA_RING_SAMPLE_DATA.jsonSample}

SOURCE 2 - Apple Watch (HealthKit):
${APPLE_WATCH_SAMPLE_DATA.jsonSample}

SOURCE 3 - Doctor's EHR (FHIR):
${EHR_SAMPLE_DATA.jsonSample}

Create a well-formed JSON schema that follows these AI data best practices:
1. Use consistent naming conventions (camelCase)
2. Include proper data types and constraints
3. Add validation rules for data quality
4. Include provenance/source tracking for each field
5. Use standardized medical coding where appropriate (LOINC, SNOMED)
6. Include timestamps in ISO 8601 format
7. Add units of measurement for all numeric values
8. Structure arrays properly for time-series data
9. Include metadata for AI training (data quality scores, confidence levels)
10. Be HIPAA-aware (mark PHI fields)

Return ONLY valid JSON with this structure:
{
  "schemaName": "UnifiedPatientHealthSchema",
  "version": "1.0.0",
  "description": "...",
  "patient": { ... },
  "vitalSigns": [ ... ],
  "sleepData": [ ... ],
  "activityData": [ ... ],
  "conditions": [ ... ],
  "dataQuality": { ... },
  "metadata": { ... }
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { 
              role: 'system', 
              content: 'You are a healthcare data architect specializing in creating unified schemas for AI systems. Always return valid, well-formed JSON only.' 
            },
            { role: 'user', content: schemaPrompt },
          ],
          max_tokens: 3000,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const schema = JSON.parse(jsonMatch[0]);
          setUnifiedSchema(schema);
          setDataModal({ opened: true, source: 'Unified Schema' });
        } else {
          throw new Error('No valid JSON in response');
        }
      } catch (parseError) {
        setError('Failed to parse unified schema. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate unified schema');
    } finally {
      setIsGeneratingSchema(false);
    }
  };

  const currentQ = QUIZ_QUESTIONS[currentQuestion];
  const currentEval = evaluations[currentQ?.id];

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getGrade = (percent) => {
    if (percent >= 90) return { letter: 'A', color: 'green' };
    if (percent >= 80) return { letter: 'B', color: 'teal' };
    if (percent >= 70) return { letter: 'C', color: 'yellow' };
    if (percent >= 60) return { letter: 'D', color: 'orange' };
    return { letter: 'F', color: 'red' };
  };

  // Results Screen
  if (showResults) {
    const finalPercent = (totalScore / maxPossibleScore) * 100;
    const grade = getGrade(finalPercent);

    return (
      <>
        <Paper shadow="md" p="xl" radius="lg" withBorder mb="xl" className={styles.hero}>
          <Center mb="xl">
            <Stack align="center" gap="md">
              <ThemeIcon color="yellow" size={80} radius="xl" variant="light">
                <IconTrophy size={40} />
              </ThemeIcon>
              <Title order={2}>Quiz Complete!</Title>
            </Stack>
          </Center>

          <Group justify="center" gap={{ base: 'md', sm: 'xl' }} mb="xl" wrap="wrap">
            <RingProgress
              size={180}
              thickness={16}
              roundCaps
              sections={[{ value: finalPercent, color: grade.color }]}
              label={
                <Center>
                  <Stack align="center" gap={0}>
                    <Text size="xl" fw={700}>{grade.letter}</Text>
                    <Text size="sm" c="dimmed">{Math.round(finalPercent)}%</Text>
                  </Stack>
                </Center>
              }
            />
            <Stack gap="xs" align={{ base: 'center', sm: 'flex-start' }}>
              <Text size="lg" fw={600}>Final Score</Text>
              <Text size="xl" fw={700} c={grade.color}>{totalScore} / {maxPossibleScore}</Text>
              <Badge color={grade.color} size="lg" variant="light">
                {answeredCount} Questions Answered
              </Badge>
            </Stack>
          </Group>

          <Divider my="xl" label="Question Breakdown" labelPosition="center" />

          <Stack gap="md">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const qEval = evaluations[q.id];
              const qScore = qEval ? Math.round((qEval.score / 100) * q.maxPoints) : 0;
              const qAttempts = attempts[q.id] || 0;
              return (
                <Card key={q.id} padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
                    <Group gap="xs" wrap="wrap">
                      <Badge color="green" variant="light" size="sm">Q{idx + 1}</Badge>
                      <Text size="sm" fw={500}>{q.category}</Text>
                      {qAttempts > 1 && (
                        <Badge color="orange" variant="light" size="xs">
                          {qAttempts} attempts
                        </Badge>
                      )}
                    </Group>
                    <Badge color={qEval ? getScoreColor(qEval.score) : 'gray'} size="lg">
                      {qScore}/{q.maxPoints}
                    </Badge>
                  </Group>
                  {qEval && (
                    <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word' }}>{qEval.feedback?.slice(0, 150)}...</Text>
                  )}
                </Card>
              );
            })}
          </Stack>

          <Group justify="center" mt="xl">
            <Button
              leftSection={<IconRefresh size={18} />}
              variant="light"
              color="green"
              size="lg"
              onClick={handleRestart}
            >
              Try Again
            </Button>
          </Group>
        </Paper>
      </>
    );
  }

  return (
    <>
      {/* Score Display - Top Right */}
      <Paper
        shadow="md"
        p="md"
        radius="md"
        withBorder
        style={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 100,
          minWidth: 120,
          maxWidth: 140,
        }}
        visibleFrom="sm"
      >
        <Stack align="center" gap="xs">
          <Text size="xs" c="dimmed" fw={500}>SCORE</Text>
          <Text size="xl" fw={700} c="green">{totalScore}</Text>
          <Progress
            value={progressPercent}
            color="green"
            size="sm"
            radius="xl"
            style={{ width: '100%' }}
          />
          <Text size="xs" c="dimmed">{answeredCount}/{QUIZ_QUESTIONS.length}</Text>
        </Stack>
      </Paper>

      {/* Patient Persona Hero */}
      <Paper
        shadow="md"
        p={{ base: 'md', sm: 'xl' }}
        radius="lg"
        withBorder
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, rgba(64, 192, 87, 0.1) 0%, rgba(34, 139, 230, 0.1) 100%)',
        }}
      >
        <Group gap="lg" align="flex-start" wrap="wrap">
          <Box hiddenFrom="xs">
            <Text style={{ fontSize: 48 }}>👩</Text>
          </Box>
          <Box visibleFrom="xs">
            <Text style={{ fontSize: 64 }}>👩</Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 280 }}>
            <Group gap="sm" mb="xs" wrap="wrap">
              <Title order={3} style={{ wordBreak: 'break-word' }}>{PATIENT_PERSONA.name}</Title>
              <Badge color="blue" variant="light">
                {PATIENT_PERSONA.age} years old
              </Badge>
              <Badge color="grape" variant="light">
                {PATIENT_PERSONA.occupation}
              </Badge>
              <Badge color="teal" variant="light">
                {PATIENT_PERSONA.location}
              </Badge>
              {PATIENT_PERSONA.healthConditions.map((condition, idx) => (
                <Badge key={idx} color="red" variant="light">
                  {condition}
                </Badge>
              ))}
            </Group>
            <Text size={{ base: 'md', sm: 'lg' }} my="lg" lh={1.6} style={{ wordBreak: 'break-word' }}>
              {PATIENT_PERSONA.highlightedScenario}
            </Text>
            <Group gap="xs" wrap="wrap" justify="space-between">
              <Group gap="xs" wrap="wrap">
                {PATIENT_PERSONA.dataSources.map((source, idx) => (
                  <Tooltip key={idx} label="Click to view sample data" withArrow>
                    <Badge
                      size="lg"
                      variant="outline"
                      color="green"
                      leftSection={<source.icon size={14} />}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDataModal({ opened: true, source: source.name })}
                    >
                      {source.name}
                    </Badge>
                  </Tooltip>
                ))}
              </Group>
              <Tooltip label={unifiedSchema ? "View unified schema" : "Generate AI-powered unified schema from all sources"} withArrow>
                <Badge
                  size="lg"
                  variant={unifiedSchema ? "filled" : "gradient"}
                  gradient={{ from: 'violet', to: 'cyan', deg: 90 }}
                  color={unifiedSchema ? "cyan" : undefined}
                  leftSection={isGeneratingSchema ? <Loader size={12} color="white" /> : (unifiedSchema ? <IconDatabase size={14} /> : <IconWand size={14} />)}
                  style={{ cursor: isGeneratingSchema ? 'wait' : 'pointer' }}
                  onClick={isGeneratingSchema ? undefined : (unifiedSchema ? () => setDataModal({ opened: true, source: 'Unified Schema' }) : generateUnifiedSchema)}
                >
                  {unifiedSchema ? 'Unified Schema' : 'Generate Unified Schema'}
                </Badge>
              </Tooltip>
            </Group>
          </Box>
        </Group>
      </Paper>

      {/* Data Source Modal */}
      <Modal
        opened={dataModal.opened}
        onClose={() => setDataModal({ opened: false, source: null })}
        title={
          <Group gap="sm">
            <ThemeIcon color={dataModal.source === 'Unified Schema' ? 'cyan' : 'green'} size="md" radius="xl">
              {dataModal.source === 'Unified Schema' ? <IconDatabase size={16} /> :
               dataModal.source === 'Oura Ring' ? <IconCircleDot size={16} /> : 
               dataModal.source === 'Apple Watch' ? <IconDeviceWatch size={16} /> : 
               <IconFileText size={16} />}
            </ThemeIcon>
            <Text fw={600}>
              {dataModal.source === 'Unified Schema' ? 'AI-Generated Unified Patient Health Schema' :
               dataModal.source === 'Oura Ring' ? OURA_RING_SAMPLE_DATA.title :
               dataModal.source === 'Apple Watch' ? APPLE_WATCH_SAMPLE_DATA.title : 
               EHR_SAMPLE_DATA.title}
            </Text>
          </Group>
        }
        size="90%"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {dataModal.source === 'Unified Schema' && unifiedSchema ? (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              This unified schema was generated by AI to combine Oura Ring, Apple Watch, and EHR data into a single, 
              AI-ready format following healthcare data best practices.
            </Text>
            
            <Alert color="cyan" variant="light" icon={<IconSparkles size={16} />}>
              <Text size="xs" fw={500}>AI Data Standards Applied:</Text>
              <Text size="xs">✓ Consistent camelCase naming • ✓ ISO 8601 timestamps • ✓ LOINC/SNOMED codes • ✓ PHI field marking • ✓ Data provenance tracking • ✓ Validation constraints</Text>
            </Alert>

            <Group gap="xs" mb="xs">
              <Badge color="cyan" variant="light">Schema v{unifiedSchema.version || '1.0.0'}</Badge>
              <Badge color="violet" variant="light">AI Generated</Badge>
              {unifiedSchema.patient && <Badge color="green" variant="light">Patient Data</Badge>}
              {unifiedSchema.vitalSigns && <Badge color="orange" variant="light">{unifiedSchema.vitalSigns.length || 0} Vital Signs</Badge>}
              {unifiedSchema.sleepData && <Badge color="indigo" variant="light">Sleep Data</Badge>}
            </Group>

            <Text size="sm" fw={600}>Unified JSON Schema:</Text>
            <Code block style={{ fontSize: 11, maxHeight: 400, overflow: 'auto' }}>
              {JSON.stringify(unifiedSchema, null, 2)}
            </Code>
            
            <Alert color="green" variant="light">
              <Text size="xs">
                <strong>Why this matters:</strong> This unified schema enables AI models to process data from multiple sources consistently. 
                Notice how fields from different sources (Oura&apos;s sleep stages, Apple Watch&apos;s heart rate, EHR&apos;s blood pressure) 
                are now in a standardized format ready for machine learning.
              </Text>
            </Alert>
          </Stack>
        ) : dataModal.source === 'Oura Ring' ? (
          <Stack gap="md">
            <Text size="sm" c="dimmed">{OURA_RING_SAMPLE_DATA.description}</Text>
            
            <Text size="sm" fw={600}>Sample Metrics:</Text>
            <ScrollArea h={200}>
              <Table striped highlightOnHover withTableBorder withColumnBorders fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Data Type</Table.Th>
                    <Table.Th>Metric</Table.Th>
                    <Table.Th>Value</Table.Th>
                    <Table.Th>Unit</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {OURA_RING_SAMPLE_DATA.records.map((r, i) => (
                    <Table.Tr key={i}>
                      <Table.Td><Code size="xs">{r.type}</Code></Table.Td>
                      <Table.Td>{r.metric}</Table.Td>
                      <Table.Td fw={500}>{r.value}</Table.Td>
                      <Table.Td>{r.unit}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Text size="sm" fw={600}>Oura Cloud API v2 Response Format:</Text>
            <Code block style={{ fontSize: 11, maxHeight: 250, overflow: 'auto' }}>
              {OURA_RING_SAMPLE_DATA.jsonSample}
            </Code>
            
            <Alert color="violet" variant="light">
              <Text size="xs">Notice the contributor scores (0-100) that break down each daily metric. Oura uses ISO 8601 timestamps and provides temperature deviation from baseline — useful for detecting illness or stress patterns.</Text>
            </Alert>
          </Stack>
        ) : dataModal.source === 'Apple Watch' ? (
          <Stack gap="md">
            <Text size="sm" c="dimmed">{APPLE_WATCH_SAMPLE_DATA.description}</Text>
            
            <Text size="sm" fw={600}>Sample Records:</Text>
            <ScrollArea h={200}>
              <Table striped highlightOnHover withTableBorder withColumnBorders fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Value</Table.Th>
                    <Table.Th>Unit</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {APPLE_WATCH_SAMPLE_DATA.records.map((r, i) => (
                    <Table.Tr key={i}>
                      <Table.Td><Code size="xs">{r.type.replace('HKQuantityTypeIdentifier', '').replace('HKCategoryTypeIdentifier', '')}</Code></Table.Td>
                      <Table.Td>{r.value}</Table.Td>
                      <Table.Td>{r.unit || '-'}</Table.Td>
                      <Table.Td>{new Date(r.startDate).toLocaleTimeString()}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Text size="sm" fw={600}>Raw JSON Export Format:</Text>
            <Code block style={{ fontSize: 11, maxHeight: 250, overflow: 'auto' }}>
              {APPLE_WATCH_SAMPLE_DATA.jsonSample}
            </Code>
            
            <Alert color="blue" variant="light">
              <Text size="xs">Notice the different data types (HeartRate, StepCount, SleepAnalysis) and their units. This is the format you&apos;d need to parse when integrating with Maria&apos;s EHR data.</Text>
            </Alert>
          </Stack>
        ) : (
          <Stack gap="md">
            <Text size="sm" c="dimmed">{EHR_SAMPLE_DATA.description}</Text>
            
            <Text size="sm" fw={600}>Key Fields:</Text>
            <Table striped highlightOnHover withTableBorder withColumnBorders fontSize="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Field</Table.Th>
                  <Table.Th>Value</Table.Th>
                  <Table.Th>Coding System</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {EHR_SAMPLE_DATA.records.map((r, i) => (
                  <Table.Tr key={i}>
                    <Table.Td fw={500}>{r.field}</Table.Td>
                    <Table.Td>{r.value}</Table.Td>
                    <Table.Td><Code size="xs">{r.system}</Code></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Text size="sm" fw={600}>FHIR Bundle Format:</Text>
            <Code block style={{ fontSize: 11, maxHeight: 250, overflow: 'auto' }}>
              {EHR_SAMPLE_DATA.jsonSample}
            </Code>
            
            <Alert color="orange" variant="light">
              <Text size="xs">⚠️ PHI Alert: Notice this data contains identifiable information (name, DOB, MRN). This would need to be de-identified before AI training!</Text>
            </Alert>
          </Stack>
        )}
      </Modal>

      {/* Instructions */}
      <Alert icon={<IconBrain size={18} />} color="green" mb="xl" variant="light">
        <Text size="sm" fw={500}>
          Help Maria get insights from her health data! Answer questions about data specifications 
          based on what you learned in Module 1. The AI will evaluate your understanding.
        </Text>
      </Alert>

      {/* Current Question */}
      <Card shadow="sm" padding={{ base: 'md', sm: 'xl' }} radius="lg" withBorder mb="xl">
        <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
          <Group gap="xs" wrap="wrap">
            <Badge color="green" size="lg" variant="filled">
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </Badge>
            <Badge color="blue" variant="light">{currentQ.category}</Badge>
          </Group>
          <Badge color="gray" variant="light">
            {currentQ.maxPoints} points
          </Badge>
        </Group>

        <Text size={{ base: 'md', sm: 'lg' }} fw={500} mb="lg" style={{ wordBreak: 'break-word' }}>
          {currentQ.question}
        </Text>

        <Text size="xs" c="dimmed" mb="md" fs="italic">
          💡 Hint: {currentQ.hint}
        </Text>

        {!currentEval ? (
          <>
            <Textarea
              placeholder="Type your answer here..."
              minRows={4}
              maxRows={8}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={isEvaluating}
              mb="md"
            />
            <Group justify="flex-end">
              <Button
                color="green"
                onClick={handleSubmitAnswer}
                loading={isEvaluating}
                disabled={!currentAnswer.trim()}
                rightSection={<IconSparkles size={18} />}
              >
                Submit for AI Evaluation
              </Button>
            </Group>
          </>
        ) : (
          <Transition mounted={!!currentEval} transition="slide-up" duration={300}>
            {(transitionStyles) => (
              <Box style={transitionStyles}>
                <Divider my="md" label="AI Evaluation" labelPosition="center" />
                
                <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
                  <Group gap="xs" wrap="wrap">
                    <ThemeIcon
                      color={getScoreColor(currentEval.score)}
                      size={32}
                      radius="xl"
                    >
                      {currentEval.score >= PASSING_SCORE ? <IconCheck size={18} /> : <IconX size={18} />}
                    </ThemeIcon>
                    <Text fw={600}>
                      {currentEval.score >= PASSING_SCORE ? 'Great job!' : 'Not quite - try again!'}
                    </Text>
                    {attempts[currentQ.id] > 1 && (
                      <Badge color="orange" variant="light" size="sm">
                        Attempt #{attempts[currentQ.id]}
                      </Badge>
                    )}
                  </Group>
                  <Badge color={getScoreColor(currentEval.score)} size="xl" variant="filled">
                    {Math.round((currentEval.score / 100) * currentQ.maxPoints)}/{currentQ.maxPoints} pts
                  </Badge>
                </Group>

                <Paper p="md" radius="md" bg="gray.0" withBorder mb="md">
                  <Text size="sm" style={{ wordBreak: 'break-word' }}>{currentEval.feedback}</Text>
                </Paper>

                {currentEval.correctConcepts?.length > 0 && (
                  <Box mb="sm">
                    <Text size="xs" fw={500} c="dimmed" mb="xs">Concepts you covered:</Text>
                    <Group gap="xs" wrap="wrap">
                      {currentEval.correctConcepts.map((concept, i) => (
                        <Badge key={i} color="green" variant="light" size="sm" leftSection={<IconCheck size={10} />}>
                          {concept}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {currentEval.missingConcepts?.length > 0 && (
                  <Box mb="md">
                    <Text size="xs" fw={500} c="dimmed" mb="xs">Concepts to consider:</Text>
                    <Group gap="xs" wrap="wrap">
                      {currentEval.missingConcepts.map((concept, i) => (
                        <Badge key={i} color="orange" variant="light" size="sm">
                          {concept}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {currentEval.score < PASSING_SCORE && currentEval.suggestion && (
                  <Alert icon={<IconAlertCircle size={14} />} color="orange" variant="light" mb="md">
                    <Text size="xs">{currentEval.suggestion}</Text>
                  </Alert>
                )}

                {currentEval.score >= PASSING_SCORE ? (
                  <Group justify="flex-end">
                    <Button
                      color="green"
                      onClick={handleNextQuestion}
                      rightSection={<IconArrowRight size={18} />}
                    >
                      {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  </Group>
                ) : (
                  <Group justify="flex-end">
                    <Button
                      color="orange"
                      onClick={handleRetry}
                      leftSection={<IconRefresh size={18} />}
                    >
                      Try Again
                    </Button>
                  </Group>
                )}
              </Box>
            )}
          </Transition>
        )}
      </Card>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}
    </>
  );
};

export default DataSpecsQuiz;
