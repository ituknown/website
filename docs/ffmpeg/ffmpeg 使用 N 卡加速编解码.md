在使用 `ffmpeg` 时，如果对**视频重新编码**默认使用的是CPU（注意是重新编码，不是直接 `-c:v copy`）。如果想指定使用 NVIDIA 显卡（N卡） 来进行硬件加速，可以通过以下步骤来实现：

## 查看 ffmpeg 支持的硬件加速方式

```bash
$ ffmpeg -hide_banner -hwaccels
```

输出示例：

```bash
Hardware acceleration methods:
cuda    // NVIDIA 的通用 GPU 加速平台
vaapi   // Video Acceleration API（主要用于 Linux 下的 Intel/AMD）
qsv     // Intel Quick Sync Video（Intel CPU 的硬件加速）
dxva2   // Windows 下的 DirectX 视频加速
d3d11va // Windows 下的 DirectX 视频加速
opencl  // ...
vulkan
d3d12va
```

如果使用 N 卡的话就是 cuda。

## 查看 ffmpeg 支持的 NVIDIA 硬件编码器（NVENC）

```bash
$ ffmpeg -hide_banner -encoders | grep nvenc
```

输出示例：

```
 V....D av1_nvenc            NVIDIA NVENC av1 encoder (codec av1)
 V....D h264_nvenc           NVIDIA NVENC H.264 encoder (codec h264)
 V....D hevc_nvenc           NVIDIA NVENC hevc encoder (codec hevc)
```

## 使用 NVIDIA NVENC 进行视频编码

```bash
$ ffmpeg -hwaccel cuda -i input.mp4 -c:v hevc_nvenc output.mp4
```

参数说明：

- `-hwaccel cuda`：启用 CUDA 硬件加速（也可用 `-hwaccel nvdec` 只用于解码）。

- `-c:v hevc_nvenc`：使用 NVIDIA 的 H.265 硬件编码器，也可以用 `h264_nvenc` 来编码为 H.264。

## 有多张显卡？

当使用 N 卡加速时，默认使用的是第一张显卡。如果你有多张显卡，可以使用 `CUDA_VISIBLE_DEVICES=NUM` 指定（其中 NUM 是显卡编码，从 0 开始）。比如使用第二张显卡：

```bash
CUDA_VISIBLE_DEVICES=1 ffmpeg -hwaccel cuda -i input.mp4 -c:v hevc_nvenc output.mp4
```

**注意：** `CUDA_VISIBLE_DEVICES` 要在 ffmpeg 命令之前指定。
