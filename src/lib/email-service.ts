import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * You will need to set up an account at https://www.emailjs.com/
 * and get your Service ID, Template ID, and Public Key.
 */

// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_default'; 
const EMAILJS_TEMPLATE_ID = 'template_order_update'; 
const EMAILJS_PUBLIC_KEY = 'your_public_key'; 

export interface EmailParams {
  to_name: string;
  to_email: string;
  order_id: string;
  status: string;
  total_amount: string;
  items_summary: string;
  message?: string;
  [key: string]: any;
}

/**
 * Sends an order notification email using EmailJS.
 * Ensure the EmailJS public key is provided for the request to succeed.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    if (EMAILJS_PUBLIC_KEY === 'your_public_key' || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS not configured. Please set your Public Key in src/lib/email-service.ts');
      return null;
    }

    const templateParams = {
      ...params,
      reply_to: 'support@gemmasgulayan.com',
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', result.status, result.text);
    return result;
  } catch (error) {
    console.error('EmailJS Error:', error);
    // We throw the error so callers can handle it if needed
    throw error;
  }
}
