# FIX: Update Your Google Apps Script

The issue is likely that your Sheet tab is named **"Trang tính 1"** (Vietnamese default) but the script is looking for **"Sheet1"**.

To fix this so it works with ANY sheet name, please replace your **Google Apps Script** code with this robust version:

### 1. Copy this new code:

```javascript
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    
    // CHANGE: Get the FIRST sheet automatically, regardless of name
    var sheet = doc.getSheets()[0] 

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}
```

### 2. Update the Script
1. Go back to your **Apps Script** tab.
2. Delete the old code and Paste this new code.
3. **Save** the project.

### 3. Run Setup Again
1. Select `intialSetup` from the dropdown menu.
2. Click **Run**.

### 4. Create a NEW Deployment (Crucial!)
1. Click **Deploy** > **Manage deployments**.
2. Click the **Pencil icon** (Edit) or create a **New deployment**.
   - *Tip: It is often safer to create a brand new deployment to ensure changes apply.*
   - If creating new: Select type **Web app**.
   - Description: "Version 2".
   - Execute as: **Me**.
   - Who has access: **Anyone**.
3. **Copy the NEW URL** (if it changed).
   - If you managed the existing deployment and updated the version, the URL might stay the same. If you made a new one, update it in your code.

### 5. Update index.html (Only if URL changed)
If you got a new URL, paste it into `index.html`. If the URL is the same, you usually don't need to change `index.html`, but **redeploying Vercel** is a good idea to clear caches.
