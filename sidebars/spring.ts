import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    spring: [
        '@Import 的三种使用方式',
        'Spring 事件与异步监听器',
        '容器初始化流程源码解析',
        {
            type: 'category',
            label: 'SpringBoot',
            items: [
                'SpringBoot/自定义 Configuration Properties',
                'SpringBoot/自动装配的四种模式',
            ],
        },
    ],
};

export default sidebars;
