import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-6 inline-block border-4 border-black bg-yellow-300 px-4 py-2 font-bold uppercase tracking-wide shadow-[4px_4px_0px_#000000]">
              AI-POWERED JOB AUTOMATION
            </div>
            <h1 className="mb-6 text-4xl font-bold uppercase tracking-tight md:text-7xl">
              Stop Sending the Same
              <br />
              <span className="text-orange-500">Stupid CV</span>
              <br />
              to Every Job
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-gray-600 md:text-xl">
              JobBot automatically tailors your CV to match each job posting perfectly. Capture jobs with our Chrome
              extension, let AI align your experience with what employers want, and land more interviews.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex h-16 items-center justify-center border-4 border-black bg-orange-500 px-10 py-5 text-lg font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_#000000] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000] active:translate-x-2 active:translate-y-2 active:shadow-[0px_0px_0px_#000000]"
              >
                GET STARTED FREE
              </Link>
              <Link
                href="#features"
                className="inline-flex h-16 items-center justify-center border-4 border-black bg-white px-10 py-5 text-lg font-bold uppercase tracking-wide text-black shadow-[4px_4px_0px_#000000] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000] active:translate-x-2 active:translate-y-2 active:shadow-[0px_0px_0px_#000000]"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-5xl">How It Works</h2>
            <p className="text-lg font-medium text-gray-600">Three simple steps to automate your job applications</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-orange-500 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-bold uppercase">Upload Your CV</h3>
              <p className="text-gray-600">
                Upload your master CV and fill out your profile. Our AI learns your experience, skills, and
                achievements.
              </p>
            </div>

            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-teal-400 text-2xl font-bold text-black">
                2
              </div>
              <h3 className="mb-2 text-xl font-bold uppercase">Capture Jobs</h3>
              <p className="text-gray-600">
                Use our Chrome extension to capture job postings from any website. We extract all the key requirements
                automatically.
              </p>
            </div>

            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_#000000]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-yellow-300 text-2xl font-bold text-black">
                3
              </div>
              <h3 className="mb-2 text-xl font-bold uppercase">AI Generates Everything</h3>
              <p className="text-gray-600">
                Our AI creates a tailored CV and cover letter for each job, highlighting your most relevant experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-100 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase tracking-tight md:text-5xl">Why JobBot?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-orange-500">10x</div>
              <h3 className="mb-2 text-xl font-bold uppercase">Faster Applications</h3>
              <p className="text-gray-600">Apply to 10x more jobs in the same time</p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-teal-400">85%</div>
              <h3 className="mb-2 text-xl font-bold uppercase">Higher Response Rate</h3>
              <p className="text-gray-600">Tailored applications get more responses</p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-yellow-400">0</div>
              <h3 className="mb-2 text-xl font-bold uppercase">Hallucinations</h3>
              <p className="text-gray-600">AI only uses your real experience</p>
            </div>

            <div className="text-center">
              <div className="mb-4 text-4xl font-bold text-green-500">100%</div>
              <h3 className="mb-2 text-xl font-bold uppercase">Automated</h3>
              <p className="text-gray-600">Set it and forget it job applications</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mb-8 text-lg font-medium text-gray-600">
            Join thousands of job seekers who have automated their applications with JobBot
          </p>
          <Link
            href="/onboarding"
            className="inline-flex h-16 items-center justify-center border-4 border-black bg-orange-500 px-10 py-5 text-lg font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_#000000] transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_#000000] active:translate-x-2 active:translate-y-2 active:shadow-[0px_0px_0px_#000000]"
          >
            START FREE TRIAL
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-gray-100 px-4 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-bold uppercase tracking-wide">© 2025 JobBot. Built with AI, Designed for Results.</p>
        </div>
      </footer>
    </div>
  )
}
