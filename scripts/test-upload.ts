import fs from 'node:fs';
import path from 'node:path';

const appData = process.env.APPDATA || '';
const configPath = path.join(appData, 'shopify-cli-kit-nodejs', 'Config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const sessionStore = typeof config.sessionStore === 'string' ? JSON.parse(config.sessionStore) : config.sessionStore;
const accounts = sessionStore['accounts.shopify.com'];
const userSession = Object.values(accounts)[0] as any;
const targetAppKey = 'kyros-ox8yt4up.myshopify.com-7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c';
const token = userSession.applications[targetAppKey]?.accessToken;

async function shopifyGql(query: string, variables: any = {}) {
  const res = await fetch('https://kyros-ox8yt4up.myshopify.com/admin/api/2026-01/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function uploadImage(filePath: string, filename: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length;

  console.log(`Requesting staged upload for ${filename} (${fileSize} bytes)...`);

  const stagedRes = await shopifyGql(`
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: [
      {
        resource: 'IMAGE',
        filename,
        mimeType: 'image/jpeg',
        fileSize: String(fileSize),
        httpMethod: 'POST',
      }
    ]
  });

  if (stagedRes.data?.stagedUploadsCreate?.userErrors?.length > 0) {
    throw new Error(JSON.stringify(stagedRes.data.stagedUploadsCreate.userErrors));
  }

  const target = stagedRes.data.stagedUploadsCreate.stagedTargets[0];
  console.log('Staged target url:', target.url);
  console.log('Resource url:', target.resourceUrl);

  // Upload using standard FormData
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, filename);

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  console.log('Upload HTTP status:', uploadRes.status);
  return target.resourceUrl;
}

async function run() {
  const testFile = path.resolve('public/images/diamonds/round-solitaire-platinum.jpg');
  const resourceUrl = await uploadImage(testFile, 'round-solitaire-platinum.jpg');
  console.log('Successfully uploaded! Resource URL:', resourceUrl);

  // Now attach to first product
  const productId = 'gid://shopify/Product/16021402911089';
  const mediaRes = await shopifyGql(`
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          id
          status
          mediaContentType
        }
        mediaUserErrors {
          code
          field
          message
        }
      }
    }
  `, {
    productId,
    media: [
      {
        mediaContentType: 'IMAGE',
        originalSource: resourceUrl,
        alt: 'The Kyros Signature Solitaire Diamond Ring in Platinum 950'
      }
    ]
  });

  console.log('Media attach result:', JSON.stringify(mediaRes, null, 2));
}

run().catch(console.error);
