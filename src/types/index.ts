export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  isFollowing: boolean;
};

export type PhotoPin = {
  photoIndex: number;    // 0始まりの写真インデックス
  locationName: string;  // 表示テキスト（例: "京都・嵐山"）
  lat: number;
  lng: number;
};

export type Post = {
  id: string;
  user: User;
  photoUrls: string[];   // 最大6枚
  photoPins: PhotoPin[]; // 各写真のピン情報（任意）
  body: string;
  hashtags: string[];
  likeCount: number;
  wantToGoCount: number;
  createdAt: string;     // ISO8601
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'navi';
  content: string;
  createdAt: string;
};

export type NaviThread = {
  id: string;
  title: string;
  thumbnailUrl: string;
  messages: ChatMessage[];
  sourcePostId?: string; // 「行きたい！」から生成された場合の元投稿ID
  createdAt: string;
  updatedAt: string;
};
