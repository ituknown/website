---
slug: SSH Key 和 SSL Key 区别
title: SSH Key 和 SSL Key 区别
date: 2023-01-23T15:01
tags: [算法]
---

`SSH key` 和通过 `OpenSSL` 生成的 `SSL key` 尽管都基于公钥加密技术，但是是两种不同用途的密钥。以下是它们的主要区别和用途：

<!-- truncate -->

## SSH Key

**用途：**

用于通过 `SSH（Secure Shell）` 协议进行身份验证和安全通信。

**协议：**

基于 `SSH` 协议。

**典型场景：**

1. 登录远程服务器时用于身份验证（无密码登录）。
2. Git 代码托管平台（如 GitHub、GitLab）上的身份验证。

**格式：**

1. 常见的 SSH 密钥格式是 `PEM`，使用工具如 `ssh-keygen` 生成。
2. 公钥通常保存在 `~/.ssh/id_rsa.pub` 文件中，私钥保存在 `~/.ssh/id_rsa` 文件中。

**加密算法：**

常用算法包括 `RSA`、`ECDSA`、`Ed25519` 等。

## SSL Key

**用途：**

用于支持 `TLS/SSL（Transport Layer Security / Secure Sockets Layer）` 协议，保护网络通信的安全性。

**协议：**

基于 `TLS/SSL` 协议。

**典型场景：**

1. 为网站配置 HTTPS。
2. 在 Web 服务器（如 Apache、Nginx）中用于加密通信。
3. 生成服务器证书或客户端证书。

**格式：**

1. 生成的密钥文件通常以 `.key` 或 `.pem` 结尾。
2. 生成后，SSL 密钥常配合证书（如 `.crt` 或 `.pem` 文件）使用。

**加密算法：**

1. 支持 `RSA`、`ECDSA`、`Ed25519` 等。
2. 使用工具如 `OpenSSL` 生成私钥：

```bash
openssl genrsa -out server.key 2048
```

3. 配合生成证书签名请求（CSR）和证书文件：

```bash
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

## 核心区别

| **属性**    | **SSH Key**                    | **SSL Key**    |
| --------- | ------------------------------ | -------------- |
| **主要用途**  | 身份验证、远程登录                      | 安全通信、数据加密      |
| **协议**    | SSH                            | TLS/SSL        |
| **生成工具**  | ssh-keygen                     | OpenSSL        |
| **文件扩展名** | `.pub` (公钥), 无扩展名或 `.pem` (私钥) | `.key`, `.pem` |
| **加密目标**  | 用户身份、访问权限验证                    | 加密传输数据、保护通信    |

## 总结

1. 如果你要通过 SSH 远程连接服务器，请使用 `SSH Key`。
2. 如果你要为网站配置 HTTPS，请使用 `SSL Key`。