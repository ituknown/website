import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: '文件夹',
    tagline: 'This\'s a Knowledge Base',
    favicon: 'img/favicon.ico',

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: 'https://ituknown.org/',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    // organizationName: 'ituknown', // Usually your GitHub org/user name.
    // projectName: 'website', // Usually your repo name.

    // 引用链接不存在, 直接报错
    onBrokenLinks: 'throw',

    i18n: {
        defaultLocale: 'zh',
        locales: ['zh'],
    },

    themes: ['@docusaurus/theme-mermaid'],

    markdown: {
        format: 'mdx',
        mermaid: true,
        emoji: false,
        anchors: {
            maintainCase: true,
        },
        hooks: {
            // 引用链接不存在, 直接报错
            onBrokenMarkdownLinks: 'throw',
            onBrokenMarkdownImages: 'throw',
        },
    },

    presets: [
        [
            'classic',
            {
                docs: false, // 禁用默认文档插件(默认文档插件id=default)
                blog: {
                    showReadingTime: true,
                    onInlineTags: 'throw', // 内联不存在的TAG 直接抛出异常
                    onInlineAuthors: 'throw', // 内联不存在的作者 直接抛出异常
                    onUntruncatedBlogPosts: 'throw', // 如果文档没设置 <!-- truncate --> 直接抛出异常
                },
                sitemap: {
                    changefreq: 'weekly', // 页面更改频率
                    priority: 0.5,        // 默认优先级
                    filename: 'sitemap.xml', // 生成的文件名
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    // 启用 Katex
    // https://docusaurus.io/docs/markdown-features/math-equations
    stylesheets: [
        {
            // Katex 样式
            // https://katex.org/docs/browser
            href: 'https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css',
            type: 'text/css',
            integrity: 'sha384-WcoG4HRXMzYzfCgiyfrySxx90XSl2rxY5mnVY5TwtWE6KLrArNKn0T/mOgNL0Mmi',
            crossorigin: 'anonymous',
        },
    ],

    // 自定义文档插件实例
    plugins: [
        [
            // FFmpeg 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'ffmpeg', // 插件ID
                path: 'docs/ffmpeg', // 文档所在目录
                routeBasePath: 'ffmpeg', // URL路由，例如: 域名/ffmpeg
                sidebarPath: './sidebars/ffmpeg.ts', // 侧边栏目录解析
                showLastUpdateTime: true, // 最近更新时间
                remarkPlugins: [remarkMath], // 启用 katex
                rehypePlugins: [rehypeKatex], // 启用 katex
            },
        ],
        [
            // Linux 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'linux',
                path: 'docs/linux',
                routeBasePath: 'linux',
                sidebarPath: './sidebars/linux.ts',
                showLastUpdateTime: true,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ],
        [
            // Java 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'java',
                path: 'docs/java',
                routeBasePath: 'java',
                sidebarPath: './sidebars/java.ts',
                showLastUpdateTime: true,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ],
        [
            // Spring 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'spring',
                path: 'docs/spring',
                routeBasePath: 'spring',
                sidebarPath: './sidebars/spring.ts',
                showLastUpdateTime: true,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        colorMode: {
            defaultMode: 'light', // 默认主题 light/dark
            respectPrefersColorScheme: false, // 优先使用系统主题(会覆盖 defaultMode)
            disableSwitch: false, // 是否禁用切换按钮
        },
        tableOfContents: {
            minHeadingLevel: 2,
            maxHeadingLevel: 6,
        },
        docs: {
            sidebar: {
                hideable: true, // 左侧栏可收起
                autoCollapseCategories: false, // 自动折叠非当前分类
            },
        },
        blog: {
            sidebar: {
                groupByYear: true, // 根据年分组
            },
        },
        algolia: {
            appId: 'A0CR00AVKM',
            apiKey: 'cd59993bf74e7981f6f3e33fb5916c51',
            indexName: 'Docusaurus Website',

            // Optional: see doc section below
            contextualSearch: true,

            // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
            // externalUrlRegex: 'external\\.com|domain\\.com',

            // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
            replaceSearchResultPathname: {
                from: '/docs/', // or as RegExp: /\/docs\//
                to: '/',
            },

            // Optional: whether you want to use the new Ask AI feature (undefined by default)
            // askAi: 'YOUR_ALGOLIA_ASK_AI_ASSISTANT_ID',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.oneDark,
            additionalLanguages: [ // 代码语法高亮
                'bash',
                'c',
                'cpp',
                'dart',
                'docker',
                'go',
                'git',
                'java',
                'powershell',
                'rust',
                'sql',
                "vim",
                'yaml',
                'zig',
            ],
        },
        navbar: {
            title: '文件夹',
            hideOnScroll: true, // 滚动时隐藏 Top 导航
            logo: {
                alt: 'Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'ffmpeg',
                    docsPluginId: 'ffmpeg',
                    position: 'left',
                    label: 'FFmpeg 命令行',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'linux',
                    docsPluginId: 'linux',
                    position: 'left',
                    label: 'Linux',
                },
                {
                    type: 'dropdown',
                    label: 'JVM',
                    position: 'left',
                    items: [
                        {
                            type: 'docSidebar',
                            sidebarId: 'java',
                            docsPluginId: 'java',
                            label: 'Java 知识笔记',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'spring',
                            docsPluginId: 'spring',
                            label: 'Spring 系列',
                        },
                    ],
                },
                {
                    to: '/blog',
                    label: 'Blog',
                    position: 'left'
                },

                // 语言本地化
                {
                    type: 'localeDropdown',
                    position: 'right',
                },
                {
                    href: 'https://github.com/ituknown/',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
