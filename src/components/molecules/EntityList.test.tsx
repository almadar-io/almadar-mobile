import React from 'react';
import { render } from '@testing-library/react-native';
import { EntityList } from '../organisms/EntityList';

describe('EntityList', () => {
  const mockData = [
    { id: '1', title: 'Task 1', status: 'active' },
    { id: '2', title: 'Task 2', status: 'completed' },
  ];

  it('renders loading state', () => {
    const { getByText } = render(
      <EntityList
        entity="Task"
        columns={['title', 'status']}
        data={[]}
        keyExtractor={(item) => item.id}
        isLoading
      />
    );
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders empty state', () => {
    const { getByText } = render(
      <EntityList
        entity="Task"
        columns={['title', 'status']}
        data={[]}
        keyExtractor={(item) => item.id}
      />
    );
    
    expect(getByText('No tasks found')).toBeTruthy();
  });

  it('renders data correctly', () => {
    const { getByText } = render(
      <EntityList
        entity="Task"
        columns={['title', 'status']}
        data={mockData}
        keyExtractor={(item) => item.id}
      />
    );
    
    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Task 2')).toBeTruthy();
  });
});
