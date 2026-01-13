import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  List,
  Alert,
  Anchor,
  SimpleGrid,
  Breadcrumbs,
  Button,
  Modal,
  Code,
  Stack,
  Progress,
  Image,
  Stepper,
  RingProgress,
  Grid,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconInfoCircle,
  IconPlug,
  IconSun,
  IconRun,
  IconSalad,
  IconBuildingSkyscraper,
  IconCoffee,
  IconAlertTriangle,
  IconShoppingCart,
  IconHome,
  IconMoon,
  IconDeviceWatch,
  IconHeartRateMonitor,
  IconActivity,
  IconShield,
  IconLock,
  IconKey,
  IconX,
  IconPill,
  IconHeart,
  IconDatabase,
  IconArrowRight,
  IconBolt,
  IconPhoto,
} from '@tabler/icons-react';

// Timeline data with JSON payloads and MCP connection info
const timelineData = [
  {
    id: 'wake',
    time: '6:30 AM',
    title: 'Wake Up',
    icon: IconSun,
    color: 'yellow',
    sources: ['Oura Ring'],
    sourceColors: ['grape'],
    description: 'Syncs overnight sleep data automatically',
    insight: 'Good morning Maria! You got 7.2 hours of sleep with 1.5 hours of deep sleep. Your HRV of 42ms is slightly lower than your 7-day average of 48ms—consider a lighter workout today. Your readiness score is 72.',
    insightBg: 'var(--mantine-color-blue-0)',
    healthScore: 72,
    scoreLabel: 'Readiness',
    jsonData: {
      sleep_duration: 7.2,
      deep_sleep_hours: 1.5,
      rem_sleep_hours: 1.8,
      light_sleep_hours: 3.9,
      hrv_ms: 42,
      hrv_7day_avg: 48,
      readiness_score: 72,
      respiratory_rate: 14.5,
      body_temperature_deviation: -0.1,
      resting_heart_rate: 58,
      sleep_efficiency: 0.89,
    },
    mcpConnection: {
      server: 'oura-mcp-server',
      endpoint: '/v1/sleep',
      method: 'GET',
      auth_type: 'OAuth 2.0 (stored locally)',
      response_time_ms: 145,
      data_encrypted: true,
    },
  },
  {
    id: 'run',
    time: '7:00 AM',
    title: 'Morning Run',
    icon: IconRun,
    color: 'orange',
    sources: ['Strava', 'Apple Watch'],
    sourceColors: ['orange', 'blue'],
    description: 'Exercise tracked with heart rate zones',
    insight: 'Great 3-mile run! Your pace was 8:45/mile, and you stayed in zone 2 for 80% of the workout—ideal for recovery days. Your heart rate recovered to under 100 BPM within 2 minutes.',
    insightBg: 'var(--mantine-color-green-0)',
    healthScore: 85,
    scoreLabel: 'Workout Quality',
    jsonData: {
      activity_type: 'run',
      distance_miles: 3.0,
      duration_minutes: 26.25,
      pace_per_mile: '8:45',
      calories_burned: 312,
      avg_heart_rate: 142,
      max_heart_rate: 165,
      heart_rate_zones: {
        zone_1: 0.05,
        zone_2: 0.80,
        zone_3: 0.12,
        zone_4: 0.03,
        zone_5: 0.00,
      },
      recovery_time_to_100bpm: 120,
      elevation_gain_ft: 85,
      cadence_avg: 172,
    },
    mcpConnection: {
      server: 'strava-mcp-server',
      endpoint: '/v1/activities/latest',
      method: 'GET',
      auth_type: 'OAuth 2.0 (stored locally)',
      response_time_ms: 203,
      data_encrypted: true,
      secondary_source: {
        server: 'apple-health-mcp-server',
        endpoint: '/v1/workout',
        method: 'GET',
      },
    },
  },
  {
    id: 'breakfast',
    time: '8:00 AM',
    title: 'Breakfast & Meds',
    icon: IconSalad,
    color: 'green',
    sources: ['Calendar', 'BP Monitor'],
    sourceColors: ['yellow', 'red'],
    description: 'Morning routine with medication reminder',
    insight: 'Don\'t forget your morning Lisinopril! ☕ Your post-run BP reading was 118/76—excellent! That\'s 8% lower than your 30-day average.',
    insightBg: 'var(--mantine-color-yellow-0)',
    healthScore: 92,
    scoreLabel: 'BP Health',
    isMeal: true,
    mealImage: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
    mealDescription: 'Avocado toast with soft egg',
    nutritionData: {
      calories: 420,
      protein_g: 16,
      carbs_g: 32,
      fat_g: 26,
      fiber_g: 8,
      sugar_g: 3,
      sodium_mg: 380,
      potassium_mg: 620,
      vitamins: {
        vitamin_c: '12%',
        vitamin_d: '10%',
        vitamin_e: '18%',
        vitamin_k: '26%',
        folate: '22%',
        iron: '15%',
      },
      health_score: 8.8,
      meal_tags: ['Heart Healthy', 'Good Fats', 'High Fiber', 'Protein Rich'],
    },
    jsonData: {
      blood_pressure: { systolic: 118, diastolic: 76 },
      bp_30day_avg: { systolic: 128, diastolic: 82 },
      medication_reminder: 'Lisinopril 10mg',
      medication_taken: true,
      time_since_exercise_min: 45,
    },
    mcpConnection: {
      server: 'withings-mcp-server',
      endpoint: '/v1/bp/latest',
      method: 'GET',
      auth_type: 'API Key (encrypted local)',
      response_time_ms: 98,
      data_encrypted: true,
    },
  },
  {
    id: 'work',
    time: '9:00 AM',
    title: 'Arrive at Work',
    icon: IconBuildingSkyscraper,
    color: 'gray',
    sources: ['Location', 'Calendar'],
    sourceColors: ['gray', 'blue'],
    description: 'Work location detected, calendar synced',
    insight: 'You have a busy morning with 3 back-to-back meetings. I\'ve noticed your stress tends to spike on meeting-heavy days. I\'ve blocked 10 minutes before your 2pm presentation.',
    insightBg: 'var(--mantine-color-gray-0)',
    healthScore: 65,
    scoreLabel: 'Stress Prep',
    jsonData: {
      location: 'Office - 123 Business Ave',
      arrival_time: '8:58 AM',
      meetings_today: 5,
      back_to_back_meetings: 3,
      stress_prediction: 'elevated',
      calendar_blocks_added: 1,
      focus_time_available_hours: 2.5,
    },
    mcpConnection: {
      server: 'calendar-mcp-server',
      endpoint: '/v1/events/today',
      method: 'GET',
      auth_type: 'OAuth 2.0 (stored locally)',
      response_time_ms: 67,
      data_encrypted: true,
    },
  },
  {
    id: 'lunch',
    time: '12:30 PM',
    title: 'Lunch Break',
    icon: IconCoffee,
    color: 'blue',
    sources: ['Apple Watch'],
    sourceColors: ['blue'],
    description: 'Mid-day activity check',
    insight: 'You\'re at 4,200 steps—on track for your 10K goal! Your standing hours are good (5/12). Consider a 15-minute walk after lunch.',
    insightBg: 'var(--mantine-color-blue-0)',
    healthScore: 78,
    scoreLabel: 'Activity',
    isMeal: true,
    mealImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    mealDescription: 'Grilled salmon salad with mixed greens and avocado',
    nutritionData: {
      calories: 520,
      protein_g: 38,
      carbs_g: 18,
      fat_g: 34,
      fiber_g: 8,
      sugar_g: 4,
      sodium_mg: 380,
      potassium_mg: 890,
      omega_3_mg: 2100,
      vitamins: {
        vitamin_d: '85%',
        vitamin_b12: '120%',
        vitamin_k: '95%',
        vitamin_e: '25%',
      },
      health_score: 9.4,
      meal_tags: ['Omega-3 Rich', 'Low Carb', 'Heart Healthy'],
    },
    jsonData: {
      steps_current: 4200,
      steps_goal: 10000,
      standing_hours: 5,
      standing_goal: 12,
      resting_heart_rate: 62,
      active_calories: 180,
    },
    mcpConnection: {
      server: 'apple-health-mcp-server',
      endpoint: '/v1/activity',
      method: 'GET',
      auth_type: 'HealthKit (local)',
      response_time_ms: 45,
      data_encrypted: true,
    },
  },
  {
    id: 'stress',
    time: '3:00 PM',
    title: 'Stressful Meeting',
    icon: IconAlertTriangle,
    color: 'orange',
    sources: ['Oura Ring', 'Apple Watch'],
    sourceColors: ['grape', 'blue'],
    description: 'Elevated heart rate detected',
    insight: 'I noticed your heart rate spiked to 95 BPM during your Q3 review meeting (your baseline is 62). This pattern has occurred in 3 of your last 5 budget meetings.',
    insightBg: 'var(--mantine-color-orange-0)',
    healthScore: 45,
    scoreLabel: 'Stress Level',
    isAlert: true,
    jsonData: {
      heart_rate_peak: 95,
      heart_rate_baseline: 62,
      heart_rate_increase_pct: 53,
      stress_detected: true,
      meeting_context: 'Q3 Budget Review',
      similar_events_30days: 3,
      hrv_during_meeting: 28,
      recovery_recommendation: '4-7-8 breathing',
    },
    mcpConnection: {
      server: 'oura-mcp-server',
      endpoint: '/v1/stress',
      method: 'GET',
      auth_type: 'OAuth 2.0 (stored locally)',
      response_time_ms: 112,
      data_encrypted: true,
      alert_triggered: true,
    },
  },
  {
    id: 'shopping',
    time: '5:30 PM',
    title: 'Quick Shopping',
    icon: IconShoppingCart,
    color: 'teal',
    sources: ['Apple Watch', 'Location'],
    sourceColors: ['blue', 'gray'],
    description: 'Steps tracked, grocery store detected',
    insight: 'You\'re at 8,100 steps! Based on your meal history, you\'ve been lower on omega-3s this week. Consider grabbing salmon and leafy greens.',
    insightBg: 'var(--mantine-color-green-0)',
    healthScore: 81,
    scoreLabel: 'Activity',
    jsonData: {
      steps_current: 8100,
      steps_goal: 10000,
      location: 'Whole Foods Market',
      nutrition_gaps: ['omega-3', 'leafy greens'],
      shopping_suggestions: ['salmon', 'spinach', 'kale'],
      walking_pace_mph: 2.8,
    },
    mcpConnection: {
      server: 'apple-health-mcp-server',
      endpoint: '/v1/activity',
      method: 'GET',
      auth_type: 'HealthKit (local)',
      response_time_ms: 52,
      data_encrypted: true,
    },
  },
  {
    id: 'dinner',
    time: '7:00 PM',
    title: 'Dinner at Home',
    icon: IconHome,
    color: 'pink',
    sources: ['BP Monitor', 'Apple Watch'],
    sourceColors: ['red', 'blue'],
    description: 'Evening vitals check',
    insight: 'Excellent dinner choice with the salmon! 🐟 Your post-dinner BP is 122/78—nicely recovered from the afternoon stress. You\'re at 9,450 steps!',
    insightBg: 'var(--mantine-color-teal-0)',
    healthScore: 88,
    scoreLabel: 'Recovery',
    isMeal: true,
    mealImage: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    mealDescription: 'Pan-seared salmon with roasted vegetables and quinoa',
    nutritionData: {
      calories: 650,
      protein_g: 45,
      carbs_g: 38,
      fat_g: 32,
      fiber_g: 9,
      sugar_g: 6,
      sodium_mg: 420,
      potassium_mg: 1100,
      omega_3_mg: 2800,
      vitamins: {
        vitamin_d: '95%',
        vitamin_b6: '65%',
        vitamin_c: '40%',
        magnesium: '35%',
      },
      health_score: 9.6,
      meal_tags: ['Omega-3 Rich', 'Complete Protein', 'Anti-inflammatory'],
    },
    jsonData: {
      blood_pressure: { systolic: 122, diastolic: 78 },
      stress_recovery: true,
      steps_current: 9450,
      steps_goal: 10000,
      steps_remaining: 550,
    },
    mcpConnection: {
      server: 'withings-mcp-server',
      endpoint: '/v1/bp/latest',
      method: 'GET',
      auth_type: 'API Key (encrypted local)',
      response_time_ms: 88,
      data_encrypted: true,
    },
  },
  {
    id: 'bedtime',
    time: '10:00 PM',
    title: 'Bedtime',
    icon: IconMoon,
    color: 'violet',
    sources: ['Oura Ring'],
    sourceColors: ['grape'],
    description: 'Day summary and sleep optimization',
    insight: 'Great day Maria! 📊 Final stats: 10,200 steps, one solid workout, and you managed stress well. Your evening HRV is recovering nicely. Aim for bed by 10:30.',
    insightBg: 'var(--mantine-color-violet-0)',
    healthScore: 95,
    scoreLabel: 'Day Score',
    jsonData: {
      steps_total: 10200,
      steps_goal_met: true,
      workouts_completed: 1,
      stress_events: 1,
      stress_recovered: true,
      evening_hrv: 45,
      recommended_bedtime: '10:30 PM',
      sleep_debt_hours: 0.5,
      weekly_trend: 'improving',
      cardiovascular_fitness: 'good',
    },
    mcpConnection: {
      server: 'oura-mcp-server',
      endpoint: '/v1/daily-summary',
      method: 'GET',
      auth_type: 'OAuth 2.0 (stored locally)',
      response_time_ms: 178,
      data_encrypted: true,
    },
  },
];

