import fs from 'fs';
import path from 'path';

export function getFfmpegBin(): string {
  const gyanPath = 'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin\\ffmpeg.exe';
  if (fs.existsSync(gyanPath)) return gyanPath;
  return 'ffmpeg';
}

export function getFfprobeBin(): string {
  const gyanPath = 'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin\\ffprobe.exe';
  if (fs.existsSync(gyanPath)) return gyanPath;
  return 'ffprobe';
}

// Automatically ensure Gyan FFmpeg is on process.env.PATH
const gyanBinDir = 'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin';
if (fs.existsSync(gyanBinDir)) {
  const sep = path.delimiter;
  if (!process.env.PATH?.includes(gyanBinDir)) {
    process.env.PATH = `${gyanBinDir}${sep}${process.env.PATH || ''}`;
  }
  if (!process.env.Path?.includes(gyanBinDir)) {
    process.env.Path = `${gyanBinDir}${sep}${process.env.Path || ''}`;
  }
}
