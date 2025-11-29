import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  ffmpeg: [
    {
      type: 'category',
      label: '快速开始',
      items: [
        '快速开始/安装 ffmpeg',
        '快速开始/ffmpeg 截取视频',
        '快速开始/ffmpeg 合并多个视频文件',
      ],
    },
    {
      type: 'category',
      label: '流媒体介绍',
      items: [
        '流媒体介绍/视频文件工作的基本原理',
        '流媒体介绍/视频编解码器介绍',
        '流媒体介绍/音频编解码器介绍',
        '流媒体介绍/常见的视频容器格式',
      ],
    },
    {
      type: 'category',
      label: 'ffprobe 命令',
      items: [
        'ffprobe 命令/ffprobe 查看媒体文件头信息',
        'ffprobe 命令/如何确认视频文件流媒体信息',
      ],
    },
    {
      type: 'category',
      label: 'ffmpeg 进阶使用',
      items: [
        'ffmpeg 进阶使用/ffmpeg 的 map 参数',
        'ffmpeg 进阶使用/ffmpeg 修改流媒体 Metadata',
        'ffmpeg 进阶使用/ffmpeg 视频添加音频',
        'ffmpeg 进阶使用/ffmpeg 视频添加字幕',
        'ffmpeg 进阶使用/ffmpeg 视频添加封面',
        'ffmpeg 进阶使用/ffmpeg 提取音视频及字幕',
        'ffmpeg 进阶使用/ffmpeg 音视频倍速播放',
        'ffmpeg 进阶使用/ffmpeg 使用 N 卡加速编解码',
      ],
    },
  ],
};

export default sidebars;
