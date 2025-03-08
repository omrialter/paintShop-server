const axios = require('axios')



exports.getTokenOk = async () => {
    const response = await axios({
        url: process.env.PAYPAL_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })


    return response.data;
}


async function generateAccessToken() {

    const response = await axios({
        url: process.env.PAYPAL_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })


    return response.data.access_token
}

exports.createOrder = async () => {


    const accessToken = await generateAccessToken()

    const response = await axios({
        url: process.env.PAYPAL_URL + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items: [
                        {
                            name: 'Painting',
                            description: 'Description of the painting',
                            quantity: 1,
                            unit_amount: {
                                currency_code: 'ILS',
                                value: '100.00'
                            }
                        }
                    ],

                    amount: {
                        currency_code: 'ILS',
                        value: '100.00',
                        breakdown: {
                            item_total: {
                                currency_code: 'ILS',
                                value: '100.00'
                            }
                        }
                    }
                }
            ],

            application_context: {
                return_url: process.env.PAINTSHOP_URL + '/completeOrder',
                cancel_url: process.env.PAINTSHOP_URL + '/checkout',
                user_action: 'PAY_NOW',
                brand_name: 'paintshop'
            }
        })
    })

    return response.data.links.find(link => link.rel === 'approve').href
}

exports.capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken();

    try {
        const response = await axios({
            url: process.env.PAYPAL_URL + `/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        });
        console.log("PayPal capture response:", response.data);
        return response.data;
    } catch (error) {
        // Detailed log here:
        if (error.response) {
            console.error("Detailed PayPal Error:", error.response.data);
        } else {
            console.error("Error without response:", error);
        }
        throw error;
    }
};



