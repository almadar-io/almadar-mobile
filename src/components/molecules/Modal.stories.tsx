import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Title"
          footer={
            <>
              <Button variant="secondary" onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onPress={() => setIsOpen(false)}>Confirm</Button>
            </>
          }
        >
          <Typography variant="body">
            This is the modal content. You can put any content here.
          </Typography>
        </Modal>
      </VStack>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button onPress={() => { setSize('sm'); setIsOpen(true); }}>
          Open Small Modal
        </Button>
        <Button onPress={() => { setSize('md'); setIsOpen(true); }}>
          Open Medium Modal
        </Button>
        <Button onPress={() => { setSize('lg'); setIsOpen(true); }}>
          Open Large Modal
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={`${size.toUpperCase()} Modal`}
          size={size}
          footer={
            <Button onPress={() => setIsOpen(false)}>Close</Button>
          }
        >
          <Typography variant="body">
            This is a {size} modal.
          </Typography>
        </Modal>
      </VStack>
    );
  },
};

export const ConfirmDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Button variant="destructive" onPress={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={() => {
            console.log('Confirmed!');
            setIsOpen(false);
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmLabel="Delete"
        />
      </VStack>
    );
  },
};
