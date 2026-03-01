import type { Meta, StoryObj } from '@storybook/react-native';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Molecules/ErrorState',
  component: ErrorState,
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    title: 'Something went wrong',
    message: 'We encountered an error while loading your data.',
  },
};

export const WithRetry: Story = {
  args: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection.',
    onRetry: () => {},
  },
};

export const CustomMessage: Story = {
  args: {
    title: 'Error 404',
    message: 'The requested resource was not found.',
    onRetry: () => {},
  },
};
