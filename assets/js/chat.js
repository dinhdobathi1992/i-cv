class ChatInterface {
  static updateWelcomeMessage() {
    const welcomeEl = document.querySelector('#askme .section-title p');
    if (welcomeEl) {
      welcomeEl.innerHTML = `
        I can help you find information about my background and experience. Try asking about:
        <br>• Experience or work history
        <br>• Education and certifications
        <br>• Technical skills
        <br>• Specific technologies (AWS, Kubernetes, DevOps)
        <br>• Current role and responsibilities
      `;
    }
  }

  constructor() {
    this.messages = [];
    this.messageContainer = document.getElementById("chat-messages");
    this.userInput = document.getElementById("user-input");
    this.sendButton = document.getElementById("send-button");
    this.websiteContext = this.gatherWebsiteContent();

    this.init();

    // Add export button handler
    this.exportButton = document.getElementById('export-pdf');
    if (this.exportButton) {
      this.exportButton.addEventListener('click', () => this.exportToPDF());
    }
  }

  init() {
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });
  }

  gatherWebsiteContent() {
    const aboutSection =
      document.querySelector("#about .section-title p")?.textContent || "";

    const skillsSection = Array.from(
      document.querySelectorAll("#skills .skill")
    )
      .map((skill) => skill.textContent.split("  ")[0])
      .join(", ");

    const experienceSection = Array.from(
      document.querySelectorAll("#resume .resume-item")
    )
      .map((item) => {
        const title = item.querySelector("h4")?.textContent || "";
        const date = item.querySelector("h5")?.textContent || "";
        const company = item.querySelector("em")?.textContent || "";
        const details = Array.from(item.querySelectorAll("li"))
          .map((li) => li.textContent)
          .join(". ");
        return `- ${title} at ${company} (${date})\n  ${details}`;
      })
      .join("\n");

    const educationSection = Array.from(
      document.querySelectorAll("#portfolio .resume-item")
    )
      .map((item) => {
        const degree = item.querySelector("h4")?.textContent || "";
        const year = item.querySelector("h5")?.textContent || "";
        const school = item.querySelector("em")?.textContent || "";
        return `- ${degree} from ${school} (${year})`;
      })
      .join("\n");

    return `
            ABOUT ME:
            ${aboutSection}

            PROFESSIONAL EXPERIENCE:
            ${experienceSection}

            EDUCATION:
            ${educationSection}

            SKILLS:
            ${skillsSection}
        `.trim();
  }

  async sendMessage() {
    const userMessage = this.userInput.value.trim();
    if (!userMessage) return;

    this.addMessageToChat("user", userMessage);
    this.userInput.value = "";

    try {
      this.addLoadingIndicator();
      const response = await this.callAI(userMessage);
      this.removeLoadingIndicator();
      this.addMessageToChat("ai", response);
    } catch (error) {
      console.error("Detailed error:", error);
      this.removeLoadingIndicator();
      this.addMessageToChat(
        "error",
        `Error: ${error.message || "Something went wrong. Please try again."}`
      );
    }
  }

  getSkillLevel(percentage) {
    if (percentage >= 90) return "expert";
    if (percentage >= 80) return "highly proficient";
    if (percentage >= 70) return "proficient";
    if (percentage >= 60) return "competent";
    return "familiar";
  }

  getDetailedSkillResponse(skill) {
    const skillResponses = {
      kubernetes:
        "I specialize in Kubernetes and container orchestration, managing over 40 clusters. My expertise includes Helm chart development, implementing security best practices, and automating Kubernetes operations.",
      aws: "I'm an AWS Certified Solutions Architect with extensive experience in cloud platforms. I work with services like EKS, EC2, S3, and focus on cloud architecture design and optimization.",
      terraform:
        "I specialize in Infrastructure as Code using Terraform, implementing and maintaining infrastructure for multiple environments with a focus on consistency and security.",
      security:
        "I implement and maintain security controls following ISO 27001 standards, conduct assessments, and ensure infrastructure meets security requirements.",
      cicd: "I have extensive experience with CI/CD tools like Github Actions and Harness. I've significantly improved pipeline performance and implemented automated deployment strategies.",
      system:
        "I have comprehensive expertise in system administration across Windows, Linux, and MacOS platforms, including system optimization, troubleshooting, and automation.",
      scripting:
        "I create automation solutions using Shell and PowerShell scripting for various operational tasks and system management.",
      monitoring:
        "I implement comprehensive observability solutions, including metrics collection, alerting systems, and performance monitoring dashboards.",
    };

    return (
      skillResponses[skill] ||
      "I have experience with this technology and can provide more specific details if needed."
    );
  }

  async callAI(message) {
    try {
      const query = message.toLowerCase();
      const context = this.websiteContext;

      if (
        query.includes("skill") ||
        query.includes("technology") ||
        query.includes("tech") ||
        query.includes("tools")
      ) {
        return `My key technical proficiencies include:

1. Kubernetes & Container Orchestration
   • Managing 40+ production clusters
   • Helm chart development and deployment
   • Container security and best practices

2. Cloud Platforms - AWS/Azure
   • AWS Solutions Architect certified
   • Experience with EKS, EC2, S3
   • Cloud architecture and optimization

3. Infrastructure as Code
   • Terraform for multi-environment deployments
   • Infrastructure automation
   • State management and security

4. CI/CD & Automation
   • Harness and GitHub Actions expertise
   • Optimized pipeline runtimes
   • Automated deployment strategies

5. System Administration
   • Windows, Linux, MacOS platforms
   • System optimization and troubleshooting
   • Infrastructure automation

6. Additional Skills
   • Shell/PowerShell scripting
   • Monitoring & observability
   • ISO 27001 security compliance

Would you like details about any specific skill or technology?`;
      }

      // Enhanced response mapping with more context and variations
      if (
        query.includes("experience") ||
        query.includes("work") ||
        query.includes("history")
      ) {
        if (query.includes("recent")) {
          return "In my current role at GFT Group, I manage Kubernetes clusters, handle CI/CD pipelines with Harness, and ensure infrastructure security. Previously at Manabie, I improved pipeline runtime by 30% and led incident response efforts.";
        }
        if (query.includes("years") || query.includes("long")) {
          return "I have 9 years of experience in IT, starting as a System Administrator and progressing to Senior DevOps Engineer. Throughout this journey, I've worked with financial institutions and technology companies, focusing on infrastructure automation and cloud technologies.";
        }
        return this.findInContext("PROFESSIONAL EXPERIENCE:", context, 5); // Show more experience entries
      }

      if (
        query.includes("education") ||
        query.includes("study") ||
        query.includes("certificate") ||
        query.includes("certification")
      ) {
        if (query.includes("aws")) {
          return "I hold an AWS Certified Solutions Architect – Associate certification (2023), demonstrating my expertise in designing distributed systems on AWS.";
        }
        if (query.includes("kubernetes")) {
          return "I have both CKA (Certified Kubernetes Administrator) and CKS (Certified Kubernetes Security Specialist) certifications from 2022, showing my deep expertise in Kubernetes administration and security.";
        }
        return this.findInContext("EDUCATION:", context, 4);
      }

      if (
        query.includes("about") ||
        query.includes("who") ||
        query.includes("background") ||
        query.includes("intro")
      ) {
        return (
          this.findInContext("ABOUT ME:", context) +
          "\n\nI specialize in DevOps practices and have a strong focus on automation, security, and reliability."
        );
      }

      if (query.includes("aws") || query.includes("cloud")) {
        if (query.includes("project") || query.includes("work")) {
          return "In my cloud infrastructure work, I've managed over 40 Kubernetes clusters on AWS, implemented infrastructure as code using Terraform, and ensured security compliance. I have hands-on experience with various AWS services including EKS, EC2, S3, and CloudFormation.";
        }
        return "I have extensive AWS experience, holding an AWS Solutions Architect certification. My work involves managing cloud infrastructure, implementing security best practices, and optimizing cloud resources for cost and performance.";
      }

      if (query.includes("kubernetes") || query.includes("k8s")) {
        if (query.includes("security")) {
          return "I hold the CKS (Certified Kubernetes Security Specialist) certification and have implemented security best practices across multiple Kubernetes clusters. This includes pod security policies, network policies, and secure container configurations.";
        }
        return "I'm a certified Kubernetes administrator (CKA) with extensive experience managing over 40 clusters. I work with Helm charts, handle cluster upgrades, and implement automation for Kubernetes operations.";
      }

      if (
        query.includes("devops") ||
        query.includes("ci") ||
        query.includes("cd") ||
        query.includes("pipeline")
      ) {
        if (query.includes("tools")) {
          return "I work with various DevOps tools including Harness for CI/CD, Terraform for IaC, GitHub Actions, and monitoring solutions. I've successfully reduced pipeline runtime by 30% and implemented automated deployment strategies.";
        }
        return "As a Senior DevOps Engineer, I focus on increasing velocity, reliability, and quality with a high emphasis on security. I've implemented CI/CD pipelines, managed infrastructure as code, and led incident response efforts.";
      }

      // Default response with guidance
      return `I can provide information about my:
      • Professional experience and work history
      • Education and certifications
      • Technical skills and tools
      • Specific experience with AWS, Kubernetes, or DevOps practices

      What would you like to know more about?`;
    } catch (error) {
      console.error("Error details:", error);
      throw error;
    }
  }

  findInContext(section, context, limit = 3) {
    const sectionStart = context.indexOf(section);
    if (sectionStart === -1) return "I don't have that information available.";

    const nextSection = context.indexOf(":", sectionStart + section.length);
    const sectionEnd = nextSection === -1 ? context.length : nextSection;

    return context
      .substring(sectionStart + section.length, sectionEnd)
      .trim()
      .split("\n")
      .slice(0, limit) // Configurable limit for number of items
      .join("\n");
  }

  addMessageToChat(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${content}</span>
                <small class="message-time">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
    this.messageContainer.appendChild(messageDiv);
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  addLoadingIndicator() {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-indicator";
    loadingDiv.className = "chat-message ai-message";
    loadingDiv.innerHTML =
      '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
    this.messageContainer.appendChild(loadingDiv);
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  removeLoadingIndicator() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  async exportToPDF() {
    const chatContent = document.getElementById('chat-messages');
    if (!chatContent || chatContent.children.length === 0) {
      alert('No conversation to export yet!');
      return;
    }

    // Create a new container for PDF content
    const pdfContainer = document.createElement('div');
    pdfContainer.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #149ddd; margin-bottom: 20px;">Chat Conversation</h2>
            <p style="margin-bottom: 20px;">
                Date: ${new Date().toLocaleString()}<br>
                Website: ${window.location.origin}
            </p>
            <div class="chat-content">
                ${chatContent.innerHTML}
            </div>
        </div>
    `;

    // Configure PDF options
    const opt = {
      margin: [10, 10],
      filename: 'chat-conversation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    try {
      // Show loading state
      this.exportButton.disabled = true;
      this.exportButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';

      // Generate PDF
      await html2pdf().set(opt).from(pdfContainer).save();

      // Reset button
      this.exportButton.disabled = false;
      this.exportButton.innerHTML = '<i class="bx bx-download"></i>';
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');

      // Reset button
      this.exportButton.disabled = false;
      this.exportButton.innerHTML = '<i class="bx bx-download"></i>';
    }
  }

  // Add this method to format messages for PDF
  formatMessageForPDF(message) {
    const timestamp = new Date().toLocaleTimeString();
    return `
        <div class="chat-message-pdf">
            <div class="message-time">${timestamp}</div>
            <div class="message-content">${message}</div>
        </div>
    `;
  }
}

// Initialize the welcome message when the page loads
document.addEventListener("DOMContentLoaded", () => {
  ChatInterface.updateWelcomeMessage();
  const chat = new ChatInterface();
});
