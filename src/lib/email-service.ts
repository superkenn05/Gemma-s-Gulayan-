import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials:
 * Service ID: service_m3u0lak
 * Template ID (Pending): template_elfn3i8
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak';
const EMAILJS_TEMPLATE_ID = 'template_elfn3i8';
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj';

// Initialize EmailJS globally for the module
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailOrderItem {
  name: string;
  units: number;
  price: number;
}

export interface EmailParams {
  email: string;
  customer_name: string;
  order_id: string;
  order_date: string;
  items: EmailOrderItem[];
  shipping: number;
  tax: number;
  total: number;
  templateId?: string; // Optional override for different statuses
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

    // Mapping exactly to the Handlebars variables in the template
    const templateParams = {
      email: params.email,
      name: params.customer_name, // Maps to Hello {{name}}
      order_id: params.order_id,
      order_date: params.order_date,
      
      // Handlebars loop {{#orders}} expects name, units, price
      orders: params.items.map(item => ({
        name: item.name,
        units: item.units,
        price: item.price.toFixed(2)
      })),
      
      // Cost object for {{cost.total}}, {{cost.shipping}}, and {{cost.tax}}
      cost: {
        shipping: params.shipping.toFixed(2),
        tax: params.tax.toFixed(2),
        total: params.total.toFixed(2)
      }
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      params.templateId || EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return result;
  } catch (error: any) {
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    if (error?.status === 422) {
      console.error('DIAGNOSTIC: 422 Error indicates a mismatch in IDs or Public Key initialization.');
    }
    
    throw error;
  }
}
