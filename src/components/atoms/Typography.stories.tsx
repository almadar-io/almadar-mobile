import type { Meta, StoryObj } from '@storybook/react-native';
import { Typography, H1, H2, H3, H4, Body, BodySmall, Caption } from './Typography';
import { VStack } from './Stack';

const meta: Meta<typeof Typography> = {
  title: 'Atoms/Typography',
  component: Typography,
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'body', 'body-small', 'caption', 'label'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const AllVariants: Story = {
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <Body>Body text - The quick brown fox jumps over the lazy dog.</Body>
      <BodySmall>Body small text - The quick brown fox jumps over the lazy dog.</BodySmall>
      <Caption>Caption text - Small supporting text</Caption>
    </VStack>
  ),
};

export const Colors: Story = {
  render: () => (
    <VStack spacing={12} style={{ padding: 20 }}>
      <Typography variant="body">Default color</Typography>
      <Typography variant="body" color="#6366f1">Primary color</Typography>
      <Typography variant="body" color="#ef4444">Error color</Typography>
      <Typography variant="body" color="#22c55e">Success color</Typography>
      <Typography variant="body" color="#6b7280">Muted color</Typography>
    </VStack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <VStack spacing={12} style={{ padding: 20 }}>
      <Typography variant="body" align="left">Left aligned</Typography>
      <Typography variant="body" align="center">Center aligned</Typography>
      <Typography variant="body" align="right">Right aligned</Typography>
    </VStack>
  ),
};
