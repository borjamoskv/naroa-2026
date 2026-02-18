import yt_dlp
import os

URL = 'https://www.youtube.com/watch?v=ZVZEUpHL_FA'
OUTPUT_TEMPLATE = 'source_audio'

def download_audio():
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': OUTPUT_TEMPLATE,
        'quiet': False
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([URL])

if __name__ == "__main__":
    if os.path.exists("source_audio.wav"):
        print("Audio already exists, skipping download.")
    else:
        print(f"Downloading audio from {URL}...")
        download_audio()
        print("Download complete.")
