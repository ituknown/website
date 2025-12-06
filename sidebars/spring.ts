import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    spring: [
        '@Import 的三种使用方式',
        'Spring 事件与异步监听器',
        '容器初始化流程源码解析',
        '依赖注入',
        '依赖注入与注入模式',
        'Spring 如何判断事务是否生效',
        'Spring 强制使用 cglib 的好处',
        '单例 Bean 中注入原型 Bean',
        'Aware 容器感知化技术',
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
