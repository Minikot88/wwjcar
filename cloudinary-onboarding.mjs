#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dg5dvbeor',
  api_key: '315261934763679',
  api_secret: '3RWZqglOgM4EhEyy6aDil8cydfs',
  secure: true,
});

const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

async function run() {
  const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
    folder: 'onboarding_samples',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  console.log('Uploaded image secure URL:', uploadResult.secure_url);
  console.log('Uploaded image public ID:', uploadResult.public_id);

  const details = await cloudinary.api.resource(uploadResult.public_id);

  console.log('Image width:', details.width);
  console.log('Image height:', details.height);
  console.log('Image format:', details.format);
  console.log('Image file size in bytes:', details.bytes);

  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    secure: true,
    // f_auto lets Cloudinary choose the best image format for the browser.
    fetch_format: 'auto',
    // q_auto lets Cloudinary choose an efficient quality level automatically.
    quality: 'auto',
  });

  console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
  console.log(transformedUrl);
}

run().catch((error) => {
  console.error('Cloudinary onboarding failed:', error.message);
  process.exitCode = 1;
});
