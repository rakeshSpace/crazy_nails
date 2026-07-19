const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const initRazorpayPayment = async (orderData, razorpayOrder, onSuccess, onError) => {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
    }
    
    const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Crazy Nails & Lashes',
        description: `Order #${orderData.orderNumber}`,
        image: '/logo192.png',
        order_id: razorpayOrder.id,
        handler: function(response) {
            onSuccess({
                order_id: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            });
        },
        prefill: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            contact: orderData.customerPhone
        },
        notes: {
            address: orderData.shippingAddress
        },
        theme: {
            color: '#d4a574'
        },
        modal: {
            ondismiss: function() {
                onError('Payment cancelled by user');
            }
        }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
};

export { initRazorpayPayment };