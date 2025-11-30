import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  linux: [

    {
      type: 'category',
      label: 'VIM 文本编辑器',
      items: [
        'VIM 文本编辑器/VIM 环境配置',
        'VIM 文本编辑器/基本按键说明',
      ],
    },
    {
      type: 'category',
      label: 'Shell 使用',
      items: [
        'Shell 使用/zsh',
        'Shell 使用/&& 和 ; 的区别',
        'Shell 使用/bash 和 sh 的区别',
        'Shell 使用/Shell 脚本解释器',
        'Shell 使用/Linux 变量前导符 $',
        'Shell 使用/Shell 中的 getopts 命令',
        'Shell 使用/解析行数据',
        'Shell 使用/配置文件正确使用姿势',
      ],
    },
    {
      type: 'category',
      label: '系统管理',
      items: [
        '系统管理/TimeZone 时区设置',
        '系统管理/Linux 系统运行模式（Runlevels）',
        '系统管理/Linux 开启关闭 GUI 界面',
        '系统管理/gnome 桌面 File 隐藏 Recent',
      ],
    },
    {
      type: 'category',
      label: 'Systemd',
      items: [
        'Systemd/journalctl 命令查看服务日志',
        'Systemd/如何编写服务单元',
      ],
    },
  ],
};

export default sidebars;
