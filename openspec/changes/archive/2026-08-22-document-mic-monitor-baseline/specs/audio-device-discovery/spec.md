## ADDED Requirements

### Requirement: 執行環境前置檢查
系統 SHALL 在載入時檢查 `getUserMedia`、`AudioContext` 是否存在以及是否處於安全內容，
任一項不滿足時 MUST 停用權限按鈕並說明原因，而不是等到使用者操作才失敗。

#### Scenario: 缺少必要的音訊 API
- **WHEN** 瀏覽器沒有 `navigator.mediaDevices.getUserMedia` 或 `AudioContext`
- **THEN** 顯示不支援訊息並停用「允許使用麥克風」按鈕

#### Scenario: 以非安全連線開啟
- **WHEN** 頁面在 `window.isSecureContext` 為 false 的情況下載入（例如 `file://` 或純 http）
- **THEN** 說明瀏覽器只在安全連線下開放麥克風，並停用權限按鈕

### Requirement: 以權限換取裝置名稱
瀏覽器在未授權前不會提供裝置 label，系統 SHALL 先取得一次麥克風授權，
並 MUST 在取得後立即停止該探測用的音軌，不保留非必要的裝置佔用。

#### Scenario: 授權成功
- **WHEN** 使用者按下「允許使用麥克風」並在瀏覽器提示中允許
- **THEN** 探測用音軌立即停止，權限區塊隱藏，裝置、輸出、監聽、音訊處理四個區塊顯示出來

#### Scenario: 使用者拒絕授權
- **WHEN** `getUserMedia` 以 `NotAllowedError` 失敗
- **THEN** 說明可能是使用者拒絕或站台被封鎖，並指示從網址列鎖頭圖示重新開放

#### Scenario: 找不到任何麥克風
- **WHEN** `getUserMedia` 以 `NotFoundError` 失敗
- **THEN** 明確告知找不到麥克風裝置，而不是顯示通用錯誤

### Requirement: 列舉音訊輸入裝置
系統 SHALL 列出所有 `audioinput` 裝置供多選，並 MUST 在裝置沒有 label 時以序號命名，
避免出現無法辨識的空白項目。

#### Scenario: 首次掃描
- **WHEN** 權限取得後第一次列舉裝置且至少有一個輸入裝置
- **THEN** 清單顯示全部輸入裝置，且第一個裝置預設為勾選狀態

#### Scenario: 裝置沒有 label
- **WHEN** 某個輸入裝置的 label 為空字串
- **THEN** 該列顯示「麥克風 N」，N 為其在清單中的序號

#### Scenario: 完全沒有輸入裝置
- **WHEN** 列舉結果不含任何 `audioinput`
- **THEN** 清單區域顯示「找不到任何麥克風裝置。」

### Requirement: 推測並標示藍牙裝置
沒有任何 Web API 能提供裝置的連線類型，系統 SHALL 以裝置名稱比對來推測藍牙裝置，
並 MUST 以帶問號的標記呈現，明確表示這是推測而非事實。

#### Scenario: 名稱符合藍牙特徵
- **WHEN** 裝置 label 含有 bluetooth、藍牙、AirPods、Jabra、WH- 等已知特徵字串
- **THEN** 該列名稱後方附加「藍牙?」標記

#### Scenario: 名稱不符合特徵
- **WHEN** 裝置 label 為「MacBook Pro 麥克風」或「USB Audio Device」等不含特徵字串者
- **THEN** 不附加任何藍牙標記

### Requirement: 反映裝置的即時變化
系統 SHALL 監聽 `devicechange` 事件並重新列舉，
且 MUST 在重繪時保留使用者既有的勾選與正在運作中麥克風的音量、靜音狀態。

#### Scenario: 藍牙耳機連線後
- **WHEN** 使用者在系統設定連上一副藍牙耳機
- **THEN** 清單自動出現該裝置，既有勾選狀態不受影響

#### Scenario: 運作中的裝置消失
- **WHEN** 某支正在監聽中的麥克風從列舉結果中消失（拔線或藍牙斷開）
- **THEN** 系統將它從音訊圖與已選集合中移除，其餘麥克風繼續運作

#### Scenario: 重繪保留運作中狀態
- **WHEN** 清單因裝置變化而重繪，且其中一支麥克風正在運作、音量為 250%、已靜音
- **THEN** 重繪後該列的音量滑桿仍顯示 250%、靜音按鈕仍為啟用狀態
