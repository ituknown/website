import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    java: [
        'Java 内省机制',
        'i18n 国际化实现',
        'Bean Validation',
        'Caffeine 高性能本地缓存',
        'HTTP 客户端 OkHttp',
        'Maven 配置',
        'MyBatis 自定义 TypeHandler',
        'Tomcat 源码构建',
        {
            type: 'category',
            label: 'Java8 日期',
            collapsed: true, // 默认折叠
            items: [
                'Java8 日期/java.time 正确使用姿势',
                'Java8 日期/Duration 和 Period 的区别',
            ],
        },
        {
            type: 'category',
            label: 'Jackson 实战',
            collapsed: true, // 默认折叠
            items: [
                'Jackson 实战/关于 Jackson',
                'Jackson 实战/JSON 反序列化',
                'Jackson 实战/JSON 序列化',
                'Jackson 实战/字段驼峰转换',
                'Jackson 实战/时区问题',
                'Jackson 实战/java.time 日期格式问题',
                'Jackson 实战/序列化时自定义 NULL 输出',
                'Jackson 实战/枚举类序列化与反序列化',
            ],
        },
    ],
};

export default sidebars;
