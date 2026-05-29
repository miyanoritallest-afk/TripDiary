import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const q = searchParams.get('q');

  if (q) {
    // 地名 → 座標（forward geocoding）
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ja`;
    const res = await fetch(url, { headers: { 'User-Agent': 'TripDiary/1.0' } });
    if (!res.ok) return NextResponse.json({ error: 'Geocoding API error' }, { status: 502 });
    const data = await res.json() as { display_name: string; lat: string; lon: string }[];
    return NextResponse.json(
      data.map((d) => ({ name: d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon) })),
    );
  }

  if (lat && lng) {
    // 座標 → 地名（reverse geocoding）
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`;
    const res = await fetch(url, { headers: { 'User-Agent': 'TripDiary/1.0' } });
    if (!res.ok) return NextResponse.json({ error: 'Geocoding API error' }, { status: 502 });
    const data = await res.json() as { display_name?: string };
    return NextResponse.json({ name: data.display_name ?? '' });
  }

  return NextResponse.json({ error: 'lat/lng または q パラメーターが必要です' }, { status: 400 });
}
