## 前言

在 PowerShell 中，想给某个命令起一个更短的名字、或者把一段固定写法封装成一个命令来调用，主要有两套手段：

- **`Set-Alias`（别名）**：纯粹是给一个**已有的命令**换一个名字，仅此而已。它**不能带任何参数**。
- **`function`（函数）**：一段可以带参数、带逻辑的脚本块，能力远强于别名。

一句话区分：**只换名、不带参数，用 `Set-Alias`；只要带参数或逻辑，就必须用 `function`。** 本文按这个递进顺序展开。

## 一、Set-Alias：为单一命令设置别名

`Set-Alias` 用于为现有命令设置一个别名，基本语法如下：

```powershell
Set-Alias [-Name] <string> [-Value] <string> [-Option <ScopedItemOptions>] [-Description <string>]
```

- `-Name`：你要创建的别名名称。
- `-Value`：该别名**指向的命令**（注意：是一个命令的**名字**，不是一整条命令行）。
- `-Option`：别名的选项，常用取值为 `None`、`ReadOnly`（防止误改）、`Constant`、`Private`。
- `-Description`：为别名添加一段说明文字（Windows PowerShell 与 PowerShell 7 均支持）。

以「给 `pnpm` 起一个短名 `pm`」为例：

```powershell
Set-Alias -Name pm -Value pnpm -Description "pnpm 的短别名"
```

如果只设置 `Name` 和 `Value`，可以省略参数名，直接用简写形式：

```powershell
Set-Alias pm pnpm
```

设置完成后，用 `Get-Alias` 即可查看确认：

```powershell
Get-Alias pm

CommandType     Name             Version    Source
-----------     ----             -------    ------
Alias           pm -> pnpm
```

:::tip[关键限制]
`-Value` 只能填**一个命令的名字**（cmdlet、函数、脚本或可执行程序名），**不能填「命令 + 参数」**。这是别名与函数最本质的区别，下文会详细说明。
:::

## 二、把别名写进配置文件持久化

直接在 PowerShell 窗口里执行 `Set-Alias` 只在**当前窗口**生效，关闭窗口就失效了。想要以后每次打开都能用，需要把命令写进 PowerShell 的**配置文件**（`$PROFILE`）。

用下面命令打开配置文件：

```powershell
notepad $PROFILE
```

若提示「找不到指定路径」，说明配置文件还没被创建过。可以先执行下面这段创建它：

```powershell
if (!(Test-Path -Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}
```

它先检查 `$PROFILE` 是否存在，不存在则创建。创建好之后，把 `Set-Alias`（或后文的 `function`）写进去保存即可。修改完用 `. $PROFILE`（dot-source）重新加载，无需重启窗口：

```powershell
. $PROFILE
```

:::info[`$PROFILE` 的具体路径]
`$PROFILE` 是个自动变量，指向「当前主机 + 当前用户」的配置文件。不同版本位置不同：

- **Windows PowerShell 5.x**：`~\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
- **PowerShell 7+**：`~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

不确定自己用的是哪个时，执行 `echo $PROFILE` 即可看到完整路径。
:::

## 三、别名的局限：不能带任何参数

这是初学最容易踩的坑。前面强调过：**`-Value` 只接受一个命令名，不能带参数。** 因此下面这条命令是**无法正确设置**的：

```powershell
# ❌ 错误：rustup update 是「命令 + 子命令」，不是一个单一命令
Set-Alias -Name RustUpdate -Value "rustup update"
```

因为 PowerShell 会去寻找一个名叫 `rustup update` 的命令（含中间那个空格），自然找不到。执行 `RustUpdate` 时就会报：

```text
RustUpdate : 无法将"rustup update"项识别为 cmdlet、函数、脚本文件或可运行程序的名称。
请检查名称的拼写，如果包括路径，请确保路径正确，然后再试一次。
    + CategoryInfo          : ObjectNotFound: (rustup update:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
```

再比如带更明确的参数 `stable`：

```powershell
# ❌ 同样错误：stable 是参数，别名无法处理
Set-Alias -Name RustUpdateStable -Value "rustup update stable"
```

只要命令里**带参数、带子命令**，别名就无能为力——这种情况只能用 `function` 解决。

## 四、用 function 封装带参数的命令

函数可以接受参数、执行逻辑，是别名的「超集」。把上面的 Rust 更新改写成函数：

```powershell
# 更新 Rust
function rust_update {
    param (
        [string]$version = "stable"
    )
    rustup update $version
}
```

- `function rust_update {}`：定义一个名为 `rust_update` 的函数。
- `param ([string]$version = "stable")`：声明参数 `$version`，默认值为 `"stable"`。
- `rustup update $version`：函数体，执行 `rustup update` 并把参数传进去。

