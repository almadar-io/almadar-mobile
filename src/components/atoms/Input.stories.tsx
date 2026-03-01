import type { Meta, StoryObj } from '@storybook/react-native';
import { Input } from './Input';
import { VStack } from './Stack';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  argTypes: {
    placeholder: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
  },
};

export const WithHelper: Story = {
  args: {
    label: 'Password',
    placeholder: 'Min 8 characters',
    helperText: 'Must include at least one number and special character',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const AllStates: Story = {
  render: () => (
    <VStack spacing={20} style={{ padding: 20 }}>
      <Input placeholder="Default input" />
      <Input label="With label" placeholder="Enter text" />
      <Input label="With helper" placeholder="Enter text" helperText="Helper text here" />
      <Input label="With error" placeholder="Enter text" error="This field is required" />
    </VStack>
  ),
};
