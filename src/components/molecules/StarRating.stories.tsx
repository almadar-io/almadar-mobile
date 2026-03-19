import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { StarRating } from './StarRating';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';

const meta: Meta<typeof StarRating> = {
  title: 'Molecules/StarRating',
  component: StarRating,
  argTypes: {
    max: {
      control: 'select',
      options: [3, 5, 7, 10],
    },
    readOnly: {
      control: 'boolean',
    },
    precision: {
      control: 'select',
      options: ['full', 'half'],
    },
    size: {
      control: { type: 'range', min: 16, max: 48, step: 4 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    value: 3,
    max: 5,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 4,
    max: 5,
    readOnly: true,
  },
};

export const LargeStars: Story = {
  args: {
    value: 3,
    max: 5,
    size: 40,
  },
};

export const SmallStars: Story = {
  args: {
    value: 2,
    max: 5,
    size: 18,
  },
};

export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState(0);
    return (
      <VStack spacing={16} style={{ padding: 20 }}>
        <Typography variant="h4">Rate this product</Typography>
        <StarRating value={rating} onChange={setRating} />
        <Typography variant="body">
          {rating === 0
            ? 'Tap a star to rate'
            : `You rated ${rating} out of 5`}
        </Typography>
      </VStack>
    );
  },
};

export const AllRatings: Story = {
  render: () => (
    <VStack spacing={12} style={{ padding: 20 }}>
      <Typography variant="h4">Product Reviews</Typography>
      {[
        { label: 'Quality', rating: 4.5 },
        { label: 'Value', rating: 3 },
        { label: 'Shipping', rating: 5 },
        { label: 'Packaging', rating: 2 },
      ].map(({ label, rating }) => (
        <HStack key={label} spacing={12} align="center">
          <Typography
            variant="caption"
            style={{ width: 80, textAlign: 'right' }}
          >
            {label}
          </Typography>
          <StarRating value={rating} readOnly size={20} />
          <Typography variant="caption">{rating}</Typography>
        </HStack>
      ))}
    </VStack>
  ),
};
