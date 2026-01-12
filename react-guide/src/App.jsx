import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
} from '@tabler/icons-react';
import { modules } from './data/modules';
import HomePage from './pages/HomePage';
import ModulePage from './pages/ModulePage';
import DataSpecsPage from './pages/modules/DataSpecsPage';
import uoLogo from './static/uo-logo.svg';
import './index.css';

// Module 1 sub-navigation items
const module1SubPages = [
  { id: 'why-data-matters', title: 'Why Data Matters', icon: IconBulb },
  { id: 'creating-specs', title: 'Creating Specs', icon: IconCode },
  { id: 'prompt-to-spec', title: 'Prompt to Spec', icon: IconWand },
];

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconServer,
  'module-3': IconShieldCheck,
  'module-4': IconScale,
  'module-5': IconDatabase,
};

function AppLayout() {
  const location = useLocation();

  return (
    <AppShell padding="md" navbar={{ width: 280, breakpoint: 'sm' }} footer={{ height: 80 }}>
      <AppShell.Navbar p="md" className="app-navbar">
        <Box mb="lg">
          <Text size="lg" fw={700} c="white" lh={1.2}>
            University of Oregon
          </Text>
          <Text size="sm" c="yellow" lh={1.2}>
            Lundquist College of Business
          </Text>
        </Box>
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
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/module-1" element={<DataSpecsPage />} />
          <Route path="/module-1/:subPage" element={<DataSpecsPage />} />
          <Route path="/:moduleId" element={<ModulePage />} />
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
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </MantineProvider>
  );
}
