import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Box,
  Badge,
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Progress,
  Card,
  Divider,
  List,
  Button,
  Center,
  Stack,
} from '@mantine/core';
import {
  IconTrophy,
  IconStar,
  IconCircleCheck,
  IconClock,
  IconTarget,
  IconArrowRight,
  IconChartBar,
  IconFileText,
  IconShieldCheck,
} from '@tabler/icons-react';

function ProgressPage() {
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    // Load progress from localStorage
    const loadProgress = () => {
      const saved = localStorage.getItem('learningProgress');
      if (saved) {
        setProgressData(JSON.parse(saved));
      }
    };

    loadProgress();
    // Listen for storage changes
    window.addEventListener('storage', loadProgress);
    return () => window.removeEventListener('storage', loadProgress);
  }, []);

  // Calculate overall stats
  const calculateStats = () => {
    const quizzes = Object.keys(progressData);
    const totalQuizzes = quizzes.length;
    const completedQuizzes = quizzes.filter(key => progressData[key].completed).length;
    const totalScore = quizzes.reduce((sum, key) => sum + (progressData[key].score || 0), 0);
    const totalPossible = quizzes.reduce((sum, key) => sum + (progressData[key].totalQuestions || 0), 0);
    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    return {
      totalQuizzes,
      completedQuizzes,
      totalScore,
      totalPossible,
      averageScore,
      completionRate: totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0,
    };
  };

  const stats = calculateStats();

  // Get achievement badge based on average score
  const getAchievementBadge = (score) => {
    if (score >= 90) return { label: 'Expert', color: 'yellow', icon: IconTrophy };
    if (score >= 75) return { label: 'Proficient', color: 'blue', icon: IconStar };
    if (score >= 60) return { label: 'Learning', color: 'teal', icon: IconTarget };
    return { label: 'Getting Started', color: 'gray', icon: IconClock };
  };

  const badge = getAchievementBadge(stats.averageScore);
  const BadgeIcon = badge.icon;

  // Quiz details with proper display names
  const quizDetails = {
    'hipaa-quiz': { name: 'HIPAA Compliance', module: 'Module 2', icon: IconShieldCheck, color: 'blue' },
    'gdpr-quiz': { name: 'GDPR Compliance', module: 'Module 2', icon: IconShieldCheck, color: 'grape' },
    'data-specs-quiz': { name: 'Data Specifications', module: 'Module 1', icon: IconFileText, color: 'cyan' },
  };

  return (
    <Container size="lg" py="xl">
      <Group mb="xl" justify="space-between">
        <Box>
          <Title order={1} mb="xs">Your Learning Progress</Title>
          <Text c="dimmed">Track your achievements and see how you're doing</Text>
        </Box>
      </Group>

      {/* Overall Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Completion Rate</Text>
            <ThemeIcon color="teal" variant="light" radius="xl" size="lg">
              <IconCircleCheck size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats.completionRate}%</Text>
          <Progress value={stats.completionRate} mt="sm" size="sm" color="teal" />
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Average Score</Text>
            <ThemeIcon color={badge.color} variant="light" radius="xl" size="lg">
              <IconTarget size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats.averageScore}%</Text>
          <Progress value={stats.averageScore} mt="sm" size="sm" color={badge.color} />
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Quizzes Completed</Text>
            <ThemeIcon color="blue" variant="light" radius="xl" size="lg">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>{stats.completedQuizzes} / {stats.totalQuizzes}</Text>
          <Text size="xs" c="dimmed" mt="xs">Keep going!</Text>
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Achievement</Text>
            <ThemeIcon color={badge.color} variant="light" radius="xl" size="lg">
              <BadgeIcon size={20} />
            </ThemeIcon>
          </Group>
          <Badge size="lg" color={badge.color} variant="filled" mt="xs">
            {badge.label}
          </Badge>
        </Paper>
      </SimpleGrid>

      {/* Overall Progress Ring */}
      <Paper p="xl" radius="md" withBorder mb="xl">
        <Group justify="center">
          <Box style={{ textAlign: 'center' }}>
            <RingProgress
              size={200}
              thickness={20}
              sections={[
                { value: stats.completionRate, color: 'teal' },
              ]}
              label={
                <Center>
                  <Box style={{ textAlign: 'center' }}>
                    <Text size="xl" fw={700}>{stats.completionRate}%</Text>
                    <Text size="xs" c="dimmed">Complete</Text>
                  </Box>
                </Center>
              }
            />
            <Badge size="xl" color={badge.color} variant="filled" mt="md" leftSection={<BadgeIcon size={18} />}>
              {badge.label}
            </Badge>
          </Box>
        </Group>
      </Paper>

      {/* Individual Quiz Results */}
      <Title order={2} mb="md">Quiz Performance</Title>
      
      {Object.keys(progressData).length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" variant="light" color="gray">
              <IconChartBar size={30} />
            </ThemeIcon>
            <Box style={{ textAlign: 'center' }}>
              <Text size="lg" fw={600} mb="xs">No quiz data yet</Text>
              <Text c="dimmed" mb="md">Start taking quizzes to see your progress here</Text>
              <Button component={Link} to="/module-2" rightSection={<IconArrowRight size={16} />}>
                Go to Module 2
              </Button>
            </Box>
          </Stack>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {Object.entries(progressData).map(([quizKey, data]) => {
            const details = quizDetails[quizKey] || { name: quizKey, module: 'Unknown', icon: IconFileText, color: 'gray' };
            const QuizIcon = details.icon;
            const percentage = data.totalQuestions > 0 
              ? Math.round((data.score / data.totalQuestions) * 100) 
              : 0;
            const quizBadge = getAchievementBadge(percentage);

            return (
              <Card key={quizKey} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Group>
                    <ThemeIcon size="xl" radius="md" color={details.color} variant="light">
                      <QuizIcon size={24} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={600}>{details.name}</Text>
                      <Text size="xs" c="dimmed">{details.module}</Text>
                    </Box>
                  </Group>
                  {data.completed && (
                    <Badge color={quizBadge.color} variant="filled">
                      {quizBadge.label}
                    </Badge>
                  )}
                </Group>

                <Divider mb="md" />

                <Group grow mb="md">
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>Score</Text>
                    <Text size="xl" fw={700}>
                      {data.score} / {data.totalQuestions}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>Percentage</Text>
                    <Text size="xl" fw={700} c={quizBadge.color}>
                      {percentage}%
                    </Text>
                  </Box>
                </Group>

                <Progress value={percentage} size="lg" color={quizBadge.color} mb="md" />

                {data.completedAt && (
                  <Text size="xs" c="dimmed">
                    <IconClock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Completed {new Date(data.completedAt).toLocaleDateString()}
                  </Text>
                )}
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      {/* Motivational Message */}
      {stats.completedQuizzes > 0 && stats.completionRate < 100 && (
        <Paper p="lg" radius="md" withBorder mt="xl" bg="blue.0">
          <Group>
            <ThemeIcon size={40} radius="xl" color="blue">
              <IconStar size={20} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Text fw={600} mb="xs">Keep up the great work!</Text>
              <Text size="sm" c="dimmed">
                You've completed {stats.completedQuizzes} quizzes. Continue exploring modules to unlock more achievements.
              </Text>
            </Box>
          </Group>
        </Paper>
      )}

      {stats.completionRate === 100 && (
        <Paper p="lg" radius="md" withBorder mt="xl" bg="yellow.0">
          <Group>
            <ThemeIcon size={40} radius="xl" color="yellow">
              <IconTrophy size={20} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Text fw={600} mb="xs">🎉 Congratulations!</Text>
              <Text size="sm" c="dimmed">
                You've completed all available quizzes with an average score of {stats.averageScore}%. Outstanding work!
              </Text>
            </Box>
          </Group>
        </Paper>
      )}
    </Container>
  );
}

export default ProgressPage;
