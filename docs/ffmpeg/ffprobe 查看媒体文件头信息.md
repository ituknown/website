## 前言

`ffprobe` 命令行主要用于查看媒体文件的头或流信息，比如编码格式、时长、帧率等等。使用起来也特别简单，只需要在命令后面加上媒体文件名即可：

```bash
ffprobe [文件名]
```

## 基本使用

下面以我本地的 mp3 文件为例说明：

```bash
$ ffprobe 風の住む街.mp3

...
Input #0, mp3, from 'example.mp3':
  Metadata:
    title           : 風の住む街
    album           : 西尔德斯 新世纪·亚洲
    artist          : 磯村由紀子
    genre           : Blues
  Duration: 00:04:45.99, start: 0.025056, bitrate: 327 kb/s
  Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 320 kb/s
    Metadata:
      encoder         : LAME3.99r
    Side data:
      replaygain: track gain - -4.600000, track peak - unknown, album gain - unknown, album peak - unknown,
  Stream #0:1: Video: mjpeg, none(bt470bg/unknown/unknown), 90k tbr, 90k tbn (attached pic)
    Metadata:
      comment         : Other
```

对于 mp3 文件我们主要关注两行信息：

**第一行：**

```log
Duration: 00:04:45.99, start: 0.025056, bitrate: 327 kb/s
```

该信息主要包含 mp3 媒体文件的时长信息、开始播放时间信息以及文件的比特率。以该媒体文件为例，该mp3的总时长是4分45秒99毫秒，开始播放时间是0.025056，整个文件的比特率是 327 kb/s。

**第二行：**

```log
Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 320 kb/s
```

这行信息表示，第一个流是音频流，编码格式是MP3格式，采样率是44.1KHz，声道是立体声，采样表示格式是 fltp，这路流的比特率 320 kb/s。

## 查看mp4格式文件信息

```bash
$ ffprobe example.mp4

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

对于视频流信息有几行信息特别重要（根据你的视频情况而定）：

**第一行信息：**

```log
Duration: 00:01:42.74, start: 0.000000, bitrate: 1735 kb/s
```

这行信息表示用于展示视频基本时长信息，比如该视频文件的总时长为 1分42秒74毫秒，开始播放时间是0，整个文件的比特率是 1735 kb/s。

**第二行信息：**

```log
Stream #0:0[0x1](und): Video: hevc (Main) (hev1 / 0x31766568), yuv420p(tv, bt709), 3840x2160 [SAR 1:1 DAR 16:9], 1529 kb/s, 52.47 fps, 52 tbr, 16k tbn (default)
```

这行信息表示，第一个流是视频流，视频编码格式是 hevc（封装格式为 hev1），这个就是我们俗称的 H.265格式。每一帧的数据表示为 yuv420p，分辨率为3840x2160，这路流的比特率为 1529 kb/s，帧率（fps）为每秒钟 52.47 帧。

|**Note**|
|:-------|
|视频编码格式是在某些时候特别重要，比如你想使用 ffmpeg 按原始比特流法 实现视频倍速播放那么知道这个视频格式就显得尤为重要。|

**第三行信息：**

```log
Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 195 kb/s (default)
```

这行信息表示第二个流是音频流，编码方式为 ACC（封装格式为 mp4a），并且采用的Profile是LC规格，采样率是 48K Hz，声道是立体声，这路流的比特率 195 kb/s。

| **Note**                                                               |
|:-----------------------------------------------------------------------|
| 音频流不是每个视频都会有，假如你的视频没有声音那么就不会有对应的音频流！ |

**第四行信息：**

```log
Stream #0:2[0x3]: Subtitle: mov_text (tx3g / 0x67337874), 0 kb/s (default)
```

这行信息表示第三个流是字幕流，编码格式是 mov_text（封装格式为 tx3g）。

| **Note**                                                               |
|:-----------------------------------------------------------------------|
| 字幕流不是每个视频都会有，假如你的视频没有字幕那么就不会有对应的音频流！ |

## 高级用法

其实 ffprobe 的功能并不仅仅是查看基本的流信息，而是用于探测流媒体的属性信息（甚至能直接查看帧数据信息）。比如我有一个视频文件 input.mp4，我想要查看视频流使用的编码格式怎么做？如果还使用前面的方式就太鸡肋了：

```bash
$ ffprobe input.mp4

...
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'input.mp4':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2mp41
    encoder         : Lavf60.3.100
    description     : Packed by Bilibili XCoder v2.0.2
  Duration: 01:39:22.52, start: 0.000000, bitrate: 396 kb/s
  Stream #0:0[0x1](und): Video: hevc (Main) (hev1 / 0x31766568), yuv420p(tv, bt709), 1920x1080 [SAR 1:1 DAR 16:9], 259 kb/s, 25 fps, 25 tbr, 16k tbn (default)
    Metadata:
      handler_name    : VideoHandler
      vendor_id       : [0][0][0][0]
  Stream #0:1[0x2](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 130 kb/s (default)
    Metadata:
      handler_name    : SoundHandler
      vendor_id       : [0][0][0][0]
