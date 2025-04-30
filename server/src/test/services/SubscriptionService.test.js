const SubscriptionService = require('../../services/SubscriptionService');
const Organization = require('../../models/Organization');
const config = require('../../config/config');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test123',
        email: 'test@example.com'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cus_test123'
      })
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        latest_invoice: {
          payment_intent: {
            client_secret: 'pi_test_secret'
          }
        }
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        items: {
          data: [{
            id: 'si_test123'
          }]
        }
      }),
      update: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        status: 'active'
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'active',
            customer: 'cus_test123',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }
        }
      })
    }
  }));
});

describe('SubscriptionService', () => {
  let testOrg;
  let paymentMethod;

  beforeAll(async () => {
    testOrg = await testHelpers.createTestOrganization();
    paymentMethod = 'pm_test_card_123';
  });

  describe('createCustomer', () => {
    it('should create Stripe customer and update organization', async () => {
      const result = await SubscriptionService.createCustomer(testOrg, paymentMethod);

      expect(result.id).toBe('cus_test123');

      // Verify organization was updated
      const updatedOrg = await Organization.findById(testOrg._id);
      expect(updatedOrg.subscription.stripeCustomerId).toBe('cus_test123');
    });

    it('should handle Stripe errors appropriately', async () => {
      // Mock Stripe error
      const stripeError = new Error('Stripe error');
      stripeError.type = 'StripeCardError';
      SubscriptionService.stripe.customers.create.mockRejectedValueOnce(stripeError);

      await expect(
        SubscriptionService.createCustomer(testOrg, 'invalid_payment_method')
      ).rejects.toThrow('Failed to create customer');
    });
  });

  describe('createSubscription', () => {
    it('should create subscription for new customer', async () => {
      const result = await SubscriptionService.createSubscription(
        testOrg._id,
        'professional',
        paymentMethod
      );

      expect(result).toHaveProperty('subscriptionId', 'sub_test123');
      expect(result).toHaveProperty('clientSecret', 'pi_test_secret');

      // Verify organization subscription was updated
      const updatedOrg = await Organization.findById(testOrg._id);
      expect(updatedOrg.subscription.stripeSubscriptionId).toBe('sub_test123');
      expect(updatedOrg.subscription.plan).toBe('professional');
    });

    it('should use existing customer if available', async () => {
      // Update org with existing customer ID
      await Organization.findByIdAndUpdate(testOrg._id, {
        'subscription.stripeCustomerId': 'cus_existing123'
      });

      await SubscriptionService.createSubscription(
        testOrg._id,
        'professional',
        paymentMethod
      );

      expect(SubscriptionService.stripe.customers.create).not.toHaveBeenCalled();
      expect(SubscriptionService.stripe.customers.retrieve).toHaveBeenCalledWith('cus_existing123');
    });
  });

  describe('updateSubscription', () => {
    beforeEach(async () => {
      // Setup existing subscription
      await testHelpers.createTestSubscription(testOrg._id);
    });

    it('should update subscription plan', async () => {
      const result = await SubscriptionService.updateSubscription(
        testOrg._id,
        'enterprise'
      );

      expect(result).toBe(true);

      // Verify organization subscription was updated
      const updatedOrg = await Organization.findById(testOrg._id);
      expect(updatedOrg.subscription.plan).toBe('enterprise');
    });

    it('should handle missing subscription', async () => {
      await Organization.findByIdAndUpdate(testOrg._id, {
        $unset: { 'subscription.stripeSubscriptionId': 1 }
      });

      await expect(
        SubscriptionService.updateSubscription(testOrg._id, 'enterprise')
      ).rejects.toThrow('No active subscription found');
    });
  });

  describe('cancelSubscription', () => {
    beforeEach(async () => {
      await testHelpers.createTestSubscription(testOrg._id);
    });

    it('should cancel subscription at period end', async () => {
      const result = await SubscriptionService.cancelSubscription(testOrg._id);

      expect(result).toBe(true);

      // Verify organization subscription status was updated
      const updatedOrg = await Organization.findById(testOrg._id);
      expect(updatedOrg.subscription.status).toBe('canceling');
    });
  });

  describe('handleWebhook', () => {
    it('should process subscription update webhook', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }
        }
      };

      await SubscriptionService.handleWebhook(event);

      // Verify organization subscription was updated
      const updatedOrg = await Organization.findOne({
        'subscription.stripeSubscriptionId': 'sub_test123'
      });
      expect(updatedOrg.subscription.status).toBe('active');
    });

    it('should handle payment failure webhook', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_test123',
            customer: 'cus_test123'
          }
        }
      };

      await SubscriptionService.handleWebhook(event);

      // Verify organization subscription status was updated
      const updatedOrg = await Organization.findOne({
        'subscription.stripeCustomerId': 'cus_test123'
      });
      expect(updatedOrg.subscription.status).toBe('past_due');
    });
  });
});
