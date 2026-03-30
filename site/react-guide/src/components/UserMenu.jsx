import React from 'react';
import {
  Menu,
  Avatar,
  Text,
  Group,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  IconLogout,
  IconUser,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const { user, signOut, isAuthenticated } = useAuth();

  // Don't show menu if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
        >
          <Group gap="xs">
            <Avatar radius="xl" size="sm" color="green">
              {initials}
            </Avatar>
            <Text size="sm" fw={500} visibleFrom="sm">
              {displayName}
            </Text>
            <IconChevronDown
              style={{ width: rem(14), height: rem(14) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Signed in as</Menu.Label>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
          disabled
        >
          {displayName}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={signOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
