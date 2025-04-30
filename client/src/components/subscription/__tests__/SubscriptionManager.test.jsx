import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import SubscriptionManager from '../SubscriptionManager';

// Mock Stripe
jest.mock('@stripe/stripe-js');
const mockStripe = {
  elements: jest.fn(),
  confirmCardPayment: jest.fn()
};
loadStripe.mockResolvedValue(mockStripe);

describe('SubscriptionManager', () => {
  const mockPlans = {
    basic: {
      name: 'Basic Plan',
      price: 29.99,
      features: ['Feature 1', 'Feature 2'],
      limits: {
        students: 200,
        programs: 5,
        storage: 500
      }
    },
    professional: {
      name: 'Professional Plan',
      price: 99.99,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      limits: {
        students: 1000,
        programs: 20,
        storage: 2000
      }
    }
  };

  const mockCurrentSubscription = {
    plan: 'basic',
    status: 'active',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const mockUsage = {
    students: 150,
    programs: 3,
    storage: 300
  };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch.mockReset();

    // Mock successful API responses
    global.fetch
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse(mockPlans))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscription: mockCurrentSubscription,
        usage: mockUsage
      }));
  });

  it('renders subscription plans and current subscription', async () => {
    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Current Subscription')).toBeInTheDocument();
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });

    // Verify current subscription details
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // Verify usage information
    expect(screen.getByText('150 / 200')).toBeInTheDocument(); // Students
    expect(screen.getByText('3 / 5')).toBeInTheDocument(); // Programs
    expect(screen.getByText('300MB / 500MB')).toBeInTheDocument(); // Storage
  });

  it('handles plan selection for new subscription', async () => {
    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });

    // Select professional plan
    const selectPlanButton = screen.getByRole('button', { 
      name: /select plan/i,
      closest: 'Professional Plan'
    });
    await userEvent.click(selectPlanButton);

    // Verify payment dialog appears
    expect(screen.getByText(/subscribe to professional plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('handles plan upgrade for existing subscription', async () => {
    // Mock upgrade API call
    global.fetch
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse(mockPlans))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscription: mockCurrentSubscription,
        usage: mockUsage
      }))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        success: true
      }));

    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });

    // Upgrade to professional plan
    const upgradePlanButton = screen.getByRole('button', { 
      name: /select plan/i,
      closest: 'Professional Plan'
    });
    await userEvent.click(upgradePlanButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/subscription/update'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('professional')
        })
      );
    });
  });

  it('handles payment submission', async () => {
    // Mock successful payment intent creation
    global.fetch
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse(mockPlans))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscription: { status: 'pending' },
        usage: mockUsage
      }))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscriptionId: 'sub_123',
        clientSecret: 'pi_123_secret'
      }));

    // Mock successful Stripe confirmation
    mockStripe.confirmCardPayment.mockResolvedValueOnce({ paymentIntent: { status: 'succeeded' } });

    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });

    // Select professional plan
    const selectPlanButton = screen.getByRole('button', { 
      name: /select plan/i,
      closest: 'Professional Plan'
    });
    await userEvent.click(selectPlanButton);

    // Submit payment
    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    await userEvent.click(subscribeButton);

    await waitFor(() => {
      expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith(
        'pi_123_secret',
        expect.any(Object)
      );
    });
  });

  it('handles subscription cancellation', async () => {
    // Mock successful cancellation
    global.fetch
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse(mockPlans))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscription: mockCurrentSubscription,
        usage: mockUsage
      }))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        success: true
      }));

    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel subscription/i });
    await userEvent.click(cancelButton);

    // Confirm cancellation
    const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/subscription/cancel'),
        expect.any(Object)
      );
    });
  });

  it('displays error messages', async () => {
    // Mock API error
    global.fetch
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse(mockPlans))
      .mockImplementationOnce(() => testHelpers.mockAuthenticatedResponse({
        subscription: mockCurrentSubscription,
        usage: mockUsage
      }))
      .mockImplementationOnce(() => testHelpers.mockErrorResponse('Subscription update failed'));

    render(
      <Elements stripe={loadStripe('dummy_key')}>
        <SubscriptionManager />
      </Elements>
    );

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });

    // Attempt to upgrade plan
    const upgradePlanButton = screen.getByRole('button', { 
      name: /select plan/i,
      closest: 'Professional Plan'
    });
    await userEvent.click(upgradePlanButton);

    await waitFor(() => {
      expect(screen.getByText('Subscription update failed')).toBeInTheDocument();
    });
  });
});
