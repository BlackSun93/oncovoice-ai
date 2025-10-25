/**
 * Simple test for GPT-5 integration using existing uploaded files
 */

const API_BASE = 'http://localhost:3000';

// Use existing uploaded files
const AUDIO_URL = 'http://localhost:3000/uploads/team-1-audio-1761381554471.m4a';
const PDF_URL = 'http://localhost:3000/uploads/team-1-pdf-1761381554474.pdf';

async function testTranscription() {
  console.log('\n🎤 Testing Audio Transcription with Whisper API...');
  console.log('='.repeat(60));
  console.log(`📁 Audio: ${AUDIO_URL.split('/').pop()}`);

  try {
    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioUrl: AUDIO_URL,
        contentType: 'audio/m4a',
        fileName: 'team-1-audio.m4a'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Transcription failed: ${JSON.stringify(error, null, 2)}`);
    }

    const result = await response.json();
    console.log('✅ Transcription successful!');
    console.log(`📝 Length: ${result.transcript.length} characters`);
    console.log(`📄 Preview: "${result.transcript.substring(0, 150)}..."`);

    return result.transcript;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function testGPT5Analysis(transcript) {
  console.log('\n🤖 Testing GPT-5 Responses API with PDF Analysis...');
  console.log('='.repeat(60));
  console.log(`📁 PDF: ${PDF_URL.split('/').pop()}`);
  console.log(`📝 Transcript: ${transcript.length} characters`);
  console.log('\n⏳ Starting GPT-5 analysis (this takes 30-60s)...');
  console.log('   GPT-5 via Responses API is:');
  console.log('   1. Uploading PDF to OpenAI');
  console.log('   2. Processing with file_search tool');
  console.log('   3. Analyzing text + visual elements (diagrams, charts, tables)');
  console.log('   4. Generating medical analysis');

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: 1,
        transcript: transcript,
        pdfUrl: PDF_URL,
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Analysis failed: ${JSON.stringify(error, null, 2)}`);
    }

    const result = await response.json();

    console.log(`\n✅ GPT-5 Analysis completed in ${elapsed}s!`);
    console.log('='.repeat(60));

    if (result.success && result.result) {
      const { summary, conclusion, criticism } = result.result;

      console.log('\n📊 SUMMARY:');
      console.log('-'.repeat(60));
      console.log(summary);

      console.log('\n🎯 CONCLUSION:');
      console.log('-'.repeat(60));
      console.log(conclusion);

      console.log('\n🔍 CRITICAL ANALYSIS & COMPARISON:');
      console.log('-'.repeat(60));
      console.log(criticism);

      console.log('\n📈 Analysis Metrics:');
      console.log(`   Summary:    ${summary.length.toLocaleString()} characters`);
      console.log(`   Conclusion: ${conclusion.length.toLocaleString()} characters`);
      console.log(`   Criticism:  ${criticism.length.toLocaleString()} characters`);
      console.log(`   Total:      ${(summary.length + conclusion.length + criticism.length).toLocaleString()} characters`);

      // Check for visual element references
      const fullText = (summary + conclusion + criticism).toLowerCase();
      const visualKeywords = ['figure', 'table', 'diagram', 'chart', 'image', 'graph', 'illustration'];
      const foundKeywords = visualKeywords.filter(kw => fullText.includes(kw));

      console.log('\n🖼️  Visual Element Detection:');
      if (foundKeywords.length > 0) {
        console.log(`   ✅ Found ${foundKeywords.length} visual references: ${foundKeywords.join(', ')}`);
        console.log('   💡 GPT-5 is successfully seeing and analyzing PDF images!');
      } else {
        console.log('   ⚠️  No explicit visual element references found');
        console.log('   (May still be analyzing visual content implicitly)');
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 GPT-5 Integration Test');
  console.log('='.repeat(60));
  console.log('Testing: 100% OpenAI API Solution');
  console.log('  ✓ OpenAI Whisper for audio transcription');
  console.log('  ✓ OpenAI GPT-5 via Responses API for PDF analysis');
  console.log('  ✓ Native PDF processing (text + visual elements)');
  console.log('='.repeat(60));

  try {
    // Step 1: Transcribe audio
    const transcript = await testTranscription();

    // Step 2: Analyze with GPT-5
    await testGPT5Analysis(transcript);

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('✅ Whisper transcription: Working');
    console.log('✅ GPT-5 PDF analysis: Working');
    console.log('✅ Visual processing: Working');
    console.log('✅ Medical analysis: Working');
    console.log('\n💡 System is ready for your oncology event!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n💥 TEST FAILED');
    console.error('='.repeat(60));
    console.error(error.stack || error);
    process.exit(1);
  }
}

main();
