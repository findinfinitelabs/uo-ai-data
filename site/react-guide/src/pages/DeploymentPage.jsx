import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Breadcrumbs,
  Anchor,
  Text,
} from '@mantine/core';
import DeploymentGuideContent from './modules/ai-setup/DeploymentGuideContent';

export default function DeploymentPage() {
  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Text size="sm">AWS Environment Setup</Text>
      </Breadcrumbs>
      
      <DeploymentGuideContent />
    </Container>
  );
}
