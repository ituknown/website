在项目根目录下执行：

```bash
python -m venv venv  # 创建新的虚拟环境

# 可选操作（升级 pip 和 setuptools）
# python3 -m pip install --upgrade pip setuptools
```

:::tip
venv 是约定习俗的虚拟环境文件名，你也可以使用其他文件名。
:::

如果你的项目本身已创建虚拟环境，但是存在问题。可以先删除当前虚拟环境，之后重新创建：

```bash
deactivate    # 如果你当前处于虚拟环境中
rm -rf venv   # 删除虚拟环境

python -m venv venv # 重新创建虚拟环境
```

## 激活虚拟环境

Unix环境：

```bash
source venv/bin/activate
```

Windows 环境：

```cmd
.\venv\Scripts\activate
```

Windows 环境执行激活命令时通常会遇到类似下面的错误：

```
.\venv\Scripts\activate : 无法加载文件 ....\venv\Scripts\Activate.ps1，因为在此系统上禁止运行
脚本。有关详细信息，请参阅 https:/go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。
所在位置 行:1 字符: 1
+ .\venv\Scripts\activate
+ ~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : SecurityError: (:) []，PSSecurityException
    + FullyQualifiedErrorId : UnauthorizedAccess
```

原因是 PowerShell 执行策略禁止运行脚本，只需要修改执行策略解决：

$1$. **以管理员身份运行 PowerShell**

右键点击 PowerShell 图标，选择“以管理员身份运行”。

$2$. **查看当前执行策略**

```cmd
Get-ExecutionPolicy
```

如果显示 Restricted，表示不允许任何脚本运行。

$3$. **设置执行策略**

运行下面的命令将执行策略修改为 RemoteSigned：

```cmd
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

之后再次尝试激活 Python 虚拟环境即可！

--

https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies