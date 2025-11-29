## 前言

流媒体文件通常都会附带一些元数据（Metadata）信息，通过元数据信息我们可以很方便的知道流媒体的基本信息。如歌手、歌名以及对应的专辑：

```bash
$ ffprobe M.Graveyard\ -\ you.flac

...

Input #0, flac, from 'M.Graveyard - you.flac':
  Metadata:
    album           : Thanks you
    artist          : M.Graveyard
    title           : you
    encoder         : Lavf60.3.100
  Duration: 00:03:34.85, start: 0.000000, bitrate: 1365 kb/s
  Stream #0:0: Audio: flac, 44100 Hz, stereo, s32 (24 bit)
```

比如这个流媒体文件，从输出示例中可以看到这个音乐媒体文件的歌名叫 you，歌手是 M.Graveyard，对应的专辑是 Thanks you。

|**Note**|
|:-------|
|流媒体的元数据信息是可以修改的，`ffprobe` 输出的媒体元数据信息只能作参考使用。|

> 之所以介绍这个的原因是，我在某音乐平台下载一首歌，当我将歌导入到网易云音乐之后发现居然没有识别到歌手（显示未知歌手）。当时我还挺纳闷的，后来通过使用 `ffprobe` 查看文件元数据信息时发现，居然没有 Metadata 数据。
>
> 不过，知道了原因之后，只需要使用 `ffmpeg` 加上对应的 Metadata 就好了，因此这里记录下。

## 添加/修改 Metadata

添加/修改流媒体文件的元数据信息可以借助 `-metadata` 参数实现，后面跟随对应的键/值。基本语法如下：

```bash
$ ffmpeg -i inputfile -metadata title="Movie Title" -metadata year="2010" outputfile
```

比如修改音乐媒体文件的歌名和歌手：

```bash
$ ffmpeg \
-i M.Graveyard\ -\ you.flac \
-c copy \
-metadata title="歌名" \
-metadata artist="歌手" \
output.flac
```

需要强调的一点是，`-metadata` 是做覆盖更新。如当前流媒体文件元数据信息已存在 title，当我们指定 `-metadata title="..."` 时，就会将原来的 title 信息覆盖掉。因此，添加和修改操作是一样的。

|**Note**|
|:-------|
|不同的流媒体文件，键/值区别很大。如果你不知道对应的流媒体文件有哪些键值可以参考下FFmpeg官方文档或本文最后的[参考链接](#参考链接)。|

## 删除指定 Metadata

删除指定 Metadata 与添加/修改如出一辙，使用空键即可（`key=`）。如删除 title 信息：

```bash
$ ffmpeg \
-i M.Graveyard\ -\ you.flac \
-c copy \
-metadata title= \
output.flac
```

## 删除全部 Metadata

如果流媒体文件的 Metadata 很多，一个key一个key的删除有点不现实。简单点，直接使用 `-map_metadata -1` 参数即可：

```bash
$ ffmpeg \
-i M.Graveyard\ -\ you.flac \
-c copy \
-map_metadata -1 \
output.flac
```

## 参考链接

https://wiki.multimedia.cx/index.php/FFmpeg_Metadata

http://mplayerhq.hu/pipermail/ffmpeg-user/2018-December/042292.html

https://write.corbpie.com/adding-metadata-to-a-video-or-audio-file-with-ffmpeg/