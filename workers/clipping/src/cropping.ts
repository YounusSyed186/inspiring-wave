/**
 * Smart Vertical (9:16) Cropping and Reframing Engine
 */

import { CropMode } from '../../../packages/shared-types/src/index';

export interface CropOptions {
  mode: CropMode;
  targetWidth?: number;
  targetHeight?: number;
  focusPointX?: number; // 0.0 to 1.0 (normalized center)
  focusPointY?: number; // 0.0 to 1.0
}

export class SmartCropEngine {
  /**
   * Build the FFmpeg video filter expression for 9:16 vertical reframing
   */
  public buildFfmpegFilter(options: CropOptions): string {
    const {
      mode,
      targetWidth = 1080,
      targetHeight = 1920,
      focusPointX = 0.5
    } = options;

    switch (mode) {
      case 'BLURRED_BACKGROUND':
        // Scale full video over blurred vertical background
        return `
          split=2[orig][bg];
          [bg]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},boxblur=25:5[blurred];
          [orig]scale=${targetWidth}:-2:force_original_aspect_ratio=decrease[fg];
          [blurred][fg]overlay=(W-w)/2:(H-h)/2
        `.replace(/\s+/g, '');

      case 'FACE_TRACKING':
      case 'CENTER_CROP':
      case 'MANUAL':
      default:
        // Crop 9:16 window centered at focusPointX (with safe clamping)
        // Crop width = in_h * (9/16)
        // Offset X = clamp( (in_w * focusPointX) - (crop_w / 2), 0, in_w - crop_w )
        return `
          scale=-2:${targetHeight},
          crop=${targetWidth}:${targetHeight}:'max(0, min(in_w-${targetWidth}, (in_w*${focusPointX}) - (${targetWidth}/2)))':0
        `.replace(/\s+/g, '');
    }
  }
}

export const defaultCropEngine = new SmartCropEngine();
