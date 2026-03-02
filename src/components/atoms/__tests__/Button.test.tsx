import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import { EventBusProvider } from '../../../providers/EventBusProvider';

// Mock the event bus
const mockEmit = jest.fn();
jest.mock('../../../hooks/useEventBus', () => ({
  useEventBus: () => ({
    emit: mockEmit,
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <EventBusProvider>
      <ThemeProvider>{component}</ThemeProvider>
    </EventBusProvider>
  );
};

describe('Button', () => {
  beforeEach(() => {
    mockEmit.mockClear();
  });

  it('renders correctly with default props', () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button onPress={onPress}>Click me</Button>);
    
    fireEvent.press(screen.getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('emits eventBus action when action prop is provided', () => {
    renderWithProviders(
      <Button action="SAVE_ITEM" actionPayload={{ id: 1 }}>
        Save
      </Button>
    );
    
    fireEvent.press(screen.getByText('Save'));
    expect(mockEmit).toHaveBeenCalledWith('UI:SAVE_ITEM', { id: 1 });
  });

  it('is disabled when isLoading is true', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <Button onPress={onPress} isLoading={true}>
        Loading
      </Button>
    );
    
    // Activity indicator should be shown
    expect(screen.queryByText('Loading')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <Button onPress={onPress} disabled={true}>
        Disabled
      </Button>
    );
    
    fireEvent.press(screen.getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has displayName set', () => {
    expect(Button.displayName).toBe('Button');
  });
});
