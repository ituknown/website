---
slug: YAML-语法
title: YAML 语法
date: 2022-06-18T17:37
tags: [YAML]
---

## 前言

本文档旨在作为一个简短的 YAML 教程，足以让你开始使用YAML语言。

YAML是一种基于缩进的标记语言，其目标是既易于阅读又易于编写。许多项目使用它是因为它的可读性、简单性以及对许多编程语言的良好支持。

YAML 示例：

```yaml
execution:
- concurrency: 10
  hold-for: 5m
  ramp-up: 2m
  scenario: yaml_example

scenarios:
  yaml_example:
    retrieve-resources: false
    requests:
      - http://example.com/

reporting:
- module: final-stats
- module: console

settings:
  check-interval: 5s
  default-executor: jmeter

provisioning: local
```

:::info[注意]
冒号后面必须有空格。
:::

从示例中可以看到，YAML使用缩进来表示文档结构（与JSON相反，JSON使用括号和大括号）。除此之外，JSON 和 YAML 非常相似。下面是将上面 YAML 转换为 JSON 后的数据：

```json
{
  "execution": [
    {
      "concurrency": 10,
      "hold-for": "5m",
      "ramp-up": "2m",
      "scenario": "json_example"
    }
  ],
  "scenarios": {
    "json_example": {
      "retrieve-resources": false,
      "requests": [
        "http://example.com/"
      ]
    }
  },
  "reporting": [
    {
      "module": "final-stats"
    },
    {
      "module": "console"
    }
  ],
  "settings": {
    "check-interval": "5s",
    "default-executor": "jmeter"
  },
  "provisioning": "local"
}
```

## 普通值：数字、字符串、布尔值

```yaml
number-value: 42
floating-point-value: 3.141592
boolean-value: true
## strings can be both 'single-quoted` and "double-quoted"
string-value: 'Bonjour'
```

对应的 JSON 数据：

```json
{
  "number-value": 42,
  "floating-point-value": 3.141592,
  "boolean-value": true,
  "string-value": "Bonjour"
}
```

出于方便的原因，YAML语法还允许不带引号的字符串值：

```yaml
unquoted-string: Hello World
```

对应的 JSON 数据：

```json
{
  "unquoted-string": "Hello World"
}
```

## 集合和字典

集合中的每个元素都必须缩进，并以 `-` 和空格开头：

```yaml
jedis:
  - Yoda
  - Qui-Gon Jinn
  - Obi-Wan Kenobi
  - Luke Skywalker
```

对应的 JSON 数据：

```json
{
  "jedis": [
    "Yoda",
    "Qui-Gon Jinn",
    "Obi-Wan Kenobi",
    "Luke Skywalker"
  ]
}
```

字典是键值映射的集合，所有 key 都区分大小写：

```yaml
jedi:
  name: Obi-Wan Kenobi
  home-planet: Stewjon
  species: human
  master: Qui-Gon Jinn
  height: 1.82m
```

对应的 JSON 数据：

```json
{
  "jedi": {
    "name": "Obi-Wan Kenobi",
    "home-planet": "Stewjon",
    "species": "human",
    "master": "Qui-Gon Jinn",
    "height": "1.82m"
  }
}
```

另外，字典和集合可以互相嵌套，反之亦然：

```yaml
requests:
  # first item of `requests` list is just a string
  - http://example.com/

  # second item of `requests` list is a dictionary
  - url: http://example.com/
    method: GET
```

对应的 JSON 数据：

```json
{
  "requests": [
    "http:\/\/example.com\/",
    {
      "url": "http:\/\/example.com\/",
      "method": "GET"
    }
  ]
}
```

如果需要，还可以对列表和字典使用内联语法：

```yaml
episodes: [1, 2, 3, 4, 5, 6, 7]
best-jedi: {name: Obi-Wan, side: light}
```

```json
{
  "episodes": [
    1,
    2,
    3,
    4,
    5,
    6,
    7
  ],
  "best-jedi": {
    "name": "Obi-Wan",
    "side": "light"
  }
}
```