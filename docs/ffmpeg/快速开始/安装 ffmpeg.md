---
title: 安装
---

[FFmpeg](http://ffmpeg.org) 是开源的（[https://github.com/FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg)），官方不提供预编译的二进制程序，只提供源代码。

想使用 FFmpeg 只能下载源码后，自行编译构建。不过，开源社区江湖豪侠众多，有很多大牛构建后会发布到渠道共大家下载使用。如果你觉得自己编译构建太麻烦，推荐直接使用这些大牛构建的二进制程序。

如果你使用的是类 UNIX 系统，其实可以通过包管理直接安装：

```bash
## Mac 下使用 HomeBrew 安装
$ brew install -v ffmpeg

## CentOS/RHEL 系统可以使用 YUM 包管理工具安装
$ yum install -y ffmpeg

## Debain/Ubuntu 系列使用 APT 包管理工具安装
$ apt-get install -y ffmpeg
```

如果你不想使用包管理器（或你的操作系统是 Windows），也可以下载大牛发布的二进制程序安装。

:::info[Windows 推荐下载渠道]

Windows builds from gyan.dev：[https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)

Windows builds by BtbN：[https://github.com/BtbN/FFmpeg-Builds/](https://github.com/BtbN/FFmpeg-Builds/)

> BtbN 也提供 Linux 二进制程序。

:::

:::info[MacOS 推荐下载渠道]

Static builds for macOS 64-bit：[https://evermeet.cx/ffmpeg/](https://evermeet.cx/ffmpeg/)

:::

安装完成之后在可以在终端输入 `ffmpeg -version` 命令验证是否安装成功，如果输出类似如下的信息即表示安装成功了：

```bash
$ ffmpeg -version

ffmpeg version 4.3.3-0+deb11u1 Copyright (c) 2000-2021 the FFmpeg developers
built with gcc 10 (Debian 10.2.1-6)
configuration: --prefix=/usr --extra-version=0+deb11u1 --toolchain=hardened --libdir=/usr/lib/x86_64-linux-gnu --incdir=/usr/include/x86_64-linux-gnu --arch=amd64 --enable-gpl --disable-stripping --enable-avresample --disable-filter=resample --enable-gnutls --enable-ladspa --enable-libaom --enable-libass --enable-libbluray --enable-libbs2b --enable-libcaca --enable-libcdio --enable-libcodec2 --enable-libdav1d --enable-libflite --enable-libfontconfig --enable-libfreetype --enable-libfribidi --enable-libgme --enable-libgsm --enable-libjack --enable-libmp3lame --enable-libmysofa --enable-libopenjpeg --enable-libopenmpt --enable-libopus --enable-libpulse --enable-librabbitmq --enable-librsvg --enable-librubberband --enable-libshine --enable-libsnappy --enable-libsoxr --enable-libspeex --enable-libsrt --enable-libssh --enable-libtheora --enable-libtwolame --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwavpack --enable-libwebp --enable-libx265 --enable-libxml2 --enable-libxvid --enable-libzmq --enable-libzvbi --enable-lv2 --enable-omx --enable-openal --enable-opencl --enable-opengl --enable-sdl2 --enable-pocketsphinx --enable-libmfx --enable-libdc1394 --enable-libdrm --enable-libiec61883 --enable-chromaprint --enable-frei0r --enable-libx264 --enable-shared
libavutil      56. 51.100 / 56. 51.100
libavcodec     58. 91.100 / 58. 91.100
libavformat    58. 45.100 / 58. 45.100
libavdevice    58. 10.100 / 58. 10.100
libavfilter     7. 85.100 /  7. 85.100
libavresample   4.  0.  0 /  4.  0.  0
libswscale      5.  7.100 /  5.  7.100
libswresample   3.  7.100 /  3.  7.100
libpostproc    55.  7.100 / 55.  7.100
```