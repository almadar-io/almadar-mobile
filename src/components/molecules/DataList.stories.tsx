import type { Meta, StoryObj } from '@storybook/react-native';
import { DataList } from './DataList';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof DataList> = {
  title: 'Molecules/DataList',
  component: DataList,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'card', 'compact', 'message'],
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataList>;

const users = [
  { id: '1', name: 'Sarah Chen', role: 'Engineer', status: 'active', department: 'Platform', progress: 85, joinDate: '2024-03-15' },
  { id: '2', name: 'Marcus Webb', role: 'Designer', status: 'pending', department: 'Product', progress: 42, joinDate: '2024-06-01' },
  { id: '3', name: 'Aisha Patel', role: 'PM', status: 'active', department: 'Growth', progress: 100, joinDate: '2023-11-20' },
  { id: '4', name: 'James Liu', role: 'Engineer', status: 'inactive', department: 'Platform', progress: 10, joinDate: '2025-01-08' },
  { id: '5', name: 'Elena Torres', role: 'Designer', status: 'active', department: 'Product', progress: 67, joinDate: '2024-09-12' },
];

export const Default: Story = {
  args: {
    entity: users,
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'role', variant: 'body' },
      { name: 'department', variant: 'caption' },
    ],
  },
};

export const CardVariant: Story = {
  args: {
    entity: users,
    variant: 'card',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'role', label: 'Role' },
      { name: 'joinDate', label: 'Joined', format: 'date' },
    ],
  },
};

export const CompactVariant: Story = {
  args: {
    entity: users,
    variant: 'compact',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
    ],
  },
};

export const WithProgress: Story = {
  args: {
    entity: users,
    variant: 'card',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'role', label: 'Role' },
      { name: 'progress', variant: 'progress', label: 'Onboarding' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    entity: users,
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'role', label: 'Role' },
    ],
    itemActions: [
      { label: 'Edit', event: 'EDIT_USER', variant: 'ghost' },
      { label: 'Delete', event: 'DELETE_USER', variant: 'danger' },
    ],
  },
};

export const WithFormats: Story = {
  args: {
    entity: [
      { id: '1', product: 'Wireless Headphones', price: 79.99, inStock: true, sold: 1250, rating: 92 },
      { id: '2', product: 'Smart Watch', price: 199.99, inStock: true, sold: 830, rating: 88 },
      { id: '3', product: 'USB-C Cable', price: 12.99, inStock: false, sold: 5400, rating: 74 },
    ],
    variant: 'card',
    fields: [
      { name: 'product', variant: 'h4' },
      { name: 'price', label: 'Price', format: 'currency' },
      { name: 'inStock', label: 'In Stock', format: 'boolean' },
      { name: 'sold', label: 'Units Sold', format: 'number' },
      { name: 'rating', label: 'Rating', format: 'percent' },
    ],
  },
};

export const GroupedByDepartment: Story = {
  args: {
    entity: users,
    groupBy: 'department',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'role', label: 'Role' },
    ],
  },
};

export const MessageVariant: Story = {
  args: {
    entity: [
      { id: '1', text: 'Hey, are we still on for the design review?', sender: 'Sarah', timestamp: '2025-03-19T10:30:00Z' },
      { id: '2', text: 'Yes! 3pm works for me.', sender: 'You', timestamp: '2025-03-19T10:31:00Z' },
      { id: '3', text: 'Great, I will share the Figma link beforehand.', sender: 'Sarah', timestamp: '2025-03-19T10:32:00Z' },
      { id: '4', text: 'Sounds good, looking forward to it', sender: 'You', timestamp: '2025-03-19T10:33:00Z' },
      { id: '5', text: 'Also, did you see the new component specs?', sender: 'Sarah', timestamp: '2025-03-19T10:35:00Z' },
    ],
    variant: 'message',
    senderField: 'sender',
    currentUser: 'You',
    fields: [
      { name: 'text', variant: 'body' },
      { name: 'timestamp', format: 'date' },
    ],
  },
};

export const WithPagination: Story = {
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <Typography variant="h3">Team Members (paginated)</Typography>
      <DataList
        entity={users}
        pageSize={3}
        fields={[
          { name: 'name', variant: 'h4' },
          { name: 'status', variant: 'badge' },
          { name: 'role', label: 'Role' },
          { name: 'department', label: 'Dept' },
        ]}
      />
    </VStack>
  ),
};
