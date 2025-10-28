/**
 * Script to upload PDFs to Vercel Blob storage
 * Run: node upload-pdfs.js
 */

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const PDFS_DIR = path.join(__dirname, 'pdfs');

// PDF filenames to upload
const PDF_FILES = [
  '1-ILD and cancer therapy combined.pdf',
  '2-Managing a patient with very early HER2+ disease combined.pdf',
  '3-Radiotherapy after neoadjuvant therapy in 2025 combined.pdf',
  '4-What is peculiar about brain metastasis combined.pdf',
  '5-ADCs in HER2-positive breast cancer safety and efficacy combined.pdf',
  '6-Dose dense chemotherapy with G-CSF support for early breast cancer combined.pdf',
  '7-Management of isolated local recurrence combined.pdf',
  '8-Managing AEs of targeted and endocrine therapy combinations combined.pdf',
  '9-Molecular testing in Advanced ER+ breast cancer combined.pdf',
  '10-When to position ADCs in metastatic ER+ disease combined.pdf',
];

async function uploadPDFs() {
  console.log('Starting PDF upload to Vercel Blob...\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment variables');
    console.error('Please ensure .env.local contains BLOB_READ_WRITE_TOKEN');
    process.exit(1);
  }

  const uploadedUrls = {};

  for (const filename of PDF_FILES) {
    const filePath = path.join(PDFS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    try {
      console.log(`📤 Uploading: ${filename}...`);

      const fileBuffer = fs.readFileSync(filePath);
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      uploadedUrls[filename] = blob.url;
      console.log(`✅ Uploaded: ${blob.url}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${filename}:`, error.message);
    }
  }

  // Create placeholder PDFs info
  console.log('\n📝 Summary of uploaded PDFs:');
  console.log('='.repeat(60));
  Object.entries(uploadedUrls).forEach(([filename, url]) => {
    console.log(`${filename}`);
    console.log(`  → ${url}\n`);
  });

  console.log('\n⚠️  Note: Teams 11-15 need placeholder PDFs');
  console.log('You can create simple placeholder PDFs or reuse existing ones.');

  // Save URLs to a file for reference
  const outputPath = path.join(__dirname, 'uploaded-pdf-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(uploadedUrls, null, 2));
  console.log(`\n💾 URLs saved to: ${outputPath}`);
}

uploadPDFs().catch(console.error);
