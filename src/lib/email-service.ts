import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials from Screenshot:
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
  email: string; // Recipient: {{email}}
  customer_name: string; // Greeting: {{name}}
  order_id: string; // Order ID: {{order_id}}
  order_date: string; // Optional: {{order_date}}
  items: EmailOrderItem[]; // Loop: {{#orders}} ... {{/orders}}
  shipping: number; // {{cost.shipping}}
  tax: number; // {{cost.tax}}
  total: number; // {{cost.total}}
}

/**
 * Sends an order notification email using EmailJS.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    if (!params.email || !params.email.includes('@')) {
      console.warn('Skipping email: Invalid recipient address.');
      return null;
    }

    // Mapping to the specific variables seen in the user's template screenshot
    const templateParams = {
      email: params.email, // Maps to {{email}} in "To Email" field
      name: params.customer_name, // Maps to Hello {{name}}
      order_id: params.order_id, // Maps to Order ID: {{order_id}}
      order_date: params.order_date,
      
      // The orders loop expects {{name}}, {{units}}, and {{price}}
      orders: params.items.map(item => ({
        name: item.name,
        units: item.units,
        price: item.price.toFixed(2)
      })),
      
      // The cost object for {{cost.total}}, {{cost.shipping}}, etc.
      cost: {
        shipping: params.shipping.toFixed(2),
        tax: params.tax.toFixed(2),
        total: params.total.toFixed(2)
      }
    };

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
