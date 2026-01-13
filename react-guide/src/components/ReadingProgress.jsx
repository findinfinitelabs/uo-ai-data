import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Badge, Group, Text, Progress } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

function ReadingProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Calculate estimated reading time based on page content
    const calculateReadingTime = () => {
      const content = document.querySelector('main') || document.body;
      const text = content.innerText || content.textContent;
      const words = text.trim().split(/\s+/).length;
      // Average reading speed: 200-250 words per minute
      const minutes = Math.ceil(words / 220);
      setEstimatedTime(minutes);
      return minutes;
    };

    const totalMinutes = calculateReadingTime();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
      
      // Calculate remaining time based on progress
      const remaining = Math.ceil(totalMinutes * (1 - scrollPercent / 100));
      setTimeRemaining(Math.max(remaining, 0));
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  // Recalculate on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      const content = document.querySelector('main') || document.body;
      const text = content.innerText || content.textContent;
      const words = text.trim().split(/\s+/).length;
      const minutes = Math.ceil(words / 220);
      setEstimatedTime(minutes);
      setTimeRemaining(minutes);
      setProgress(0);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const formatTime = (minutes) => {
    if (minutes <= 0) return 'Done!';
    if (minutes === 1) return '1 min left';
    return `${minutes} min left`;
  };

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Group justify="space-between" align="center" px="md" py={6}>
        <Box style={{ flex: 1, maxWidth: 'calc(100% - 120px)' }}>
          <Progress
            value={progress}
            size="sm"
            radius="xl"
            color={progress >= 100 ? 'green' : 'blue'}
            animated={progress > 0 && progress < 100}
            style={{ transition: 'all 0.3s ease' }}
          />
        </Box>
        <Badge
          variant="light"
          color={progress >= 100 ? 'green' : 'gray'}
          size="md"
          leftSection={<IconClock size={12} />}
          style={{ flexShrink: 0 }}
        >
          {progress >= 100 ? (
            <Text span size="xs" fw={500}>Complete!</Text>
          ) : (
            <Text span size="xs" fw={500}>
              {timeRemaining > 0 ? formatTime(timeRemaining) : `~${estimatedTime} min`}
            </Text>
          )}
        </Badge>
      </Group>
    </Box>
  );
}

export default ReadingProgress;
