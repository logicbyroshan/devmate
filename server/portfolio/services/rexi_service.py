"""
Rexi AI Assistant Service (Qwen3-0.6B Integration & Grounded Fallback Engine).
Answers queries in strict 3rd person perspective using dynamic DB context
(UserProfile, Projects, Skills, Experience, Achievements, Categories).
"""

import json
import os
import random
import urllib.request
from typing import Any, Dict, Optional
from ..models import (
    Achievement,
    Category,
    Experience,
    Project,
    Skill,
    UserProfile,
)
from .security_service import SecurityService


class RexiChatService:
    """Service to generate Rexi AI assistant responses."""

    DEFAULT_MODEL = "Qwen3-0.6B-Instruct"

    @classmethod
    def get_portfolio_context(cls) -> Dict[str, Any]:
        """Extract and format dynamic portfolio knowledge base directly from DB."""
        profile = UserProfile.objects.first()
        full_name = profile.full_name if profile and profile.full_name else "Roshan Damor"
        title = profile.title if profile and profile.title else "AI Full Stack Developer"
        raw_bio = profile.bio if profile and profile.bio else ""

        if not raw_bio or "[Well-known" in raw_bio or "0+ years" in raw_bio:
            bio = "Building AI-powered solutions, scalable web apps, and modern cloud applications."
        else:
            bio = raw_bio

        location = profile.location if profile and profile.location else "India"
        email = profile.email if profile and profile.email else "mail@logicbyroshan.in"
        github = profile.github if profile and profile.github else "https://github.com/logicbyroshan"
        linkedin = profile.linkedin if profile and profile.linkedin else "https://linkedin.com/in/roshandamor"
        work_type = profile.get_work_type_display() if profile else "Remote / Flexible"
        status_str = profile.get_status_display() if profile else "Available for Work"

        # Projects
        db_projects = list(Project.objects.filter(is_active=True).order_by('-order', '-created_at')[:6])
        project_items = []
        for p in db_projects:
            p_name = p.project_name or p.title
            techs = p.technologies or ""
            desc = (p.description or "")[:120]
            project_items.append(f"• **{p_name}**: {desc} (Stack: {techs})")
        projects_summary = (
            "\n".join(project_items)
            if project_items
            else "• **CardFlow**: Enterprise ID Card Data Management System\n• **JobPilot**: AI-Based Job Hunter\n• **VidyaFlow**: AI School Management"
        )

        # Skills
        db_skills = list(Skill.objects.filter(is_active=True, is_draft=False).order_by('-proficiency'))
        skill_names = [s.name for s in db_skills]
        top_skills_str = (
            ", ".join(skill_names[:12])
            if skill_names
            else "React, Next.js, Node.js, Python, Django, FastAPI, AWS, Docker, PostgreSQL, MongoDB, TypeScript"
        )
        expert_skills = [s.name for s in db_skills if s.proficiency >= 80 or s.skill_level in ['expert', 'advanced']]
        top_spec = ", ".join(expert_skills[:6]) if expert_skills else "React, Python, Django, Next.js, AWS, PostgreSQL"

        # Experience
        db_exp = list(Experience.objects.filter(is_active=True, is_draft=False).order_by('-order', '-start_date')[:4])
        exp_items = [f"• **{e.position}** at **{e.company_name}** ({e.duration})" for e in db_exp]
        exp_summary = (
            "\n".join(exp_items)
            if exp_items
            else "• **Software Engineer & AI Full Stack Developer**: Building high-concurrency web systems."
        )

        # Achievements
        db_achievements = list(Achievement.objects.filter(is_active=True, is_draft=False).order_by('-achievement_date')[:4])
        ach_items = [f"• **{a.title}** by {a.issuing_organization}" for a in db_achievements]
        ach_summary = (
            "\n".join(ach_items)
            if ach_items
            else "• **1300+ DSA Problems Solved** across LeetCode & CodeForces\n• **12+ Hackathon Wins**\n• **27+ Open Source Repositories**"
        )

        return {
            "full_name": full_name,
            "title": title,
            "bio": bio,
            "location": location,
            "email": email,
            "github": github,
            "linkedin": linkedin,
            "work_type": work_type,
            "status_str": status_str,
            "top_skills_str": top_skills_str,
            "top_spec": top_spec,
            "projects_summary": projects_summary,
            "exp_summary": exp_summary,
            "ach_summary": ach_summary,
        }

    @classmethod
    def call_huggingface_llm(cls, system_prompt: str, hf_token: str) -> Optional[str]:
        """Perform inference call to HuggingFace hosted Qwen model."""
        try:
            req_data = json.dumps({
                "inputs": system_prompt,
                "parameters": {"max_new_tokens": 250, "temperature": 0.7, "return_full_text": False},
            }).encode('utf-8')

            req = urllib.request.Request(
                "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-0.5B-Instruct",
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {hf_token}",
                },
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode('utf-8'))
                if isinstance(result, list) and len(result) > 0:
                    text = result[0].get("generated_text", "").strip()
                    if text:
                        return text
        except Exception:
            return None
        return None

    @classmethod
    def match_fallback_intent(cls, user_message: str, ctx: Dict[str, Any]) -> str:
        """Rule-based NLP matcher to produce grounded, engaging 3rd-person replies."""
        msg_lower = user_message.lower().strip()

        greetings_pool = [
            "Hey there! 🐉 I'm **Rexi**, Roshan's dragon AI assistant!",
            "Hello! 👋 I'm **Rexi**, powered by **Qwen3-0.6B**!",
            "Greetings! ⚡ I'm **Rexi**, Roshan's digital assistant!",
        ]

        # 1. Rexi Identity
        if any(w in msg_lower for w in ['who are you', 'who r u', 'who r you', 'what are you', 'your name', 'about yourself']) or msg_lower in ['who are you', 'who are u', 'who is rexi']:
            return random.choice([
                f"I'm **Rexi** 🐉 — the official dragon mascot & AI Assistant for {ctx['full_name']}'s portfolio, powered by **Qwen3-0.6B**!\n\nI can answer questions about Roshan's skills, projects, work experience, DSA statistics, or how to contact him. What would you like to know?",
                f"I am **Rexi**, an AI assistant built with **Qwen3-0.6B** to help visitors explore {ctx['full_name']}'s portfolio ⚡!\n\nFeel free to ask me about Roshan's background, featured projects, tech stack, or achievements!",
            ])

        # 2. About Roshan
        if any(w in msg_lower for w in ['roshan', 'who is he', 'about roshan', 'who is roshan', 'bio', 'background']):
            return random.choice([
                f"**{ctx['full_name']}** is a passionate **{ctx['title']}** based in {ctx['location']}! 🚀\n\n{ctx['bio']}\n\n• **Role**: {ctx['title']}\n• **Status**: {ctx['status_str']} ({ctx['work_type']})\n• **Problem Solving**: 1300+ solved DSA problems across LeetCode & CodeForces!",
                f"Meet **{ctx['full_name']}** — an innovative **{ctx['title']}** located in {ctx['location']}. {ctx['bio']}\n\nRoshan loves solving complex architectural challenges, creating elegant user interfaces, and training AI models!",
                f"**{ctx['full_name']}** is a full-stack engineer and AI specialist ({ctx['title']}) living in {ctx['location']}.\n\nHe has built multiple end-to-end applications, solved over **1300+ algorithms** on LeetCode, and is currently open to exciting tech opportunities!",
            ])

        # 3. Skills / Tech stack
        if any(w in msg_lower for w in ['skill', 'stack', 'tech', 'language', 'python', 'react', 'node', 'django', 'aws', 'docker', 'database']):
            return random.choice([
                f"Here is a look at **Roshan's core tech stack** 🛠️:\n\n• **Primary Expertise**: {ctx['top_spec']}\n• **Complete Toolset**: {ctx['top_skills_str']}\n\nRoshan selects optimal technologies to build scalable, high-performance web and AI platforms!",
                f"Roshan is highly skilled across full-stack software development 💻:\n\n• **Core Languages & Frameworks**: {ctx['top_skills_str']}\n• **Top Strengths**: {ctx['top_spec']}\n\nWhether it's frontend UX or backend microservices, Roshan has it covered!",
            ])

        # 4. Projects
        if any(w in msg_lower for w in ['project', 'work', 'build', 'app', 'portfolio', 'cardflow', 'jobpilot']):
            return random.choice([
                f"Here are some of **Roshan's top projects** 🔭:\n\n{ctx['projects_summary']}\n\nYou can explore live links and documentation for all of Roshan's projects in the Projects section!",
                f"Roshan has developed several impressive applications 🚀:\n\n{ctx['projects_summary']}\n\nFeel free to ask me more about any specific project!",
            ])

        # 5. DSA / Achievements
        if any(w in msg_lower for w in ['dsa', 'leetcode', 'codeforces', 'problem', 'algorithm', 'achievement', 'award', 'certif']):
            return random.choice([
                f"🧠 **Algorithms & Key Achievements**:\n\n{ctx['ach_summary']}\n\nRoshan possesses strong algorithmic thinking and system design fundamentals!",
                f"🏆 **Roshan's Milestones & Competitive Coding**:\n\n• Solved over **1300+ DSA problems** on LeetCode & CodeForces\n• Won awards in **12+ Hackathons**\n• Built **27+ Open Source** repositories",
            ])

        # 6. Contact
        if any(w in msg_lower for w in ['contact', 'email', 'reach', 'hire', 'message', 'phone', 'social', 'github', 'linkedin']):
            return random.choice([
                f"📩 **Connect with {ctx['full_name']}**:\n\n• **Email**: {ctx['email']}\n• **Location**: {ctx['location']}\n• **GitHub**: {ctx['github']}\n• **LinkedIn**: {ctx['linkedin']}\n\nYou can also leave a direct message via the contact form on this page!",
                f"Roshan is always happy to collaborate! Reach out to him at:\n\n• **Email**: {ctx['email']}\n• **LinkedIn**: {ctx['linkedin']}\n• **GitHub**: {ctx['github']}",
            ])

        # 7. Experience
        if any(w in msg_lower for w in ['experience', 'job', 'work history', 'career', 'company']):
            return f"💼 **Roshan's Professional Work Experience**:\n\n{ctx['exp_summary']}\n\nRoshan brings strong experience building scalable software and AI products."

        # 8. Greetings
        if any(w in msg_lower for w in ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good evening']):
            greeting = random.choice(greetings_pool)
            return f"{greeting}\n\nHow can I help you today? You can ask me about Roshan's skills, projects, work experience, achievements, or contact info!"

        # 9. Default Fallback
        return random.choice([
            f"I'm **Rexi**, {ctx['full_name']}'s AI assistant powered by **Qwen3-0.6B** 🐉!\n\nI can answer anything about Roshan's technical background, featured projects (CardFlow, JobPilot), 1300+ solved algorithms, or contact info ({ctx['email']}). What would you like to know?",
            f"As Rexi, I'm here to help you learn about **{ctx['full_name']}** ({ctx['title']})! Ask me about his tech stack, projects, experience, or achievements! What are you curious about?",
        ])

    @classmethod
    def generate_reply(cls, user_message: str) -> Dict[str, Any]:
        """Main service entry point for Rexi Chat."""
        clean_query = SecurityService.sanitize_text(user_message, max_length=1000)
        if not clean_query:
            return {
                "success": False,
                "message": "Please provide a valid query.",
                "reply": None,
                "model": cls.DEFAULT_MODEL,
            }

        ctx = cls.get_portfolio_context()

        # Build Qwen prompt in strict 3rd person
        system_prompt = (
            f"<|im_start|>system\n"
            f"You are Rexi, the friendly dragon AI assistant for {ctx['full_name']}'s portfolio powered by Qwen3-0.6B.\n"
            f"CRITICAL RULES:\n"
            f"1. When asked about yourself ('who are you', 'what is your name'), introduce yourself as Rexi, Roshan's AI assistant.\n"
            f"2. When asked about {ctx['full_name']} ('who is Roshan', skills, projects), speak strictly in 3rd-person perspective ('Roshan is...', 'He built...').\n"
            f"3. Only answer about Roshan when the user query is about Roshan or his work.\n\n"
            f"{ctx['full_name']}'s Background:\n"
            f"- Name: {ctx['full_name']} | Role: {ctx['title']} | Location: {ctx['location']}\n"
            f"- Bio: {ctx['bio']}\n"
            f"- Contact: Email: {ctx['email']} | GitHub: {ctx['github']} | LinkedIn: {ctx['linkedin']}\n"
            f"- Skills: {ctx['top_skills_str']}\n"
            f"- Projects:\n{ctx['projects_summary']}\n"
            f"- Achievements:\n{ctx['ach_summary']}\n"
            f"<|im_end|>\n"
            f"<|im_start|>user\n{clean_query}<|im_end|>\n"
            f"<|im_start|>assistant\n"
        )

        hf_token = os.getenv("HUGGINGFACE_API_KEY", os.getenv("HF_TOKEN", "")).strip()
        reply_text = None

        if hf_token:
            reply_text = cls.call_huggingface_llm(system_prompt, hf_token)

        if not reply_text:
            reply_text = cls.match_fallback_intent(clean_query, ctx)

        return {
            "success": True,
            "reply": reply_text,
            "model": cls.DEFAULT_MODEL,
        }
