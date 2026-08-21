# shareMic2Ear

在瀏覽器裡把麥克風即時導到指定的音訊輸出裝置。單一 HTML 檔、零依賴、零建置，可直接部署到 GitHub Pages。

## 功能

- 列出系統所有音訊輸入／輸出裝置，並依名稱推測標示藍牙裝置
- 選定麥克風即時監聽，可指定輸出到哪個耳機
- 音量調整與靜音（指數漸變，不會有喀噠聲）
- 即時音量表（RMS + peak hold）、取樣率、聲道、估計延遲
- 關閉 `echoCancellation` / `noiseSuppression` / `autoGainControl`（預設全關，可切換）
- 監聽裝置變化，藍牙連上或斷開時自動更新清單

## 部署到 GitHub Pages

```bash
git remote add origin git@github.com:<你的帳號>/shareMic2Ear.git
git push -u origin main
```

到 repo 的 **Settings → Pages**，Source 選 **Deploy from a branch**，branch 選 `main`、資料夾選 `/ (root)`，儲存後等一分鐘即可。

不需要 GitHub Actions，也不需要任何建置流程。

## 本機測試

`getUserMedia` 需要安全context。`localhost` 被視為安全，直接開檔案（`file://`）則不行：

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

## 瀏覽器支援

輸出裝置的選擇依賴 `setSinkId`，各家支援程度不同：

| 瀏覽器 | 選擇輸出裝置 | 走的路徑 |
|---|---|---|
| Chrome / Edge 110+ | ✅ | `AudioContext.setSinkId()`，延遲最低 |
| Firefox 116+ | ✅ | `<audio>` 元素轉送，多約 20–100 ms 延遲 |
| Safari（含 iOS） | ❌ | 只能輸出到系統預設裝置，需自行到系統設定切換 |

程式會自動偵測並選擇可用的路徑，不支援時在畫面上說明原因。

## 已知限制

這些是瀏覽器與藍牙協定本身的限制，不是實作問題：

- **無法配對藍牙裝置。** Web Bluetooth 只能操作 BLE GATT，碰不到 A2DP／HFP 音訊裝置。配對必須在系統設定完成，本頁只能列出已連線的裝置。
- **藍牙裝置的標示是用名稱猜的。** Web API 不提供裝置的連線類型，只能靠字串比對，不保證準確。
- **藍牙耳機當麥克風用會降音質。** 一旦作為輸入裝置，會從 A2DP 切換到 HFP 模式，取樣率掉到 16 kHz 以下、立體聲變單聲道。想要好音質，輸入請用有線或內建麥克風，只讓輸出走藍牙。
- **藍牙有 100–300 ms 傳輸延遲。** 要真正低延遲的監聽請使用有線耳機。
- **回授風險。** 用喇叭而非耳機播放時，麥克風會收到自己的聲音形成嘯叫。程式啟動時會從靜音淡入以降低衝擊，但無法根治——請戴耳機。

## 授權

MIT
