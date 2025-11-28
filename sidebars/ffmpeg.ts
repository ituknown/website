import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  ffmpeg: [
    '安装',
    {
      type: 'category',
      label: '基础知识',
      items: [
        '视频文件工作的基本原理',
        '常见的视频容器格式',
        '视频编解码器介绍',
        '音频编解码器介绍',
        '如何确认视频文件流媒体信息',
        'ffprobe 查看媒体文件头信息',
      ],
    },
    {
      type: 'category',
      label: '流媒体操作',
      items: [
        '截取视频',
        '合并视频文件',
        '强大的 map 参数',
        '视频添加音频',
        '视频添加字幕',
        '视频添加封面',
        '提取音视频及字幕',
        '修改流媒体 Metadata',
        '音视频倍速播放',
      ],
    },
    '使用 N 卡加速编解码',
  ],


};

export default sidebars;
