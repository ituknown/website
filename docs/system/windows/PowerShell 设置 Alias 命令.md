## 前言

在 PowerShell 中，`Set-Alias` 命令用于为现有命令设置一个别名。其基本语法如下：

```PowerShell
Set-Alias [-Name] <string> [-Value] <string> [-Option <ScopedItemOptions>] [-Description <string>]
```

- `-Name`：指定你要创建的别名名称。
- `-Value`：指定你要给这个别名指向的实际命令。
- `-Option`：指定别名的选项，可以是 `None`、`ReadOnly`、`Constant` 或 `Private`。
- `-Description`：为别名提供一个描述（在 PowerShell 7 及更高版本中可用）。

不过这些参数名可以直接忽略，比如为 `rustup update` 设置别名 `Rust-Update`：

```PowerShell
Set-Alias -Name Rust-Update -Value "rustup update"
```

也可以直接忽略参数名：

```PowerShell
Set-Alias Rust-Update "rustup update"
```

设置完成之后可以通过 `Get-Alias Rust-Update` 确认。
## 持久化

直接在 PowerShell 中执行 `Set-Alias` 只会在当前窗口中生效，关闭之后就可能使用了。如果想要后续还可以继续使用该命令，可以写到 PowerShell  配置文件中。

使用下面命令打开配置文件：

```PowerShell
notepad $PROFILE
```

如果执行该命令提示 “找不到指定路径”，是因为 PowerShell 配置文件还没有创建。可以在 PowerShell 中执行下面命令解决：

```PowerShell
if (!(Test-Path -Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}
```

该命令用于检查 PowerShell 配置文件是否存在。如果不存在，则创建。之后将 Alias 命令写到配置文件中即可！

不过需要强调的一点时，`Set-Alias` 命令不支持参数输入。比如下面的命令就无法正确设置：

```PowerShell
Set-Alias -Name Rust-Update-Stable -Value "rustup update stable"
```

因为 stable 是参数，无法正确处理。当你在 PowerShell 中执行 `Rust-Update-Stable` 命令通常会遇到如下错误信息：

```
Update-Rust-Stable : 无法将“rustup.exe update stable”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的
拼写，如果包括路径，请确保路径正确，然后再试一次。
所在位置 行:1 字符: 1
+ Update-Rust-Stable
+ ~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (rustup.exe update stable:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

不过我们可以通过在配置文件中写一个函数解决参数问题，如下：

```PowerShell
function rust_update {
    param (
        [string]$version = "stable"
    )
    rustup update $version
}

## 为函数创建别名
Set-Alias -Name Update-Rust -Value rust_update
```

- `function rust_update {}`：定义了一个名为 `rust_update` 的函数。

- `param ([string]$version = "stable")`：定义了一个参数 `$version`，默认为 `"stable"`。

- `rustup update $version`：函数体，执行 `rustup update` 命令并将 `$version` 作为参数传递。

- `Set-Alias -Name Update-Rust -Value rust_update`：为函数 `rust_update` 创建一个别名 `Update-Rust`。

通过这种方式，你就可以创建一个功能类似于别名的命令，并允许传递参数。

```powershell
# 更新到 nightly 版本
Update-Rust nightly

# 默认选择 stable 版本
Update-Rust
```