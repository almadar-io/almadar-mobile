import type { Meta, StoryObj } from '@storybook/react-native';
import { Card } from './Card';
import { Typography } from './Typography';
import { VStack } from './Stack';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ margin: 20 }}>
      <Typography variant="body">This is a basic card with some content.</Typography>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Card onPress={() => {}} style={{ margin: 20 }}>
      <Typography variant="h4">Clickable Card</Typography>
      <Typography variant="body-small" color="#6b7280">
        This card can be pressed
      </Typography>
    </Card>
  ),
};

export const PaddingVariants: Story = {
  render: () => (
    <VStack spacing={12} style={{ padding: 20 }}>
      <Card padding="none">
        <Typography variant="caption">No padding</Typography>
      </Card>
      <Card padding="sm">
        <Typography variant="caption">Small padding</Typography>
      </Card>
      <Card padding="md">
        <Typography variant="caption">Medium padding</Typography>
      </Card>
      <Card padding="lg">
        <Typography variant="caption">Large padding</Typography>
      </Card>
    </VStack>
  ),
};
