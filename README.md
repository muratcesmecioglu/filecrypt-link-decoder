# 🔓 FileCrypt Link Decoder

A Tampermonkey userscript that automatically decrypts download links from [FileCrypt.cc](https://filecrypt.cc) / [FileCrypt.co](https://filecrypt.co) using the DLC decryption method.

## ✨ Features

- 🚀 **Automatic decryption** - Works instantly when you visit a FileCrypt container page
- 🔗 **Clickable links** - Decrypted URLs open in a new tab
- 📋 **Copy buttons** - One-click copy for individual links or all links at once
- 🎨 **Native styling** - Matches the FileCrypt page theme (light/dark)
- 🛡️ **No external dependencies** - Uses dcrypt.it API for secure decryption

## 📦 Installation

### Prerequisites
- [Tampermonkey](https://www.tampermonkey.net/) browser extension

### Steps
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click on the Tampermonkey icon → **Create a new script**
3. Delete the template code
4. Copy and paste the contents of [`filecrypt_decoder.user.js`](filecrypt_decoder.user.js)
5. Save the script (Ctrl+S or File → Save)

## 🎯 Usage

1. Navigate to any FileCrypt container page (URLs containing `/Container/`)
2. The script will automatically:
   - Download the DLC file
   - Send it to dcrypt.it for decryption
   - Display the decoded links on the page

## 🔧 How It Works

```
FileCrypt Page → Download DLC File → dcrypt.it API → Display Links
```

1. **Detects** FileCrypt container pages automatically
2. **Extracts** the DLC ID from the page's download button
3. **Downloads** the encrypted `.dlc` file from FileCrypt servers
4. **Decrypts** via POST request to `http://dcrypt.it/decrypt/paste`
5. **Displays** clickable links with copy functionality

## 📸 Screenshot

After installation, decrypted links appear above the file table:

```
✅ Decrypted 1 link(s):

https://www.mediafire.com/file/xxxxx/filename.rar  [📋]

[📋 Copy All Links]
```

## ⚠️ Disclaimer

This script is for educational purposes only. Please respect copyright laws and the terms of service of the websites you visit.

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
