import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Badge, Group, Text, Progress } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import pageConfig from '../data/pageConfig.json';

function ReadingProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Find page config for current path
    const currentPage = pageConfig.pages.find(p => p.path === location.pathname);
    
    // Use config time or calculate from word count
    const getEstimatedTime = () => {
      if (currentPage?.estimatedMinutes) {
        return currentPage.estimatedMinutes;
      }
      // Fallback: calculate from content
      const content = document.querySelector('main') || document.body;
      const text = content.innerText || content.textContent;
      const words = text.trim().split(/\s+/).length;
      return Math.ceil(words / 220);
    };

    const totalMinutes = getEstimatedTime();
    setEstimatedTime(totalMinutes);
    setTimeRemaining(totalMinutes);

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
        left: 280,
        right: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <Group justify="space-between" align="center" px="md" py={8}>
        <Box style={{ flex: 1, maxWidth: 'calc(100% - 130px)' }}>
          <Progress
            value={progress}
            size="md"
            radius="xl"
            color="#007030"
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
