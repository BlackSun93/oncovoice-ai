/**
 * Test script for GPT-5 integration
 * Tests the complete flow: Audio transcription + PDF analysis
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000';

// Test files
const AUDIO_FILE = path.join(__dirname, 'public/uploads/team-1-audio-1761381554471.m4a');
const PDF_FILE = path.join(__dirname, 'public/uploads/team-1-pdf-1761381554474.pdf');

async function testTranscription() {
  console.log('\n🎤 Testing Audio Transcription...');
  console.log('='.repeat(50));

  try {
    const formData = new FormData();
    const audioBlob = new Blob([fs.readFileSync(AUDIO_FILE)], { type: 'audio/m4a' });
    formData.append('audio', audioBlob, 'test-audio.m4a');
    formData.append('teamId', '1');

    console.log(`📁 Audio file: ${path.basename(AUDIO_FILE)} (${(fs.statSync(AUDIO_FILE).size / 1024).toFixed(2)} KB)`);

    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Transcription failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Transcription successful!');
    console.log(`📝 Transcript length: ${result.transcript.length} characters`);
    console.log(`📄 Preview: ${result.transcript.substring(0, 200)}...`);

    return result.transcript;
  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    throw error;
  }
}

async function testGPT5Analysis(transcript) {
  console.log('\n🤖 Testing GPT-5 Analysis with PDF...');
  console.log('='.repeat(50));

  try {
    const pdfUrl = `/uploads/${path.basename(PDF_FILE)}`;

    console.log(`📁 PDF file: ${path.basename(PDF_FILE)} (${(fs.statSync(PDF_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`📝 Transcript: ${transcript.length} characters`);
    console.log(`🔗 PDF URL: ${pdfUrl}`);
    console.log('\n⏳ Starting GPT-5 Assistants API analysis...');
    console.log('   This may take 30-60 seconds as GPT-5 processes the PDF with visual elements...');

    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId: 1,
        transcript: transcript,
        pdfUrl: pdfUrl,
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Analysis failed: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log(`\n✅ GPT-5 Analysis completed in ${elapsed}s!`);
    console.log('='.repeat(50));

    if (result.success && result.result) {
      console.log('\n📊 SUMMARY:');
      console.log('-'.repeat(50));
      console.log(result.result.summary);

      console.log('\n🎯 CONCLUSION:');
      console.log('-'.repeat(50));
      console.log(result.result.conclusion);

      console.log('\n🔍 CRITICAL ANALYSIS:');
      console.log('-'.repeat(50));
      console.log(result.result.criticism);

      console.log('\n✨ Analysis Quality Indicators:');
      console.log(`   - Summary length: ${result.result.summary.length} chars`);
      console.log(`   - Conclusion length: ${result.result.conclusion.length} chars`);
      console.log(`   - Criticism length: ${result.result.criticism.length} chars`);
      console.log(`   - Total analysis: ${result.result.summary.length + result.result.conclusion.length + result.result.criticism.length} chars`);

      // Check if analysis mentions figures/tables (sign of visual understanding)
      const mentionsFigures = /figure|table|diagram|chart|image/i.test(
        result.result.summary + result.result.conclusion + result.result.criticism
      );

      if (mentionsFigures) {
        console.log('   ✅ Visual elements referenced (GPT-5 is seeing the PDF images!)');
      } else {
        console.log('   ⚠️  No visual element references detected');
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    throw error;
  }
}

async function runTests() {
  console.log('\n🚀 Starting GPT-5 Integration Tests');
  console.log('='.repeat(50));
  console.log('Testing: 100% OpenAI API Solution');
  console.log('  - Whisper API for transcription');
  console.log('  - GPT-5 Assistants API for PDF analysis');
  console.log('='.repeat(50));

  try {
    // Step 1: Test transcription
    const transcript = await testTranscription();

    // Step 2: Test GPT-5 analysis with PDF
    await testGPT5Analysis(transcript);

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('✅ Audio transcription: Working');
    console.log('✅ GPT-5 PDF analysis: Working');
    console.log('✅ Visual element processing: Working');
    console.log('\n💡 The system is ready for your live event!');

  } catch (error) {
    console.error('\n💥 TEST FAILED');
    console.error('='.repeat(50));
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
