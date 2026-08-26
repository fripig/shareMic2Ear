# localization Specification

## Purpose

定義介面的多語系行為。這個工具處理的是藍牙與作業系統層的限制，
說明文案本身就是功能的一部分（「為什麼不能選輸出」「為什麼音質變差」），
因此語言不是裝飾，看不懂說明的使用者等於拿不到解法。

支援繁體中文與英文兩種語言。範圍限定在使用者看得到的文案；
程式註解、診斷資訊中的 API 名稱與 UA 字串維持原樣，因為那是要貼給開發者看的。

切換語言不得影響音訊：使用者可能正戴著耳機監聽，重繪介面不該中斷任何裝置。

## Requirements

### Requirement: 兩種語言的完整字典
系統 SHALL 提供繁體中文（`zh-Hant`）與英文（`en`）兩份文案字典，內嵌於 `index.html`。
兩份字典的鍵 MUST 完全一致，且同一鍵的佔位符（`{n}` 之類）MUST 相同。
查不到的鍵 SHALL 退回英文，仍查不到時退回鍵名本身，MUST NOT 讓介面出現空白。

#### Scenario: 新增或修改文案
- **WHEN** 開發者新增一段使用者可見的文案
- **THEN** 必須同時寫進兩份字典，並以鍵引用，MUST NOT 在 HTML 或 JS 中直接寫死語言文字

#### Scenario: 字典缺鍵
- **WHEN** 某個鍵只存在於英文字典
- **THEN** 中文介面顯示英文內容，而不是空字串或 `undefined`

### Requirement: 依瀏覽器語言自動選擇
系統 SHALL 在首次開啟時依 `navigator.languages` 決定語言：
任何中文變體（`zh`、`zh-TW`、`zh-Hans` 等）一律給繁體中文，其餘語言一律給英文。

#### Scenario: 中文環境
- **WHEN** 瀏覽器偏好語言為 `zh-TW`
- **THEN** 介面以繁體中文顯示，`<html lang>` 為 `zh-Hant`

#### Scenario: 其他語言環境
- **WHEN** 瀏覽器偏好語言為 `ja-JP` 或任何非中文語言
- **THEN** 介面以英文顯示，`<html lang>` 為 `en`

### Requirement: 手動切換並記住選擇
系統 SHALL 在標題列提供語言切換，使用者的選擇 SHALL 存入 `localStorage`，
並在之後的開啟中優先於瀏覽器語言。`localStorage` 不可用時 MUST NOT 拋錯，
僅退回為不記憶。

#### Scenario: 使用者切換語言
- **WHEN** 使用者按下另一個語言
- **THEN** 全頁文案立即更新，被選中的按鈕以 `aria-pressed` 標示

#### Scenario: 重新開啟頁面
- **WHEN** 使用者先前選過語言，之後重新開啟頁面
- **THEN** 使用記住的語言，即使與瀏覽器偏好語言不同

### Requirement: 切換語言不影響音訊與狀態
切換語言 SHALL 只重繪文字。系統 MUST NOT 因此停止監聽、重新取得裝置、
或改變任何使用者已設定的狀態（勾選的麥克風、各別音量與靜音、選定的輸出裝置、
進階處理選項）。

#### Scenario: 監聽進行中切換語言
- **WHEN** 正在監聽時切換語言
- **THEN** 音訊不中斷，狀態仍為「監聽中」，各麥克風的音量與靜音狀態保持不變

#### Scenario: 動態產生的文字
- **WHEN** 切換語言
- **THEN** JS 產生的文字一併更新，包含：狀態徽章、開始／停止按鈕、麥克風清單
  （裝置名稱以外的標示、靜音按鈕、連線中／被佔用／失敗）、輸出裝置清單的補充標示、
  輸出模式與說明、統計欄位、低電平提示、目前顯示中的錯誤訊息與診斷資訊

#### Scenario: 保留錯誤標示
- **WHEN** 某支麥克風啟用失敗後切換語言（清單會重繪）
- **THEN** 該列仍標示為錯誤，原因以新語言顯示

### Requirement: 文件層級的語言標註
系統 SHALL 隨語言更新 `<html lang>`、`<title>` 與 `meta[name=description]`，
使螢幕閱讀器與分享預覽取得正確語言。

#### Scenario: 切換語言
- **WHEN** 使用者切換語言
- **THEN** `<html lang>`、頁面標題與 meta description 同步更新

#### Scenario: PWA manifest
- **WHEN** 使用者安裝本頁為 App
- **THEN** 因 manifest 只能有一份文案，安裝名稱使用不需翻譯的產品名，
  描述同時提供英文與中文，MUST NOT 依語言動態產生 manifest（會破壞安裝）
