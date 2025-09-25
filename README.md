因爲此專案設計與 workflow 管理站台相綁，並利用該站台 SESSION 做權限認證
故以下為開發環境動作

1. 安裝所需套件： npm install
2. 於 develop 環境登入 workflow 管理站台，URL 後面 PHPSESSID 參數即是 SESSION ID
   範例：https://dev-workflow.e8d.cc/administrator.php?op=adminMain&PHPSESSID=7rb2n7c1dhfkpd3idrr3nn5f4u
3. 將此 SESSION ID 記錄於 Cookie 中
   範例：
   名稱：PHPSESSID
   值：7rb2n7c1dhfkpd3idrr3nn5f4u
4. 本機開發時，因 call api 會有跨域問題，所以需啟用本機 server；vite.config 檔案移除註解即可
