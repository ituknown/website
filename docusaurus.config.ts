import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

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
    url: 'https://ituknown.org',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'ituknown', // Usually your GitHub org/user name.
    projectName: 'website', // Usually your repo name.

    onBrokenLinks: 'throw',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'zh',
        locales: ['zh'],
    },

    presets: [
        [
            'classic',
            {
                docs: false, // 禁用默认文档插件(默认文档插件id=default)
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ['rss', 'atom'],
                        xslt: true,
                    },
                    // Useful options to enforce blogging best practices
                    onInlineTags: 'warn',
                    onInlineAuthors: 'warn',
                    onUntruncatedBlogPosts: 'warn',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    // 使用 plugins 数组来添加新的 docs 插件实例
    plugins: [
        // FFmpeg 文档实例
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'ffmpeg', // 插件ID
                path: 'ffmpeg', // 项目 ffmpeg 目录
                routeBasePath: 'ffmpeg', // 访问路径，例如: 域名/ffmpeg
                sidebarPath: './sidebars_ffmpeg.ts', // 目录解析
                showLastUpdateTime: true, // 最近更新时间
            }
        ],
        // Linux 文档实例
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'linux',
                path: 'linux', // 项目 linux 目录
                routeBasePath: 'linux', // 访问路径，例如: 域名/linux
                sidebarPath: './sidebars_linux.ts', // 目录解析
                showLastUpdateTime: true, // 最近更新时间
            }
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        colorMode: {
            defaultMode: 'light',             // 默认主题 light/dark
            respectPrefersColorScheme: false, // 优先使用系统主题(会覆盖 defaultMode)
            disableSwitch: false,             // 是否禁用切换按钮
        },
        navbar: {
            title: '文件夹',
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
                    label: 'FFmpeg',
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'linux', // 侧边栏ID
                    docsPluginId: 'linux', // 插件ID
                    position: 'left',
                    label: 'Linux 基础',
                },
                { to: '/blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://github.com/ituknown/website-docusaurus',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        docs: {
            sidebar: {
                hideable: true, // 左侧栏可收起
                autoCollapseCategories: false, // 自动折叠非当前分类
            },
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
