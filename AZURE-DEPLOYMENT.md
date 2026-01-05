# Azure Static Web Apps Deployment Guide

## Problem
- CORS blocks SharePoint REST API calls from local files
- Need to host the dashboard on a web server
- Azure Static Web Apps is the solution

---

## **Option 1: Simple Deployment (Quick)**

### Step 1: Create Azure Static Web App

1. Go to: https://portal.azure.com
2. Click "Create a resource"
3. Search "Static Web App"
4. Click "Create"
5. Fill in:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new: `gamification-rg`
   - **Name**: `gamification-dashboard`
   - **Plan type**: **Free**
   - **Region**: Choose closest (e.g., "West Europe")
   - **Deployment details**: **"Other"**
6. Click "Review + create" → "Create"

### Step 2: Upload Files

1. After creation, go to your Static Web App
2. Click "Overview" → "Browse"
3. You'll see a placeholder page
4. Go to "Deployment Center"
5. Click "Local Git" or "GitHub" (your choice)
6. Follow the instructions to upload your `dashboard-standalone.html` file

### Step 3: Set Default File

1. Go to "Configuration" → "Application settings"
2. Add new setting:
   - **Name**: `app_location`
   - **Value**: `/`
3. Add:
   - **Name**: `app_artifact_location`
   - **Value**: `/`
4. Add:
   - **Name**: `routes_location`
   - **Value**: `/`
5. Save

---

## **Option 2: GitHub Integration (Recommended)**

### Step 1: Create GitHub Repository

1. Go to: https://github.com
2. Create new repository: `gamification-dashboard`
3. Upload `dashboard-standalone.html` to the repository

### Step 2: Connect Azure to GitHub

1. In Azure Static Web App creation
2. Choose "GitHub" for deployment
3. Authorize Azure
4. Select your repository
5. Branch: `main`
6. Build details:
   - **App location**: `/`
   - **Api location**: (leave empty)
   - **Output location**: `/`
7. Create

### Step 3: Automatic Deployment

- Every time you push to GitHub, Azure automatically deploys!

---

## **Option 3: Azure Function Backend (Best for CORS)**

Since SharePoint REST API has CORS issues, create an Azure Function to fetch data server-side.

### Create Azure Function

1. In Azure Portal, create "Function App"
2. Create a new function (HTTP trigger)
3. Add this code to fetch SharePoint data:

```javascript
module.exports = async function (context, req) {
    const https = require('https');
    
    const siteUrl = 'https://sakidan-my.sharepoint.com/personal/u_zahid_kidan_com';
    const listName = req.query.list || 'SP_UserTotals';
    
    const url = `${siteUrl}/_api/web/lists/getbytitle('${listName}')/items?$select=ID,TotalPoints,Tier,EmployeeEmail/Email,EmployeeEmail/Title&$expand=EmployeeEmail&$orderby=TotalPoints desc`;
    
    // Fetch data using Azure Function's managed identity
    // This bypasses CORS!
    
    context.res = {
        status: 200,
        body: { /* SharePoint data */ }
    };
};
```

4. Update dashboard to call Azure Function instead of SharePoint directly

---

## **Quick Test: Deploy to GitHub Pages (Easiest)**

1. Create GitHub repo
2. Upload `dashboard-standalone.html` as `index.html`
3. Go to Settings → Pages
4. Enable GitHub Pages
5. Your dashboard will be at: `https://yourusername.github.io/gamification-dashboard/`

**Note**: GitHub Pages will still have CORS issues. You'll need Azure Function backend.

---

## **Recommended Solution: Azure Static Web Apps + Azure Function**

1. Deploy HTML to Azure Static Web Apps
2. Create Azure Function to fetch SharePoint data (bypasses CORS)
3. Dashboard calls Azure Function → Function calls SharePoint
4. No CORS issues!

---

## **Next Steps**

1. Choose deployment method (GitHub Pages for quick test, Azure for production)
2. I'll help you create the Azure Function backend
3. Update dashboard to use Azure Function API

Which do you want to do first?

