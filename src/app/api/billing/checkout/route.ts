import { NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe.service";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, scanId } = body;
    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    let customerId = dbUser?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
      customerId = customer.id;
    }

    const price = await stripe.prices.retrieve(priceId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: price.recurring ? 'subscription' : 'payment', // DYNAMIC MODE
      success_url: price.recurring 
        ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard?success=true`
        : `${process.env.NEXT_PUBLIC_API_URL}/scan/${scanId}?consultation_success=true`,
      cancel_url: price.recurring
        ? `${process.env.NEXT_PUBLIC_API_URL}/pricing?canceled=true`
        : `${process.env.NEXT_PUBLIC_API_URL}/scan/${scanId}`,
      // Attach metadata for one-time payments
      ...(price.recurring ? {} : {
        payment_intent_data: {
          metadata: {
            userId: user.id,
            scanId: scanId,
          }
        },
        metadata: {
          userId: user.id,
          scanId: scanId,
        }
      })
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    logger.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}