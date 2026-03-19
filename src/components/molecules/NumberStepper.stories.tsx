import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { NumberStepper } from './NumberStepper';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { Divider } from '../atoms/Divider';

const meta: Meta<typeof NumberStepper> = {
  title: 'Molecules/NumberStepper',
  component: NumberStepper,
  argTypes: {
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    step: {
      control: { type: 'number' },
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const Default: Story = {
  args: {
    value: 1,
    min: 0,
    max: 10,
  },
};

export const WithLabel: Story = {
  args: {
    value: 2,
    min: 0,
    max: 99,
    label: 'Quantity',
  },
};

export const CustomStep: Story = {
  args: {
    value: 10,
    min: 0,
    max: 100,
    step: 5,
    label: 'Volume',
  },
};

export const Disabled: Story = {
  args: {
    value: 3,
    disabled: true,
    label: 'Locked',
  },
};

export const AtMinimum: Story = {
  args: {
    value: 0,
    min: 0,
    max: 10,
    label: 'At minimum',
  },
};

export const AtMaximum: Story = {
  args: {
    value: 10,
    min: 0,
    max: 10,
    label: 'At maximum',
  },
};

export const Interactive: Story = {
  render: () => {
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    return (
      <VStack spacing={20} style={{ padding: 20 }}>
        <Typography variant="h3">Booking Details</Typography>
        <Divider />
        <NumberStepper
          label="Adults"
          value={adults}
          min={1}
          max={8}
          onChange={setAdults}
        />
        <NumberStepper
          label="Children"
          value={children}
          min={0}
          max={6}
          onChange={setChildren}
        />
        <NumberStepper
          label="Rooms"
          value={rooms}
          min={1}
          max={4}
          onChange={setRooms}
        />
        <Divider />
        <Typography variant="caption">
          {adults} adult{adults !== 1 ? 's' : ''}, {children} child
          {children !== 1 ? 'ren' : ''}, {rooms} room{rooms !== 1 ? 's' : ''}
        </Typography>
      </VStack>
    );
  },
};
