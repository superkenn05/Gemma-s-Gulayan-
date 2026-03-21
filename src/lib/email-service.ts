
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials:
 * Service ID: service_m3u0lak
 * Template ID: template_nec49hc
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = 'template_nec49hc'; 
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj'; 

export interface EmailOrderItem {
  name: string;
  units: number;
  price: number;
}

export interface EmailParams {
  email: string; // The recipient's email
  customer_name: string; // {{customer_name}}
  order_id: string; // {{order_id}}
  order_date: string; // {{order_date}}
  items: EmailOrderItem[]; // for {{#orders}} loop
  shipping: number; // {{cost.shipping}}
  tax: number; // {{cost.tax}}
  total: number; // {{cost.total}}
  [key: string]: any;
}

/**
 * Sends an order notification email using EmailJS.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    // Prevent sending if the email is invalid
    if (!params.email || !params.email.includes('@')) {
      console.warn('Skipping email: Invalid recipient address.');
      return null;
    }

    // Map the internal data to the template variables shown in the screenshot
    const templateParams = {
      email: params.email, // To Email: {{email}}
      customer_name: params.customer_name, // Hi {{customer_name}}
      order_id: params.order_id, // Order ID: {{order_id}}
      order_date: params.order_date, // Date: {{order_date}}
      
      // The orders loop expects name, units, and price
      orders: params.items.map(item => ({
        name: item.name,
        units: item.units,
        price: item.price.toFixed(2)
      })),
      
      // The cost object
      cost: {
        shipping: params.shipping.toFixed(2),
        tax: params.tax.toFixed(2),
        total: params.total.toFixed(2)
      }
    };

    /**
     * IMPORTANT: In EmailJS v4, the 4th argument MUST be an options object
     * containing the publicKey.
     */
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    return result;
  } catch (error: any) {
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    if (error?.status === 422) {
      console.error('DIAGNOSTIC: 422 Error usually means the Template ID, Service ID, or Public Key is incorrect.');
    }
    
    throw error;
  }
}
