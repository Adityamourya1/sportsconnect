# Git Push Guide - MySports Project

**Your Credentials:**
- Email: adityamourya2026@gmail.com
- Username: Adityamourya1

---

## ✅ Step 1: Configure Git (Run Once)

```powershell
git config --global user.email "adityamourya2026@gmail.com"
git config --global user.name "Adityamourya1"
```

---

## ✅ Step 2: Add All Changes

```powershell
cd c:\Users\DELL\OneDrive\Desktop\mysports
git add .
```

---

## ✅ Step 3: Commit Changes

```powershell
git commit -m "Phase 2 Complete: All 12 features fixed and tested

- Follow/Unfollow users with state tracking
- Like/Unlike posts with visual feedback
- Comment on posts with CommentModal
- Share posts with copy-to-clipboard
- Notifications for likes, comments, follows
- Messages with proper sender/receiver handling
- View conversations with user info
- Chat history persistence"
```

---

## ✅ Step 4: Check Your Remote

```powershell
git remote -v
```

### If you see output like `origin https://github.com/...` → Go to Step 5

### If you see nothing, add your GitHub repo:

```powershell
git remote add origin https://github.com/Adityamourya1/mysports.git
```

(Replace URL with your actual GitHub repo URL)

---

## ✅ Step 5: Push to GitHub

```powershell
git push -u origin main
```

Or if your default branch is different:
```powershell
git push -u origin master
```

---

## 📋 Full Commands to Copy-Paste

Open PowerShell and paste these one at a time:

```powershell
# Navigate to project
cd c:\Users\DELL\OneDrive\Desktop\mysports

# Configure git
git config --global user.email "adityamourya2026@gmail.com"
git config --global user.name "Adityamourya1"

# Stage everything
git add .

# Commit
git commit -m "Phase 2 Complete: All 12 features fixed - Follow, Like, Comment, Share, Notifications, Messages, User Profiles"

# Check your remote
git remote -v

# If no remote, add it:
# git remote add origin https://github.com/YOUR_USERNAME/mysports.git

# Push
git push -u origin main
```

---

## 🆘 Troubleshooting

### Error: "fatal: not a git repository"
```powershell
cd c:\Users\DELL\OneDrive\Desktop\mysports
git init
```

### Error: "Permission denied"
- Make sure git is installed
- Run PowerShell as Administrator

### Error: "Authentication failed"
- Check your GitHub password/SSH key
- Make sure you have push access to the repo

### Check current status
```powershell
git status
git log --oneline -5
```

---

## 📊 What's Being Pushed

**12 Features Fixed:**
✅ Follow/Unfollow users  
✅ Like/Unlike posts  
✅ Comment on posts  
✅ Share posts  
✅ Like notifications  
✅ Comment notifications  
✅ Follow notifications  
✅ Unread count  
✅ Send messages  
✅ View conversations  
✅ Mark messages as read  
✅ Chat history  

**New Files:**
- UserProfilePage.jsx
- CommentModal.jsx
- deploy.sh
- push-to-git.ps1
- GIT_PUSH_GUIDE.md

**Modified Files:**
- ExplorePage.jsx
- HomePage.jsx
- MessagesPage.jsx
- PostCard.jsx
- CommentModal.jsx
- app/routes/notifications.py
- app/routes/messages.py
- app/schemas/__init__.py
- app/schemas/schemas.py

---

## 💡 Pro Tips

1. **Check before pushing:**
   ```powershell
   git log --oneline -5
   ```

2. **See what changed:**
   ```powershell
   git diff --cached
   ```

3. **Verify email/name:**
   ```powershell
   git config --global user.email
   git config --global user.name
   ```

---

**Ready? Run the commands above in PowerShell!** 🚀
