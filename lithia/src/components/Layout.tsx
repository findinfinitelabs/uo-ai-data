import { AppShell, Burger, Group, NavLink, Title, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useNotesFs } from '../context/useNotesFs';

const deliverables = [
  {
    due: 'April 10',
    items: [
      { label: 'Review Lithia Investor Report', path: '/training', search: '?step=0' },
      { label: 'Conduct Market Research', path: '/training', search: '?step=1' },
    ],
  },
  {
    due: 'April 17',
    items: [
      { label: 'Review with Lithia Leaders', path: '/training', search: '?step=2' },
      { label: 'Create Business Case', path: '/training', search: '?step=3' },
    ],
  },
  {
    due: 'May 1',
    items: [
      { label: 'Build Team Discussion Pack', path: '/training', search: '?step=4' },
      { label: 'Align Product Understanding', path: '/training', search: '?step=5' },
      { label: 'Apply Innovation Framework', path: '/training', search: '?step=6' },
      { label: 'Create Core Team Artifacts', path: '/training', search: '?step=7' },
      { label: 'Industry Fit & Prioritization', path: '/training', search: '?step=8' },
    ],
  },
];

export default function Layout() {
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { status, dirName, pickFolder, reconnect } = useNotesFs();

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 260, breakpoint: 'xs', collapsed: { desktop: !opened } }}
      padding="xs"
      styles={{
        navbar: { width: 260 },
      }}
    >
      <AppShell.Header style={{ background: '#007030', borderBottom: 'none' }}>
        <Group h="100%" px="lg" gap="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} size="md" color="#FEE11A" />
            <div>
              <Text size="xs" fw={800} tt="uppercase" lh={1} style={{ color: '#FEE11A', letterSpacing: '0.08em' }}>
                University of Oregon Product Studio
              </Text>
              <Title order={3} lh={1.2} style={{ color: '#fff', fontSize: '1.25rem' }}>Business Foundations Prompt Guide</Title>
            </div>
          </Group>

          {/* Notes folder connector */}
          {status !== 'unavailable' && (
            <button
              className={`header-folder-btn header-folder-btn--${status}`}
              onClick={status === 'needs-permission' ? reconnect : status === 'connected' ? undefined : pickFolder}
              disabled={status === 'connected'}
              title={
                status === 'connected'
                  ? `Notes auto-saving to: ${dirName}`
                  : status === 'needs-permission'
                  ? 'Click to reconnect notes folder'
                  : 'Click to connect a save folder for notes'
              }
            >
              {status === 'connected'
                ? `📁 ${dirName}`
                : status === 'needs-permission'
                ? '🔓 Reconnect Folder'
                : '📂 Connect Notes Folder'}
            </button>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ overflowY: 'auto' }}>
        <Stack gap={0}>
          {/* Home link */}
          <NavLink
            label={<span className="nav-section-label">Home</span>}
            active={location.pathname === '/training' && !location.search}
            onClick={() => { navigate('/training'); }}
            variant="subtle"
            mb={4}
            style={{ borderRadius: 6 }}
          />

          {/* Business Design — training steps */}
          <NavLink
            label={<span className="nav-section-label">Business Design</span>}
            defaultOpened
            variant="subtle"
            style={{ borderRadius: 6 }}
            childrenOffset={12}
          >
            {deliverables.map((group, gi) => (
              <NavLink
                key={group.due}
                label={<Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#555' }}>{group.due}</Text>}
                defaultOpened
                variant="subtle"
                style={{ borderRadius: 6 }}
                childrenOffset={12}
              >
                {group.items.map((item, ii) => (
                  <NavLink
                    key={`${gi}-${ii}`}
                    label={item.label}
                    active={location.search === item.search && location.pathname === item.path}
                    onClick={() => { navigate(`${item.path}${item.search}`); }}
                    fw={500}
                    fz="sm"
                    variant="subtle"
                    mb={1}
                    style={{ borderRadius: 6 }}
                  />
                ))}
              </NavLink>
            ))}
          </NavLink>

          {/* Product Design — May 1 subnav with all 3 design phases */}
          <NavLink
            label={<span className="nav-section-label">Product Design</span>}
            defaultOpened
            variant="subtle"
            mt={4}
            style={{ borderRadius: 6 }}
            childrenOffset={12}
          >
            <NavLink
              label={<Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#555' }}>May 1</Text>}
              defaultOpened
              variant="subtle"
              style={{ borderRadius: 6 }}
              childrenOffset={12}
            >
              <NavLink
                label="Design Together in Class"
                active={location.pathname === '/design' && location.search === '?phase=0'}
                onClick={() => { navigate('/design?phase=0'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
              <NavLink
                label="Build with Lovable or Base44"
                active={location.pathname === '/design' && location.search === '?phase=1'}
                onClick={() => { navigate('/design?phase=1'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
            </NavLink>
            <NavLink
              label={<Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#555' }}>May 8</Text>}
              defaultOpened
              variant="subtle"
              style={{ borderRadius: 6 }}
              childrenOffset={12}
            >
              <NavLink
                label="Enhance Business Documentation"
                active={location.pathname === '/design' && location.search === '?phase=2'}
                onClick={() => { navigate('/design?phase=2'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
              <NavLink
                label="Create Functional Specifications"
                active={location.pathname === '/functional-specs'}
                onClick={() => { navigate('/functional-specs'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
              <NavLink
                label="Evaluate Regulations"
                active={location.pathname === '/evaluate-regulations'}
                onClick={() => { navigate('/evaluate-regulations'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
              <NavLink
                label="Create Data"
                active={location.pathname === '/create-data'}
                onClick={() => { navigate('/create-data'); }}
                fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
              />
            </NavLink>
          </NavLink>

          {/* AI Design */}
          <NavLink
            label={<span className="nav-section-label">AI Design</span>}
            defaultOpened={location.pathname === '/ai-design'}
            active={location.pathname === '/ai-design'}
            variant="subtle"
            mt={4}
            style={{ borderRadius: 6 }}
            childrenOffset={14}
          >
            <NavLink
              label="Phase 1 — Connect to Database"
              active={location.pathname === '/ai-design' && location.search === '?phase=0'}
              onClick={() => { navigate('/ai-design?phase=0'); }}
              fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
            />
            <NavLink
              label="Phase 2 — Explore Your Data"
              active={location.pathname === '/ai-design' && location.search === '?phase=1'}
              onClick={() => { navigate('/ai-design?phase=1'); }}
              fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
            />
            <NavLink
              label="Phase 3 — Train AI Model"
              active={location.pathname === '/ai-design' && location.search === '?phase=2'}
              onClick={() => { navigate('/ai-design?phase=2'); }}
              fw={500} fz="sm" variant="subtle" mb={1} style={{ borderRadius: 6 }}
            />
          </NavLink>

          {/* Generate Document */}
          <NavLink
            label={<span className="nav-section-label">Generate Document</span>}
            active={location.pathname === '/generate-document'}
            onClick={() => { navigate('/generate-document'); }}
            variant="subtle"
            mt={4}
            style={{ borderRadius: 6 }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: '#fff' }}>
        <div className="main-inner">
          <Outlet />
        </div>
        <footer className="site-footer">
          <div className="site-footer-inner">
            {/* UO wordmark SVG */}
            <svg className="site-footer-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" aria-label="University of Oregon">
              <text x="0" y="19" fontFamily="'Arial', sans-serif" fontSize="13" fontWeight="700" fontStyle="normal" fill="#007030" letterSpacing="1">UNIVERSITY OF OREGON</text>
              <text x="0" y="38" fontFamily="'Arial', sans-serif" fontSize="12" fontWeight="400" fontStyle="normal" fill="#444">Lundquist College of Business</text>
            </svg>
            <span className="site-footer-divider">|</span>
            <span className="site-footer-text">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </span>
          </div>
        </footer>
      </AppShell.Main>
    </AppShell>
  );
}
