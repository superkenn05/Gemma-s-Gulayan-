
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * You will need to set up an account at https://www.emailjs.com/
 * and get your Service ID, Template ID, and Public Key.
 */

const EMAILJS_SERVICE_ID = 'service_default'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'template_order_update'; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Replace with your Public Key

export interface EmailParams {
  to_name: string;
  to_email: string;
  order_id: string;
  status: string;
  total_amount: string;
  items_summary: string;
  message?: string;
}

export async function sendOrderEmail(params: EmailParams) {
  try {
    // Note: In a real app, you'd check if the public key is set.
    // For now, we'll attempt the call. If not configured, it will gracefully fail in console.
    if (EMAILJS_PUBLIC_KEY === 'your_public_key') {
      console.warn('EmailJS not configured. Please set your Public Key in src/lib/email-service.ts');
      return;
    }

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        ...params,
        reply_to: 'support@gemmasgulayan.com',
      },
      EMAILJS_PUBLIC_KEY
    );

    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