// Calculate cumulative health score
const calculateCumulativeScore = (selectedIndex) => {
  if (selectedIndex < 0) return 0;
  const items = timelineData.slice(0, selectedIndex + 1);
  const total = items.reduce((sum, item) => sum + item.healthScore, 0);
  return Math.round(total / items.length);
};

export default function CaseStudyHealthPage() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const handleIconClick = (index) => {
    setSelectedItem(index);
    setModalData(timelineData[index]);
    setModalOpen(true);
  };

  const cumulativeScore = calculateCumulativeScore(selectedItem);

  return (
    <Container size="lg" py="xl">
      {/* Data Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={
          <Group gap="sm">
            {modalData && (
              <>
                <ThemeIcon color={modalData.color} size="lg" radius="xl">
                  <modalData.icon size={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={700} size="lg">{modalData.time} - {modalData.title}</Text>
                  <Text size="xs" c="dimmed">MCP Data Flow Visualization</Text>
                </Box>
              </>
            )}
          </Group>
        }
        styles={{
          content: { maxWidth: '900px' },
          body: { padding: '20px' },
        }}
      >
        {modalData && (
          <Stack gap="lg">
            {/* MCP Flow Stepper */}
            <Paper p="md" withBorder radius="md" style={{ background: 'var(--mantine-color-gray-0)' }}>
              <Text fw={600} size="sm" mb="md">How MCP Retrieved This Data</Text>
              <Stepper active={3} size="sm" color={modalData.color}>
                <Stepper.Step 
                  icon={<IconDeviceWatch size={16} />}
                  label="Device"
                  description={modalData.sources.join(', ')}
                />
                <Stepper.Step 
                  icon={<IconLock size={16} />}
                  label="MCP Server"
                  description="Local auth"
                />
                <Stepper.Step 
                  icon={<IconDatabase size={16} />}
                  label="Data Request"
                  description={`${modalData.mcpConnection.response_time_ms}ms`}
                />
                <Stepper.Step 
                  icon={<IconBolt size={16} />}
                  label="AI Insight"
                  description="Generated"
                />
              </Stepper>
            </Paper>

            {/* Meal Section for food entries */}
            {modalData.isMeal && (
              <Paper p="md" withBorder radius="md" style={{ borderColor: 'var(--mantine-color-green-4)' }}>
                <Group gap="sm" mb="md">
                  <ThemeIcon color="green" size="lg" radius="xl">
                    <IconPhoto size={18} />
                  </ThemeIcon>
                  <Text fw={600}>Meal Logged</Text>
                </Group>
                
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <Image
                      src={modalData.mealImage}
                      alt={modalData.mealDescription}
                      radius="md"
                      h={180}
                      fit="cover"
                    />
                    <Text size="sm" c="dimmed" mt="xs" ta="center">
                      {modalData.mealDescription}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 7 }}>
                    <Paper p="sm" withBorder radius="md" style={{ background: 'var(--mantine-color-green-0)' }}>
                      <Group justify="space-between" mb="sm">
                        <Text fw={600} size="sm">Nutrition Analysis</Text>
                        <Badge color="green" variant="filled" size="lg">
                          Score: {modalData.nutritionData.health_score}/10
                        </Badge>
                      </Group>
                      
                      <SimpleGrid cols={2} spacing="xs" mb="sm">
                        <Box>
                          <Text size="xs" c="dimmed">Calories</Text>
                          <Text fw={600}>{modalData.nutritionData.calories}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Protein</Text>
                          <Text fw={600}>{modalData.nutritionData.protein_g}g</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Carbs</Text>
                          <Text fw={600}>{modalData.nutritionData.carbs_g}g</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">Fat</Text>
                          <Text fw={600}>{modalData.nutritionData.fat_g}g</Text>
                        </Box>
                      </SimpleGrid>

                      <Divider my="sm" />
                      
                      <Text size="xs" fw={600} mb="xs">Vitamins & Minerals</Text>
                      <SimpleGrid cols={2} spacing={4}>
                        {Object.entries(modalData.nutritionData.vitamins).map(([key, value]) => (
                          <Group key={key} gap="xs" justify="space-between">
                            <Text size="xs" c="dimmed" tt="capitalize">{key.replace('_', ' ')}</Text>
                            <Text size="xs" fw={500}>{value}</Text>
                          </Group>
                        ))}
                      </SimpleGrid>

                      <Divider my="sm" />
                      
                      <Group gap="xs">
                        {modalData.nutritionData.meal_tags.map((tag) => (
                          <Badge key={tag} size="xs" variant="light" color="green">
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Paper>
            )}

            {/* JSON Data Section */}
            <Paper p="md" withBorder radius="md">
              <Group gap="sm" mb="md">
                <ThemeIcon color="blue" size="lg" radius="xl">
                  <IconDatabase size={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={600}>Raw Health Data (JSON)</Text>
                  <Text size="xs" c="dimmed">Data collected from {modalData.sources.join(' & ')}</Text>
                </Box>
              </Group>
              <Code block style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(modalData.jsonData, null, 2)}
              </Code>
            </Paper>

            {/* MCP Connection Details */}
            <Paper p="md" withBorder radius="md" style={{ borderColor: 'var(--mantine-color-pink-4)' }}>
              <Group gap="sm" mb="md">
                <ThemeIcon color="pink" size="lg" radius="xl">
                  <IconPlug size={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={600}>MCP Connection Details</Text>
                  <Text size="xs" c="dimmed">Secure connection metadata</Text>
                </Box>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <Box>
                  <Text size="xs" c="dimmed">Server</Text>
                  <Code>{modalData.mcpConnection.server}</Code>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Endpoint</Text>
                  <Code>{modalData.mcpConnection.endpoint}</Code>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Method</Text>
                  <Badge variant="light">{modalData.mcpConnection.method}</Badge>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Response Time</Text>
                  <Badge color="green" variant="light">{modalData.mcpConnection.response_time_ms}ms</Badge>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Authentication</Text>
                  <Text size="sm">{modalData.mcpConnection.auth_type}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Encrypted</Text>
                  <Badge color={modalData.mcpConnection.data_encrypted ? 'green' : 'red'}>
                    {modalData.mcpConnection.data_encrypted ? 'Yes ✓' : 'No'}
                  </Badge>
                </Box>
              </SimpleGrid>
              
              {modalData.mcpConnection.alert_triggered && (
                <Alert color="orange" variant="light" mt="md" icon={<IconAlertTriangle size={16} />}>
                  <Text size="sm">Real-time alert triggered based on health threshold</Text>
                </Alert>
              )}
            </Paper>

            {/* AI Insight */}
            <Paper p="md" withBorder radius="md" style={{ background: modalData.insightBg }}>
              <Group gap="sm" mb="sm">
                <ThemeIcon color={modalData.color} size="lg" radius="xl">
                  <IconBolt size={18} />
                </ThemeIcon>
                <Text fw={600}>AI Generated Insight</Text>
              </Group>
              <Text size="sm" fs="italic">&quot;{modalData.insight}&quot;</Text>
            </Paper>
          </Stack>
        )}
      </Modal>

      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Text size="sm">Maria Chen Health Platform</Text>
      </Breadcrumbs>

      <Paper shadow="md" radius="lg" p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' }}>
        <Group gap="md" mb="md">
          <ThemeIcon color="pink" size={56} radius="xl">
            <IconHeart size={28} />
          </ThemeIcon>
          <Box>
            <Badge color="pink" variant="filled" size="lg" mb="xs">
              CASE STUDY
            </Badge>
            <Title order={1}>Maria Chen&apos;s Connected Health Platform</Title>
          </Box>
        </Group>
        <Text size="lg" c="dimmed">
          How MCP enables a truly personalized AI health assistant by securely 
          connecting multiple health devices and apps.
        </Text>
      </Paper>

      {/* Introduction */}
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Meet Maria Chen</Title>
        <Text size="md" mb="md">
          Maria is a 45-year-old marketing executive who wants to optimize her health. 
          She uses multiple devices and apps to track different aspects of her wellness, 
          but the data lives in silos—until now.
        </Text>
        <Text size="md" mb="md">
          With <Text span fw={600}>Model Context Protocol (MCP)</Text>, Maria&apos;s AI assistant 
          can securely connect to all her health data sources and provide unified, contextual 
          insights throughout her day—without ever exposing her credentials or sensitive health information.
        </Text>
      </Paper>

      {/* What MCP Can Do for Maria */}
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">What MCP Enables for Maria</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="blue" size="lg" radius="xl">
                <IconPill size={18} />
              </ThemeIcon>
              <Text fw={600}>Medication Reminders</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Contextual reminders based on her schedule, meals, and activity level
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="orange" size="lg" radius="xl">
                <IconActivity size={18} />
              </ThemeIcon>
              <Text fw={600}>Exercise Optimization</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Adjust workout intensity based on sleep quality and recovery metrics
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="red" size="lg" radius="xl">
                <IconHeartRateMonitor size={18} />
              </ThemeIcon>
              <Text fw={600}>BP Monitoring</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Correlate blood pressure with stress, activity, and sleep patterns
            </Text>
          </Paper>
          <Paper p="md" withBorder radius="md">
            <Group gap="sm" mb="xs">
              <ThemeIcon color="green" size="lg" radius="xl">
                <IconBuildingSkyscraper size={18} />
              </ThemeIcon>
              <Text fw={600}>Location Awareness</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Know when she&apos;s at work, home, or gym to provide relevant insights
            </Text>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* Maria's Connected Devices */}
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">Maria&apos;s Connected Devices &amp; Apps</Title>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="md">
          <Paper p="md" withBorder radius="md" style={{ textAlign: 'center' }}>
            <ThemeIcon color="grape" size={48} radius="xl" mb="sm" mx="auto">
              <IconDeviceWatch size={24} />
            </ThemeIcon>
            <Text size="sm" fw={600}>Oura Ring</Text>
            <Text size="xs" c="dimmed">Sleep, HRV, recovery scores, activity</Text>
          </Paper>
          <Paper p="md" withBorder radius="md" style={{ textAlign: 'center' }}>
            <ThemeIcon color="orange" size={48} radius="xl" mb="sm" mx="auto">
              <IconActivity size={24} />
            </ThemeIcon>
            <Text size="sm" fw={600}>Strava</Text>
            <Text size="xs" c="dimmed">Running, cycling, workout logs</Text>
          </Paper>
          <Paper p="md" withBorder radius="md" style={{ textAlign: 'center' }}>
            <ThemeIcon color="red" size={48} radius="xl" mb="sm" mx="auto">
              <IconHeartRateMonitor size={24} />
            </ThemeIcon>
            <Text size="sm" fw={600}>Withings BP Monitor</Text>
            <Text size="xs" c="dimmed">Blood pressure readings</Text>
          </Paper>
          <Paper p="md" withBorder radius="md" style={{ textAlign: 'center' }}>
            <ThemeIcon color="blue" size={48} radius="xl" mb="sm" mx="auto">
              <IconDeviceWatch size={24} />
            </ThemeIcon>
            <Text size="sm" fw={600}>Apple Watch</Text>
            <Text size="xs" c="dimmed">Steps, heart rate, workouts</Text>
          </Paper>
        </SimpleGrid>

        <Alert icon={<IconPlug size={16} />} color="pink" variant="light">
          <Text size="sm">
            Each device has its own MCP server that handles authentication locally. 
            The AI assistant requests data through MCP—it never sees API keys or OAuth tokens.
          </Text>
        </Alert>
      </Paper>

      {/* Security Comparison */}
      <Paper p="lg" withBorder radius="md" mb="xl" style={{ borderColor: 'var(--mantine-color-orange-4)' }}>
        <Title order={3} mb="md">Security: Traditional vs MCP Approach</Title>
        <Text size="md" mb="md">
          Connecting AI to Maria&apos;s sensitive health data requires careful security. 
          Here&apos;s how MCP differs from traditional approaches:
        </Text>
        
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="md">
          <Paper p="md" withBorder radius="md" style={{ background: 'var(--mantine-color-red-0)', borderColor: 'var(--mantine-color-red-3)' }}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="red" size="lg" radius="xl">
                <IconX size={18} />
              </ThemeIcon>
              <Text fw={700} c="red.7">Traditional (Risky)</Text>
            </Group>
            <List size="sm" spacing="sm" icon={<ThemeIcon color="red" size={20} radius="xl"><IconAlertTriangle size={12} /></ThemeIcon>}>
              <List.Item>Paste Oura API key into ChatGPT</List.Item>
              <List.Item>Share Strava OAuth token in prompts</List.Item>
              <List.Item>Credentials visible in chat history</List.Item>
              <List.Item>No way to revoke AI access</List.Item>
              <List.Item>Data exposure if chat is leaked</List.Item>
            </List>
          </Paper>
          
          <Paper p="md" withBorder radius="md" style={{ background: 'var(--mantine-color-green-0)', borderColor: 'var(--mantine-color-green-3)' }}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="green" size="lg" radius="xl">
                <IconShield size={18} />
              </ThemeIcon>
              <Text fw={700} c="green.7">With MCP (Secure)</Text>
            </Group>
            <List size="sm" spacing="sm" icon={<ThemeIcon color="green" size={20} radius="xl"><IconCheck size={12} /></ThemeIcon>}>
              <List.Item>Credentials stored locally, encrypted</List.Item>
              <List.Item>AI only sees health data, not keys</List.Item>
              <List.Item>Full audit log of every request</List.Item>
              <List.Item>Revoke access with one click</List.Item>
              <List.Item>HIPAA-compliant architecture</List.Item>
            </List>
          </Paper>
        </SimpleGrid>

        <Alert icon={<IconLock size={16} />} color="blue" variant="light">
          <Text size="sm">
            <Text span fw={600}>Key insight:</Text> MCP servers run on Maria&apos;s own devices. 
            Her health data flows from device → MCP server → AI, with credentials never leaving her machine.
          </Text>
        </Alert>
      </Paper>

      {/* A Day in Maria's Life Timeline */}
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">A Day in Maria&apos;s Life: AI-Powered Health Insights</Title>
        <Text size="md" c="dimmed" mb="lg">
          Click on any time icon to see the data collected and MCP connection details.
          Watch how the AI builds a comprehensive health picture throughout the day.
        </Text>

        <Grid gutter="xl">
          {/* Timeline Column */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box>
              {timelineData.map((item, index) => {
                const isSelected = selectedItem === index;
                const ItemIcon = item.icon;
                
                return (
                  <Box
                    key={item.id}
                    mb="lg"
                    style={{
                      opacity: isSelected ? 1 : 0.4,
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1)' : 'scale(0.98)',
                    }}
                  >
                    <Group align="flex-start" gap="md">
                      {/* Glowing Icon */}
                      <Box
                        onClick={() => handleIconClick(index)}
                        style={{
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <ThemeIcon
                          color={item.color}
                          size={48}
                          radius="xl"
                          style={{
                            boxShadow: isSelected 
                              ? `0 0 20px var(--mantine-color-${item.color}-4), 0 0 40px var(--mantine-color-${item.color}-2)`
                              : 'none',
                            animation: isSelected ? 'glow 2s ease-in-out infinite alternate' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ItemIcon size={24} />
                        </ThemeIcon>
                        {/* Connecting line */}
                        {index < timelineData.length - 1 && (
                          <Box
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '100%',
                              width: '2px',
                              height: '60px',
                              background: `var(--mantine-color-${item.color}-3)`,
                              opacity: isSelected ? 0.8 : 0.3,
                              transform: 'translateX(-50%)',
                            }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" mb="xs">
                          <Text fw={700} size="lg">{item.time}</Text>
                          <Text fw={600} size="lg" c={isSelected ? undefined : 'dimmed'}>
                            - {item.title}
                          </Text>
                          {item.isAlert && (
                            <Badge color="orange" variant="filled" size="sm">Alert</Badge>
                          )}
                          {item.isMeal && (
                            <Badge color="green" variant="light" size="sm">Meal</Badge>
                          )}
                        </Group>
                        
                        <Group gap="xs" mb="xs">
                          {item.sources.map((source, i) => (
                            <Badge 
                              key={source} 
                              size="xs" 
                              color={item.sourceColors[i]} 
                              variant="light"
                            >
                              {source}
                            </Badge>
                          ))}
                        </Group>
                        
                        <Text size="sm" c="dimmed" mb="xs">{item.description}</Text>
                        
                        <Paper 
                          p="sm" 
                          withBorder 
                          radius="md" 
                          style={{ 
                            background: item.insightBg,
                            opacity: isSelected ? 1 : 0.7,
                          }}
                        >
                          <Text size="sm" fs="italic">
                            &quot;{item.insight}&quot;
                          </Text>
                        </Paper>

                        {isSelected && (
                          <Button 
                            variant="light" 
                            color={item.color} 
                            size="xs" 
                            mt="sm"
                            onClick={() => {
                              setModalData(item);
                              setModalOpen(true);
                            }}
                            rightSection={<IconArrowRight size={14} />}
                          >
                            View Data &amp; MCP Details
                          </Button>
                        )}
                      </Box>
                    </Group>
                  </Box>
                );
              })}
            </Box>
          </Grid.Col>

          {/* Scorecard Column */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper 
              p="lg" 
              withBorder 
              radius="md" 
              style={{ 
                position: 'sticky', 
                top: '20px',
                background: 'linear-gradient(135deg, var(--mantine-color-pink-0) 0%, var(--mantine-color-violet-0) 100%)',
              }}
            >
              <Title order={4} mb="md" ta="center">Health Score</Title>
              
              <Box ta="center" mb="lg">
                <RingProgress
                  size={160}
                  thickness={12}
                  roundCaps
                  sections={[{ value: cumulativeScore, color: cumulativeScore >= 80 ? 'green' : cumulativeScore >= 60 ? 'yellow' : 'orange' }]}
                  label={
                    <Text ta="center" fw={700} size="xl">
                      {cumulativeScore}
                    </Text>
                  }
                />
                <Text size="sm" c="dimmed" mt="xs">Cumulative Score</Text>
              </Box>

              <Divider mb="md" />

              <Text size="sm" fw={600} mb="sm">Current Activity</Text>
              <Paper p="sm" withBorder radius="md" mb="md" style={{ background: 'white' }}>
                <Group gap="sm">
                  <ThemeIcon color={timelineData[selectedItem].color} size="md" radius="xl">
                    {React.createElement(timelineData[selectedItem].icon, { size: 16 })}
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" fw={600}>{timelineData[selectedItem].title}</Text>
                    <Text size="xs" c="dimmed">{timelineData[selectedItem].time}</Text>
                  </Box>
                </Group>
              </Paper>

              <Text size="sm" fw={600} mb="sm">{timelineData[selectedItem].scoreLabel}</Text>
              <Progress 
                value={timelineData[selectedItem].healthScore} 
                color={timelineData[selectedItem].healthScore >= 80 ? 'green' : timelineData[selectedItem].healthScore >= 60 ? 'yellow' : 'orange'}
                size="lg"
                radius="xl"
                mb="xs"
              />
              <Text size="xs" c="dimmed" ta="center">
                {timelineData[selectedItem].healthScore}/100
              </Text>

              <Divider my="md" />

              <Text size="sm" fw={600} mb="sm">Data Sources Used</Text>
              <Group gap="xs">
                {timelineData[selectedItem].sources.map((source, i) => (
                  <Badge 
                    key={source} 
                    size="sm" 
                    color={timelineData[selectedItem].sourceColors[i]} 
                    variant="filled"
                  >
                    {source}
                  </Badge>
                ))}
              </Group>

              <Divider my="md" />

              <Text size="xs" c="dimmed" ta="center">
                Click timeline icons to explore each moment
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* CSS for glow animation */}
        <style>{`
          @keyframes glow {
            from {
              box-shadow: 0 0 10px var(--mantine-color-pink-3), 0 0 20px var(--mantine-color-pink-2);
            }
            to {
              box-shadow: 0 0 20px var(--mantine-color-pink-4), 0 0 40px var(--mantine-color-pink-3);
            }
          }
        `}</style>
      </Paper>

      {/* MCP Architecture */}
      <Paper p="lg" withBorder radius="md" mb="xl">
        <Title order={3} mb="md">How It Works: MCP Architecture</Title>
        <Text size="md" mb="md">
          Maria&apos;s setup uses four MCP servers, each handling one data source:
        </Text>
        
        <Box mb="md" p="md" style={{ background: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">MCP Server 1</Text>
              <Text fw={600} size="sm">Oura</Text>
              <Text size="xs" c="dimmed">Sleep, HRV, Activity</Text>
            </Paper>
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">MCP Server 2</Text>
              <Text fw={600} size="sm">Strava</Text>
              <Text size="xs" c="dimmed">Workouts, Routes</Text>
            </Paper>
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">MCP Server 3</Text>
              <Text fw={600} size="sm">Withings</Text>
              <Text size="xs" c="dimmed">BP Readings</Text>
            </Paper>
            <Paper p="sm" withBorder radius="md" style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">MCP Server 4</Text>
              <Text fw={600} size="sm">Apple Health</Text>
              <Text size="xs" c="dimmed">Steps, HR</Text>
            </Paper>
          </SimpleGrid>
        </Box>

        <Text size="sm" c="dimmed" mb="md">
          All services run locally on Maria&apos;s machine. The AI assistant (Claude) connects 
          to each service through the MCP protocol, requesting only the specific data needed 
          for each insight.
        </Text>
      </Paper>

      {/* Key Takeaways */}
      <Alert icon={<IconKey size={16} />} color="green" variant="light" mb="xl">
        <Title order={4} mb="sm">Key Takeaways</Title>
        <List size="sm" spacing="xs">
          <List.Item>MCP enables unified health insights across multiple data sources</List.Item>
          <List.Item>Credentials never leave Maria&apos;s device—AI only sees the health data</List.Item>
          <List.Item>Contextual awareness (time, location, activity) makes insights actionable</List.Item>
          <List.Item>Pattern recognition across days/weeks reveals trends invisible in single-app views</List.Item>
          <List.Item>Maria maintains full control and can revoke AI access instantly</List.Item>
        </List>
      </Alert>

      {/* Navigation */}
      <Divider my="xl" />
      <Group justify="space-between">
        <Button
          component={Link}
          to="/case-study"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
        >
          Pape Machinery Case Study
        </Button>
        <Button
          component={Link}
          to="/ai-setup/mcp"
          variant="light"
          color="pink"
        >
          Learn About MCP →
        </Button>
      </Group>
    </Container>
  );
}
