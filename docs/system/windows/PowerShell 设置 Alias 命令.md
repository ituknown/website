## 前言

在 PowerShell 中，`Set-Alias` 命令用于为现有命令设置一个别名。其基本语法如下：

```PowerShell
Set-Alias [-Name] <string> [-Value] <string> [-Option <ScopedItemOptions>] [-Description <string>]
```

- `-Name`：指定你要创建的别名名称。
- `-Value`：指定你要给这个别名指向的实际命令。
- `-Option`：指定别名的选项，可以是 `None`、`ReadOnly`、`Constant` 或 `Private`。
- `-Description`：为别名提供一个描述（在 PowerShell 7 及更高版本中可用）。

不过这些参数名可以直接忽略，比如为 `rustup update` 设置别名 `RustUpdate`：

```PowerShell
Set-Alias -Name RustUpdate -Value "rustup update"

# 简写
Set-Alias RustUpdate "rustup update"
```

设置完成之后可以通过 `Get-Alias RustUpdate` 确认。

## 使用配置文件持久化

直接在 PowerShell 中执行 `Set-Alias` 只会在当前窗口中生效，关闭之后就可能使用了。如果想要后续还可以继续使用该命令，可以写到 PowerShell  配置文件中。可以使用下面命令打开配置文件：

```PowerShell
notepad $PROFILE
```

如果执行该命令提示 “找不到指定路径”，是因为 PowerShell 配置文件还没有创建。可以通过在 PowerShell 中执行下面命令解决：

```PowerShell
if (!(Test-Path -Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}
```

该命令用于检查 PowerShell 配置文件是否存在。如果不存在，则创建。

之后将 Alias 命令写到配置文件中保存即可！

需要注意的一点是，`Set-Alias` 命令不支持参数输入，比如下面的命令就无法正确设置：

```PowerShell
Set-Alias -Name RustUpdateStable -Value "rustup update stable"
```

因为 stable 是参数，无法正确处理。当你在 PowerShell 中执行 `RustUpdateStable` 命令通常会遇到如下错误信息：

```
RustUpdateStable : 无法将“rustup.exe update stable”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的
拼写，如果包括路径，请确保路径正确，然后再试一次。
所在位置 行:1 字符: 1
+ RustUpdateStable
+ ~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (rustup.exe update stable:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

这种情况下就只能通过自定义 function 解决了

## 自定义 function

如下：

```PowerShell
# 更新 Rust
function rust_update {
    param (
        [string]$version = "stable"
    )
    rustup update $version
}
```

- `function rust_update {}`：定义了一个名为 `rust_update` 的函数。
- `param ([string]$version = "stable")`：定义了一个参数 `$version`，默认为 `"stable"`。
- `rustup update $version`：函数体，执行 `rustup update` 命令并将 `$version` 作为参数传递。

通过这种方式，你就可以创建一个功能类似于别名的命令，并允许传递参数。

```powershell
# 更新到 nightly 版本
rust_update nightly

# 默认选择 stable 版本
rust_update
```

自定义函数的功能不仅仅如此，还能使用 `$args` 完全接受外部参数。

## 借助 `$args` 实现别名映射

有这么一种场景，想将一个命令完整的替换为另一个命令。以 npm 和 pnpm 为例，我想将输入的 npm 命令在底层执行时统一拦截替换为 pnpm 命令该怎么实现？

这个时候就用上 `$args` 了，简直手拿把掐：

```PowerShell
# 将 npm 完全映射给 pnpm
function npm {
    pnpm $args
}
```

输出示例：

```PowerShell
> npm --help
Version 10.32.1
Usage: pnpm [command] [flags]
       pnpm [ -h | --help | -v | --version ]

These are common pnpm commands used in various situations, use 'pnpm help -a' to list all commands
```

如果日常使用 pnpm 命令时，觉得命令太长可以考虑简化为 pm：

```powershell
# 设置 pm 别名
Set-Alias -Name pm -Value pnpm
```

还有另外一种情况，系统中已存在某个命令，我想使用另外一个命令替换，比如使用 eza 替换 ls（[https://github.com/eza-community/eza](https://github.com/eza-community/eza)）。如果单纯使用 function 你会发现实际并不生效：

```powershell
function ls {
    eza --icons $args
}
```

这是因为系统自带 ls 命令，它的优先级比 $PROFILE 文件要高。因此，如果想让自定义 function 生效，首先需要先移除系统自带的 ls 命令：

```powershell
# 先移除系统自带的 ls 别名，否则函数不会被触发
if (Test-Path Alias:ls) {
    Remove-Item Alias:ls -Force
}
```

之后自定义的 function 就生效了~

<details>
<summary>**$PROFILE 示例**</summary>
```
# 更新 Rust
function rust_chain_update {
    rustup update stable
}

# wsl显示所有可用分发版本
function wsl_list_online {
    param (
        [string]$list = "--online"
    )
    wsl --list --online $args
}

# FFmpeg
function ffmpeg {
    ffmpeg.exe -hide_banner $args
}

function ffprobe {
    ffprobe.exe -hide_banner $args
}

# 设置 pm 别名
Set-Alias -Name pm -Value pnpm

# 将 npm 完全映射给 pnpm
function npm {
    pnpm $args
}

# pnpm 组合更新
function pm_update {
    pnpm update -g
    pnpm self-update
}

# pnpm 全局安装包
function pm_list_g {
    pnpm list -g
}

# pnpm 全局安装
function pm_add_g {
    pnpm add -g $args
}

# eza 替代默认 ls
# https://github.com/eza-community/eza

# 先移除系统自带的 ls 别名，否则函数不会被触发
if (Test-Path Alias:ls) {
    Remove-Item Alias:ls -Force
}

function ls {
    eza --icons $args
}

function ll {
    eza --icons -alhF $args
}

function la {
    eza --icons -a $args
}

# 先移除系统自带的 tree 别名，否则函数不会被触发
if (Test-Path Alias:tree) {
    Remove-Item Alias:tree -Force
}

function tree {
    eza -T -L $args
}

function tree_icons {
    eza --icons -T -L $args
}

function yt_dlp {
    yt-dlp.exe --js-runtimes node --remote-components ejs:github
}

# 设置代理
function proxy_enable {
    $env:HTTP_PROXY = "http://127.0.0.1:7897"
    $env:HTTPS_PROXY = "http://127.0.0.1:7897"
    Write-Output "Proxy ON"
}

function proxy_disable {
    Remove-Item Env:HTTP_PROXY
    Remove-Item Env:HTTPS_PROXY
    Write-Output "Proxy OFF"
}
```
</details>