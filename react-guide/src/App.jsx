import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import ReadingProgress from './components/ReadingProgress';
import {
  MantineProvider,
  AppShell,
  Text,
  NavLink,
  Group,
  Box,
  Divider,
  Container,
  Collapse,
} from '@mantine/core';
import {
  IconFileText,
  IconServer,
  IconShieldCheck,
  IconScale,
  IconDatabase,
  IconHome,
  IconBulb,
  IconCode,
  IconWand,
  IconCloud,
  IconBrandAws,
  IconTerminal2,
  IconBuildingFactory2,
} from '@tabler/icons-react';
import { modules } from './data/modules';
import HomePage from './pages/HomePage';
import ModulePage from './pages/ModulePage';
import LoginPage from './pages/LoginPage';
import DataSpecsPage from './pages/modules/DataSpecsPage';
import AISetupPage from './pages/modules/AISetupPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserMenu from './components/UserMenu';
import uoLogo from './static/uo-logo.svg';
import './index.css';

// Module 1 sub-navigation items
const module1SubPages = [
  { id: 'why-data-matters', title: 'Why Data Matters', icon: IconBulb },
  { id: 'creating-specs', title: 'Creating Specs', icon: IconCode },
  { id: 'prompt-to-spec', title: 'Prompt to Spec', icon: IconWand },
];

// AI Setup sub-navigation items
const aiSetupSubPages = [
  { id: 'aws-account', title: 'AWS Account Setup', icon: IconCloud },
  { id: 'bedrock', title: 'AWS Bedrock', icon: IconBrandAws },
  { id: 'local-llm', title: 'Local LLM', icon: IconTerminal2 },
  { id: 'sagemaker', title: 'AWS SageMaker', icon: IconServer },
];

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconServer,
  'module-3': IconShieldCheck,
  'module-4': IconScale,
  'module-5': IconDatabase,
  'case-study': IconBuildingFactory2,
};

function AppLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <AppShell padding="md" navbar={{ width: 280, breakpoint: 'sm' }} footer={{ height: 80 }}>
      <AppShell.Navbar p="md" className="app-navbar">
        <Group justify="space-between" align="flex-start" mb="lg">
          <Box>
            <Text size="lg" fw={700} c="white" lh={1.2}>
              University of Oregon
            </Text>
            <Text size="sm" c="yellow" lh={1.2}>
              Lundquist College of Business
            </Text>
          </Box>
          <UserMenu />
        </Group>
        <Divider color="rgba(254, 225, 26, 0.3)" mb="md" />

        <NavLink
          component={Link}
          to="/"
          label="Home"
          leftSection={<IconHome size={20} stroke={1.5} />}
          mb="xs"
          className="nav-link"
          active={location.pathname === '/'}
        />

        <Text size="xs" tt="uppercase" fw={700} c="yellow" mb="xs" mt="md">
          Course Modules
        </Text>
        {modules.map((mod) => {
          const Icon = moduleIcons[mod.id];
          const isActive = location.pathname === `/${mod.id}` || location.pathname.startsWith(`/${mod.id}/`);
          
          // Special handling for Module 1 with sub-navigation
          if (mod.id === 'module-1') {
            return (
              <Box key={mod.id}>
                <NavLink
                  label={mod.title}
                  component={Link}
                  to={`/${mod.id}`}
                  leftSection={<Icon size={20} stroke={1.5} />}
                  mb="xs"
                  className="nav-link"
                  active={isActive}
                />
                <Collapse in={isActive}>
                  <Box ml="xl" className="sub-nav-container">
                    {module1SubPages.map((subPage) => {
                      const SubIcon = subPage.icon;
                      const isSubActive = location.pathname === `/module-1/${subPage.id}`;
                      return (
                        <NavLink
                          key={subPage.id}
                          label={subPage.title}
                          component={Link}
                          to={`/module-1/${subPage.id}`}
                          leftSection={<SubIcon size={16} stroke={1.5} />}
                          mb={4}
                          className="nav-link sub-nav-link"
                          active={isSubActive}
                        />
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          }
          
          return (
            <NavLink
              key={mod.id}
              label={mod.title}
              component={Link}
              to={`/${mod.id}`}
              leftSection={<Icon size={20} stroke={1.5} />}
              mb="xs"
              className="nav-link"
              active={isActive}
            />
          );
        })}

        <Text size="xs" tt="uppercase" fw={700} c="yellow" mb="xs" mt="md">
          AI Environment
        </Text>
        <Box>
          <NavLink
            label="AI Setup"
            component={Link}
            to="/ai-setup"
            leftSection={<IconCloud size={20} stroke={1.5} />}
            mb="xs"
            className="nav-link"
            active={location.pathname.startsWith('/ai-setup')}
          />
          <Collapse in={location.pathname.startsWith('/ai-setup')}>
            <Box ml="xl" className="sub-nav-container">
              {aiSetupSubPages.map((subPage) => {
                const SubIcon = subPage.icon;
                const isSubActive = location.pathname === `/ai-setup/${subPage.id}`;
                return (
                  <NavLink
                    key={subPage.id}
                    label={subPage.title}
                    component={Link}
                    to={`/ai-setup/${subPage.id}`}
                    leftSection={<SubIcon size={16} stroke={1.5} />}
                    mb={4}
                    className="nav-link sub-nav-link"
                    active={isSubActive}
                  />
                );
              })}
            </Box>
          </Collapse>
        </Box>
      </AppShell.Navbar>
      <AppShell.Main style={{ paddingTop: 56 }}>
        <ReadingProgress />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/module-1"
            element={
              <ProtectedRoute>
                <DataSpecsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/module-1/:subPage"
            element={
              <ProtectedRoute>
                <DataSpecsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-setup"
            element={
              <ProtectedRoute>
                <AISetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-setup/:subPage"
            element={
              <ProtectedRoute>
                <AISetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:moduleId"
            element={
              <ProtectedRoute>
                <ModulePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppShell.Main>
      <AppShell.Footer p="md" className="app-footer">
        <Container size="lg">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Box>
              <Text size="sm" c="white">
                © 2026 University of Oregon. All Rights Reserved.
              </Text>
            </Box>
            <img
              src={uoLogo}
              alt="University of Oregon Logo"
              className="footer-logo"
            />
          </Group>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}

export default function App() {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'green',
        colors: {
          green: [
            '#e6f4ed',
            '#cce9db',
            '#99d3b7',
            '#66bd93',
            '#33a76f',
            '#007030',
            '#005a26',
            '#00431d',
            '#002d13',
            '#00160a',
          ],
          yellow: [
            '#fffce6',
            '#fff9cc',
            '#fff399',
            '#ffed66',
            '#fee733',
            '#FEE11A',
            '#cbb415',
            '#988710',
            '#655a0a',
            '#322d05',
          ],
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}
