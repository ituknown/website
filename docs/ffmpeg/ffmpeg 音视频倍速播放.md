## 前言

视频流的播放速度可以通过改变每帧的显示时间戳（PTS）来改变。有两种实现方法：

1. 通过将视频导出为 **原始比特流** 进行重新封装。
2. 使用 filter 过滤器。

## 使用“原始比特流”实现倍速播放（专业玩家）

使用“原始比特流”进行音视频倍速播放通常是无损的，因为不需要对音视频数据进行重新编码。原始比特流包含已经编码的音频和视频数据，只需调整时间戳来实现倍速播放，不需要重新压缩或解码再编码，因此不会引入额外的失真或质量损失。

注意，基于“原始比特流”实现的倍速播放并不是推荐的方式（因为操作起来及其的复杂）。因为它需要将视频导出为原始比特流格式，而且还有几点需要注意：

1. **时间戳同步**：在原始比特流中，确保音频和视频的时间戳同步非常重要。如果不正确处理时间戳，可能会导致音视频不同步的问题。
2. **倍速比例**：调整倍速比例时，要确保音频和视频都以相同的倍速播放，以保持同步。如果不一致，可能会导致音频和视频不匹配。
3. **封装格式**：原始比特流通常不包含封装格式信息，因此你需要确保将音频和视频数据以正确的方式封装到适当的容器格式中，以便最终的播放器或应用程序能够正确解析和播放。

虽然使用原始比特流进行倍速播放不会引入新的编码损失，但仍然需要小心处理时间戳和封装，以确保最终结果是无损的且正常播放的。

### 确定视频流编码及帧率

从视频中导出到原始比特流格式我们需要知道该视频的编解码格式（如 H.264 还是 H.265）。如果你不知道目标视频文件是什么编码格式可以借助 `ffprobe` 工具查看。

比如我有一个 mp4 格式的视频文件 input.mp4，我就可以使用 `ffprobe` 查看该视频的头信息：

```bash
$ ffprobe input.mp4

...
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'input.mp4':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2mp41
    encoder         : Lavf59.27.100
    description     : Packed by Bilibili XCoder v2.0.2
  Duration: 00:01:42.74, start: 0.000000, bitrate: 1735 kb/s
  Stream #0:0[0x1](und): Video: hevc (Main) (hev1 / 0x31766568), yuv420p(tv, bt709), 3840x2160 [SAR 1:1 DAR 16:9], 1529 kb/s, 52.47 fps, 52 tbr, 16k tbn (default)
    Metadata:
      handler_name    : VideoHandler
      vendor_id       : [0][0][0][0]
  Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 195 kb/s (default)
    Metadata:
      handler_name    : SoundHandler
      vendor_id       : [0][0][0][0]
  Stream #0:2[0x3]: Subtitle: mov_text (tx3g / 0x67337874), 0 kb/s (default)
    Metadata:
      handler_name    : SubtitleHandler
```

注意看第一行流信息：

```log
Stream #0:0[0x1](und): Video: hevc (Main) (hev1 / 0x31766568), yuv420p(tv, bt709), 3840x2160 [SAR 1:1 DAR 16:9], 1529 kb/s, 52.47 fps, 52 tbr, 16k tbn (default)
```

这行信息表示，第一个流是视频流，视频采用的编解码格式是 hevc，这个就是我们俗称的 H.265 格式（编解码格式具体可以参考下 [视频编解码器介绍.md](视频编解码器介绍.md)）。


每一帧的数据表示为 yuv420p，分辨率为3840x2160，该轨道流的比特率为 1529 kb/s，帧率（fps）为每秒钟 52.47 帧。

这样，我们就确定了视频编码格式（H.265）和视频帧率（52.47），同时我的视频时长为 1:42.74。

### 提取视频原始比特流（不含音频）

- 提取 H.264 视频原始比特流（不含音频）：

```bash
ffmpeg -i input.mp4 -an -c:v copy out.raw.h264
```

- 提取 H.265 视频原始比特流（不含音频）：

```bash
ffmpeg -i input.mp4 -an -c:v copy out.raw.h265
```

其中，`-i` 参数后面的 input.mp4 就是你的具体视频文件，最后产生对应的 out.raw.h264 或 out.raw.h265 文件，这个文件名是可以自定义的。

### 视频流实现倍速播放

#### 方法一：修改时间轴

