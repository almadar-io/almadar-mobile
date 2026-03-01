import type { Meta, StoryObj } from '@storybook/react-native';
import { EntityCard } from './EntityCard';

const meta: Meta<typeof EntityCard> = {
  title: 'Organisms/EntityCard',
  component: EntityCard,
};

export default meta;
type Story = StoryObj<typeof EntityCard>;

export const Default: Story = {
  args: {
    title: 'Project Alpha',
    subtitle: 'Last updated 2 hours ago',
  },
};

export const WithStatus: Story = {
  args: {
    title: 'Project Beta',
    subtitle: 'Due in 3 days',
    status: 'Active',
    statusVariant: 'success',
  },
};

export const WithMetadata: Story = {
  args: {
    title: 'Task #1234',
    subtitle: 'Created by John Doe',
    status: 'Pending',
    statusVariant: 'warning',
    metadata: [
      { label: 'Priority', value: 'High' },
      { label: 'Due Date', value: '2026-03-15' },
      { label: 'Assignee', value: 'Jane Smith' },
    ],
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    subtitle: 'Tap to view details',
    status: 'Active',
    statusVariant: 'primary',
    onPress: () => {},
  },
};
