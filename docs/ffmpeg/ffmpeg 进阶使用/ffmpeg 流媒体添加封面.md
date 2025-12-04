给流媒体（视频、音频）文件添加封面的通用命令如下：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \
-map 0:v \
-map 0:a \
-map 1:v \
-c copy \
-metadata:s:v:1 title="Album Cover" \
-metadata:s:v:1 comment="Cover (front)" \
-disposition:v:1 attached_pic \
output.mp4
```

:::tip
这个是设置封面的通用命令，你可以将 input.mp4 替换为任意你需要的流媒体文件，比如 mkv、flac。

下面是对该命令的详细解释：
:::

<details open>
<summary>**`-i input.mp4`<br/>`-i cover.jpg`**</summary>

输入文件，按照顺序，索引从 $0$ 开始。

比如第一个输入文件是 $input.mp4$，该文件的索引就是 $0$。<br/>
第二个输入文件是 $cover.jpg$，该文件的索引就是 $1$。
</details>

<details open>
<summary>**`-map 0:v`**</summary>

提取索引为 0 的输入文件（input.mp4）的所有视频流。一个媒体文件通常只有一个视频流，即主视频。如果该索引文件有多个视频流，可以通过索引指定：

```bash
-map 0:v[:索引]
```

比如该文件有两个视频流，你想提取第一个视频流，就可以写成：

```bash
-map 0:v:0
```

你想提取第二个视频流，就可以写成：

```bash
-map 0:v:1
```

当然，你也可以全要：

```bash
-map 0:v:0 \
-map 0:v:1 \
```
</details>

<details open>
<summary>**`-map 0:a`**</summary>

与 `-map 0:v` 表示同样的含义，只不过这个提取的是音频流。
</details>

<details open>
<summary>**`-map 1:v`**</summary>

将索引为 $1$ 的输入文件（cover.jpg）提取为视频流。

视频本身就是图片序列，所以将图片提取为视频流没有任何问题。
</details>

<details open>
<summary>**`-c copy`**</summary>

对提取（`map`）的流只做复制操作，不重新编码。就是说保留原视频流、音频流的编码格式，不做任何操作（最主要的是对流重新编码特别浪费时间）。
</details>

<details open>
<summary>**`-metadata:s:v:1 title="Album Cover"`**</summary>

`-metadata:s` 表示操作流的元数据，后面又跟一个 `v`，含义就变成了操作视频流的元数据。

该命令中一共提取了两个视频流，具体使用哪一个呢？所以就需要继续追加索引 $1$ 来指定（对应的就是输入文件 cover.jpg）。

总结下来，就是给第二个视频流添加元数据 `title`。

:::tip
$v:$ 表示视频流<br/>
$a:$ 表示音频流<br/>
$s:$ 表示字幕流
:::
</details>

<details open>
<summary>**`-metadata:s:v:1 comment="Cover (front)"`**</summary>

继续给第二个视频流添加元数据 `comment`。

<u>这个元数据非必须，但是如果你修改的是 flac 音频文件，那该元数据就是必须的，且值也必须指定为 `Cover (front)`。所以在实际使用时，还是建议保留该元数据。</u>
</details>

<details open>
<summary>**`-disposition:v:1 attached_pic`**</summary>

将第二个视频流标记为封面（封面图片），<u>这个必须要设置</u>。因为很多主流的播放器都是以 attached_pic 来判断是否设置了封面。
</details>

:::tip[一个给 flac 添加封面的示例]

```bash
ffmpeg \
-i input.flac \
-i cover.jpg \
-map 0:a \
-map 1:v \
-c copy \
-metadata:s:v title="Album Cover" \
-metadata:s:v comment="Cover (front)" \
-disposition:v attached_pic \
output.flac
```

因为只有一个视频流，所以在设置视频流元数据（`-metadata:s:v`）时，可以直接忽略视频流的索引。

:::

## -disposition 参数说明

在 `FFmpeg` 中，所有输入文件都可以被视为一个流。对于图片输入，`FFmpeg` 通常会创建一个视频流，尽管它实际上是静态帧。就是说即使 `cover.jpg` 是一张图片，它在 `FFmpeg` 处理时会被视为一个视频流使用。

所以命令：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \

...
-disposition:v:1 attached_pic
...
```

有两个视频流，第一个视频流是 input.mp4，索引是0。第二个视频流是 cover.jpg，索引是1。

而 `-disposition:v` 参数可以用来设置流的属性。这里指定第二个视频做作为附加封面（attached_pic）使用。