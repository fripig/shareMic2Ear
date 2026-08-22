## ADDED Requirements

### Requirement: 依瀏覽器能力選擇輸出路徑
指定音訊輸出裝置的 API 支援度差異很大，系統 SHALL 偵測可用能力並依延遲高低選擇路徑：
優先 `AudioContext.setSinkId`，其次 `HTMLMediaElement.setSinkId`，兩者皆無則使用系統預設輸出。

#### Scenario: 支援 AudioContext.setSinkId
- **WHEN** 瀏覽器的 `AudioContext.prototype` 具有 `setSinkId`（Chrome / Edge 桌面版）
- **THEN** 系統直接將 `AudioContext` 導向選定裝置，並標示為「低延遲」

#### Scenario: 僅支援 HTMLMediaElement.setSinkId
- **WHEN** 只有 `HTMLMediaElement.prototype` 具有 `setSinkId`（Firefox 桌面版）
- **THEN** 系統改以 `<audio>` 元素轉送，標示為「相容模式」並說明會多出約 20-100 ms 延遲

#### Scenario: 兩者皆不支援
- **WHEN** 兩個 `setSinkId` 都不存在
- **THEN** 系統將訊號送往系統預設輸出，並說明無法由網頁指定輸出裝置

### Requirement: 切換輸出裝置即時生效
系統 SHALL 允許在監聽進行中更換輸出裝置，MUST NOT 要求重新啟動。

#### Scenario: 監聽中更換耳機
- **WHEN** 監聽進行中，使用者從輸出下拉選擇另一個裝置
- **THEN** 聲音改由新裝置播放，麥克風不中斷

#### Scenario: 切換失敗
- **WHEN** 對選定裝置呼叫 `setSinkId` 失敗
- **THEN** 顯示切換失敗訊息，監聽本身繼續運作

### Requirement: 依實際平台說明無法選擇的原因
無法選擇輸出時，系統 SHALL 依偵測到的平台給出對應的原因與替代操作方式，
MUST NOT 顯示與使用者平台無關的瀏覽器名稱。

#### Scenario: Android 瀏覽器
- **WHEN** 使用者在 Android 上開啟且無法選擇輸出
- **THEN** 說明 `setSinkId` 只在桌面版提供，並指示從通知列的媒體通知切換輸出，
  同時警告使用麥克風時系統會走通訊路由，藍牙將降為 HFP 且可能被強制導向喇叭

#### Scenario: iOS 瀏覽器
- **WHEN** 使用者在 iOS 上開啟
- **THEN** 說明 iOS 不支援由網頁選擇輸出，並指示從控制中心切換

#### Scenario: 桌面版 Safari
- **WHEN** 使用者以桌面版 Safari 開啟
- **THEN** 說明 Safari 不支援 `setSinkId`，建議到系統設定切換或改用 Chrome / Edge

#### Scenario: 支援 API 但列不出裝置
- **WHEN** `setSinkId` 可用，但列舉結果不含任何 `audiooutput` 裝置
- **THEN** 區分於「API 不存在」，說明瀏覽器支援切換但未提供裝置清單

### Requirement: 不提供無法操作的控制項
系統 SHALL 在無法選擇輸出時隱藏輸出下拉選單，
MUST NOT 保留一個停用但仍然可見的選單。

#### Scenario: 無法選擇輸出
- **WHEN** 目前環境無法指定輸出裝置
- **THEN** 輸出下拉整個隱藏，只留下說明文字

### Requirement: 回授風險警示
把麥克風導向喇叭會形成回授迴路，系統 SHALL 在啟動監聽前提示使用者配戴耳機，
並說明麥克風數量越多風險越高。

#### Scenario: 檢視監聽區塊
- **WHEN** 使用者看到監聽控制區塊
- **THEN** 顯示先戴耳機的警告與回授成因說明