```

有没有更简单、更直接的方法呢？我只想输出视频流的编码格式。那... 当然有了，使用下面的命令试试？

```bash
ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 input.mp4
```

之后你会发现就简单的输出一个视频的编解码格式：hevc，是不是感觉舒服多了？

现在再来解释下这个命令的意思：

* `-v quiet`：设置日志级别。
* `-select_streams v:0`：选择第一个视频流（v:0）。
* `-show_entries stream=codec_name`：指定要显示的流的编码格式（codec_name）。
* `-of default=noprint_wrappers=1:nokey=1`：设置纯文本的格式输出（只显示编码格式，而不包含额外的信息）。
* `input.mp4`：视频文件的路径。

现在似乎已经有了大概的了解，实际上 ffprobe 的参数特别多。接下来，就详细说下几个重要参数（实际上这几个参数就完全够使用了）。

### -loglevel

用于设置日志级别（简写方式 `-v` ）。默认使用的是 info 级别，会输出很多冗余的信息。我的建议是，除非你不用，如果一定要指定日志级别那就使用最高的 quiet 级别。quiet 级别只会输出你要获取的信息，其他统统忽略。

示例：

```bash
$ ffprobe -v quiet -show_entries stream input_file
```

### -show_entries

`-show_entries` 参数用于指定要从媒体文件中提取的元数据信息的类型和格式。该参数的语法如下：

```bash
-show_entries [stream|format|frame|packet|program|chapter|subtitle|data|library_name|sar|show_programs|show_streams|show_format] ...
```

你可以在方括号中选择以下其中之一的标签来指定要提取的信息类型（其中 `stream` 最常用）：

* `stream`: 提取有关流（如视频、音频、字幕等）的信息。
* `format`: 提取有关多媒体文件格式的信息。
* `frame`: 提取有关帧（视频或音频帧）的信息。
* `packet`: 提取有关数据包（如音频和视频帧的数据包）的信息。
* `program`: 提取有关多媒体文件中的节目（program）的信息。
* `chapter`: 提取有关多媒体文件中的章节（chapter）的信息。
* `subtitle`: 提取有关字幕的信息。
* `data`: 提取有关数据流（如附加数据流）的信息。
* `library_name`: 提取有关使用的库的信息。
* `sar`: 提取有关样本纵横比（sample aspect ratio）的信息。
* `show_programs`: 显示所有节目的信息。
* `show_streams`: 显示所有流的信息。
* `show_format`: 显示多媒体文件格式的信息。

你可以在命令中指定多个 `-show_entries` 标签，以一次提取多种类型的元数据。例如，如果你希望同时提取流信息和格式信息，可以使用以下命令：

```bash
ffprobe -v error -show_entries stream -show_entries format input.mp4
```

接下来就以 `stream` 做说明。ffprobe 默认会提取 stream 的所有元数据：

```bash
$ ffprobe -v error -show_entries stream input.mkv

[STREAM]
index=0
codec_name=hevc
codec_long_name=H.265 / HEVC (High Efficiency Video Coding)
profile=Main 10
codec_type=video
codec_tag_string=[0][0][0][0]
codec_tag=0x0000
width=1920
height=1080
...
TAG:BPS=2139049
TAG:DURATION=00:23:23.986000000
TAG:NUMBER_OF_FRAMES=33662
TAG:NUMBER_OF_BYTES=375399465
[/STREAM]
```

不过我们可以指定获取流的具体元数据（如获取视频流的编码格式和比特率）：

```bash
$ ffprobe -v error -show_entries stream=codec_name,bit_rate input.mp4

