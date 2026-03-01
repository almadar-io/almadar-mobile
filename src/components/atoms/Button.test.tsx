import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>Press Me</Button>
    );
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Press Me</Button>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { queryByText } = render(
      <Button onPress={() => {}} isLoading>Press Me</Button>
    );
    
    // Text should not be visible when loading
    expect(queryByText('Press Me')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>Press Me</Button>
    );
    
    // Should not trigger onPress when disabled
    const button = getByText('Press Me');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
