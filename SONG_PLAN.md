# Personal Song Dedications - Implementation Plan

## Requirements
1. Upload modal accepts audio files (currently only images/videos)
2. Instagram-style audio controls on gallery cards
3. Song is a personal dedication per uploader
4. Song plays across an uploader's memories (from first to last card)
5. When swiping to a different person's memories, their song plays
6. Max 30 sec playback if only one photo memory

## Changes Needed

### 1. Upload Modal (HTML)
- Song upload zone already exists — update label to "Your Dedication Song"
- Show confirmation when song is selected (song name + duration)

### 2. Upload Flow (JS)
- `handleSongUpload()` — store the song file reference
- `submitUpload()` — upload song to backend via `/api/upload-song`, store URL in Firebase gallery entries
- Each card in Firebase gets `uploaderSong: <cloudinary_url>` field

### 3. Gallery Playback (JS)
- Replace the old background music system with per-uploader audio
- `goToCard()` — detect uploader name change, swap audio source
- Create a dedicated Audio element for dedication songs
- Count cards per uploader to determine if single-photo (30s max)
- Auto-play/pause on card navigation

### 4. IG-Style Audio Controls (CSS + HTML)
- Floating audio pill on active gallery card (like IG Reels music sticker)
- Shows song name + progress arc + play/pause
- Animated equalizer bars when playing

### 5. Song Bar
- Update existing song bar to show current uploader's song info
- Show "🎵 Teddy's dedication" instead of generic title
