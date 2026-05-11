export type PublicCard = {
  uniqueId: string;
  studentName: string;
  photoUrl: string | null;
  isFirstTime: boolean;
};

export type UnlockedCard = PublicCard & {
  driveUrl: string | null;
  spotifyUrl: string | null;
  videoUrl: string | null;
};

export type AdminCardRow = {
  id: string;
  unique_id: string;
  student_name: string;
  photo_url: string | null;
  drive_url: string | null;
  spotify_url: string | null;
  video_url: string | null;
  pin_hash: string | null;
  is_first_time: boolean;
  created_at: string;
  updated_at: string;
};
