## 前言

Vim 的配置文件分为全局配置和用户配置，全局配置文件一般是 `/etc/vimrc` 文件或者 `/etc/vim/vimrc`。而用户级别的配置文件则是 `~/.vimrc`。

下面是 Vim 配置文件由高到底加载顺序（高级别的配置会覆盖级别低的配置）。在实际中严格禁止直接修改系统级别的配置文件，应该以用户级别为主。想要做哪些定制化配置的话直接修改用户级别的配置即可（使用用户级别覆盖系统级别）。

|**级别**|**文件**|
|:--|:----|
|用户级别|`~/.vimrc`|
|系统级别|`/etc/vim/vimrc` 或 `/etc/vimrc`|

需要特别强调一点，在 vimrc 配置文件中注释使用的是英文 `"` 符号而不是 `#`。另外，在大多数情况下如果想要关闭某个配置只需要在前面加上 `no` 前缀即可，比如行号：

```vim
set number
````

关闭的话只需要加上 `no` 前缀即可：

```vim
set nonumber
```

还有一点，对于 Bool 配置可以使用 on、enable、yes 表示启用；使用 no、disable 表示关闭。

下面是配置说明：


## 配置示例

```vim
" 显示行号
set number "同 set nu

" 默认不显示行号, 如果显示设置不显示行号只需要在前面加上 no 前缀即可. 示例:
"set nonumber

" 突出当前行
set cursorline "同 set cul

" 突出当前列
"set cursorcolumn "同 set cuc

" 状态栏显示行列
set ruler

" 开启自动保存
set autowrite

" 高亮显示搜索结果
set hlsearch

" 搜过到最后匹配的位置时, 再次搜索不回到第一个匹配出
set nowrapscan

" 在处理未保存或只读文件时, 弹出确认
set confirm

" 高亮显示括号匹配
set showmatch

" 设置 TAB 长度未指定空格
set tabstop=4

" 设置自动缩进长度未指定空格
set shiftwidth=4

" 使用空格替代制表符
set expandtab

" 语法高亮
syntax on

" 在VIM底部显示模式, 如插入模式
set showmode

" 显示当前插入的明来, 如 2yy
set showcmd

" 设置编码格式
set encoding=utf-8

" 启用256色
set t_Co=256

" 开启文件类型检查, 并且载入与该类型对应的缩进规则. 比如编辑的
" 是.py文件, Vim 就是会找 Python 的缩进规则 ~/.vim/indent/python.vim
"filetype indent on

" 设置字体
"set guifont="JetBrains Mono"

" 记录命令条数(与之后的撤销有关)
set history=1000

" 允许撤销次数
set undolevels=1000

" 发生错误时, 视觉提示(通常是屏幕闪烁)
"set visualbell

" 自动删除行尾的空格和制表符
autocmd BufWritePre *.c :%s/\s\+$//e
```
