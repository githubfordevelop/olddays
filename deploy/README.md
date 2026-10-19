# GitHub → Linux 服务器

目标仓库为 githubfordevelop/olddays；当前采用本文末尾的公开 CI 拉取模式。前半部分保留支持 SSH、rsync、Nginx 的 Linux 服务器推送模式说明。不包含数据库、付费服务或自动修改服务器配置。

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

公开仓库 githubfordevelop/olddays；服务器 121.40.22.96；部署用户 olddays；目录 /srv/olddays。域名和 HTTPS 证书待用户选定。实际运行结果应以 GitHub Actions、服务器日志和 version.json 为准。

## 当前服务器采用的公开 CI 拉取模式

由于仓库公开，服务器可以通过 GitHub 公共 API 检查 main 分支的 `Check and deploy` 工作流是否成功，然后只下载该提交的 `dist/` 文件。这个模式不需要把维护私钥保存到 GitHub，也不需要为部署授予 GitHub 账号额外权限。

- 服务器：121.40.22.96，部署用户 olddays，根目录 `/srv/olddays`。
- `olddays-sync.timer` 约每两分钟触发一次；`olddays-sync.service` 以非 root 用户运行。
- 同步器只接受当前仓库、main 分支、push 事件、结论为 success 的 CI 提交；不执行下载仓库中的任何脚本。
- 只解包 `dist/` 的普通文件，拒绝路径穿越、软链接和超限负载。
- 新版本先写入独立目录，再切换 current；后续发布的本机 HTTP 健康检查不通过时，恢复旧软链接。
- GitHub 不可达、公共 API 限流或检查失败时，保留旧站，等下一次检查。
- `version.json` 公开当前提交及对应 CI 记录，方便核验。

安装文件来自本目录。首次切换站点前需先发布一个通过 CI 的版本，再更新 Nginx 并验证 HTTP；首次发布没有可回滚的旧 current，需人工完成首次 HTTP 核验。维护用 SSH 私钥保存在维护设备上，勿上传源码或聊天。

SSH 推送模式仍可选：配置前文的变量和 Secrets 后启用 workflow 的 SSH 部署任务。**不要同时启用两种发布模式**；切换为 SSH 推送时先停用 `olddays-sync.timer`。
