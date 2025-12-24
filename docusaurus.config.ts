import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: '笔记本',
    // tagline: 'This\'s a Knowledge Base',
    favicon: 'img/favicon.ico',

    headTags: [
        {
            tagName: 'meta',
            attributes: {
                name: 'algolia-site-verification',
                content: '2DEE65D225182147',
            },
        },
    ],

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: 'https://ituknown.org',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',
    trailingSlash: true, // 这里要配置尾斜杠, 否则 algolia 爬虫会失败

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
                    blogSidebarTitle: 'Recent posts', // 侧边栏标题
                    blogSidebarCount: 'ALL', // 侧边栏显示 Blog 数量
                    showReadingTime: true, // 显示阅读时间
                    remarkPlugins: [remarkMath], // 启用 katex
                    rehypePlugins: [rehypeKatex], // 启用 katex
                    onInlineTags: 'throw', // 内联不存在的 TAG 直接抛出异常
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
                showLastUpdateTime: false, // 最近更新时间
                remarkPlugins: [remarkMath], // 启用 katex
                rehypePlugins: [rehypeKatex], // 启用 katex
            },
        ], [
            // Linux 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'linux',
                path: 'docs/system/linux',
                routeBasePath: 'system/linux',
                sidebarPath: './sidebars/system/linux.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Windows 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'windows',
                path: 'docs/system/windows',
                routeBasePath: 'system/windows',
                sidebarPath: './sidebars/system/windows.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Java 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'java',
                path: 'docs/jvm/java',
                routeBasePath: 'jvm/java',
                sidebarPath: './sidebars/jvm/java.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Spring 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'spring',
                path: 'docs/jvm/spring',
                routeBasePath: 'jvm/spring',
                sidebarPath: './sidebars/jvm/spring.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Kafka 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'kafka',
                path: 'docs/jvm/kafka',
                routeBasePath: 'jvm/kafka',
                sidebarPath: './sidebars/jvm/kafka.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Database 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'database',
                path: 'docs/database',
                routeBasePath: 'database',
                sidebarPath: './sidebars/database.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Git 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'git',
                path: 'docs/programmer/git',
                routeBasePath: 'programmer/git',
                sidebarPath: './sidebars/programmer/git.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Protocol 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'protocol',
                path: 'docs/programmer/protocol',
                routeBasePath: 'programmer/protocol',
                sidebarPath: './sidebars/programmer/protocol.ts',
                showLastUpdateTime: false,
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
            },
        ], [
            // Rust 文档实例
            '@docusaurus/plugin-content-docs',
            {
                id: 'rust',
                path: 'docs/programmer/rust',
                routeBasePath: 'programmer/rust',
                sidebarPath: './sidebars/programmer/rust.ts',
                showLastUpdateTime: false,
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
            appId: 'S2Q2TJV9SH',
            apiKey: 'fc9d428f8815ca5b5b860b70f05d31de',
            indexName: 'ituknown_org', // algolia 爬虫名称
            contextualSearch: false, // 这里不能改
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
            // title: 'NoteBook',
            hideOnScroll: false, // 滚动时隐藏 Top 导航
            logo: {
                alt: 'Logo',
                src: 'img/favicon.ico',
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'ffmpeg',
                    docsPluginId: 'ffmpeg',
                    position: 'left',
                    label: 'FFmpeg 命令行',
                }, {
                    type: 'dropdown',
                    label: '🖥️操作系统',
                    position: 'left',
                    items: [
                        {
                            type: 'docSidebar',
                            sidebarId: 'linux',
                            docsPluginId: 'linux',
                            label: 'Linux',
                        }, {
                            type: 'docSidebar',
                            sidebarId: 'windows',
                            docsPluginId: 'windows',
                            label: 'Windows',
                        },
                    ],
                }, {
                    type: 'dropdown',
                    label: 'JVM 生态',
                    position: 'left',
                    items: [
                        {
                            type: 'docSidebar',
                            sidebarId: 'java',
                            docsPluginId: 'java',
                            label: 'Java 笔记',
                        }, {
                            type: 'docSidebar',
                            sidebarId: 'spring',
                            docsPluginId: 'spring',
                            label: 'Spring',
                        }, {
                            type: 'docSidebar',
                            sidebarId: 'kafka',
                            docsPluginId: 'kafka',
                            label: 'Kafka',
                        },
                    ],
                }, {
                    type: 'docSidebar',
                    sidebarId: 'database',
                    docsPluginId: 'database',
                    label: '📀数据库',
                }, {
                    type: 'dropdown',
                    label: '🛠编程',
                    position: 'left',
                    items: [
                        {
                            type: 'docSidebar',
                            sidebarId: 'git',
                            docsPluginId: 'git',
                            label: '💫 Git',
                        }, {
                            type: 'docSidebar',
                            sidebarId: 'protocol',
                            docsPluginId: 'protocol',
                            label: '🌍 Protocol',
                        }, {
                            type: 'docSidebar',
                            sidebarId: 'rust',
                            docsPluginId: 'rust',
                            label: '🦀 Rust',
                        }
                    ],
                },

                {
                    to: '/blog',
                    label: '📝博客',
                    position: 'left'
                },

                // 语言本地化
                {
                    type: 'localeDropdown',
                    position: 'right',
                },

                // {
                //     href: 'https://github.com/ituknown',
                //     label: 'GitHub',
                //     position: 'right',
                // },
            ],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
