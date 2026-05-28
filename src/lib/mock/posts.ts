import { Post } from '@/types';
import { mockUsers } from './users';

export const mockPosts: Post[] = [
  {
    id: 'post_1',
    user: mockUsers[0], // 田中さくら
    photoUrls: [
      'https://picsum.photos/seed/kyoto1/800/600',
      'https://picsum.photos/seed/kyoto2/800/600',
      'https://picsum.photos/seed/kyoto3/800/600',
      'https://picsum.photos/seed/kyoto4/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '京都・嵐山', lat: 35.0094, lng: 135.6722 },
      { photoIndex: 1, locationName: '金閣寺', lat: 35.0394, lng: 135.7292 },
      { photoIndex: 2, locationName: '清水寺', lat: 34.9948, lng: 135.7851 },
    ],
    body: '京都の紅葉が最高でした！嵐山から金閣寺、清水寺と巡りましたが、どこも息をのむ美しさ。来年もまた来たいな〜。',
    hashtags: ['京都旅行', '紅葉', '一人旅', '女子旅'],
    likeCount: 42,
    wantToGoCount: 18,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-20T09:00:00Z',
  },
  {
    id: 'post_2',
    user: mockUsers[1], // 山田たろう
    photoUrls: [
      'https://picsum.photos/seed/okinawa1/800/600',
      'https://picsum.photos/seed/okinawa2/800/600',
      'https://picsum.photos/seed/okinawa3/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '沖縄・那覇', lat: 26.2124, lng: 127.6809 },
      { photoIndex: 1, locationName: '美ら海水族館', lat: 26.6938, lng: 127.8783 },
      { photoIndex: 2, locationName: '古宇利島', lat: 26.8672, lng: 128.0378 },
    ],
    body: '沖縄の海は最高すぎた！美ら海水族館のジンベエザメに感動。古宇利島のビーチも最高でした。',
    hashtags: ['沖縄', '海', '夏旅', 'シュノーケリング'],
    likeCount: 89,
    wantToGoCount: 35,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-18T14:00:00Z',
  },
  {
    id: 'post_3',
    user: mockUsers[2], // 佐藤はな
    photoUrls: [
      'https://picsum.photos/seed/paris1/800/600',
      'https://picsum.photos/seed/paris2/800/600',
      'https://picsum.photos/seed/paris3/800/600',
      'https://picsum.photos/seed/paris4/800/600',
      'https://picsum.photos/seed/paris5/800/600',
      'https://picsum.photos/seed/paris6/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: 'エッフェル塔', lat: 48.8584, lng: 2.2945 },
      { photoIndex: 1, locationName: 'ルーブル美術館', lat: 48.8606, lng: 2.3376 },
      { photoIndex: 2, locationName: 'モンマルトル', lat: 48.8867, lng: 2.3431 },
      { photoIndex: 4, locationName: 'シャンゼリゼ通り', lat: 48.8698, lng: 2.3078 },
    ],
    body: 'パリ5日間の旅！エッフェル塔は何度見ても感動する。ルーブルは半日では全然足りなかった笑。次はもっとゆっくり来たい！',
    hashtags: ['パリ', 'フランス', 'ヨーロッパ', '海外旅行'],
    likeCount: 124,
    wantToGoCount: 67,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-15T10:30:00Z',
  },
  {
    id: 'post_4',
    user: mockUsers[3], // 鈴木けんじ
    photoUrls: [
      'https://picsum.photos/seed/hokkaido1/800/600',
      'https://picsum.photos/seed/hokkaido2/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '北海道・富良野', lat: 43.3417, lng: 142.3833 },
      { photoIndex: 1, locationName: '美瑛の丘', lat: 43.5884, lng: 142.4677 },
    ],
    body: 'ラベンダーの季節の富良野は別世界でした。美瑛の丘もドライブが最高！北海道グルメも堪能しました。',
    hashtags: ['北海道', 'ラベンダー', '富良野', 'ドライブ旅'],
    likeCount: 56,
    wantToGoCount: 29,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-12T16:00:00Z',
  },
  {
    id: 'post_5',
    user: mockUsers[4], // 伊藤みか
    photoUrls: [
      'https://picsum.photos/seed/hakone1/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '箱根・芦ノ湖', lat: 35.1929, lng: 139.0217 },
    ],
    body: '箱根の温泉で日頃の疲れが全部とれた〜！富士山も見えて最高の週末でした♨️',
    hashtags: ['箱根', '温泉', '週末旅行', '富士山'],
    likeCount: 33,
    wantToGoCount: 14,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-10T11:00:00Z',
  },
  {
    id: 'post_6',
    user: mockUsers[0], // 田中さくら
    photoUrls: [
      'https://picsum.photos/seed/taiwan1/800/600',
      'https://picsum.photos/seed/taiwan2/800/600',
      'https://picsum.photos/seed/taiwan3/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '台北・九份', lat: 25.1095, lng: 121.8448 },
      { photoIndex: 1, locationName: '台北101', lat: 25.0338, lng: 121.5646 },
    ],
    body: '台湾4日間！九份は映画の世界みたいで感動。夜市のグルメも最高でした。また絶対行く！',
    hashtags: ['台湾', '台北', '九份', '夜市', 'アジア旅'],
    likeCount: 71,
    wantToGoCount: 41,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-08T09:00:00Z',
  },
  {
    id: 'post_7',
    user: mockUsers[1], // 山田たろう
    photoUrls: [
      'https://picsum.photos/seed/nikko1/800/600',
      'https://picsum.photos/seed/nikko2/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '日光東照宮', lat: 36.7580, lng: 139.5993 },
    ],
    body: '日光東照宮、歴史の重みを感じる場所でした。紅葉の時期にまた来てみたい。',
    hashtags: ['日光', '東照宮', '世界遺産', '歴史旅'],
    likeCount: 28,
    wantToGoCount: 12,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-05T13:00:00Z',
  },
  {
    id: 'post_8',
    user: mockUsers[2], // 佐藤はな
    photoUrls: [
      'https://picsum.photos/seed/bali1/800/600',
      'https://picsum.photos/seed/bali2/800/600',
      'https://picsum.photos/seed/bali3/800/600',
      'https://picsum.photos/seed/bali4/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: 'バリ島・ウブド', lat: -8.5069, lng: 115.2625 },
      { photoIndex: 2, locationName: 'タナロット寺院', lat: -8.6215, lng: 115.0869 },
    ],
    body: 'バリ島でリゾート三昧🌴ウブドの棚田とタナロット寺院が特に印象的でした。スパも最高！',
    hashtags: ['バリ島', 'インドネシア', 'リゾート', 'ビーチ'],
    likeCount: 98,
    wantToGoCount: 52,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'post_9',
    user: mockUsers[3], // 鈴木けんじ
    photoUrls: [
      'https://picsum.photos/seed/osaka1/800/600',
      'https://picsum.photos/seed/osaka2/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: '大阪・道頓堀', lat: 34.6687, lng: 135.5012 },
      { photoIndex: 1, locationName: '大阪城', lat: 34.6873, lng: 135.5262 },
    ],
    body: '大阪グルメ旅！たこ焼き・お好み焼き・串カツを制覇。道頓堀の活気が最高でした。',
    hashtags: ['大阪', 'グルメ旅', 'たこ焼き', '道頓堀'],
    likeCount: 45,
    wantToGoCount: 22,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-04-28T15:00:00Z',
  },
  {
    id: 'post_10',
    user: mockUsers[4], // 伊藤みか
    photoUrls: [
      'https://picsum.photos/seed/singapore1/800/600',
      'https://picsum.photos/seed/singapore2/800/600',
      'https://picsum.photos/seed/singapore3/800/600',
    ],
    photoPins: [
      { photoIndex: 0, locationName: 'マリーナベイサンズ', lat: 1.2836, lng: 103.8607 },
      { photoIndex: 1, locationName: 'ガーデンズ・バイ・ザ・ベイ', lat: 1.2816, lng: 103.8636 },
    ],
    body: 'シンガポール3日間！マリーナベイサンズのプールからの夜景が忘れられない。チキンライスも最高でした🍚',
    hashtags: ['シンガポール', '海外旅行', 'アジア', 'リゾート'],
    likeCount: 63,
    wantToGoCount: 38,
    isLiked: false,
    isWantToGo: false,
    createdAt: '2026-04-25T12:00:00Z',
  },
];
