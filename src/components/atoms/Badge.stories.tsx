import type { Meta, StoryObj } from '@storybook/react-native';
import { Badge } from './Badge';
import { HStack, VStack } from './Stack';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const AllVariants: Story = {
  render: () => (
    <HStack spacing={8} style={{ padding: 20, flexWrap: 'wrap' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack spacing={12} style={{ padding: 20 }}>
      <Badge size="sm" variant="primary">Small Badge</Badge>
      <Badge size="md" variant="primary">Medium Badge</Badge>
    </VStack>
  ),
};
