// Content script for JobBot Chrome Extension
class JobBotContentScript {
  constructor() {
    this.init()
  }

  init() {
    this.addJobBotButton()
    this.setupMessageListener()
  }

  addJobBotButton() {
    // Only add button on supported job sites
    const url = window.location.href
    const supportedSites = ["linkedin.com/jobs", "indeed.com", "glassdoor.com", "jobs.google.com"]

    const isJobSite = supportedSites.some((site) => url.includes(site))
    if (!isJobSite) return

    // Create JobBot capture button
    const button = document.createElement("div")
    button.id = "jobbot-capture-btn"
    button.innerHTML = `
      <div class="jobbot-btn">
        <span>📋</span>
        <span>Capture with JobBot</span>
      </div>
    `

    button.addEventListener("click", () => {
      this.captureJobFromPage()
    })

    // Add to page
    document.body.appendChild(button)

    // Show button after a delay
    setTimeout(() => {
      button.classList.add("visible")
    }, 1000)
  }

  async captureJobFromPage() {
    try {
      // Get user email from storage
      const result = await window.chrome.storage.sync.get(["jobbot_email"])
      if (!result.jobbot_email) {
        this.showNotification("Please connect your JobBot account first", "error")
        return
      }

      this.showNotification("Capturing job...", "info")

      // Extract job data
      const jobData = this.extractJobData()

      if (!jobData.title) {
        this.showNotification("Could not extract job data from this page", "error")
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
          jobData: {
            ...jobData,
            sourceUrl: window.location.href,
            rawHtml: document.documentElement.outerHTML,
          },
        }),
      })

      if (response.ok) {
        this.showNotification("Job captured successfully! 🎉", "success")
      } else {
        throw new Error("Failed to capture job")
      }
    } catch (error) {
      console.error("Capture error:", error)
      this.showNotification("Failed to capture job", "error")
    }
  }

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
        requirements: document.querySelector(".jobs-box__html-content")?.textContent?.trim(),
        jobType: this.extractJobType(),
        salaryRange: this.extractSalary(),
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
        requirements: document.querySelector("#jobDescriptionText")?.textContent?.trim(),
        jobType: this.extractJobType(),
        salaryRange: this.extractSalary(),
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
        requirements: document.querySelector('[data-test="jobDescriptionContent"]')?.textContent?.trim(),
        jobType: this.extractJobType(),
        salaryRange: this.extractSalary(),
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

  extractJobType() {
    const text = document.body.textContent.toLowerCase()
    if (text.includes("full-time") || text.includes("full time")) return "full-time"
    if (text.includes("part-time") || text.includes("part time")) return "part-time"
    if (text.includes("contract")) return "contract"
    if (text.includes("freelance")) return "freelance"
    if (text.includes("internship")) return "internship"
    return "full-time" // default
  }

  extractSalary() {
    const text = document.body.textContent
    const salaryRegex = /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*(?:year|hour|month))?/gi
    const matches = text.match(salaryRegex)
    return matches ? matches[0] : null
  }

  showNotification(message, type) {
    // Remove existing notification
    const existing = document.getElementById("jobbot-notification")
    if (existing) existing.remove()

    // Create notification
    const notification = document.createElement("div")
    notification.id = "jobbot-notification"
    notification.className = `jobbot-notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => notification.classList.add("visible"), 100)

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("visible")
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  setupMessageListener() {
    window.chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "extractJobData") {
        const jobData = this.extractJobData()
        sendResponse(jobData)
      }
    })
  }
}

// Initialize content script
new JobBotContentScript()
