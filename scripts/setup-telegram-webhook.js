#!/usr/bin/env node

const https = require('https');

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL + '/api/telegram/webhook';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in environment');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ NEXT_PUBLIC_APP_URL not set in environment');
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.error('❌ TELEGRAM_WEBHOOK_SECRET not set in environment');
  process.exit(1);
}

// Function to make API call
function telegramApi(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.ok) {
            resolve(result);
          } else {
            reject(new Error(result.description || 'API error'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setupWebhook() {
  try {
    console.log('🔧 Setting up Telegram webhook...\n');
    
    // Get bot info
    const botInfo = await telegramApi('getMe');
    console.log(`✅ Bot connected: @${botInfo.result.username}`);
    
    // Set webhook
    const webhookResult = await telegramApi('setWebhook', {
      url: WEBHOOK_URL,
      secret_token: WEBHOOK_SECRET,
      allowed_updates: [
        'message',
        'edited_message',
        'channel_post',
        'edited_channel_post',
        'callback_query',
        'my_chat_member',
        'chat_member'
      ]
    });
    
    console.log(`✅ Webhook set to: ${WEBHOOK_URL}`);
    
    // Get webhook info
    const webhookInfo = await telegramApi('getWebhookInfo');
    console.log('\n📊 Webhook Status:');
    console.log(`   URL: ${webhookInfo.result.url}`);
    console.log(`   Has secret: ${webhookInfo.result.has_custom_certificate ? 'Yes' : 'No'}`);
    console.log(`   Pending updates: ${webhookInfo.result.pending_update_count}`);
    
    if (webhookInfo.result.last_error_message) {
      console.log(`   ⚠️ Last error: ${webhookInfo.result.last_error_message}`);
    }
    
    console.log('\n✅ Telegram bot webhook setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure your app is deployed to a public URL');
    console.log('   2. Test the bot by sending /start command');
    console.log('   3. Add the bot to a Telegram group as admin');
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    process.exit(1);
  }
}

// For local development - delete webhook
async function deleteWebhook() {
  try {
    console.log('🔧 Deleting Telegram webhook for local development...\n');
    
    const result = await telegramApi('deleteWebhook');
    console.log('✅ Webhook deleted');
    
    console.log('\n📝 For local development, you can use:');
    console.log('   - Polling mode (not implemented in this setup)');
    console.log('   - ngrok to expose local server');
    console.log('   - Deploy to staging environment');
    
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
    process.exit(1);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'delete') {
  deleteWebhook();
} else {
  setupWebhook();
}