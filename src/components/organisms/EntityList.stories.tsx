import type { Meta, StoryObj } from '@storybook/react-native';
import { EntityList } from './EntityList';

const meta: Meta<typeof EntityList> = {
  title: 'Organisms/EntityList',
  component: EntityList,
};

export default meta;
type Story = StoryObj<typeof EntityList>;

const mockTasks = [
  { id: '1', title: 'Complete project proposal', status: 'active', priority: 'high' },
  { id: '2', title: 'Review code changes', status: 'pending', priority: 'medium' },
  { id: '3', title: 'Update documentation', status: 'completed', priority: 'low' },
  { id: '4', title: 'Fix bug in login flow', status: 'active', priority: 'high' },
];

export const Default: Story = {
  args: {
    entity: 'Task',
    columns: ['title', 'status', 'priority'],
    data: mockTasks,
    keyExtractor: (item) => item.id,
  },
};

export const Loading: Story = {
  args: {
    entity: 'Task',
    columns: ['title', 'status'],
    data: [],
    keyExtractor: (item) => item.id,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    entity: 'Task',
    columns: ['title', 'status'],
    data: [],
    keyExtractor: (item) => item.id,
  },
};

export const WithPressHandler: Story = {
  args: {
    entity: 'Task',
    columns: ['title', 'status', 'priority'],
    data: mockTasks,
    keyExtractor: (item) => item.id,
    onItemPress: (item) => console.log('Pressed:', item),
  },
};
