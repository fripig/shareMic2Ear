# 將現有 shareMic2Ear 實作整理為正式規格

## Why

shareMic2Ear 已經實作完成並部署到 GitHub Pages，但所有行為只存在於單一 `index.html`
與 commit 訊息裡。這些行為有相當比例是為了繞過瀏覽器與藍牙協定的硬限制而做的取捨
（關閉 `autoGainControl`、三層輸出降級、壓縮器旁通切換），一旦沒有寫成規格，
後續修改很容易在不知情的狀況下把這些取捨改掉。

本 change 不新增功能，目的是把**已上線的行為**轉成可驗證的規格，作為後續變更的基準線。

## What Changes

- 將現有實作拆解為五個能力，各自建立 spec
- 每條需求都附帶可驗證的情境，對應實際可觀察的行為
- 把「為什麼這樣做」的技術決策（含被否決的替代方案）寫進 design.md
- 補上 `openspec/config.yaml` 的 `context`，讓後續產出的 artifact 知道專案的技術背景

**不含任何程式碼變更。** 規格描述的是 commit `341f056` 已部署的狀態。

## Capabilities

### New Capabilities

- `audio-device-discovery` — 麥克風權限流程、裝置列舉、藍牙裝置推測標示、熱插拔處理
- `microphone-mixing` — 多支麥克風同時收音混成單一輸出、監聽中動態增減、單支失敗隔離
- `gain-staging` — 個別與總音量、靜音、指數漸變、動態壓縮增強
- `output-routing` — 輸出裝置選擇與三層能力降級、依平台說明無法選擇的原因
- `level-metering` — 個別與混音電平表、執行統計、低電平偵測與建議、診斷面板

### Modified Capabilities

無（`openspec/specs/` 目前是空的）。

## Impact

- **程式碼**：無變更
- **文件**：新增 `openspec/specs/` 下五份規格；`openspec/config.yaml` 補上 `context`
- **相依**：無
- **基準 commit**：`341f056`（線上版本 https://fripig.github.io/shareMic2Ear/ ）

## Non-goals

- 不處理已知但無法在網頁層解決的限制（藍牙配對、HFP 音質降級、行動裝置輸出路由）
- 不定義自動化測試策略；現有驗證是 Node 層的邏輯測試加人工聽測
