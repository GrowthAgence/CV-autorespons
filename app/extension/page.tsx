"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const EXTENSION_FILES = {
  "manifest.json": {
    name: "Job Application Automation",
    version: "4.1.0",
    manifest_version: 3,
    description: "AI-powered job posting capture via clipboard",
    permissions: ["activeTab", "clipboardWrite", "scripting"],
    host_permissions: ["<all_urls>"],
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content.js"],
        css: ["content.css"],
      },
    ],
    action: {
      default_popup: "popup.html",
      default_title: "Job Automation",
    },
  },
  "background.js": `// Background service worker v4.1
console.log('[v0] Job Automation Extension v4.1 installed - Clipboard mode');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[v0] Extension installed successfully');
});`,
  "content.js": `// Content script v4.1 - Clipboard mode
console.log('[v0] Job Automation content script loaded');

function getPageContent() {
  return {
    url: window.location.href,
    title: document.title,
    html: document.body.innerHTML.substring(0, 50000), // Limit size
    text: document.body.innerText.substring(0, 20000), // Limit size
  };
}

// Add save button to page
function addSaveButton() {
  if (document.getElementById('job-automation-save-btn')) return;

  console.log('[v0] Adding save button');
  const button = document.createElement('button');
  button.id = 'job-automation-save-btn';
  button.className = 'job-automation-save-btn';
  button.innerHTML = '🤖 Copy Job Data';
  
  button.onclick = async () => {
    console.log('[v0] Capturing job data');
    button.textContent = '📦 Capturing...';
    button.disabled = true;
    
    try {
      const pageContent = getPageContent();
      const dataString = JSON.stringify(pageContent);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(dataString);
      
      button.textContent = '✅ Copied! Go to app';
      button.disabled = false;
      
      console.log('[v0] Job data copied to clipboard');
      
      setTimeout(() => {
        button.innerHTML = '🤖 Copy Job Data';
      }, 3000);
    } catch (error) {
      console.error('[v0] Error:', error);
      button.textContent = '❌ Error';
      button.disabled = false;
      setTimeout(() => {
        button.innerHTML = '🤖 Copy Job Data';
      }, 3000);
    }
  };
  
  document.body.appendChild(button);
  console.log('[v0] Save button added');
}

// Wait for page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(addSaveButton, 1000));
} else {
  setTimeout(addSaveButton, 1000);
}`,
  "content.css": `.job-automation-save-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s;
  font-family: system-ui, -apple-system, sans-serif;
}

.job-automation-save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.job-automation-save-btn:active {
  transform: translateY(0);
}

.job-automation-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}`,
  "popup.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 320px;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    h1 {
      font-size: 18px;
      margin: 0 0 8px 0;
      font-weight: bold;
    }
    .subtitle {
      font-size: 12px;
      color: #666;
      margin-bottom: 16px;
    }
    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      margin-bottom: 8px;
      font-size: 14px;
    }
    button:hover {
      opacity: 0.9;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    #status {
      margin-top: 12px;
      padding: 8px;
      border-radius: 4px;
      text-align: center;
      font-size: 13px;
      display: none;
    }
    .success {
      background: #d4edda;
      color: #155724;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
    }
    .info {
      background: #e7f3ff;
      color: #004085;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <h1>🤖 Job Automation AI</h1>
  <div class="subtitle">AI-powered job extraction v4.1</div>
  
  <div class="info">
    Click the button below to copy job data from this page. Then go to your app and click "Paste & Extract".
  </div>
  
  <button id="copyJob">📋 Copy Job Data</button>
  
  <div id="status"></div>
  <script src="popup.js"></script>
</body>
</html>`,
  "popup.js": `// Popup script v4.1 - Fixed Promise-based API
document.getElementById('copyJob').addEventListener('click', async () => {
  const button = document.getElementById('copyJob');
  const statusDiv = document.getElementById('status');
  
  button.disabled = true;
  button.textContent = '📦 Capturing...';
  
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }
    
    // Set timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    // Execute script to get page content
    const scriptPromise = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          url: window.location.href,
          title: document.title,
          html: document.body.innerHTML.substring(0, 50000),
          text: document.body.innerText.substring(0, 20000),
        };
      }
    });
    
    // Race between script execution and timeout
    const results = await Promise.race([scriptPromise, timeoutPromise]);
    
    if (!results || !results[0] || !results[0].result) {
      throw new Error('Could not read page content');
    }
    
    const pageData = results[0].result;
    const dataString = JSON.stringify(pageData);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(dataString);
    
    button.textContent = '✅ Copied!';
    showStatus('✅ Data copied! Go to app and click "Paste & Extract"', 'success');
    
    setTimeout(() => {
      button.disabled = false;
      button.textContent = '📋 Copy Job Data';
    }, 2000);
    
  } catch (error) {
    console.error('[v0] Error:', error);
    
    let errorMessage = '❌ Error: ';
    if (error.message === 'Timeout') {
      errorMessage += 'Operation timed out';
    } else if (error.message.includes('Cannot access')) {
      errorMessage += 'Cannot access this page';
    } else {
      errorMessage += error.message || 'Unknown error';
    }
    
    showStatus(errorMessage, 'error');
    button.disabled = false;
    button.textContent = '📋 Copy Job Data';
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 4000);
}`,
}

function downloadFile(filename: string, content: string | object) {
  const blob = new Blob([typeof content === "string" ? content : JSON.stringify(content, null, 2)], {
    type: typeof content === "string" ? "text/plain" : "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadAllFiles() {
  Object.entries(EXTENSION_FILES).forEach(([filename, content]) => {
    setTimeout(() => downloadFile(filename, content), 100)
  })
}

export default function ExtensionPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const extensionFiles = [
    { name: "manifest.json", description: "Extension manifest" },
    { name: "background.js", description: "Background service worker" },
    { name: "content.js", description: "Content script for job sites" },
    { name: "content.css", description: "Styling for injected elements" },
    { name: "popup.html", description: "Extension popup interface" },
    { name: "popup.js", description: "Popup functionality" },
  ]

  const handleDownload = (filename: string) => {
    setDownloading(filename)
    downloadFile(filename, EXTENSION_FILES[filename as keyof typeof EXTENSION_FILES])
    setTimeout(() => setDownloading(null), 1000)
  }

  const handleDownloadAll = () => {
    setDownloading("all")
    downloadAllFiles()
    setTimeout(() => setDownloading(null), 2000)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold uppercase tracking-tight">Chrome Extension</h1>
        <p className="text-xl text-muted-foreground">Capture job postings with AI-powered clipboard extraction</p>
      </div>

      <div className="mb-8 rounded-lg border-4 border-primary bg-primary/10 p-6">
        <h2 className="mb-3 text-xl font-bold uppercase">📋 How It Works</h2>
        <ol className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">1.</span>
            <span>Install the extension and navigate to any job posting page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">2.</span>
            <span>Click the "🤖 Copy Job Data" button that appears on the page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">3.</span>
            <span>Go to your app's "Add Job" page and click "📋 Paste & Extract"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-primary">4.</span>
            <span>AI automatically extracts and saves the job details!</span>
          </li>
        </ol>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Install</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Download all extension files at once to start capturing jobs automatically from any job site.
            </p>
            <Button className="w-full" onClick={handleDownloadAll} disabled={downloading === "all"}>
              {downloading === "all" ? "DOWNLOADING..." : "DOWNLOAD ALL FILES"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📁 Download Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">Download extension files individually if needed.</p>
            <div className="space-y-2">
              {extensionFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between rounded border p-2">
                  <div>
                    <div className="font-mono text-sm font-bold">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{file.description}</div>
                  </div>
                  <Button size="sm" onClick={() => handleDownload(file.name)} disabled={downloading === file.name}>
                    {downloading === file.name ? "..." : "Download"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📋 Installation Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Download all 6 extension files above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Create a new folder called "job-automation-extension"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Move all downloaded files into this folder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Open Chrome and go to chrome://extensions/</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">5.</span>
                <span>Enable "Developer mode" (top right toggle)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">6.</span>
                <span>Click "Load unpacked" and select your extension folder</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✨ Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <h3 className="font-bold">AI-Powered Extraction</h3>
                  <p className="text-sm text-muted-foreground">Intelligent job data extraction from any page</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="font-bold">Clipboard-Based</h3>
                  <p className="text-sm text-muted-foreground">Simple copy-paste workflow, no API calls needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <h3 className="font-bold">Works Everywhere</h3>
                  <p className="text-sm text-muted-foreground">Compatible with all job sites and platforms</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard">BACK TO DASHBOARD</Link>
        </Button>
      </div>
    </div>
  )
}
