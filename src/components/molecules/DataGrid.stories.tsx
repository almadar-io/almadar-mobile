import type { Meta, StoryObj } from '@storybook/react-native';
import { DataGrid } from './DataGrid';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof DataGrid> = {
  title: 'Molecules/DataGrid',
  component: DataGrid,
  argTypes: {
    cols: {
      control: 'select',
      options: [1, 2, 3, 4],
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

const products = [
  { id: '1', name: 'Wireless Headphones', price: 79.99, status: 'active', category: 'Audio', rating: 92, image: 'https://picsum.photos/seed/headphones/400/300' },
  { id: '2', name: 'Smart Watch', price: 199.99, status: 'active', category: 'Wearables', rating: 88, image: 'https://picsum.photos/seed/watch/400/300' },
  { id: '3', name: 'USB-C Hub', price: 49.99, status: 'pending', category: 'Accessories', rating: 76, image: 'https://picsum.photos/seed/hub/400/300' },
  { id: '4', name: 'Mechanical Keyboard', price: 129.99, status: 'active', category: 'Input', rating: 95, image: 'https://picsum.photos/seed/keyboard/400/300' },
  { id: '5', name: 'Webcam HD', price: 59.99, status: 'inactive', category: 'Video', rating: 70, image: 'https://picsum.photos/seed/webcam/400/300' },
  { id: '6', name: 'Monitor Stand', price: 34.99, status: 'active', category: 'Accessories', rating: 82, image: 'https://picsum.photos/seed/stand/400/300' },
];

export const Default: Story = {
  args: {
    entity: products,
    cols: 2,
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
      { name: 'category', label: 'Category' },
    ],
  },
};

export const WithImages: Story = {
  args: {
    entity: products,
    cols: 2,
    imageField: 'image',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
    ],
  },
};

export const SingleColumn: Story = {
  args: {
    entity: products.slice(0, 3),
    cols: 1,
    imageField: 'image',
    fields: [
      { name: 'name', variant: 'h3' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
      { name: 'category', label: 'Category' },
      { name: 'rating', label: 'Rating', format: 'percent' },
    ],
  },
};

export const ThreeColumns: Story = {
  args: {
    entity: products,
    cols: 3,
    gap: 'sm',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    entity: products,
    cols: 2,
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
      { name: 'category', label: 'Category' },
    ],
    itemActions: [
      { label: 'View', event: 'VIEW_PRODUCT', variant: 'ghost' },
      { label: 'Edit', event: 'EDIT_PRODUCT', variant: 'primary' },
      { label: 'Delete', event: 'DELETE_PRODUCT', variant: 'danger' },
    ],
  },
};

export const Selectable: Story = {
  args: {
    entity: products,
    cols: 2,
    selectable: true,
    selectionEvent: 'PRODUCTS_SELECTED',
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'price', label: 'Price', format: 'currency' },
    ],
  },
};

export const WithProgress: Story = {
  args: {
    entity: [
      { id: '1', name: 'Project Alpha', status: 'active', progress: 75, deadline: '2025-06-15' },
      { id: '2', name: 'Project Beta', status: 'pending', progress: 30, deadline: '2025-08-01' },
      { id: '3', name: 'Project Gamma', status: 'completed', progress: 100, deadline: '2025-03-01' },
      { id: '4', name: 'Project Delta', status: 'active', progress: 50, deadline: '2025-07-20' },
    ],
    cols: 2,
    fields: [
      { name: 'name', variant: 'h4' },
      { name: 'status', variant: 'badge' },
      { name: 'deadline', label: 'Deadline', format: 'date' },
      { name: 'progress', variant: 'progress', label: 'Completion' },
    ],
  },
};

export const TeamDirectory: Story = {
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <Typography variant="h3">Team Directory</Typography>
      <DataGrid
        entity={[
          { id: '1', name: 'Sarah Chen', title: 'Staff Engineer', status: 'online', team: 'Platform', image: 'https://picsum.photos/seed/sarah/400/300' },
          { id: '2', name: 'Marcus Webb', title: 'Senior Designer', status: 'away', team: 'Product', image: 'https://picsum.photos/seed/marcus/400/300' },
          { id: '3', name: 'Aisha Patel', title: 'Product Manager', status: 'online', team: 'Growth', image: 'https://picsum.photos/seed/aisha/400/300' },
          { id: '4', name: 'James Liu', title: 'Junior Engineer', status: 'offline', team: 'Platform', image: 'https://picsum.photos/seed/james/400/300' },
        ]}
        cols={2}
        imageField="image"
        fields={[
          { name: 'name', variant: 'h4' },
          { name: 'status', variant: 'badge' },
          { name: 'title', label: 'Title' },
          { name: 'team', label: 'Team' },
        ]}
        itemActions={[
          { label: 'Message', event: 'MESSAGE_USER', variant: 'primary' },
        ]}
      />
    </VStack>
  ),
};
