// Background script for JobBot Chrome Extension
class JobBotBackground {
  constructor() {
    this.init()
  }

  init() {
    this.setupInstallListener()
    this.setupTabUpdateListener()
    this.setupMessageListener()
  }

  setupInstallListener() {
    window.chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        // Open welcome page on first install
        window.chrome.tabs.create({
          url: "http://localhost:3000/extension-welcome",
        })
      }
    })
  }

  setupTabUpdateListener() {
    window.chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        this.checkJobSite(tab)
      }
    })
  }

  setupMessageListener() {
    window.chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "captureJob") {
        this.handleJobCapture(request.data, sendResponse)
        return true // Keep message channel open for async response
      }
    })
  }

  checkJobSite(tab) {
    const supportedSites = [
      "linkedin.com/jobs",
      "indeed.com",
      "glassdoor.com",
      "jobs.google.com",
      "stackoverflow.com/jobs",
      "angel.co",
      "wellfound.com",
    ]

    const isJobSite = supportedSites.some((site) => tab.url.includes(site))

    if (isJobSite) {
      // Update extension badge
      window.chrome.action.setBadgeText({
        tabId: tab.id,
        text: "!",
      })

      window.chrome.action.setBadgeBackgroundColor({
        tabId: tab.id,
        color: "#ff6b35",
      })
    } else {
      window.chrome.action.setBadgeText({
        tabId: tab.id,
        text: "",
      })
    }
  }

  async handleJobCapture(data, sendResponse) {
    try {
      // Get user email from storage
      const result = await window.chrome.storage.sync.get(["jobbot_email"])

      if (!result.jobbot_email) {
        sendResponse({ success: false, error: "No user email found" })
        return
      }

      // Send to API
      const response = await fetch("http://localhost:3000/api/jobs/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: result.jobbot_email,
          jobData: data,
        }),
      })

      const result_1 = await response.json()
      sendResponse({ success: response.ok, data: result_1 })
    } catch (error) {
      console.error("Background capture error:", error)
      sendResponse({ success: false, error: error.message })
    }
  }
}

// Initialize background script
new JobBotBackground()
