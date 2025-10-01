// Popup script for JobBot Chrome Extension
class JobBotPopup {
  constructor() {
    this.apiUrl = "http://localhost:3000" // Change to production URL
    this.userEmail = null
    this.chrome = window.chrome // Declare the chrome variable
    this.init()
  }

  async init() {
    await this.loadUserData()
    this.setupEventListeners()
    this.checkCurrentPage()
  }

  async loadUserData() {
    try {
      const result = await this.chrome.storage.sync.get(["jobbot_email"])
      if (result.jobbot_email) {
        this.userEmail = result.jobbot_email
        this.showMainContent()
      } else {
        this.showLoginForm()
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      this.showLoginForm()
    }
  }

  setupEventListeners() {
    // Login form
    document.getElementById("loginBtn").addEventListener("click", () => this.handleLogin())
    document.getElementById("signupLink").addEventListener("click", () => this.openSignup())

    // Main content
    document.getElementById("captureBtn").addEventListener("click", () => this.captureJob())
    document.getElementById("manualBtn").addEventListener("click", () => this.openManualEntry())
    document.getElementById("dashboardBtn").addEventListener("click", () => this.openDashboard())

    // Enter key for login
    document.getElementById("emailInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleLogin()
      }
    })
  }

  async handleLogin() {
    const email = document.getElementById("emailInput").value.trim()
    if (!email) {
      this.showStatus("Please enter your email", "error")
      return
    }

    try {
      // Save email to storage
      await this.chrome.storage.sync.set({ jobbot_email: email })
      this.userEmail = email
      this.showMainContent()
      this.showStatus("Connected successfully!", "success")
    } catch (error) {
      console.error("Login error:", error)
      this.showStatus("Connection failed", "error")
    }
  }

  async captureJob() {
    if (!this.userEmail) {
      this.showStatus("Please connect your account first", "error")
      return
    }

    this.showStatus("Capturing job...", "info")
    document.getElementById("captureBtn").disabled = true

    try {
      // Get current tab
      const [tab] = await this.chrome.tabs.query({ active: true, currentWindow: true })

      // Execute content script to extract job data
      const results = await this.chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractJobData,
      })

      const jobData = results[0].result

      if (!jobData || !jobData.title) {
        this.showStatus("Could not extract job data from this page", "error")
        return
      }

      // Send to API
      const response = await fetch(`${this.apiUrl}/api/jobs/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: this.userEmail,
          jobData: {
            ...jobData,
            sourceUrl: tab.url,
            rawHtml: document.documentElement.outerHTML,
          },
        }),
      })

      if (response.ok) {
        this.showStatus("Job captured successfully!", "success")
        setTimeout(() => {
          this.openDashboard()
        }, 1500)
      } else {
        throw new Error("Failed to capture job")
      }
    } catch (error) {
      console.error("Capture error:", error)
      this.showStatus("Failed to capture job", "error")
    } finally {
      document.getElementById("captureBtn").disabled = false
    }
  }

  // This function runs in the context of the current page
  extractJobData() {
    const url = window.location.href
    let jobData = {}

    // LinkedIn job extraction
    if (url.includes("linkedin.com/jobs")) {
      jobData = {
        title:
          document.querySelector(".top-card-layout__title")?.textContent?.trim() ||
          document.querySelector("h1")?.textContent?.trim(),
        company:
          document.querySelector(".topcard__flavor-row .topcard__flavor--black-link")?.textContent?.trim() ||
          document.querySelector(".top-card-layout__card .topcard__org-name-link")?.textContent?.trim(),
        location:
          document.querySelector(".topcard__flavor-row .topcard__flavor")?.textContent?.trim() ||
          document.querySelector(".top-card-layout__card .topcard__flavor")?.textContent?.trim(),
        description:
          document.querySelector(".description__text")?.textContent?.trim() ||
          document.querySelector(".jobs-box__html-content")?.textContent?.trim(),
        jobType: "full-time", // Default, could be extracted from page
      }
    }

    // Indeed job extraction
    else if (url.includes("indeed.com")) {
      jobData = {
        title:
          document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
          document.querySelector("h1")?.textContent?.trim(),
        company:
          document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ||
          document.querySelector(".icl-u-lg-mr--sm")?.textContent?.trim(),
        location:
          document.querySelector('[data-testid="job-location"]')?.textContent?.trim() ||
          document.querySelector(".icl-u-colorForeground--secondary")?.textContent?.trim(),
        description:
          document.querySelector("#jobDescriptionText")?.textContent?.trim() ||
          document.querySelector(".jobsearch-jobDescriptionText")?.textContent?.trim(),
        jobType: "full-time",
      }
    }

    // Glassdoor job extraction
    else if (url.includes("glassdoor.com")) {
      jobData = {
        title:
          document.querySelector('[data-test="job-title"]')?.textContent?.trim() ||
          document.querySelector("h2")?.textContent?.trim(),
        company:
          document.querySelector('[data-test="employer-name"]')?.textContent?.trim() ||
          document.querySelector(".strong")?.textContent?.trim(),
        location: document.querySelector('[data-test="job-location"]')?.textContent?.trim(),
        description:
          document.querySelector('[data-test="jobDescriptionContent"]')?.textContent?.trim() ||
          document.querySelector(".desc")?.textContent?.trim(),
        jobType: "full-time",
      }
    }

    // Generic extraction for other sites
    else {
      jobData = {
        title:
          document.querySelector("h1")?.textContent?.trim() ||
          document.querySelector('[class*="title"]')?.textContent?.trim(),
        company:
          document.querySelector('[class*="company"]')?.textContent?.trim() ||
          document.querySelector('[class*="employer"]')?.textContent?.trim(),
        location: document.querySelector('[class*="location"]')?.textContent?.trim(),
        description:
          document.querySelector('[class*="description"]')?.textContent?.trim() ||
          document.querySelector('[class*="content"]')?.textContent?.trim(),
        jobType: "full-time",
      }
    }

    // Clean up extracted data
    Object.keys(jobData).forEach((key) => {
      if (jobData[key]) {
        jobData[key] = jobData[key].replace(/\s+/g, " ").trim()
      }
    })

    return jobData
  }

  async checkCurrentPage() {
    try {
      const [tab] = await this.chrome.tabs.query({ active: true, currentWindow: true })
      const url = tab.url

      // Check if we're on a supported job site
      const supportedSites = [
        "linkedin.com/jobs",
        "indeed.com",
        "glassdoor.com",
        "jobs.google.com",
        "stackoverflow.com/jobs",
        "angel.co",
        "wellfound.com",
      ]

      const isJobSite = supportedSites.some((site) => url.includes(site))

      if (isJobSite && this.userEmail) {
        // Try to extract job preview
        const results = await this.chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: this.extractJobData,
        })

        const jobData = results[0].result
        if (jobData && jobData.title) {
          this.showJobPreview(jobData)
        }
      }
    } catch (error) {
      console.error("Error checking current page:", error)
    }
  }

  showJobPreview(jobData) {
    document.getElementById("jobTitle").textContent = jobData.title || "Unknown Title"
    document.getElementById("jobCompany").textContent = jobData.company || "Unknown Company"
    document.getElementById("jobLocation").textContent = jobData.location || "Unknown Location"
    document.getElementById("jobType").textContent = jobData.jobType || "Unknown Type"
    document.getElementById("jobPreview").style.display = "block"
  }

  showLoginForm() {
    document.getElementById("loginForm").classList.add("active")
    document.getElementById("mainContent").classList.remove("active")
  }

  showMainContent() {
    document.getElementById("loginForm").classList.remove("active")
    document.getElementById("mainContent").classList.add("active")
  }

  showStatus(message, type) {
    const statusEl = document.getElementById("statusMessage")
    statusEl.textContent = message
    statusEl.className = `status ${type}`
  }

  openSignup() {
    this.chrome.tabs.create({ url: `${this.apiUrl}/onboarding` })
  }

  openManualEntry() {
    this.chrome.tabs.create({ url: `${this.apiUrl}/dashboard/add-job` })
  }

  openDashboard() {
    this.chrome.tabs.create({ url: `${this.apiUrl}/dashboard` })
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new JobBotPopup()
})
