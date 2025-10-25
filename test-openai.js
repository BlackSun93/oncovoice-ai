// Quick test to verify OpenAI API key is working
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai').default;

async function testOpenAI() {
  console.log('Testing OpenAI API connection...');
  console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
  console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\nTesting with a simple completion...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: "Say 'API is working!'" }],
      max_tokens: 10,
    });

    console.log('✅ SUCCESS! OpenAI API is working');
    console.log('Response:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ ERROR! OpenAI API failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.status) console.error('Status code:', error.status);
    if (error.code) console.error('Error code:', error.code);
    return false;
  }
}

testOpenAI().then(success => {
  process.exit(success ? 0 : 1);
});
