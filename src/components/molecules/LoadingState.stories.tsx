import type { Meta, StoryObj } from '@storybook/react-native';
import { LoadingState } from './LoadingState';

const meta: Meta<typeof LoadingState> = {
  title: 'Molecules/LoadingState',
  component: LoadingState,
  argTypes: {
    message: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {
  args: {
    message: 'Loading...',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Fetching data from server...',
  },
};
