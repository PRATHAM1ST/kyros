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

async function check() {
  const res = await fetch('https://kyros-ox8yt4up.myshopify.com/admin/api/2026-01/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      query: `
        {
          products(first: 10) {
            nodes {
              id
              title
              handle
              status
              media(first: 5) {
                nodes {
                  alt
                  mediaContentType
                  preview {
                    image {
                      url
                    }
                  }
                }
              }
              metafields(first: 15) {
                nodes {
                  namespace
                  key
                  value
                }
              }
            }
          }
        }
      `
    })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

check().catch(console.error);
