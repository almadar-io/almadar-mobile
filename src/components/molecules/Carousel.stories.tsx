import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Carousel } from './Carousel';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { Card } from '../atoms/Card';

const meta: Meta = {
  title: 'Molecules/Carousel',
  component: Carousel,
  argTypes: {
    autoPlay: {
      control: 'boolean',
    },
    showDots: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj;

const colorSlides = [
  { color: '#14b8a6', label: 'Slide 1' },
  { color: '#0ea5e9', label: 'Slide 2' },
  { color: '#8b5cf6', label: 'Slide 3' },
  { color: '#f97316', label: 'Slide 4' },
];

export const Default: Story = {
  render: () => (
    <Carousel
      items={colorSlides}
      renderItem={(item) => (
        <View
          style={{
            height: 200,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            margin: 8,
          }}
        >
          <Typography variant="h3" style={{ color: '#fff' }}>
            {item.label}
          </Typography>
        </View>
      )}
    />
  ),
};

export const WithAutoPlay: Story = {
  render: () => (
    <Carousel
      items={colorSlides}
      autoPlay
      autoPlayInterval={2000}
      renderItem={(item) => (
        <View
          style={{
            height: 200,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            margin: 8,
          }}
        >
          <Typography variant="h3" style={{ color: '#fff' }}>
            {item.label}
          </Typography>
        </View>
      )}
    />
  ),
};

export const NoDots: Story = {
  render: () => (
    <Carousel
      items={colorSlides}
      showDots={false}
      renderItem={(item) => (
        <View
          style={{
            height: 200,
            backgroundColor: item.color,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            margin: 8,
          }}
        >
          <Typography variant="h3" style={{ color: '#fff' }}>
            {item.label}
          </Typography>
        </View>
      )}
    />
  ),
};

export const ProductCards: Story = {
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <Typography variant="h3">Featured Products</Typography>
      <Carousel
        items={[
          { name: 'Wireless Headphones', price: '$79.99', rating: 4.5 },
          { name: 'Smart Watch', price: '$199.99', rating: 4.8 },
          { name: 'Portable Charger', price: '$29.99', rating: 4.2 },
        ]}
        renderItem={(item) => (
          <Card style={{ margin: 8, padding: 20 }}>
            <VStack spacing={8}>
              <View
                style={{
                  height: 120,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption">Image placeholder</Typography>
              </View>
              <Typography variant="h4">{item.name}</Typography>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {item.price}
              </Typography>
            </VStack>
          </Card>
        )}
      />
    </VStack>
  ),
};
