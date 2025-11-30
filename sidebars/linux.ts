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
      label: '用户与权限系统',
      items: [
        '用户与权限系统/用户管理',
        '用户与权限系统/用户组管理',

        '用户与权限系统/chage 命令',
        '用户与权限系统/chgrp 命令',
        '用户与权限系统/passwd 命令',
        '用户与权限系统/chpasswd 命令与批量创建账户',

        '用户与权限系统/系统账户信息存储文件 passwd',
        '用户与权限系统/系统密码信息存储文件 shadow',

        '用户与权限系统/组成员管理命令 groupmems',
        '用户与权限系统/主要组与普通组的区别',
        '用户与权限系统/系统用户组信息存储文件 group',
        '用户与权限系统/高级权限系统ACL',

        '用户与权限系统/su 与 sudo 命令',
        '用户与权限系统/ssh 远程登录及免密登录',

        '用户与权限系统/chmod 命令与文件权限系统',
        '用户与权限系统/chown 命令与文件归属系统',

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
    {
      type: 'category',
      label: '定时作业',
      items: [
        '定时作业/Linux crontab 定时作业',
        '定时作业/run-parts',
      ],
    },
    {
      type: 'category',
      label: '常用命令和系统工具',
      items: [
        '常用命令和系统工具/curl 命令',
        '常用命令和系统工具/dpkg 命令',
        '常用命令和系统工具/ifconfig 命令',
        '常用命令和系统工具/lsof 命令',
        '常用命令和系统工具/pstree 命令查看进程树',
        '常用命令和系统工具/scp 命令',
        '常用命令和系统工具/sed 命令',
        '常用命令和系统工具/tee 命令',
        '常用命令和系统工具/wget 命令',
        '常用命令和系统工具/xargs 实战技巧',
        '常用命令和系统工具/多行输入 EOF',
      ],
    },
    {
      type: 'category',
      label: '网络管理',
      items: [
        '网络管理/Debian 系列发行版静态IP设置',
        '网络管理/Debian 系统缺少网络驱动问题',
        '网络管理/IP 命令的使用',
        '网络管理/Linux 命令行设置代理',
        '网络管理/修改默认 DNS',
      ],
    },
    {
      type: 'category',
      label: '常用软件',
      items: [
        '常用软件/视频播放器',
        '常用软件/实用且强大的录屏软件',
      ],
    },

  ],
};

export default sidebars;
