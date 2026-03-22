import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const images = [
  { name: 'intro.jpg', url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2000&auto=format&fit=crop' },
  { name: 'sapporo.jpg', url: 'https://images.unsplash.com/photo-1542055908-2713021ce8c2?q=80&w=2000&auto=format&fit=crop' },
  { name: 'tokyo.jpg', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2000&auto=format&fit=crop' },
  { name: 'fuji.jpg', url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=2000&auto=format&fit=crop' },
  { name: 'kyoto.jpg', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop' },
  { name: 'nara.jpg', url: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=2000&auto=format&fit=crop' },
  { name: 'hiroshima.jpg', url: 'https://images.unsplash.com/photo-1522850959516-58f958dde2c1?q=80&w=2000&auto=format&fit=crop' },
  { name: 'finale.jpg', url: 'https://images.unsplash.com/photo-1505069190533-da1c9af13346?q=80&w=2000&auto=format&fit=crop' }
];

async function download() {
  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }
  for (const img of images) {
    try {
      console.log(`Downloading ${img.name}...`);
      const res = await fetch(img.url);
      const fileStream = fs.createWriteStream(`public/images/${img.name}`);
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
      console.log(`Successfully downloaded ${img.name}`);
    } catch (e) {
      console.error(`Failed to download ${img.name}:`, e);
    }
  }
}
download();
