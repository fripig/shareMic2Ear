# pwa-installability Specification

## Purpose

定義本頁作為 Progressive Web App 的安裝、離線與更新行為。
這個工具的使用情境（接上耳機、開頁面、監聽）每次都要打一次網址很煩，
所以要能安裝到主畫面；而它本身不需要伺服器，因此離線也應該可用。

更新是這裡最需要小心的一環：重新載入必然切斷正在進行的監聽，
因此更新一律是提示，決定權留給使用者。

## Requirements

### Requirement: 可安裝為獨立 App
系統 SHALL 提供 Web App Manifest 與 Service Worker，使支援的瀏覽器能將本頁安裝為獨立 App。
Manifest 內的所有路徑 MUST 為相對路徑，使部署在網域子路徑（GitHub Pages Project Pages）下仍然正確。

#### Scenario: Chrome 系瀏覽器
- **WHEN** 頁面在安全連線下開啟，且 Service Worker 註冊成功
- **THEN** 瀏覽器判定為可安裝，頁面顯示可關閉的安裝提示與「安裝」按鈕

#### Scenario: 使用者完成安裝
- **WHEN** 使用者按下「安裝」並在瀏覽器的對話框中確認
- **THEN** 安裝提示消失，之後從主畫面開啟時以 `standalone` 模式顯示，沒有網址列

#### Scenario: iOS Safari
- **WHEN** 使用者在 iOS 以「加入主畫面」安裝
- **THEN** 使用 apple-touch-icon 作為圖示、以獨立視窗開啟，且版面避開瀏海與 home indicator
- **AND** 因 iOS 不提供 `beforeinstallprompt`，頁面 MUST NOT 顯示安裝按鈕

### Requirement: 離線可用
Service Worker SHALL 在安裝時預先快取 app shell（頁面、manifest、圖示），
使頁面在沒有網路時仍可完整開啟。

#### Scenario: 斷網後開啟
- **WHEN** 裝置沒有網路，使用者從主畫面或分頁開啟本頁
- **THEN** 頁面完整載入並可操作，音訊功能不受影響（本頁的音訊處理全在本機）

#### Scenario: 非 app shell 的資源
- **WHEN** 頁面請求不在預先快取清單內的同源資源
- **THEN** 直接走網路，MUST NOT 寫入快取

### Requirement: 背景更新且不打斷監聽
系統 SHALL 以 stale-while-revalidate 供應 app shell：先回快取讓頁面立即開啟，
同時在背景取得新版寫入快取。偵測到新版時系統 SHALL 只顯示提示，
MUST NOT 自動重新載入頁面，因為重新載入會切斷正在進行的監聽。

#### Scenario: 只有頁面內容改版
- **WHEN** 伺服器上的頁面已更新但 `sw.js` 未變動
- **THEN** 背景更新寫入快取後，頁面顯示「有新版本」提示與「重新載入」按鈕

#### Scenario: 更新在頁面掛上監聽器之前就完成
- **WHEN** 背景更新比新頁面的初始化更快完成
- **THEN** 頁面於載入後主動向 Service Worker 詢問，仍會顯示更新提示

#### Scenario: 監聽進行中收到更新提示
- **WHEN** 顯示更新提示時正在監聽
- **THEN** 提示文字說明重新載入會中斷目前的監聽，請使用者方便時再按

#### Scenario: 使用者按下重新載入
- **WHEN** 使用者按下「重新載入」
- **THEN** 系統先停止監聽以釋放音訊裝置，等待新版 Service Worker 接手後才重新載入，
  確保載入到的是新版而不是又一次舊快取

#### Scenario: 首次安裝
- **WHEN** Service Worker 是第一次安裝（先前沒有 controller）
- **THEN** MUST NOT 顯示更新提示

### Requirement: PWA 狀態納入診斷資訊
診斷資訊區塊 SHALL 一併列出目前的顯示模式與 Service Worker 狀態，
使回報問題時能分辨「從主畫面開啟」與「瀏覽器分頁開啟」。

#### Scenario: 檢視診斷資訊
- **WHEN** 使用者展開診斷資訊
- **THEN** 顯示顯示模式（`browser` / `standalone` 等）與 Service Worker 狀態
  （不支援 / 非安全連線 / 已註冊尚未接手 / 運作中，以及是否有更新待套用）

### Requirement: 非安全連線下不影響原有功能
Service Worker 與 `getUserMedia` 都需要安全內容。系統 SHALL 在不支援或非安全連線時
安靜跳過 Service Worker 註冊，MUST NOT 讓註冊失敗影響頁面其餘功能。

#### Scenario: 以 file:// 或純 HTTP 開啟
- **WHEN** `window.isSecureContext` 為 false
- **THEN** 不註冊 Service Worker、不顯示安裝或更新提示，頁面其餘部分照常運作
