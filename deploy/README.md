# GitHub → Linux 服务器

流程已经提供；尚未关联真实 GitHub 仓库或登录服务器。默认以支持 SSH、rsync、Nginx 的 Linux 服务器为目标。不包含数据库、付费服务或自动修改服务器配置。

## 仓库配置

在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置：

| 类型 | 名称 | 示例 / 用途 |
|---|---|---|
| Variable | DEPLOY_HOST | 服务器 IPv4 或主机名 |
| Variable | DEPLOY_USER | 专用 SSH 部署用户，例如 deploy |
| Variable | DEPLOY_PORT | SSH 端口，省略为 22 |
| Variable | DEPLOY_ROOT | 例如 /var/www/archaeo |
| Secret | DEPLOY_SSH_KEY | 仅对部署目录有写权限的专用 SSH 私钥 |
| Secret | DEPLOY_KNOWN_HOSTS | 通过可信渠道核验的服务器 SSH 主机公钥记录 |

密钥只填 GitHub Secrets，不放进源码，也不需要发到聊天里。非默认 SSH 端口的 known_hosts 记录通常使用 `[host]:port` 格式。

创建 `production` Environment；如需审批，可在 GitHub 自行配置环境保护。`DEPLOY_HOST` 未设置时，只执行检查，部署任务跳过。

## 服务器准备

由有权限的管理员安装 Nginx、rsync，创建部署目录并授权给部署用户。将 `nginx.conf.example` 改为真实域名、根目录，配置 HTTPS。Nginx 应读取 `DEPLOY_ROOT/current`，其中 `current` 为发布脚本管理的软链接，不要预先创建成普通目录。

目录结构：

```
/var/www/archaeo/
  releases/<commit SHA>/  # 每个版本独立目录
  current -> releases/<commit SHA>/
```

## 触发与回滚

推送 `main` 自动运行；PR 只检查。也可在 Actions 手动触发 main 分支。脚本先上传独立版本，检查主要文件，然后原子切换 `current`；上传失败时不切换。保留旧版本，不自动删除。

回滚时选择已有的旧 SHA，在服务器上新建临时软链接，再通过 `mv -Tf` 切换到 `current`。请使用已验证的版本目录。切换之后的 HTTP 检查与域名、HTTPS 配置应在服务器确定后接入；当前流程没有上线后自动健康检查或自动回滚。

## 尚待确定

GitHub 所属账号与仓库、是否公开、服务器地址与部署用户、域名、部署目录。真实连接前，工作流只能做语法和本地结构检查，不能声称已完成服务器发布验证。