[STREAM]
codec_name=hevc
bit_rate=N/A
[/STREAM]
[STREAM]
codec_name=aac
bit_rate=N/A
[/STREAM]
[STREAM]
codec_name=subrip
bit_rate=N/A
[/STREAM]
[STREAM]
codec_name=subrip
bit_rate=N/A
[/STREAM]
```

也就是说，如果想要同时获取多个元数据，只需要用逗号分隔多个标签即可。不过，这种方式对 TAG 数据会失效：

```
TAG:BPS=2139049
TAG:DURATION=00:23:23.986000000
TAG:NUMBER_OF_FRAMES=33662
TAG:NUMBER_OF_BYTES=375399465
```

如果想要获取 TAG 元数据，就需要使用 stream_tags 标签：

```bash
$ ffprobe -v error -show_entries stream_tags=bps,duration input.mp4
```

如果想要同时获取普通的元数据和 TAG 元数据，需要使用 `:` 拼接：

```bash
ffprobe -v error -show_entries stream=codec_name,bit_rate:stream_tags=bps,duration input.mp4
```

或获取 TAG 的所有元数据：

```bash
ffprobe -v error -show_entries stream=codec_name,bit_rate:stream_tags input.mp4
```

不过元数据的 key 所代表的含义这里就不做说明了。基本上都是字面上的意思，将元数据的 key 输出出来就一目了然了。

### -of

`-of` 参数用于指定输出格式，允许你选择如何格式化 `ffprobe` 的输出。你可以使用不同的格式选项来获得不同的输出样式，包括 `json` 、 `xml` 、 `csv` 等等。

以下是一些常见的用法示例：

#### 以 JSON 格式输出

```bash
ffprobe -v quiet -show_entries stream=codec_name -of json input.mp4
```

#### 以 XML 格式输出

```bash
ffprobe -v quiet -show_entries stream=codec_name -of xml input.mp4
```

#### 以 CSV 格式输出

```bash
ffprobe -v quiet -show_entries stream=codec_name -of csv input.mp4
```

#### 以文本格式输出

```bash
ffprobe -v quiet -show_entries stream=codec_name -of default input.mp4
```

文本默认输出如下格式内容：

```
[STREAM]
codec_name=hevc
[/STREAM]
[STREAM]
codec_name=aac
[/STREAM]
[STREAM]
codec_name=subrip
[/STREAM]
[STREAM]
codec_name=subrip
[/STREAM]
```

总感觉不太舒服，实际上如果你以文本输出的话还可以额外指定两个参数：

* `noprint_wrappers=1`：不输出外部包裹信息，如 [STREAM]。
* `nokey=1`：不输出属性的 KEY，如 codec_name。

示例：

**指定 `noprint_wrappers=1`**：

```bash
$ ffprobe -v quiet -show_entries stream=codec_name -of default=noprint_wrappers=1 input.mp4
codec_name=hevc
codec_name=aac
codec_name=subrip
codec_name=subrip
```

**同时指定 `noprint_wrappers=1` 、 `nokey=1`**：

```bash
$ ffprobe -v quiet -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 input.mp4
hevc
aac
subrip
subrip
```

### -select_streams

`-select_streams` 参数用于指定输出特定流（如视频流、音频流、字幕流等）的相关信息。该参数必须配合 `-show_entries` 一起使用，否则 ffprobe 会自动忽略该参数。

下面是 `-select_streams` 参数的基本用法：

```bash
ffprobe -select_streams [stream_specifier] -show_entries [entries] input_file
```

其中， `stream_specifier` 是流的标识符，可以采用以下形式：

* `a:X`：选择音频流，其中 `X` 是音频流的索引。
* `v:X`：选择视频流，其中 `X` 是视频流的索引。
* `s:X`：选择字幕流，其中 `X` 是字幕流的索引。
* `d:X`：选择数据流，其中 `X` 是数据流的索引。

这里有一点需要注意，索引 `X` 是可选的，如果不明确指定索引默认为流的全部索引信息。

例如，如果你想要仅分析视频流（第一个视频流），可以使用以下命令：

```bash
ffprobe -select_streams v:0 -show_entries stream input_file
```

如果你还想同时分析音频流（第一个音频流），可以这样做：

```bash
ffprobe -select_streams v:0,a:0 -show_entries stream input_file
```

还是以我本地的视频文件（input.mp4）为例，该视频文件有两个字幕流。分别是简体中文和繁体中文，我想输出这两个字幕流的语言以及名称：

```bash
ffprobe -v quiet -select_streams s -show_entries stream_tags=language,title -of json input.mp4
```

输出如下：

```json
{
  "streams": [
    {
      "tags": {
        "language": "chi",
        "title": "简体中文"
      }
    },
    {
      "tags": {
        "language": "chi",
        "title": "繁體中文"
      }
    }
  ]
}
```

是不是感觉很棒？我也可以明确指定输出第二个字幕流信息：

```bash
ffprobe -v quiet -select_streams s:1 -show_entries stream_tags=language,title -of json input.mp4
```

输出如下：

```json
{
  "streams": [
    {
      "tags": {
        "language": "chi",
        "title": "繁體中文"
      }
    }
  ]
}
```

|**NOTE**|
|:-------|
|虽然明确指定了流索引，依然会使用数组格式输出。|

## 扩展

### fps是什么?

玩过游戏的玩家都会在屏幕上方看到一行带有 fps 的小字，一般后面都会加上时刻在变动的数值，那么fps是什么意思呢？

fps 指的是画面每秒传输帧数，通俗来讲就是指动画或视频的画面数，因此经常能在FPS后面看到一些数值，数值越高，画面就越流畅，相反画面就会卡顿。

另外，我们也可以将 fps 理解为刷新率，通常好一点的显示器刷新率都在60Hz（即60帧/秒）以上。当刷新率太低时，肉眼就能感觉到屏幕的闪烁，不连贯，对图像显示效果和视觉感观产生不好的影响。对于电影来说，帧率通常是 24fps，即以每秒24张画面的速度播放，也就是一秒钟内在屏幕上连续投射出25张静止画面。

fps 其实是三个英文单词的缩写：其中的 f 就是英文单词 Frame（画面、帧），p 就是 Per（每），s 就是 Second（秒）。用中文表达就是多少帧每秒，或每秒多少帧。电影是24fps，通常简称为24帧。