这样就能像别名一样调用，还支持传参：

```powershell
rust_update nightly   # 更新到 nightly 版本
rust_update           # 不传参，默认用 stable
```

## 五、用 `$args` 透传任意参数

还有一种常见场景：**把一个命令完整地替换成另一个命令**。比如想让你输入的 `npm` 在底层统一转发给 `pnpm` 执行。这时用 `$args`（自动变量，代表传入的全部参数）即可：

```powershell
# 将 npm 完全映射给 pnpm
function npm {
    pnpm $args
}
```

```powershell
> npm --help
Version 10.32.1
Usage: pnpm [command] [flags]
       pnpm [ -h | --help | -v | --version ]
...
```

如果觉得 `pnpm` 这五个字母还是太长，可以用第一节的方式再给它一个短别名：

```powershell
# 设置 pm 别名（无参数，用 Set-Alias 即可）
Set-Alias -Name pm -Value pnpm
```

在此基础上，还能封装出一系列带逻辑的「组合命令」。下面是一个相对完整的 pnpm 工具集示例（放在配置文件里即可）：

<details>
<summary><b>pm 系列组合命令示例</b></summary>

```powershell
# 将 npm 完全映射给 pnpm
function npm {
    pnpm $args
}

# 设置 pm 别名
Set-Alias -Name pm -Value pnpm

# pnpm 组合更新
function pm_update {
    Write-Host ">>> 正在更新全局包..." -ForegroundColor Cyan
    pnpm update -g

    Write-Host "`n>>> 正在检查 pnpm 自身更新..." -ForegroundColor Cyan
    pnpm self-update

    Write-Host "`n✅ 更新检查完毕。" -ForegroundColor Green
}

# pnpm 全局安装的依赖包
function pm_list_g {
    pnpm list -g
}

# pnpm 全局安装
function pm_add_g {
    pnpm add -g $args
}

# pnpm 移除全局包
function pm_remove_g {
    pnpm remove -g $args
}

# pnpm 清除缓存
function pm_clear_cache {
    # 清理 pnpm 全局存储中未引用的包
    Write-Host "正在清理 pnpm 全局存储..." -ForegroundColor Cyan
    pnpm store prune

    # 如果当前目录有 package.json 文件，说明是 node 项目，继续清理 node_modules
    if (Test-Path "package.json") {
        Write-Host ">>> 检测到 Node 项目，准备清理本地 node_modules..." -ForegroundColor Yellow
        if (Test-Path "node_modules") {
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✅ node_modules 已成功删除。" -ForegroundColor Green
        }
        else {
            Write-Host "💡 目录下未发现 node_modules。" -ForegroundColor Gray
        }
    }
}
```

</details>

## 六、覆盖系统内置命令

还有一类情况：系统中**已经存在**某个命令，你想用自己的实现替换它。比如用 [eza](https://github.com/eza-community/eza) 替换默认的 `ls`。如果你直接定义同名函数，会发现它**并不生效**：

```powershell
# 这样单独定义不会生效
function ls {
    eza --icons $args
}
```

原因在于：PowerShell 内置了 `ls` 这个别名（指向 `Get-ChildItem`），它的优先级**高于**你后来定义的函数。所以要让自定义函数生效，必须先移除内置别名：

```powershell
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
```

`tree` 同理，也需要先移除内置别名：

```powershell
if (Test-Path Alias:tree) {
    Remove-Item Alias:tree -Force
}

function tree {
    eza -T -L $args
}
```

:::tip[命令查找顺序]
PowerShell 解析一个名字时，大致按以下顺序查找：**别名 → 函数 → cmdlet → 外部命令**。所以别名会「挡住」同名函数，必须先 `Remove-Item Alias:<名字>` 把内置别名清掉，函数才有机会被调用。
:::

## 小结

| 需求 | 用什么 | 示例 |
|:-----|:-------|:-----|
| 给单一命令换个短名（不带参数） | `Set-Alias` | `Set-Alias pm pnpm` |
| 带参数 / 带逻辑 | `function` | `function rust_update { ... }` |
| 完整转发到另一个命令 | `function` + `$args` | `function npm { pnpm $args }` |
| 替换系统内置命令 | 移除内置别名 + `function` | `Remove-Item Alias:ls -Force` |

当别名和函数越写越多，全部塞进一个 `$PROFILE` 会变得很难维护。建议把它们**按工具/领域拆分到不同文件**，再由主配置文件统一加载——具体做法见 [PowerShell 配置文件最佳实践](./PowerShell%20配置文件最佳实践.md)。
