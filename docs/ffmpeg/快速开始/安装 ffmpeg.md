---
title: 安装
---

[FFmpeg](http://ffmpeg.org) 是开源的流媒体领域的瑞士军刀，主要用于处理多媒体数据，包括音频和视频。你在网上能看到的音频播放器、视频播放器以及直播推流软件里面都有它的影子。

:::tip[FFmpeg 主要应用场景]
1、录制 (Recording)：捕捉和保存音视频流。<br/>
2、格式转换 (Conversion/Transcoding)：将一个格式的音视频文件转换为另一个格式（比如从 MP4 转换成 WebM，或改变比特率、分辨率等）。<br/>
3、串流 (Streaming)：在网络上传输实时或预录的音视频数据。<br/>
4、解码和编码 (Decoding & Encoding)：支持几乎所有主流的音视频编解码器。<br/>

:::

:::tip[FFmpeg 包含的主要命令行工具和函数库]
`ffmpeg`: 这是主要的命令行工具，用于转换、录制和流式传输媒体文件。<br/>
`ffplay`: 一个基于 SDL 和 FFmpeg 库的简单媒体播放器。<br/>
`ffprobe`: 一个命令行工具，用于分析和显示媒体文件的信息（比如时长、分辨率、比特率、使用的编解码器等）。<br/>
`libavcodec`: 包含了用于多种项目的音视频编解码器函数库。<br/>
`libavformat`: 包含了音频与视频格式转换函数库（用于处理各种容器格式，如 MP4, MKV, AVI 等）。
:::

[FFmpeg](http://ffmpeg.org) 是开源的，对应的仓库地址是：[https://git.ffmpeg.org/ffmpeg.git](https://git.ffmpeg.org/ffmpeg.git)。

另外 GitHub 上也有一个镜像仓库：[https://github.com/FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg)。

FFmpeg 每 6 个月会发布一个新的主要版本（Major Release），但都是以源码发布，不会直接提供二进制程序。如果你想使用 FFmpeg，只能通过源码构建。不过，开源社区江湖豪侠众多，有很多编译好的二进制程序下载渠道。如果你觉得自己编译构建太麻烦，推荐直接使用这些大牛构建的二进制程序。

如果你使用的是类 UNIX 系统，其实不需要单独去下载，可以通过包管理直接安装二进制程序：

```bash
## Mac 下使用 HomeBrew 安装
$ brew install -v ffmpeg

## CentOS/RHEL 系统可以使用 YUM 包管理工具安装
$ yum install -y ffmpeg

## Debain/Ubuntu 系列使用 APT 包管理工具安装
$ apt-get install -y ffmpeg
```

如果你担心在 UNIX 上会有依赖问题，不想使用包管理器（或你的操作系统是 Windows），也可以下载大牛发布的二进制程序安装。

:::tip[Windows 推荐下载渠道]

Windows builds from gyan.dev：[https://www.gyan.dev/ffmpeg/builds/](https://www.gyan.dev/ffmpeg/builds/)

Windows builds by BtbN：[https://github.com/BtbN/FFmpeg-Builds/](https://github.com/BtbN/FFmpeg-Builds/)

> BtbN 也提供 Linux 二进制程序。

:::

:::tip[MacOS 推荐下载渠道]

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