接下来，就需要修改原始比特流的时间轴以实现倍速播放。可以使用 `setpts`` 过滤器来实现这一点。下面是一些示例命令：

- 加快播放速度（2倍速）：

```bash
ffmpeg -i out.raw.h265 -vf "setpts=0.5*PTS" -c:v copy faster_output.h265
```

- 减慢播放速度（0.5倍速）：

```bash
ffmpeg -i out.raw.h265 -vf "setpts=2*PTS" -c:v copy slower_output.h265
```

在上述命令中，setpts 过滤器中的参数用于控制播放速度的倍数。0.5 表示加快 2 倍，2 表示减慢 0.5 倍。

最后，重新将原始比特流封装成原始容器格式（该示例源文件使用的容器是 mp4）：

```bash
ffmpeg -i faster_output.h265 -c:v copy faster_output.mp4
```

#### 方法二：直接调整视频帧率

除了通过修改时间轴实现倍速播放之外，还能通过调整视频帧率来实现视频倍速播放。其原理是：

视频的时长是由视频的帧数和帧率共同决定的，视频的帧数是视频中的总帧数，而帧率是指每秒播放的帧数。时长（视频长度）等于总帧数除以帧率。因此，如果总帧数不变，单你改变视频的帧率，视频的时长也会相应的会改变。

比如原视频的总帧率为 300 帧，原始帧率是 30 帧/秒，视频的总时长是 10 秒。如果将原始视频的帧率从 30 帧/秒 增加到 60 帧/秒，时长的时长将减半（300 帧 / 60 帧/秒 = 5 秒），这就实现了倍速播放。

相反，如果你将视频帧率由原来的 30 帧/秒 调整为 15 帧/秒，那么视频时长将实现慢倍速播放（300 帧 / 15 帧/秒 = 20 秒），这就是通过改变帧率实现倍速播放的原理。同样的，问题也显而易见。比如原视频的帧率是 60帧/秒，如果想实现倍速播放，帧率就要调整为... 120帧/秒🌚🌚🌚🌚~

通过修改帧率实现倍速播放命令很简单，如下：

```
ffmpeg -framerate [原始帧率] -i out.raw.h265 -c:v copy -an -r [新帧率] faster_output.mp4
```

主需要将命令中的 [原始帧率] 设为原始视频的帧率，[新帧率] 为你希望设置的新帧率即可。


### 确定音频流编码

在前面已经使用 `ffprobe` 命令查看的视频文件信息，其中音频流信息如下：

```log
Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 195 kb/s (default)
```

现在，我们就能看到确定音频流采用的编码是 aac，这是视频文件最常用的一种音频流编码格式。

### 提取音频流（不含视频）

确定音频流编码之后，就可以提取音频流数据了。因为音频流采用的编码格式是 aac，这里继续使用原编码格式，就不进行重新编码了，直接做拷贝操作。并将拷贝的音频流封装到对应的音频容器（AAC）中：

```bash
ffmpeg -i input.mp4 -vn -c:a copy audio.aac
```

### 音频流实现倍速播放

对音频流做倍速播放，直接使用 `atempo` 音频滤镜即可。例如，如果你想将音频的播放速度加倍，可以使用以下命令：

```bash
ffmpeg -i audio.aac -filter:a "atempo=2.0" -c:a aac faster_audio.aac
```

这个命令将音频的播放速度加倍，然后保存为 faster_audio.aac 文件。你可以将 2.0 替换为你想要的倍速播放倍数。比如你想慢倍速速度，可以使用小于1.0的值（如0.5）。

另外，一定要注意的一点是。修改音频流的播放速度也是变相的对音频重新编码。因此不能直接使用 `-c:a copy` 命令执行流拷贝，需要指定新的音频流编码格式。因为原始音频流的编码格式是 aac，我这里就保持不变。你也可以使用 mp3 编码和格式。

### 重新合成视频流与音频流

最后，将修改后的视频流文件与音频流文件重新合成，就得到我们要的音视频倍速播放的效果啦：

```bash
ffmpeg -i faster_output.mp4 -i faster_audio.aac -c:v copy -c:a aac -map 0:v -map 1:a output.mp4
## 或明确指定音视频流轨道
ffmpeg -i faster_output.mp4 -i faster_audio.aac -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4
```

## 使用 filter 过滤器（小白推荐）

使用 filter 过滤器实现音视频倍速播放是及其的简单。仅仅需要一条命令即可，下面直接使用命令说明，不在做多余的赘述：

**使用 `setpts` 进行视频加速：**

```bash
ffmpeg -i input.mp4 -filter:v "setpts=PTS/1.5" output.mp4
```

这个命令会将视频的播放速度加快 1.5 倍。你可以根据需要调整 `setpts` 过滤器中的倍速比例（如放慢 0.5 倍）。

**使用 `atempo` 进行音频加速：**

```bash
ffmpeg -i input.mp4 -filter:a "atempo=1.5" -vn output.mp3
```

这个命令会将音频的播放速度加快 1.5 倍，并将其保存为 MP3 文件。

**同时加速音频和视频：**

```bash
ffmpeg -i input.mp4 -filter:v "setpts=PTS/1.5" -filter:a "atempo=1.5" output.mp4
```

这个命令会同时加速音频和视频，以实现整体倍速播放。

**使用 `-vf` 和 `-af` 组合加速音视频：**

```bash
ffmpeg -i input.mp4 -vf "setpts=PTS/1.5" -af "atempo=1.5" output.mp4
```

这个命令也是同时加速音频和视频的一种方式，但使用了 `-vf` 和 `-af` 选项。

**使用 `-filter_complex` 进行更复杂的操作：**

```bash
ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=PTS/1.5[v];[0:a]atempo=1.5[a]" -map "[v]" -map "[a]" output.mp4
```

这个命令使用了 `-filter_complex` 选项来分别加速视频和音频，然后将它们重新合并成一个输出文件。

**使用 `setpts` 和 `atempo` 一起进行多次倍速播放：**

```bash
ffmpeg -i input.mp4 -filter:v "setpts=PTS/2.0" -filter:a "atempo=2.0" -vf "setpts=PTS/1.5" -af "atempo=1.5" output.mp4
```

这个命令示例中，视频会首先加速两倍，然后再减速回原始速度的 1.5 倍，最终实现原始速度的倍速播放。

--

上面这几个命令基本够小白玩家使用了。在实际使用时，根据你的需求和具体情况，选择合适的方法来实现音视频的倍速播放。记得根据需要调整倍速比例以及输入和输出文件的文件名。