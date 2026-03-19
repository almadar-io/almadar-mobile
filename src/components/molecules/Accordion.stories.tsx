import type { Meta, StoryObj } from '@storybook/react-native';
import { Accordion } from './Accordion';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof Accordion> = {
  title: 'Molecules/Accordion',
  component: Accordion,
  argTypes: {
    multiple: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const sampleItems = [
  {
    id: 'shipping',
    title: 'Shipping Information',
    content: (
      <Typography variant="body">
        We offer free shipping on all orders over $50. Standard delivery takes
        3-5 business days. Express shipping is available at checkout.
      </Typography>
    ),
  },
  {
    id: 'returns',
    title: 'Return Policy',
    content: (
      <Typography variant="body">
        Items can be returned within 30 days of purchase. Products must be in
        original condition with tags attached. Refunds are processed within 5-7
        business days.
      </Typography>
    ),
  },
  {
    id: 'warranty',
    title: 'Warranty Details',
    content: (
      <Typography variant="body">
        All products come with a 1-year manufacturer warranty. Extended warranty
        options are available for select items. Contact support for claims.
      </Typography>
    ),
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    defaultOpenItems: ['shipping'],
  },
};

export const MultipleOpen: Story = {
  args: {
    items: sampleItems,
    multiple: true,
    defaultOpenItems: ['shipping', 'returns'],
  },
};

export const AllCollapsed: Story = {
  args: {
    items: sampleItems,
    defaultOpenItems: [],
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        id: 'locked',
        title: 'Premium Content (Locked)',
        content: <Typography variant="body">This content is locked.</Typography>,
        disabled: true,
      },
    ],
  },
};

export const FAQ: Story = {
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <Typography variant="h3">Frequently Asked Questions</Typography>
      <Accordion
        items={[
          {
            id: 'q1',
            title: 'How do I create an account?',
            content: (
              <Typography variant="body">
                Tap the Sign Up button on the home screen. Enter your email and
                create a password. Verify your email to complete registration.
              </Typography>
            ),
          },
          {
            id: 'q2',
            title: 'Can I change my subscription plan?',
            content: (
              <Typography variant="body">
                Yes, go to Settings, then Subscription. You can upgrade or
                downgrade at any time. Changes take effect at the next billing
                cycle.
              </Typography>
            ),
          },
          {
            id: 'q3',
            title: 'How do I contact support?',
            content: (
              <Typography variant="body">
                Use the in-app chat (bottom right icon), email us at
                support@example.com, or call 1-800-EXAMPLE during business
                hours.
              </Typography>
            ),
          },
        ]}
        multiple
      />
    </VStack>
  ),
};
