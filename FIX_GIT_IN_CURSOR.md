# Fix: Git Not Working in Cursor Terminal

## ✅ Quick Fix (Temporary - For Current Session)

Run this command in the Cursor terminal:

```powershell
$env:PATH += ";C:\Program Files\Git\cmd"
```

Then verify:
```powershell
git --version
```

## 🔧 Permanent Fix Options

### Option 1: Restart Cursor (Easiest)

1. Close Cursor completely
2. Reopen Cursor
3. Open terminal - Git should work now

### Option 2: Add Git to System PATH (Permanent)

1. **Open System Environment Variables:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Go to "Advanced" tab
   - Click "Environment Variables"

2. **Edit PATH:**
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Git\cmd`
   - Click "OK" on all windows

3. **Restart Cursor** for changes to take effect

### Option 3: Use Full Path (Workaround)

If Git still doesn't work, use the full path:

```powershell
& "C:\Program Files\Git\bin\git.exe" --version
& "C:\Program Files\Git\bin\git.exe" status
& "C:\Program Files\Git\bin\git.exe" add .
```

### Option 4: Create Alias (PowerShell Profile)

1. **Find your PowerShell profile:**
   ```powershell
   $PROFILE
   ```

2. **Edit the profile:**
   ```powershell
   notepad $PROFILE
   ```

3. **Add this line:**
   ```powershell
   $env:PATH += ";C:\Program Files\Git\cmd"
   ```

4. **Save and reload:**
   ```powershell
   . $PROFILE
   ```

## 🔍 Verify Git Installation

```powershell
# Check if Git is installed
Test-Path "C:\Program Files\Git\bin\git.exe"

# Check Git version
git --version

# Check Git location
where.exe git
```

## ✅ Current Status

Git is now working in your terminal! You can use all git commands:

```powershell
git status
git add .
git commit -m "message"
git push
```

## 🚀 Next Steps

Now that Git is working, you can:

1. **Check status:**
   ```powershell
   git status
   ```

2. **Add the new file:**
   ```powershell
   git add GIT_COMMANDS_REFERENCE.md
   git commit -m "docs: add git commands reference"
   ```

3. **Connect to GitHub:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git
   git branch -M main
   git push -u origin main
   ```

---

**Note:** If you close and reopen Cursor, you may need to run the PATH command again, or use Option 2 for a permanent fix.

