# How to Connect Your Contact Form to Google Sheets

Since you want to send form data directly to your specific Google Sheet (https://docs.google.com/spreadsheets/d/1KLb-okaLlNrwfuFaGaSnuaPA4KT1yidG9bbvkI2x22w/edit?usp=sharing), you need to create a simple **Google Apps Script**.

I have already updated your `index.html` to wait for the Script URL. Here is how to generate it:

### Step 1: Open Your Sheet
Open the sheet you shared: [Google Sheet Link](https://docs.google.com/spreadsheets/d/1KLb-okaLlNrwfuFaGaSnuaPA4KT1yidG9bbvkI2x22w/edit?usp=sharing)

### Step 2: Open Apps Script
1. In the menu, go to **Extensions** > **Apps Script**.
2. A new tab will open with a code editor.

### Step 3: Paste the Code
Delete any existing code in `Code.gs` and paste the following:

```javascript
var sheetName = 'Sheet1' // Change this if your specific tab name is different (e.g. 'Data')
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
    var sheet = doc.getSheetByName(sheetName)

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

### Step 4: Run Initial Setup
1. **Save** the script (Cmd+S or Ctrl+S). Name it "Form Script".
2. Change the function dropdown (top toolbar) from `doPost` to `intialSetup`.
3. Click **Run**.
4. It will ask for permission. Click **Review Permissions**, choose your account, click **Advanced** > **Go to Form Script (unsafe)** > **Allow**.
   _This creates a link between this script and your spreadsheet ID._

### Step 5: Setup Headers in Your Sheet
Go back to your Google Sheet (the actual spreadsheet tab).
In the first row (Row 1), add these **exact headers** (case-sensitive) in separate columns:
- `timestamp`
- `name`
- `email`
- `subject`
- `message`

### Step 6: Deploy as Web App
1. Back in the Apps Script tab, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" > **Web app**.
3. **Description**: "CV Contact Form"
4. **Execute as**: "Me" (your email)
5. **Who has access**: **Anyone** (This is crucial so your form works for visitors without login).
6. Click **Deploy**.

### Step 7: Update Your Website Code
1. Copy the **Web App URL** (it starts with `https://script.google.com/macros/s/...`).
2. Open `index.html` in your project.
3. Find line **2205** (approx):
   ```javascript
   const scriptURL = 'https://script.google.com/macros/s/AKfycbyxxxxxx/exec';
   ```
4. Replace the dummy URL with your **copied Web App URL**.
5. Save and Deploy your site!

---
**Troubleshooting**:
- If you get a CORS error in the console, it's usually fine; the logic in index.html doesn't strictly check for JSON headers to avoid simple CORS blocks, but the data will still land in your sheet.
