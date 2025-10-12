import Vapi from '@vapi-ai/web';

console.log('Initializing VAPI SDK with token:', process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? 'Set' : 'Missing');

let vapi;
try {
  vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);
  console.log('VAPI SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize VAPI SDK:', error);
  throw error;
}

export { vapi };
