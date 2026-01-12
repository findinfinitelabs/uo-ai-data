import React, { useState, useRef } from 'react';
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
} from '@tabler/icons-react';
import styles from './DataSpecs.module.css';

// Patient Persona
const PATIENT_PERSONA = {
  name: 'Maria Chen',
  age: 52,
  avatar: '👩‍💼',
  occupation: 'Marketing Executive',
  healthGoals: 'Monitor cardiovascular health and stress levels',
  dataSources: [
    { name: 'Apple Watch', type: 'Wearable', icon: IconDeviceWatch },
    { name: "Doctor's EHR", type: 'Medical Records', icon: IconFileText },
  ],
  scenario: `Maria is a 52-year-old marketing executive who recently had a health scare with elevated blood pressure. She wants to combine her Apple Watch data (heart rate, sleep, activity) with her doctor's electronic health records to get personalized insights about her cardiovascular risk and daily habits that might affect her health.`,
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
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const scrollRef = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const totalScore = Object.values(evaluations).reduce((sum, e) => {
    const questionMaxPoints = QUIZ_QUESTIONS.find(q => q.id === e.questionId)?.maxPoints || 20;
    return sum + Math.round((e.score / 100) * questionMaxPoints);
  }, 0);

  const maxPossibleScore = QUIZ_QUESTIONS.reduce((sum, q) => sum + q.maxPoints, 0);
  const answeredCount = Object.keys(evaluations).length;
  const progressPercent = (answeredCount / QUIZ_QUESTIONS.length) * 100;

  const evaluateAnswer = async (questionId, answer) => {
    if (!apiKey || apiKey === 'sk-your-key-here') {
      setError('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env.local file.');
      return;
    }

    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

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

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setEvaluations({});
    setCurrentAnswer('');
    setShowResults(false);
    setError(null);
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

          <Group justify="center" gap="xl" mb="xl">
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
            <Stack gap="xs">
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
              return (
                <Card key={q.id} padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge color="green" variant="light" size="sm">Q{idx + 1}</Badge>
                      <Text size="sm" fw={500}>{q.category}</Text>
                    </Group>
                    <Badge color={qEval ? getScoreColor(qEval.score) : 'gray'} size="lg">
                      {qScore}/{q.maxPoints}
                    </Badge>
                  </Group>
                  {qEval && (
                    <Text size="xs" c="dimmed">{qEval.feedback?.slice(0, 150)}...</Text>
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
          minWidth: 140,
        }}
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
        p="xl"
        radius="lg"
        withBorder
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, rgba(64, 192, 87, 0.1) 0%, rgba(34, 139, 230, 0.1) 100%)',
        }}
      >
        <Group gap="lg" align="flex-start">
          <Box>
            <Text style={{ fontSize: 64 }}>{PATIENT_PERSONA.avatar}</Text>
          </Box>
          <Box style={{ flex: 1 }}>
            <Group gap="md" mb="xs">
              <Title order={3}>{PATIENT_PERSONA.name}</Title>
              <Badge color="blue" variant="light">
                {PATIENT_PERSONA.age} years old
              </Badge>
              <Badge color="grape" variant="light">
                {PATIENT_PERSONA.occupation}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              {PATIENT_PERSONA.scenario}
            </Text>
            <Group gap="md">
              {PATIENT_PERSONA.dataSources.map((source, idx) => (
                <Badge
                  key={idx}
                  size="lg"
                  variant="outline"
                  color="green"
                  leftSection={<source.icon size={14} />}
                >
                  {source.name}
                </Badge>
              ))}
            </Group>
          </Box>
        </Group>
      </Paper>

      {/* Instructions */}
      <Alert icon={<IconBrain size={18} />} color="green" mb="xl" variant="light">
        <Text size="sm" fw={500}>
          Help Maria get insights from her health data! Answer questions about data specifications 
          based on what you learned in Module 1. The AI will evaluate your understanding.
        </Text>
      </Alert>

      {/* Current Question */}
      <Card shadow="sm" padding="xl" radius="lg" withBorder mb="xl">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Badge color="green" size="lg" variant="filled">
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </Badge>
            <Badge color="blue" variant="light">{currentQ.category}</Badge>
          </Group>
          <Badge color="gray" variant="light">
            {currentQ.maxPoints} points
          </Badge>
        </Group>

        <Text size="lg" fw={500} mb="lg">
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
                
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <ThemeIcon
                      color={getScoreColor(currentEval.score)}
                      size={32}
                      radius="xl"
                    >
                      {currentEval.score >= 70 ? <IconCheck size={18} /> : <IconX size={18} />}
                    </ThemeIcon>
                    <Text fw={600}>
                      {currentEval.score >= 80 ? 'Excellent!' : currentEval.score >= 60 ? 'Good effort!' : 'Needs improvement'}
                    </Text>
                  </Group>
                  <Badge color={getScoreColor(currentEval.score)} size="xl" variant="filled">
                    {Math.round((currentEval.score / 100) * currentQ.maxPoints)}/{currentQ.maxPoints} pts
                  </Badge>
                </Group>

                <Paper p="md" radius="md" bg="gray.0" withBorder mb="md">
                  <Text size="sm">{currentEval.feedback}</Text>
                </Paper>

                {currentEval.correctConcepts?.length > 0 && (
                  <Group gap="xs" mb="sm">
                    <Text size="xs" c="green" fw={500}>✓ Got right:</Text>
                    {currentEval.correctConcepts.map((c, i) => (
                      <Badge key={i} size="sm" color="green" variant="light">{c}</Badge>
                    ))}
                  </Group>
                )}

                {currentEval.missingConcepts?.length > 0 && (
                  <Group gap="xs" mb="sm">
                    <Text size="xs" c="orange" fw={500}>↑ Could add:</Text>
                    {currentEval.missingConcepts.map((c, i) => (
                      <Badge key={i} size="sm" color="orange" variant="light">{c}</Badge>
                    ))}
                  </Group>
                )}

                {currentEval.suggestion && (
                  <Alert icon={<IconAlertCircle size={14} />} color="blue" variant="light" mb="md">
                    <Text size="xs">{currentEval.suggestion}</Text>
                  </Alert>
                )}

                <Group justify="flex-end">
                  <Button
                    color="green"
                    onClick={handleNextQuestion}
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                </Group>
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
