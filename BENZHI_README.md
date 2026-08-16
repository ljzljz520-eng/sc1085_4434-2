# Arena Emblem // 电竞战队队标亮相

这是一个单一 Go module 的电竞战队队标亮相页。服务使用固定内存 fixture，不需要数据库、外部网络或随机数据；页面由 Go 嵌入 `web/` 源资源后直接提供。

## Run

需要 Go 1.23.12 或兼容的更新版本：

```bash
CGO_ENABLED=0 go run ./cmd/server -addr :8080
```

打开 <http://localhost:8080>。页面支持战队切换、编辑明细、即时预览和保存；拖动画布旋转队标，按空格触发破碎重组，方向键调整自转方向与速度。

## Business API

- `GET /api/showcases` 返回三支固定战队的可编辑明细。
- `PUT /api/showcases/{id}` 保存队名、代号、赛季、口号、简介和两种颜色。
- `GET /api/health` 返回确定性的服务状态。

业务链路测试从模块根目录运行：

```bash
CGO_ENABLED=0 go test -count=1 ./...
```

当前项目保留一个用于验收缺陷的回归场景：修改首次读取结果后再次查询，测试会稳定报告内部明细被改变。该失败是本题要求注入的初始状态。

## Frontend

Node.js 20 构建前端：

```bash
cd web
npm ci
npm run build
```

构建产物只用于前端验收，不提交到源树；Go 服务运行时直接提供嵌入的源资源。
