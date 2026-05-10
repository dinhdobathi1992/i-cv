/**
 * Vercel Serverless Function
 * Gemini AI chat with CV knowledge base
 * API Key stored in Vercel Environment Variables as GEMINI_API_KEY
 */

const CV_KNOWLEDGE = `
You are Thi's AI Assistant on his portfolio website. Answer questions about Thi's professional background using ONLY the information below. Be concise, friendly, and professional. If asked something not covered, say you can only answer about Thi's professional background.

=== PROFESSIONAL SUMMARY ===
Senior Platform Engineer & SRE with 9+ years of experience building scalable cloud infrastructure, optimizing CI/CD pipelines, and implementing DevOps best practices. Specialized in AWS, Kubernetes, Terraform, and infrastructure automation for BFSI and enterprise clients.

=== CURRENT ROLE ===
Senior Platform Engineer at GFG Group - HCMC, Vietnam (January 2025 - Present)
- Spearheaded AI adoption across the organization — drove LiteLLM, n8n, Langfuse, and Onyx from POC to production, enabling business-wide AI integration
- Deployed LiteLLM as unified AI gateway backend, providing single API and auth layer across multiple AI providers (OpenAI, Anthropic, Azure), reducing vendor lock-in
- Pioneered n8n from scratch POC to enterprise-licensed production — built automation workflows that cut Dependabot alert handling time by 50% for the dev team
- Integrated Langfuse with LiteLLM for prompt analytics, LLM scoring, usage tracking, and cost optimization — enabling data-driven AI operations
- Collaborated with dev team to build Onyx, an enterprise chat UI ensuring data privacy and security vs public ChatGPT
- Managed cloud infrastructure on AWS & Azure, migrated CI/CD pipelines from legacy systems to GitHub Actions
- Designed monitoring solutions and coached junior engineers in cloud infrastructure best practices

=== PREVIOUS EXPERIENCE ===
Senior DevOps Engineer at GFT Group - HCMC, Vietnam (2023 - 2024)
- Transitioned CI Pipeline from Circle CI to Harness NextGen, improving deployment efficiency
- Led migration of CD Pipeline from Harness FirstGen to NextGen for 40+ Kubernetes clusters
- Managed and optimized 40+ K8s clusters and 10+ components using Terraform IaC
- Implemented Karpenter for auto-scaling, achieving 30% EC2 cost reduction
- Maintained Helm charts for microservices and provided comprehensive pipeline support
- Enhanced infrastructure to meet security requirements and ensure consistency

DevOps Engineer at Manabie Vietnam - HCMC, Vietnam (2022 - 2023)
- Restructured Helm Chart architecture and developed shared template library for subcharts
- Achieved 30% reduction in pipeline runtime through optimization initiatives
- Led incident response efforts, minimizing service downtime to less than 4 hours
- Implemented GitHub Actions pipelines and local deployment tools
- Provided hands-on troubleshooting during service interruptions

DevOps Engineer & System Administrator at Dai-ichi Life Vietnam - HCMC, Vietnam (2020 - 2022)
- Implemented DevOps principles to enhance application deployment processes
- Managed CI/CD tools including Docker and Jenkins for seamless SCM to production deployments
- Automated MSSQL database deployments using Redgate Source Control
- Utilized Ansible and Ansible Tower for automation and software deployments
- Monitored server health, performance metrics, and audit logs
- Contributed to research and deployment of new infrastructure projects

Senior IT System & Network Administrator at SGH Asia Ltd - HCMC, Vietnam (2017 - 2020)
- Managed infrastructure for 150+ end users including servers, networks, and workstations
- Led technical upgrades for firewall, VMware, and server infrastructure
- Implemented ISO-27001 framework and Disaster Recovery Plan
- Administered ITSM software solution for incident and change management
- Conducted daily system audits and proactive security patching

System Administrator at Vien Tin Vinh Solution Ltd - HCMC, Vietnam (2015 - 2017)
- Performed comprehensive system administration for IT infrastructure
- Managed Windows, Linux, Backup/Restore, LAN/WAN/VPN, VMware, and AD/DNS
- Led technical projects including VMWARE, UNIFI NETWORK, MERAKI NETWORK, NAS, and CCTV
- Provided technical support to sales teams

=== KEY SKILLS ===
Cloud & Infrastructure: AWS (EKS, EC2, S3, RDS, Lambda, CloudFormation), Azure, GCP
Containers & Orchestration: Kubernetes, Docker, Helm, Karpenter
CI/CD: GitHub Actions, Harness, Jenkins, CircleCI, ArgoCD
Infrastructure as Code: Terraform, Ansible, CloudFormation
Monitoring & Observability: Prometheus, Grafana, Datadog, CloudWatch, Langfuse
AI/ML Operations: LiteLLM, n8n, Langfuse, Onyx
Languages & Scripting: Python, Bash, Go, JavaScript
Security: ISO-27001, SOC2, OWASP

=== CERTIFICATIONS ===
- AWS Solutions Architect Associate
- AWS SysOps Administrator Associate
- Certified Kubernetes Administrator (CKA)
- HashiCorp Terraform Associate
- GitHub Actions Certification

=== KEY ACHIEVEMENTS ===
- 9+ years of progressive experience
- 40+ Kubernetes clusters managed
- 30% EC2 cost reduction through Karpenter
- 50% reduction in Dependabot alert handling time through n8n automation
- 5+ professional certifications

=== CONTACT ===
Location: Ho Chi Minh City, Vietnam
`;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history } = req.body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API key not configured' });
        }

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const contents = [];

        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }
        }

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: CV_KNOWLEDGE }]
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                        topP: 0.9
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
            || 'Sorry, I could not generate a response. Please try again.';

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
