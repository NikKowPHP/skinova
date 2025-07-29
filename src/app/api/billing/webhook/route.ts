import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/services/stripe.service";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  logger.info("/api/billing/webhook - POST - Received webhook");
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Webhook signature verification failed", { error: message });
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }
  
  const existingEvent = await prisma.processedWebhook.findUnique({ where: { eventId: event.id } });
  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === 'subscription') {
        await handleSubscriptionCheckout(session);
      } else if (session.mode === 'payment') {
        await handleConsultationCheckout(session);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  await prisma.processedWebhook.create({
    data: { eventId: event.id, type: event.type },
  });

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  if (!session.customer || !subscriptionId) {
    logger.warn("Webhook: Missing customer or subscription in checkout session", { session });
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  let tier = "FREE";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    tier = "PRO";
  }

  await prisma.user.update({
    where: { stripeCustomerId: session.customer as string },
    data: { subscriptionTier: tier, subscriptionStatus: "ACTIVE" },
  });
  logger.info(`Webhook: Subscription started for customer: ${session.customer}`, { tier });
}

async function handleConsultationCheckout(session: Stripe.Checkout.Session) {
  const { userId, scanId } = session.metadata || {};
  const stripePaymentId = session.payment_intent as string;
  
  if (!userId || !scanId || !stripePaymentId) {
      logger.error("Webhook: Missing metadata for consultation checkout", { session });
      return;
  }

  await prisma.consultation.create({
      data: {
          userId,
          scanId,
          stripePaymentId,
          status: 'PENDING', // Initial status for a new consultation
      }
  });
  logger.info(`Webhook: Consultation created for user ${userId} and scan ${scanId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    let tier = "FREE";
    if (priceId === process.env.STRIPE_PRO_PRICE_ID && subscription.status === 'active') {
        tier = "PRO";
    }

    await prisma.user.update({
        where: { stripeCustomerId: customerId },
        data: {
            subscriptionTier: tier,
            subscriptionStatus: subscription.status.toUpperCase(),
        }
    });
    logger.info(`Webhook: Subscription updated for customer: ${customerId}`, { status: subscription.status, tier });
}