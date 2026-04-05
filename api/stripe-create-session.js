const Stripe = require('stripe');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: 'https://mancoserver.surge.sh/gracias.html',
            cancel_url: 'https://mancoserver.surge.sh/checkout.html',
        });

        res.status(200).json({ sessionId: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
