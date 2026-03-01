import type { Meta, StoryObj } from '@storybook/react-native';
import { VStack, HStack, Box } from './Stack';
import { Typography } from './Typography';

const meta: Meta<typeof VStack> = {
  title: 'Atoms/Stack',
  component: VStack,
};

export default meta;

export const VStackStory: StoryObj<typeof VStack> = {
  name: 'VStack',
  render: () => (
    <VStack spacing={16} style={{ padding: 20 }}>
      <Box style={{ backgroundColor: '#6366f1', height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 1
        </Typography>
      </Box>
      <Box style={{ backgroundColor: '#8b5cf6', height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 2
        </Typography>
      </Box>
      <Box style={{ backgroundColor: '#a855f7', height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 3
        </Typography>
      </Box>
    </VStack>
  ),
};

export const HStackStory: StoryObj<typeof HStack> = {
  name: 'HStack',
  render: () => (
    <HStack spacing={16} style={{ padding: 20 }}>
      <Box style={{ backgroundColor: '#6366f1', width: 80, height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 1
        </Typography>
      </Box>
      <Box style={{ backgroundColor: '#8b5cf6', width: 80, height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 2
        </Typography>
      </Box>
      <Box style={{ backgroundColor: '#a855f7', width: 80, height: 50, borderRadius: 8 }}>
        <Typography style={{ color: 'white', textAlign: 'center', lineHeight: 50 }}>
          Item 3
        </Typography>
      </Box>
    </HStack>
  ),
};
