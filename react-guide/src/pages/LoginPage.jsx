import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  ThemeIcon,
  Stack,
  Alert,
  Box,
  Center,
  Loader,
  TextInput,
  PasswordInput,
} from '@mantine/core';
import {
  IconLock,
  IconAlertCircle,
  IconSchool,
  IconUser,
  IconKey,
} from '@tabler/icons-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { signInWithCode, loading, error, isAuthenticated, clearError } =
    useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" color="green" />
      </Center>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await signInWithCode(accessCode, studentName);
    setSubmitting(false);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(64, 192, 87, 0.1) 0%, rgba(34, 139, 230, 0.1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size={420} py="xl">
        <Paper radius="lg" p="xl" withBorder shadow="xl">
          <form onSubmit={handleSubmit}>
            <Stack align="center" gap="md">
              {/* Logo/Header */}
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: 'green', to: 'teal', deg: 135 }}
              >
                <IconSchool size={40} />
              </ThemeIcon>

              <Title order={2} ta="center">
                UO Healthcare AI
              </Title>

              <Text c="dimmed" size="sm" ta="center">
                Lundquist College of Business
                <br />
                AI for Healthcare Data Course
              </Text>

              <Box w="100%" my="md">
                <Group gap="xs" mb="xs">
                  <ThemeIcon size={20} color="green" variant="light" radius="xl">
                    <IconLock size={12} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    Course Access Required
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Enter your name and the course access code provided by your
                  instructor to access course materials.
                </Text>
              </Box>

              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  w="100%"
                  withCloseButton
                  onClose={clearError}
                >
                  {error}
                </Alert>
              )}

              <TextInput
                w="100%"
                label="Your Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={16} />}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />

              <PasswordInput
                w="100%"
                label="Access Code"
                placeholder="Enter course access code"
                leftSection={<IconKey size={16} />}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />

              <Button
                fullWidth
                size="lg"
                color="green"
                type="submit"
                loading={submitting}
                style={{ marginTop: 16 }}
              >
                Access Course Materials
              </Button>

              <Text size="xs" c="dimmed" ta="center" mt="sm">
                By signing in, you agree to the course policies and academic
                integrity guidelines.
              </Text>
            </Stack>
          </form>
        </Paper>

        <Text size="xs" c="dimmed" ta="center" mt="xl">
          © {new Date().getFullYear()} University of Oregon
          <br />
          Lundquist College of Business
        </Text>
      </Container>
    </Box>
  );
};

export default LoginPage;
