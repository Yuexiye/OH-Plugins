import fs from 'node:fs';
import path from 'node:path';

/**
 * crystal-speech-emote 插件入口
 */
export default class CrystalSpeechEmotePlugin {
  async onload() {
    const { log } = this.ctx;
    log.info('crystal-speech-emote plugin loaded');

    this.register(() => {});
  }

  /**
   * 插件系统会自动调用 routes/ 下的 .js 文件
   * 导出函数签名: export default function(app, ctx)
   */
}
