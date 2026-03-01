import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './Button';
import { VStack } from './Stack';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'md',
    children: 'Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    isLoading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
    children: 'Disabled',
  },
};

export const Sizes: Story = {
  render: () => (
    <VStack spacing={12}>
      <Button variant="primary" size="sm" onPress={() => {}}>
        Small Button
      </Button>
      <Button variant="primary" size="md" onPress={() => {}}>
        Medium Button
      </Button>
      <Button variant="primary" size="lg" onPress={() => {}}>
        Large Button
      </Button>
    </VStack>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <VStack spacing={12}>
      <Button variant="primary" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="secondary" onPress={() => {}}>
        Secondary
      </Button>
      <Button variant="ghost" onPress={() => {}}>
        Ghost
      </Button>
      <Button variant="destructive" onPress={() => {}}>
        Destructive
      </Button>
    </VStack>
  ),
};
