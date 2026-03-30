import { AppShell, Burger, Group, NavLink, Title, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const deliverables = [
  {
    due: 'April 10',
    items: [
      { label: 'Review Lithia Investor Report', path: '/training', step: 0 },
      { label: 'Conduct Market Research', path: '/training', step: 1 },
    ],
  },
  {
    due: 'April 17',
    items: [
      { label: 'Review with Lithia Leaders', path: '/training', step: 2 },
      { label: 'Create Business Case', path: '/training', step: 3 },
      { label: 'Build Team Discussion Pack', path: '/training', step: 4 },
    ],
  },
  {
    due: 'May 1',
    items: [
      { label: 'Align Product Understanding', path: '/training', step: 5 },
      { label: 'Apply Innovation Framework', path: '/training', step: 6 },
      { label: 'Create Core Team Artifacts', path: '/training', step: 7 },
      { label: 'Industry Fit & Prioritization', path: '/training', step: 8 },
    ],
  },
];

const topLevelLinks = [
  { label: 'Foundations Review', path: '/foundations' },
];

const sectionLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#444',
  marginBottom: '6px',
  marginTop: '4px',
};

export default function Layout() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 260, breakpoint: 'xs', collapsed: { desktop: !opened } }}
      padding="md"
      styles={{
        navbar: { width: 260 },
      }}
    >
      <AppShell.Header style={{ background: '#007030', borderBottom: 'none' }}>
        <Group h="100%" px="lg" gap="md">
          <Burger opened={opened} onClick={toggle} size="md" color="#FEE11A" />
          <div>
            <Text size="xs" fw={800} tt="uppercase" lh={1} style={{ color: '#FEE11A', letterSpacing: '0.08em' }}>
              University of Oregon Product Studio
            </Text>
            <Title order={3} lh={1.2} style={{ color: '#fff', fontSize: '1.25rem' }}>Business Foundations Prompt Guide</Title>
          </div>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ overflowY: 'auto' }}>
        <Stack gap={0}>
          {/* Home link */}
          <NavLink
            label="Home"
            active={location.pathname === '/training' && !location.search}
            onClick={() => { navigate('/training'); }}
            fw={700}
            fz="sm"
            variant="subtle"
            mb={12}
            pl={0}
            style={{ borderRadius: 6 }}
          />

          {/* Section heading */}
          <div style={sectionLabelStyle}>Product Design</div>

          {deliverables.map((group, gi) => (
            <div key={group.due} style={{ marginBottom: 12 }}>
              {/* Date label — plain text */}
              <Text size="xs" fw={600} c="dimmed" mb={4} pl={4}>
                {group.due}
              </Text>
              {/* Indented links */}
              {group.items.map((item, ii) => (
                <NavLink
                  key={`${gi}-${ii}`}
                  label={item.label}
                  active={location.pathname.startsWith(item.path)}
                  onClick={() => { navigate(`${item.path}?step=${item.step}`); }}
                  fw={500}
                  fz="sm"
                  variant="subtle"
                  mb={1}
                  pl={16}
                  style={{ borderRadius: 6 }}
                />
              ))}
            </div>
          ))}

          {/* Top-level links */}
          {topLevelLinks.map((link) => (
            <div key={link.path}>
              <div
                style={{ ...sectionLabelStyle, marginTop: 16, cursor: 'pointer' }}
                onClick={() => { navigate(link.path); }}
              >
                {link.label}
              </div>
            </div>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: '#fff' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
