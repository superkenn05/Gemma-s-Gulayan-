
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials from User Dashboard:
 * Service ID: service_m3u0lak
 * Template ID: template_elfn3i8
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = 'template_elfn3i8'; 
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj'; 

// Initialize EmailJS globally once at the module level.
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailOrderItem {
  name: string;
  price: string;
  units: string;
}

export interface EmailParams {
  email: string; // The recipient email (matches {{email}} in template)
  order_id: string; // Matches {{order_id}} in template
  orders: EmailOrderItem[]; // Matches {{#orders}} loop in template
  cost: {
    shipping: string;
    tax: string;
    total: string;
  };
  [key: string]: any;
}

/**
 * Sends an order notification email using EmailJS.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    // Basic validation
    if (!params.email || !params.email.includes('@')) {
      console.warn('Skipping email: Invalid or missing recipient email address.');
      return null;
    }

    // Mapping to match the template screenshot exactly
    const templateParams = {
      email: params.email,
      order_id: params.order_id,
      orders: params.orders,
      cost: params.cost,
    };

    console.log('Sending email with params:', JSON.stringify(templateParams, null, 2));

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', result.status, result.text);
    return result;
  } catch (error: any) {
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    if (error?.status === 422) {
      console.error('DIAGNOSTIC: Error 422 means the request was rejected. Verify Service ID and Template ID match Public Key.');
    }
    
    throw error;
  }
}
