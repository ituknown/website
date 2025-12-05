给流媒体（视频、音频）文件添加封面的通用命令如下：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \
-map 0:v \
-map 0:a \
-map 1:v \
-c:v:0 copy \
-c:a:0 copy \
-c:v:1 mjpeg \
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

第一个输入文件是 input.mp4，该文件的索引就是 $0$。<br/>
第二个输入文件是 cover.jpg，该文件的索引就是 $1$。
</details>

<details open>
<summary>**`-map 0:v`**</summary>

提取索引为 0 的输入文件（input.mp4）的所有视频流。一个媒体文件通常只有一个视频流，即主视频，所以无需具体指定视频流索引。

但如果该输入文件（索引为 0）有多个视频流，就可以进一步通过索引指定要提取的视频流：

```bash
-map 0:v[:索引]
```

如文件有两个视频流，你想提取第一个视频流，就可以写成：

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
<summary>**`-c copy`**<br/>**`-c:v:0 copy -c:a:0 copy -c:v:1 mjpeg`**</summary>

该参数用于控制对提取（`map`）的流做指定编码操作，如果你不想重新编码，直接使用 `copy` 即可。

命令中，针对第一个视频流和第一个音频流我什么操作也不需要做，所以直接 copy：

```bash
-c:v:0 copy \
-c:a:0 copy \
```

但是封面有点不一样，<u>大多数播放器要求封面必须采用 MJPEG 编码</u>。所以针对封面视频流，不能直接使用 copy，而是要重新编码：

```bash
-c:v:1 mjpeg \
```

:::tip
如果你的封面图片本身就是 MJPEG 编码（cover.mjpeg），那就不需要重新编码了，可以直接将：

```bash
-c:v:0 copy \
-c:a:0 copy \
-c:v:1 mjpeg \
```

简化成：

```bash
-c copy \
```
:::
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
-c:a copy \
-c:v mjpeg \
-metadata:s:v title="Album Cover" \
-metadata:s:v comment="Cover (front)" \
-disposition:v attached_pic \
output.flac
```

因为同一个类型的流只有一个（一个音频流，一个视频流），所以在处理流数据（`-c:a copy -c:v mjpeg`）和设置视频流元数据（`-metadata:s:v`）时，没有指定流索引。

:::

<details open>
<summary>**-disposition 参数说明**</summary>

在 FFmpeg 中，所有输入文件都可以被视为一个流。对于图片输入，会被视为视频流，尽管它实际上是静态帧。

就是说 cover.jpg 虽然是一张图片，但是被 FFmpeg 处理时，会被处理为视频流使用。

所以命令：

```bash
ffmpeg \
-i input.mp4 \
-i cover.jpg \

...
-disposition:v:1 attached_pic
...
```

有两个视频流，第一个视频流是 input.mp4，索引是 $0$。第二个视频流是 cover.jpg，索引是 $1$。

而 `-disposition:v` 参数可以用来设置流的属性，这里指定第二个视频做作为附加封面（attached_pic）使用。
</details>