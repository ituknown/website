## 前言

pyenv 文档提供了多种安装方式，尽管方式不同，但是都默认安装在用户根目录下的 .pyenv 文件夹中。

对于我这种内存困难户来说很不友好，所以我一般选择 git 安装方式，将仓库 clone 到指定文件夹。

## 安装 pyenv

需要说明的一点是，[pyenv](https://github.com/pyenv/pyenv) 本身没有提供 Windows 版本，不过可以使用 [pyenv-win](https://github.com/pyenv-win/pyenv-win) 扩展版，用法与 pyenv 一样。

### Linux/MacOS 安装

```bash
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
```

之后需要在环境变量中添加如下配置：

```bash
PYENV_ROOT=~/.pyenv
PATH=$PYENV_ROOT/bin:$PATH
eval "$(pyenv init -)"
```

重新打开一个命令窗口，输入 help 命令验证安装信息：

```bash
$ pyenv help
```

:::tip
安装位置需要根据自身情况修改，请勿拿来主义！
:::

### Windows 安装

```powershell
git clone https://github.com/pyenv-win/pyenv-win.git "D:\pyenv"
```

之后需要在环境变量中添加如下配置：

```powershell
PYENV=D:\pyenv\pyenv-win
PYENV_HOME=D:\pyenv\pyenv-win
PYENV_ROOT=D:\pyenv\pyenv-win
```

同时将下面两行内容追加到系统 Path 中：

```powershell
%PYENV_HOME%\bin
%PYENV_HOME%\shims
```

重新打开一个命令窗口，输入 help 验证安装信息：

```powershell
PS C:\Users\WINDOWS> pyenv help
Usage: pyenv <command> [<args>]

Some useful pyenv commands are:
   commands    List all available pyenv commands
   local       Set or show the local application-specific Python version
   latest      Print the latest installed or known version with the given prefix
   global      Set or show the global Python version
   shell       Set or show the shell-specific Python version
   install     Install a Python version using python-build
   uninstall   Uninstall a specific Python version
   rehash      Rehash pyenv shims (run this after installing executables
   version     Show the current Python version and its origin
   versions    List all Python versions available to pyenv
   which       Display the full path to an executable
   whence      List all Python versions that contain the given executable

See `pyenv help <command>' for information on a specific command.
For full documentation, see: https://github.com/pyenv-win/pyenv-win#readme
```

:::tip
安装位置需要根据自身情况修改，请勿拿来主义！
:::

## 升级 pyenv

如果需要升级 pyenv 只需要在仓库目录下执行 pull 命令即可：

```bash
git pull
```

## 查看当前系统 python 版本信息

```bash
$ pyenv versions

...
* 3.10.11
  3.11.9
  3.12.4
...
```

版本前面有个 `*` 表示是系统默认版本。

或者直接使用 version 命令查看系统默认版本：

```bash
$ pyenv version

3.10.11
```

## 列出所有可用版本

```bash
$ pyenv install -l

...
3.10.7
3.10.8
3.10.9
3.10.10
3.10.11
3.11.0a1
3.11.0a2
pypy3.11-7.3.20
pyston-2.2
...
```

该命令会将测试版以及其他发行版（如 anaconda/miniconda）都列出来。如果只想展示 python 官方正式版本，可以使用 grep 过滤：

```bash
# 只显示稳定的 Python 正式版本
$ pyenv install -l | grep -E "^ +[0-9]+\.[0-9]+\.[0-9]+$"

# 显示所有 Python 版本（排除其他发行版）
$ pyenv install -l | grep -E "^ +[0-9]+\.[0-9]+" | grep -v -E "(dev|rc|a|b)"
```

推荐直接设置 alias 命令：

```bash
# 只显示稳定的 Python 正式版本
alias pyenv-stable-versions='pyenv install -l | grep -E "^ +[0-9]+\.[0-9]+\.[0-9]+$"'

# 显示所有 Python 版本（排除其他发行版）
alias pyenv-all-versions='pyenv install -l | grep -E "^ +[0-9]+\.[0-9]+" | grep -v -E "(dev|rc|a|b)"'
```

## 安装指定版本

在安装之前可以先使用 `-l` 参数输出有哪些可用版本：

```bash
$ pyenv install -l

...
3.10.7
3.10.8
3.10.9
3.10.10
3.10.11
3.11.0a1
3.11.0a2
...
```

之后选择具体的版本安装即可：

```bash
$ pyenv install 3.10.11
```

或者直接指定大版本，如果没有指定具体的小版本的话默认会安装最新版本：

```bash
$ pyenv install 3.8
```

以 Windows 为例，输出信息如下：

```bash
$ pyenv.bat install 3.8
:: [Info] ::  Mirror: https://www.python.org/ftp/python
:: [Downloading] ::  3.8.10 ...
:: [Downloading] ::  From https://www.python.org/ftp/python/3.8.10/python-3.8.10-amd64.exe
:: [Downloading] ::  To   D:\pyenv\pyenv-win\install_cache\python-3.8.10-amd64.exe
:: [Installing] ::  3.8.10 ...
:: [Info] :: completed! 3.8.10
```

安装完成后就可以使用 versions 命令查看当前已安装的版本信息（以Windos为例）：

```bash
$ pyenv versions
* 3.10.11 (set by D:\pyenv\pyenv-win\version)
  3.11.9
  3.12.4
  3.8.10
```

同时，可以也可以直接在 $PYENV_HOME/pyenv/versions 目录下查看当前已安装的版本：

```bash
$ cd $PYENV_HOME/pyenv/versions

$ tree .
├─bin
├─shims
└─versions
    ├─3.10.11
    ├─3.11.9
    ├─3.12.4
    └─3.8.10
```

## 卸载指定版本

先查询系统已安装的版本：

```bash
$ pyenv versions
  system
* 3.10.14
  3.11.9
  3.12.11
```

将不需要的卸载掉：

```bash
$ pyenv uninstall 3.11.9

$ pyenv versions
  system
* 3.10.14
  3.10.20
  3.12.11
```

## 设置系统级别默认 python 版本

设置全局默认版本有两种方式，使用 global 命令或直接修改 $PYENV_HOME/version 文件。

使用 global 命令：

```bash
pyenv global 3.8.10
```

之后就可以使用 versions 命令或直接使用 python 命令查看系统默认版本了：

```bash
$ pyenv versions
  3.10.11
  3.11.9
  3.12.4
* 3.8.10

$ python -V
Python 3.8.10
```

同时也可以打开 $PYENV_HOME/version 文件查看内容信息：

```bash
$ cat $PYENV_HOME/version
3.8.10
```

反之，也可以通过修改 $PYENV_HOME/version 文件设置默认 python 版本。

另外，如果想要恢复系统原始 python 版本可以执行如下命令：

```bash
pyenv global system
```

更多高级用法可以查看说明文档：[https://github.com/pyenv-win/pyenv-win/blob/master/docs/installation.md#git-commands](https://github.com/pyenv-win/pyenv-win/blob/master/docs/installation.md#git-commands)

## 设置项目级别默认 python 版本

如果在实际项目中不想使用全局默认版本也可以在项目根目录使用 local 命令设置项目级别 python 版本，示例：

```bash
pyenv local 3.10.11
```

之后会在项目根目录下生成一个 .python-version 文件，该文件作用与 $PYENV_HOME/version 文件一样，不给过优先级更高！

之后可以直接在项目根目录下执行 python 命令验证：

```bash
# 项目根目录
$ python -V
Python 3.10.11

# 退出项目根目录
$ pyenv.bat versions
  3.10.11
  3.11.9
  3.12.4
* 3.8.10
```

想要取消项目级别 python 版本可以执行如下命令或直接删除 .python-version 文件：

```bash
pyenv local --unset
```

更多高级用法可以查看说明文档：[https://github.com/pyenv/pyenv/blob/master/COMMANDS.md#pyenv-local](https://github.com/pyenv/pyenv/blob/master/COMMANDS.md#pyenv-local)
