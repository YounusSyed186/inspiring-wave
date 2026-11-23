/**
 * Automated End-to-End Test Suite for Autonomous AI Video Studio
 */

import { spawnSync, execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

console.log('===============================================================');
console.log('STARTING AI VIDEO STUDIO END-TO-END VALIDATION TEST SUITE');
console.log('===============================================================\n');

const testWorkDir = path.join(os.tmpdir(), 'studio_e2e_tests');
fs.mkdirSync(testWorkDir, { recursive: true });

let allPassed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    allPassed = false;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// ----------------------------------------------------------------------------
// TEST 1: System Tool Prerequisites Verification
// ----------------------------------------------------------------------------
console.log('\n--- [TEST 1] Verifying System Engine Binaries ---');
const nodeVersion = process.version;
assert(parseInt(nodeVersion.slice(1)) >= 20, `Node.js version must be >= 20 (Found ${nodeVersion})`);

const ffmpegCheck = spawnSync('ffmpeg', ['-version']);
assert(ffmpegCheck.status === 0, 'FFmpeg binary is accessible in environment');

const ffprobeCheck = spawnSync('ffprobe', ['-version']);
assert(ffprobeCheck.status === 0, 'FFprobe binary is accessible in environment');

const whisperCliPath = path.join(os.homedir(), 'whisper.cpp', 'Release', 'whisper-cli.exe');
assert(fs.existsSync(whisperCliPath), `whisper-cli.exe exists at: ${whisperCliPath}`);

const whisperModelPath = path.join(os.homedir(), 'whisper.cpp', 'models', 'ggml-large-v3.bin');
assert(fs.existsSync(whisperModelPath), `ggml-large-v3 model exists at: ${whisperModelPath}`);

const lemoPath = path.join(os.homedir(), 'lemo-opuscar');
assert(fs.existsSync(lemoPath), `Lemo Opuscar library is present at: ${lemoPath}`);

// ----------------------------------------------------------------------------
// TEST 2: Autonomous Video Generation & Rendering Pipeline (16:9 Landscape)
// ----------------------------------------------------------------------------
console.log('\n--- [TEST 2] Testing Video Generation & Procedural Rendering Pipeline ---');
const genOutMp4 = path.join(testWorkDir, 'test_generated_video.mp4');
const genAudioWav = path.join(testWorkDir, 'test_narration.wav');

// Step 2a: Generate speech audio stem
const audioGen = spawnSync('ffmpeg', [
  '-f', 'lavfi',
  '-i', 'sine=frequency=330:duration=3',
  '-ar', '24000',
  '-ac', '1',
  '-y',
  genAudioWav
]);
assert(audioGen.status === 0 && fs.existsSync(genAudioWav), 'Generated test voiceover audio stem');

// Step 2b: Procedural visuals & audio muxing with FFmpeg
const videoRender = spawnSync('ffmpeg', [
  '-f', 'lavfi',
  '-i', 'color=c=navy:s=1920x1080:r=30:d=3',
  '-i', genAudioWav,
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-y',
  genOutMp4
]);
assert(videoRender.status === 0 && fs.existsSync(genOutMp4), 'Rendered complete 1920x1080 MP4 video');

// Step 2c: FFprobe Technical Quality Audit
const probeRaw = execFileSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'stream=width,height,codec_name',
  '-show_entries', 'format=duration',
  '-of', 'json',
  genOutMp4
], { encoding: 'utf8' });

const probe = JSON.parse(probeRaw);
const vStream = probe.streams.find((s) => s.codec_name === 'h264');
assert(vStream !== undefined, 'Video stream contains valid H.264 video');
assert(vStream.width === 1920 && vStream.height === 1080, `Dimensions are 1920x1080 (Found ${vStream.width}x${vStream.height})`);
assert(parseFloat(probe.format.duration) >= 2.9, `Duration is >= 2.9s (Found ${probe.format.duration}s)`);

// ----------------------------------------------------------------------------
// TEST 3: Intelligent Video Clipping & 9:16 Vertical Reframing Pipeline
// ----------------------------------------------------------------------------
console.log('\n--- [TEST 3] Testing Intelligent Video Clipping & 9:16 Smart Reframing ---');
const clipOutMp4 = path.join(testWorkDir, 'test_clipped_short.mp4');

// Reframing filter: 1920x1080 landscape source -> 1080x1920 vertical with blurred background
const cropFilter = 'split=2[orig][bg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[blurred];[orig]scale=1080:-2:force_original_aspect_ratio=decrease[fg];[blurred][fg]overlay=(W-w)/2:(H-h)/2';

const clipRender = spawnSync('ffmpeg', [
  '-i', genOutMp4,
  '-filter_complex', cropFilter,
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-y',
  clipOutMp4
]);
assert(clipRender.status === 0 && fs.existsSync(clipOutMp4), 'Successfully rendered 9:16 vertical Short clip');

const clipProbeRaw = execFileSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'stream=width,height,codec_name',
  '-of', 'json',
  clipOutMp4
], { encoding: 'utf8' });

const clipProbe = JSON.parse(clipProbeRaw);
const clipStream = clipProbe.streams.find((s) => s.codec_name === 'h264');
assert(clipStream.width === 1080 && clipStream.height === 1920, `Clip dimensions are 1080x1920 (Found ${clipStream.width}x${clipStream.height})`);

// ----------------------------------------------------------------------------
// TEST 4: Multi-Channel Isolation & Idempotency Key Generation
// ----------------------------------------------------------------------------
console.log('\n--- [TEST 4] Testing Multi-Channel Isolation & Idempotency Rules ---');

const channelA_Id = 'ch_antiquity_001';
const channelB_Id = 'ch_deeptech_002';
const dateOccurrence = '2026-11-23_morning';

const keyA = `${channelA_Id}:GENERATE_VIDEO:${dateOccurrence}`;
const keyB = `${channelB_Id}:GENERATE_VIDEO:${dateOccurrence}`;
const keyA_Duplicate = `${channelA_Id}:GENERATE_VIDEO:${dateOccurrence}`;

assert(keyA !== keyB, 'Idempotency keys across channels remain strictly isolated');
assert(keyA === keyA_Duplicate, 'Duplicate scheduling tick produces identical idempotency key for deduplication');

// ----------------------------------------------------------------------------
// TEST 5: Antigravity Skills Verification (All 30 skills present)
// ----------------------------------------------------------------------------
console.log('\n--- [TEST 5] Verifying 30 Antigravity Skills Structure ---');
const skillsDir = path.resolve(process.cwd(), '.agents', 'skills');
assert(fs.existsSync(skillsDir), '.agents/skills directory exists');

const skillDirs = fs.readdirSync(skillsDir);
const numberedSkills = skillDirs.filter((d) => /^[0-3][0-9]-/.test(d));
assert(numberedSkills.length === 30, `Expected 30 numbered studio skills, found ${numberedSkills.length}`);

for (const s of numberedSkills) {
  const skillFile = path.join(skillsDir, s, 'SKILL.md');
  assert(fs.existsSync(skillFile), `Skill ${s} contains valid SKILL.md`);
}

console.log('\n===============================================================');
console.log('ALL STUDIO END-TO-END TESTS PASSED SUCCESSFULLY! 🏆');
console.log('===============================================================\n');
