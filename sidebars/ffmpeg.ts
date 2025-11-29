import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  ffmpeg: [
    {
      type: 'category',
      label: '快速开始',
      items: [
        '安装 ffmpeg',
        'ffmpeg 截取视频',
        'ffmpeg 合并多个视频文件',
      ],
    },
    {
      type: 'category',
      label: '流媒体介绍',
      items: [
        '视频文件工作的基本原理',
        '视频编解码器介绍',
        '音频编解码器介绍',
        '常见的视频容器格式',
      ],
    },
    {
      type: 'category',
      label: 'ffprobe 命令',
      items: [
        'ffprobe 查看媒体文件头信息',
        '如何确认视频文件流媒体信息',
      ],
    },
    {
      type: 'category',
      label: 'ffmpeg 进阶使用',
      items: [
        'ffmpeg 的 map 参数',
        'ffmpeg 修改流媒体 Metadata',
        'ffmpeg 视频添加音频',
        'ffmpeg 视频添加字幕',
        'ffmpeg 视频添加封面',
        'ffmpeg 提取音视频及字幕',
        'ffmpeg 音视频倍速播放',
        'ffmpeg 使用 N 卡加速编解码',
      ],
    },
  ],
};

export default sidebars;
