import { type NextRequest, NextResponse } from "next/server"

// Extension files content
const extensionFiles = {
  "manifest.json": {
    content: JSON.stringify(
      {
        manifest_version: 3,
        name: "Job Application Automation",
        version: "1.0",
        description: "Automatically capture job postings and sync with your dashboard",
        permissions: ["activeTab", "storage", "scripting"],
        host_permissions: [
          "https://www.linkedin.com/*",
          "https://www.indeed.com/*",
          "https://jobs.google.com/*",
          "https://www.glassdoor.com/*",
          "https://www.monster.com/*",
        ],
        background: {
          service_worker: "background.js",
        },
        content_scripts: [
          {
            matches: [
              "https://www.linkedin.com/*",
              "https://www.indeed.com/*",
              "https://jobs.google.com/*",
              "https://www.glassdoor.com/*",
              "https://www.monster.com/*",
            ],
            js: ["content.js"],
            css: ["content.css"],
          },
        ],
        action: {
          default_popup: "popup.html",
          default_title: "Job Application Automation",
        },
        icons: {
          "16": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iIzAwN2NmZiIvPgo8cGF0aCBkPSJNNCA2aDhNNCA5aDZNNCA1aDEwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=",
          "48": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMwMDdjZmYiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgOWgxMk02IDEyaDEwTTYgMTVoOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K",
        },
      },
      null,
      2,
    ),
    type: "application/json",
  },
  "background.js": {
    content: `// Background service worker for job automation extension
console.log('Job Automation Extension: Background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Automation Extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveJob') {
    console.log('Saving job:', request.jobData);
    
    // Save to local storage
    chrome.storage.local.get(['savedJobs'], (result) => {
      const savedJobs = result.savedJobs || [];
      savedJobs.push({
        ...request.jobData,
        id: Date.now(),
        savedAt: new Date().toISOString(),
        url: sender.tab?.url
      });
      
      chrome.storage.local.set({ savedJobs }, () => {
        console.log('Job saved successfully');
        sendResponse({ success: true });
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getJobs') {
    chrome.storage.local.get(['savedJobs'], (result) => {
      sendResponse({ jobs: result.savedJobs || [] });
    });
    return true;
  }
});`,
    type: "application/javascript",
  },
  "content.js": {
    content: `// Content script for job site automation
console.log('Job Automation Extension: Content script loaded on', window.location.hostname);

// Job site configurations
const jobSiteConfigs = {
  'www.linkedin.com': {
    jobTitle: '.job-details-jobs-unified-top-card__job-title h1, .jobs-unified-top-card__job-title a',
    company: '.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a',
    location: '.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet',
    description: '.jobs-description-content__text, .jobs-box__html-content',
    applyButton: '.jobs-apply-button, .jobs-s-apply button'
  },
  'www.indeed.com': {
    jobTitle: '[data-testid="jobsearch-JobInfoHeader-title"] span, .jobsearch-JobInfoHeader-title span',
    company: '[data-testid="inlineHeader-companyName"] a, .jobsearch-InlineCompanyRating-companyHeader a',
    location: '[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div',
    description: '#jobDescriptionText, .jobsearch-jobDescriptionText',
    applyButton: '.jobsearch-IndeedApplyButton-buttonWrapper button, .indeed-apply-button'
  },
  'jobs.google.com': {
    jobTitle: '.KLsYvd, .r0wTof',
    company: '.nJlQNd a, .vNEEBe',
    location: '.Qk80Jf, .r0wTof + div',
    description: '.YgLbBe, .aJHbb',
    applyButton: '.pMhGee, .RfDO6c'
  }
};

// Get current site configuration
const currentSite = window.location.hostname;
const config = jobSiteConfigs[currentSite];

if (config) {
  console.log('Job site detected:', currentSite);
  
  // Create floating action button
  createFloatingButton();
  
  // Auto-detect job postings
  detectJobPosting();
}

function createFloatingButton() {
  const button = document.createElement('div');
  button.id = 'job-automation-fab';
  button.innerHTML = '💼';
  button.title = 'Save this job';
  button.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: #007cff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 124, 255, 0.3);
    z-index: 10000;
    transition: all 0.3s ease;
  \`;
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 20px rgba(0, 124, 255, 0.4)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0, 124, 255, 0.3)';
  });
  
  button.addEventListener('click', () => {
    captureJobData();
  });
  
  document.body.appendChild(button);
}

function detectJobPosting() {
  // Check if we're on a job posting page
  const titleElement = document.querySelector(config.jobTitle);
  if (titleElement) {
    console.log('Job posting detected');
    // Could add auto-capture logic here
  }
}

function captureJobData() {
  const jobData = {
    title: getTextContent(config.jobTitle),
    company: getTextContent(config.company),
    location: getTextContent(config.location),
    description: getTextContent(config.description),
    site: currentSite,
    capturedAt: new Date().toISOString()
  };
  
  console.log('Captured job data:', jobData);
  
  // Send to background script
  chrome.runtime.sendMessage({
    action: 'saveJob',
    jobData: jobData
  }, (response) => {
    if (response && response.success) {
      showNotification('Job saved successfully!');
    } else {
      showNotification('Failed to save job', 'error');
    }
  });
}

function getTextContent(selector) {
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : '';
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: \${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
  \`;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  \`;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}`,
    type: "application/javascript",
  },
  "content.css": {
    content: `/* Styles for job automation extension */
#job-automation-fab {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#job-automation-fab:hover {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 4px 12px rgba(0, 124, 255, 0.3); }
  50% { box-shadow: 0 6px 20px rgba(0, 124, 255, 0.5); }
  100% { box-shadow: 0 4px 12px rgba(0, 124, 255, 0.3); }
}

/* Hide extension elements when printing */
@media print {
  #job-automation-fab {
    display: none !important;
  }
}`,
    type: "text/css",
  },
  "popup.html": {
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 350px;
      min-height: 400px;
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8fafc;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .header h1 {
      margin: 0;
      font-size: 18px;
      color: #1e293b;
      font-weight: 600;
    }
    
    .header p {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }
    
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #007cff;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .btn {
      padding: 12px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      text-align: center;
      display: block;
    }
    
    .btn-primary {
      background: #007cff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0066cc;
    }
    
    .btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn-secondary:hover {
      background: #f9fafb;
    }
    
    .recent-jobs {
      margin-top: 20px;
    }
    
    .recent-jobs h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #374151;
      font-weight: 600;
    }
    
    .job-item {
      background: white;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .job-title {
      font-size: 13px;
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 2px;
    }
    
    .job-company {
      font-size: 11px;
      color: #64748b;
    }
    
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #64748b;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💼 Job Automation</h1>
    <p>Capture jobs from any job site</p>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <div class="stat-number" id="totalJobs">0</div>
      <div class="stat-label">Total Jobs</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="todayJobs">0</div>
      <div class="stat-label">Today</div>
    </div>
  </div>
  
  <div class="actions">
    <button class="btn btn-primary" id="captureBtn">📋 Capture Current Job</button>
    <a href="#" class="btn btn-secondary" id="dashboardBtn">🚀 Open Dashboard</a>
  </div>
  
  <div class="recent-jobs">
    <h3>Recent Jobs</h3>
    <div id="recentJobsList">
      <div class="empty-state">
        No jobs captured yet.<br>
        Visit a job site and click "Capture Current Job"
      </div>
    </div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>`,
    type: "text/html",
  },
  "popup.js": {
    content: `// Popup functionality for job automation extension
document.addEventListener('DOMContentLoaded', () => {
  loadJobStats();
  loadRecentJobs();
  
  // Set up event listeners
  document.getElementById('captureBtn').addEventListener('click', captureCurrentJob);
  document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
});

function loadJobStats() {
  chrome.storage.local.get(['savedJobs'], (result) => {
    const jobs = result.savedJobs || [];
    const today = new Date().toDateString();
    const todayJobs = jobs.filter(job => 
      new Date(job.savedAt).toDateString() === today
    );
    
    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('todayJobs').textContent = todayJobs.length;
  });
}

function loadRecentJobs() {
  chrome.storage.local.get(['savedJobs'], (result) => {
    const jobs = result.savedJobs || [];
    const recentJobs = jobs.slice(-5).reverse(); // Last 5 jobs, most recent first
    
    const container = document.getElementById('recentJobsList');
    
    if (recentJobs.length === 0) {
      container.innerHTML = \`
        <div class="empty-state">
          No jobs captured yet.<br>
          Visit a job site and click "Capture Current Job"
        </div>
      \`;
      return;
    }
    
    container.innerHTML = recentJobs.map(job => \`
      <div class="job-item">
        <div class="job-title">\${job.title || 'Untitled Job'}</div>
        <div class="job-company">\${job.company || 'Unknown Company'} • \${job.site || 'Unknown Site'}</div>
      </div>
    \`).join('');
  });
}

function captureCurrentJob() {
  // Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // Send message to content script to capture job
    chrome.tabs.sendMessage(currentTab.id, { action: 'captureJob' }, (response) => {
      if (chrome.runtime.lastError) {
        showMessage('Please visit a supported job site first', 'error');
        return;
      }
      
      if (response && response.success) {
        showMessage('Job captured successfully!', 'success');
        // Refresh stats and recent jobs
        setTimeout(() => {
          loadJobStats();
          loadRecentJobs();
        }, 500);
      } else {
        showMessage('Failed to capture job. Make sure you\\'re on a job posting page.', 'error');
      }
    });
  });
}

function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  window.close();
}

function showMessage(text, type = 'info') {
  // Create temporary message element
  const message = document.createElement('div');
  message.textContent = text;
  message.style.cssText = \`
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    padding: 10px;
    background: \${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 6px;
    font-size: 12px;
    text-align: center;
    z-index: 1000;
  \`;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
}`,
    type: "application/javascript",
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileName = searchParams.get("file")

  console.log("[v0] Download API called with file:", fileName)

  if (!fileName) {
    console.log("[v0] No file parameter provided")
    return NextResponse.json({ error: "File parameter required" }, { status: 400 })
  }

  const fileData = extensionFiles[fileName as keyof typeof extensionFiles]

  if (!fileData) {
    console.log("[v0] File not found:", fileName)
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  console.log("[v0] Serving file:", fileName, "Type:", fileData.type)

  return new NextResponse(fileData.content, {
    headers: {
      "Content-Type": fileData.type,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-cache",
    },
  })
}
