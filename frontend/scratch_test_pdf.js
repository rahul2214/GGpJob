const fs = require('fs');

async function testPdfEndpoints() {
  const pdfPath = 'C:\\Users\\Rahul Naik G\\OneDrive - Dhruv Compusoft Consultancy Pvt Ltd\\Desktop\\sample\\design\\AutoJobApply\\resume.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found at " + pdfPath);
    return;
  }
  const fileBuffer = fs.readFileSync(pdfPath);
  
  // Create Form Data
  const formData = new FormData();
  const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
  formData.append('file', fileBlob, 'resume.pdf');
  formData.append('jobDescription', 'Looking for a Software Engineer with experience in React, Next.js, Node.js, and TypeScript.');

  console.log('Testing /api/ats-score...');
  try {
    const res = await fetch('http://localhost:9002/api/ats-score', {
      method: 'POST',
      body: formData
    });
    console.log('ATS Score Status:', res.status);
    const data = await res.json();
    console.log('ATS Score Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error testing ATS score:', err);
  }

  console.log('\nTesting /api/resume/parse...');
  try {
    const parseFormData = new FormData();
    parseFormData.append('file', fileBlob, 'resume.pdf');
    
    const res = await fetch('http://localhost:9002/api/resume/parse', {
      method: 'POST',
      body: parseFormData
    });
    console.log('Resume Parse Status:', res.status);
    const data = await res.json();
    console.log('Resume Parse Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error testing Resume parse:', err);
  }
}

testPdfEndpoints();
