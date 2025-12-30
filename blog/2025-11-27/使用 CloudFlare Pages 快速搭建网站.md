---
slug: 使用-CloudFlare-Pages-快速搭建网站
title: 使用 CloudFlare Pages 快速搭建网站
date: 2025-11-27T13:28
tags: [CloudFlare, Node.js]
-- authors: [magicianlib]
---

## 前言

对于个人用户来说，建站最快方式就是使用赛博菩萨（[CloudFlare](https://cloudflare.com/)）提供的 [Pages](https://pages.cloudflare.com/)，只需要在界面简单点几下，就能快速的部署一个静态网站，而且每天提供 10W 次免费请求额度，对个人用户真就是“白嫖”。

加上其强大的 DNS，在全球任意一个地方基本上都能实现毫秒级访问。另外如果你有自己的专属域名，配合 [CloudFlare Pages](https://pages.cloudflare.com/) 简直不要太爽。

<!-- truncate -->

对于 IT 开发者来说，CloudFlare Pages 最常用的方式是搭建博客、知识文档一类的站点。接下来就以 [Docusaurus](https://docusaurus.io/) 为例，从头到尾的快速演示如何使用 CloudFlare Pages 搭建自己的知识网站。

:::info[小提示]

[VitePress](https://vitepress.dev/)、[Docusaurus](https://docusaurus.io/) 和 [HUGO](https://gohugo.com.cn/) 都是主流的静态站点生成器，也都特别适合文档、博客类网站使用。可根据自己的喜好自行选择，这里我以 [Docusaurus](https://docusaurus.io/) 为例做说明，其他静态站点生成器也是同样操作步骤。

:::

## 创建 docusaurus 文档

首先我假设你已经安装过 [Node.js](https://nodejs.org/)，知道如何使用 npm 和 yarn。下面是我的 Node.js 信息：

```bash
$ node -v
v24.11.1

$ npm -v
11.6.2

$ yarn -v
1.22.22
```

:::info[小提示]

yarn 和 npm 都是包管理工具，在使用体验没有任何区别。npm 是 Node.js 内置的包管理工具，无需额外安装。

虽然 Node.js 没有内置 yarn，但如果你想使用 yarn 也很简单，也不需要额外安装。只需要使用 Node.js 内置的 corepack 简单的执行两个命令就完事了：

```bash
# 启用 yarn
$ corepack enable yarn

# 验证(实际是自动帮你下载安装)
$ yarn -v
```

:::

首先使用 docusaurus 脚手架创建一个项目，命令如下：

```bash
npx create-docusaurus@latest website classic --typescript
```

其中 `website` 是创建的项目名，可以随意指定。 `--typescript` 指定项目使用 typescript，如果不指定的话默认使用 javascript，这个随意即可。

命令执行完成后，你会得到类似如下的项目结构：

```bash
.
├── README.md
├── blog
├── docs
├── node_modules
├── docusaurus.config.ts
├── package-lock.json
├── package.json
├── sidebars.ts
├── src
├── static
└── tsconfig.json
```

运行 `npm run start` 等待编译完成，在浏览器中打开 [http://localhost:3000/](http://localhost:3000/) 你会看到如下界面：

![step_0_create_docusaurus](https://media.ituknown.org/blog-media/CloudFlarePages/step_0_create_docusaurus.png)

现在一个简单的静态文档就生成好了~

接下来，关闭终端重新输入 `npm run build` 。等编译完成，就会发现项目根目录多了一个 build 文件夹，这个文件夹中的内容就是静态站点的全部信息，也是部署静态站点的内容。

之后将该项目上传到 [Github](https://github.com/) 或 [GitLab](https://gitlab.com)，就可以到 [CloudFlare Pages](https://pages.cloudflare.com/) 部署静态站点了。

## CloudFlare Pages 部署静态站点

进入 CloudFlare Pages，你会看到如下界面：

![step_1_choose_pages](https://media.ituknown.org/blog-media/CloudFlarePages/step_1_choose_pages.png)

不要直接点击右侧的 **Create application** 按钮，该功能创建的是 Workers，并不是我们部署静态站点使用的 Pages。正确的姿势是依此点击 **Add** » **Pages**，接下来就会进入下图这个界面：

![step_2_import_git](https://media.ituknown.org/blog-media/CloudFlarePages/step_2_import_git.png)

此时有两个选择，直接上传静态文档或者从 Git 导入构建。如果你想直接上传，只需要将前面生成的 build 文件夹上传即可。不过这种每次做修改时都需要手动执行一次上传，简直不要太麻烦。

我们需要的效果是，每次 Git 分支有新的提交就自动触发构建。所以，这里应该选择第一种 **Import an existing Git repository**。

接下来就需要关联自己的 Github 或 GitLab，根据自己上传的平台关联即可，关联成功后选择刚上传的项目：

![step_3_select_repository](https://media.ituknown.org/blog-media/CloudFlarePages/step_3_select_repository.png)

继续下一步，开始设置 Pages 项目名和要构建的分支。项目名随意即可，分支的话推荐使用主分支：

![step_4_1_project_name](https://media.ituknown.org/blog-media/CloudFlarePages/step_4_1_project_name.png)

继续向下，开始设置项目框架和构建命令（如下图）。CloudFlare 已经内置了所有主流的静态网站框架，你能想到的这里都有。我使用的是 [Docusaurus](https://docusaurus.io/) 所以我就选择该框架：

![step_4_2_build_command](https://media.ituknown.org/blog-media/CloudFlarePages/step_4_2_build_command.png)

构建命令使用 `npm run build` 或 `yarn run build` ，实际上 CloudFlare Pages 已经根据项目框架自动帮你填充了。输出目录就指定 build 即可，这是 Node.js 默认的输出目录。

另外，最后别忘记设置一下 Node.js 的 Version 环境变量。CloudFlare Pages 默认使用的版本可能与你项目不一致，为了防止潜在的问题，建议设置下你构建项目时使用的版本。

所有设置都填写完成后，就可以点击保存部署了：

![step_5_deploy_log](https://media.ituknown.org/blog-media/CloudFlarePages/step_5_deploy_log.png)

从构建日志中就可以看到使用了我们环境变量中配置的 Node.js 版本，构建完成后也就表示部署完成了。现在你就可以使用 CloudFlare 为你提供的域名访问你的静态站点了。

如果你有自己的域名，并想为该 Pages 设置自己的域名，可以继续点击下方的 **Add custom domain**：

![step_6_add_custom_domain](https://media.ituknown.org/blog-media/CloudFlarePages/step_6_add_custom_domain.png)

直接点击 **Set up a custom domain**：

![step_7_set_up_a_custom_domain](https://media.ituknown.org/blog-media/CloudFlarePages/step_7_set_up_a_custom_domain.png)

接下来就可以填写自己的域名了：

![step_8_input_custom_domain](https://media.ituknown.org/blog-media/CloudFlarePages/step_8_input_custom_domain.png)

:::info[小提示]

自定义域名可以是任意的，不一定非要设置一级域名，如果你的一级域名已经被占用设置二级域名也是可以正常访问的。比如我这里设置的是二级域名 `example.ituknown.org` 。

:::

域名填写完成后还有一个激活步骤，点击激活即可：

![step_9_activate_domain](https://media.ituknown.org/blog-media/CloudFlarePages/step_9_activate_domain.png)

<details open>
<summary>域名验证？</summary>

当自定义域名初始化完成之后，会进入 Verifying 阶段。如果你的域名是在 CloudFlare 上注册的（或已迁移到 CloudFlare），到这一步什么都不需要操作，CloudFlare 会自定执行验证。

但如果你的自定义域名还未迁移到 CloudFlare，此时需要按照下面的提示进入到你的域名服务商平台的管理页面，在域名 DNS 解析中添加一条 CNAME 记录。填写完成之后点击 **Check DNS Records**，如果信息无误，就完成激活验证了。

![step_10_domain_verifying](https://media.ituknown.org/blog-media/CloudFlarePages/step_10_domain_verifying.png)

</details>

当激活成功之后就可以使用你的自定义域名访问网站了🎉🎉🎉🎉：

![step_11_domain_activated](https://media.ituknown.org/blog-media/CloudFlarePages/step_11_domain_activated.png)

接下来你提交到 Github 的任意变更都会触发 Pages 的自动构建，真是一劳永逸~
