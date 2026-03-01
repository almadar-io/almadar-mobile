import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof Drawer> = {
  title: 'Molecules/Drawer',
  component: Drawer,
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const RightDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button onPress={() => setIsOpen(true)}>Open Right Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Settings"
          placement="right"
        >
          <VStack spacing={16}>
            <Typography variant="body">Profile Settings</Typography>
            <Typography variant="body">Notifications</Typography>
            <Typography variant="body">Privacy</Typography>
            <Typography variant="body">Help & Support</Typography>
          </VStack>
        </Drawer>
      </VStack>
    );
  },
};

export const LeftDrawer: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button onPress={() => setIsOpen(true)}>Open Left Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Menu"
          placement="left"
        >
          <VStack spacing={16}>
            <Typography variant="body">Home</Typography>
            <Typography variant="body">Tasks</Typography>
            <Typography variant="body">Projects</Typography>
            <Typography variant="body">Settings</Typography>
          </VStack>
        </Drawer>
      </VStack>
    );
  },
};

export const CustomWidth: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button onPress={() => setIsOpen(true)}>Open Wide Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Wide Drawer"
          width={350}
        >
          <Typography variant="body">
            This drawer has a custom width of 350 pixels.
          </Typography>
        </Drawer>
      </VStack>
    );
  },
};
