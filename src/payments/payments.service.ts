import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret);

    async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

        // with implicit return 
        const { currency, items, orderId } = paymentSessionDto;

        const lineItems = items.map(item => ({
            price_data: {

                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity
        }))

        const session = await this.stripe.checkout.sessions.create({
            // place here id of my order
            payment_intent_data: {
                metadata: {
                    orderId: orderId
                }
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl
        });

        return session;
    }


    // the stripe's sign will come from the petition's header
    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];

        let event: Stripe.Event;
        //This is your Stripe CLI webhook secret for testing your endpoint locally.
        //const endpointSecret ='whsec_3ed5e120249e2fbf279696c26b47e9aa08844764fc5daedfdb2e6d8aad2bba4a';

        // Real
        const endpointSecret = envs.stripeEndpointSecret


        try {
            event = this.stripe.webhooks.constructEvent(
                //req.body, in express
                req['rawBody'], // in nest , check main.ts 
                sig,
                endpointSecret,
            );
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return; // this is important for it not continue
        }

        // console.log({ event });
        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                //TODO: Call our microservice
                console.log({
                    metadata: chargeSucceeded.metadata,
                    orderId: chargeSucceeded.metadata.orderId,
                });
                break;
            default:
                console.log(`Event ${event.type} not handled`)

        }

        //return res.status(200).json({ sig })
        return res.status(200).json({ sig })

    }

}
