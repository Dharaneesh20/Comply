import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthBadge } from '../components/HealthBadge';

describe('HealthBadge Component', () => {
  it('renders Online status when state is online', () => {
    render(<HealthBadge state="online" />);
    expect(screen.getByText('Backend: Online')).toBeDefined();
  });

  it('renders Offline status when state is offline', () => {
    render(<HealthBadge state="offline" />);
    expect(screen.getByText('Backend: Offline')).toBeDefined();
  });

  it('renders Checking status when state is checking', () => {
    render(<HealthBadge state="checking" />);
    expect(screen.getByText('Backend: Checking...')).toBeDefined();
  });
});
