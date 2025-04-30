const Stripe = require('stripe');
const Organization = require('../models/Organization');
const config = require('../config/config');

class SubscriptionService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.plans = config.subscription.plans;
  }

  async createCustomer(organization, paymentMethod) {
    try {
      // Create Stripe customer
      const customer = await this.stripe.customers.create({
        email: organization.billing?.email || organization.email,
        name: organization.name,
        payment_method: paymentMethod,
        metadata: {
          organizationId: organization._id.toString()
        }
      });

      // Update organization with Stripe customer ID
      await Organization.findByIdAndUpdate(organization._id, {
        'subscription.stripeCustomerId': customer.id
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createSubscription(organizationId, planId, paymentMethod) {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      let customer;
      if (!organization.subscription?.stripeCustomerId) {
        customer = await this.createCustomer(organization, paymentMethod);
      } else {
        customer = await this.stripe.customers.retrieve(organization.subscription.stripeCustomerId);
      }

      // Get price ID for the plan
      const priceId = await this.getPriceIdForPlan(planId);

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent']
      });

      // Update organization subscription details
      await Organization.findByIdAndUpdate(organizationId, {
        subscription: {
          ...organization.subscription,
          stripeSubscriptionId: subscription.id,
          plan: planId,
          status: 'pending',
          validUntil: new Date(subscription.current_period_end * 1000)
        }
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async updateSubscription(organizationId, newPlanId) {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization?.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const priceId = await this.getPriceIdForPlan(newPlanId);

      // Update subscription with new price
      const subscription = await this.stripe.subscriptions.retrieve(
        organization.subscription.stripeSubscriptionId
      );

      await this.stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations'
      });

      // Update organization subscription details
      await Organization.findByIdAndUpdate(organizationId, {
        'subscription.plan': newPlanId,
        'subscription.updatedAt': new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async cancelSubscription(organizationId) {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization?.subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      // Cancel subscription at period end
      await this.stripe.subscriptions.update(organization.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update organization subscription status
      await Organization.findByIdAndUpdate(organizationId, {
        'subscription.status': 'canceling'
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          await this.updateSubscriptionStatus(subscription);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          await this.handleSuccessfulPayment(invoice);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          await this.handleFailedPayment(failedInvoice);
          break;
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async updateSubscriptionStatus(subscription) {
    try {
      const organization = await Organization.findOne({
        'subscription.stripeSubscriptionId': subscription.id
      });

      if (!organization) return;

      const status = this.getSubscriptionStatus(subscription);
      const validUntil = new Date(subscription.current_period_end * 1000);

      await Organization.findByIdAndUpdate(organization._id, {
        'subscription.status': status,
        'subscription.validUntil': validUntil
      });

      // Handle plan limits and feature access
      await this.updateOrganizationLimits(organization._id, subscription.plan);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  async handleSuccessfulPayment(invoice) {
    try {
      const organization = await Organization.findOne({
        'subscription.stripeCustomerId': invoice.customer
      });

      if (!organization) return;

      await Organization.findByIdAndUpdate(organization._id, {
        'subscription.status': 'active',
        'subscription.lastPaymentDate': new Date()
      });
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  async handleFailedPayment(invoice) {
    try {
      const organization = await Organization.findOne({
        'subscription.stripeCustomerId': invoice.customer
      });

      if (!organization) return;

      await Organization.findByIdAndUpdate(organization._id, {
        'subscription.status': 'past_due'
      });

      // Implement notification logic here
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw error;
    }
  }

  async getPriceIdForPlan(planId) {
    // Implementation would fetch or map to Stripe price IDs
    const planPriceMap = {
      'basic': 'price_basic_monthly',
      'professional': 'price_professional_monthly',
      'enterprise': 'price_enterprise_monthly'
    };
    return planPriceMap[planId];
  }

  getSubscriptionStatus(subscription) {
    if (subscription.cancel_at_period_end) return 'canceling';
    if (subscription.status === 'active') return 'active';
    if (subscription.status === 'past_due') return 'past_due';
    if (subscription.status === 'canceled') return 'canceled';
    return 'inactive';
  }

  async updateOrganizationLimits(organizationId, plan) {
    const planLimits = this.plans[plan]?.limits;
    if (!planLimits) return;

    await Organization.findByIdAndUpdate(organizationId, {
      'settings.limits': planLimits
    });
  }
}

module.exports = new SubscriptionService();
