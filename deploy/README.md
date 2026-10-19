# 私有 GitHub 仓库 → Linux 服务器

项目：githubfordevelop/olddays（private）。服务器：121.40.22.96；部署用户 olddays；根目录 /srv/olddays；Nginx 指向 /srv/olddays/current。

## GitHub Actions

检查任务在 PR、main 推送和手动运行时执行。部署任务依赖检查成功，只接受 main 非 PR 事件，使用 production 环境。

| 类型 | 名称 | 配置 |
|---|---|---|
| Variable | DEPLOY_HOST | 121.40.22.96 |
| Variable | DEPLOY_USER | olddays |
| Variable | DEPLOY_PORT | 22 |
| Variable | DEPLOY_ROOT | /srv/olddays |
| Secret | DEPLOY_SSH_KEY | 项目专用 SSH 私钥；不写入源码 |
| Secret | DEPLOY_KNOWN_HOSTS | 已核验服务器主机公钥记录 |

发布脚本再次检查本地资源，然后 rsync 至 releases/<完整提交>，原子切换 current，核验本机 HTTP 与 version.json。健康检查失败时尝试恢复旧链接。首次部署没有旧链接可回滚，需核验公网 HTTP。

部署用户没有 root 权限。GitHub runner 临时密钥文件会在任务结束删除。仓库协作者能够修改 main 工作流，因此私钥仅授予这个项目所需的部署账号权限。

## 旧模式

之前的 olddays-sync.timer 使用 GitHub 公共 API 和匿名 codeload。仓库私有后无法继续更新，切换 SSH 推送后应停用，避免两种模式竞争 current。安装器与拉取同步器保留为历史维护代码，不是当前私有仓库推荐发布方式。

## 核验与回滚

公网 http://121.40.22.96/version.json 显示当前提交与部署时间。回滚到 releases/ 中上一份完整静态版本后，仍需检查公网入口。不要将整个仓库用作 Web 根目录。

目前访问入口为 HTTP。绑定域名及 HTTPS 需要另行确定域名与证书；本流程不购买服务、不修改云账号权限。
