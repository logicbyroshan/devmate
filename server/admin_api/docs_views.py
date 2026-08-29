"""
Interactive HTML API Documentation for Portfolio Admin REST API.
Renders a modern, responsive developer portal with live parameter descriptions,
curl snippets, authentication headers, and response schemas.
"""

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(["GET"])
@permission_classes([AllowAny])
def admin_api_docs(request):
    """Interactive HTML Documentation for Admin REST API."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevMate Admin REST API - Developer Portal & Reference</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --bg-primary: #0a0e17;
            --bg-secondary: #111827;
            --bg-card: #1f2937;
            --border: #374151;
            --text-primary: #f9fafb;
            --text-secondary: #9ca3af;
            --accent-blue: #3b82f6;
            --accent-cyan: #06b6d4;
            --accent-green: #10b981;
            --accent-amber: #f59e0b;
            --accent-red: #ef4444;
            --accent-purple: #8b5cf6;
            --code-bg: #0f172a;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        header {
            background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
            border-bottom: 1px solid var(--border);
            padding: 2.5rem 2rem;
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: blur(12px);
        }

        .header-container {
            max-width: 1300px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .logo-area { display: flex; align-items: center; gap: 1rem; }
        .logo-badge {
            background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
            padding: 0.5rem 0.85rem;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }
        h1 { font-size: 1.5rem; font-weight: 700; }
        .version-badge {
            background: rgba(16, 185, 129, 0.2);
            color: var(--accent-green);
            border: 1px solid var(--accent-green);
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .container {
            max-width: 1300px;
            margin: 2rem auto;
            padding: 0 1.5rem;
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .container { grid-template-columns: 1fr; }
            .sidebar { display: none; }
        }

        .sidebar {
            position: sticky;
            top: 120px;
            height: calc(100vh - 140px);
            overflow-y: auto;
            padding-right: 0.5rem;
        }

        .nav-group { margin-bottom: 1.5rem; }
        .nav-title {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .nav-link {
            display: block;
            padding: 0.4rem 0.75rem;
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        .nav-link:hover {
            color: white;
            background: var(--bg-card);
        }

        .main-content { min-width: 0; }

        .auth-banner {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .endpoint-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 12px;
            margin-bottom: 1.5rem;
            overflow: hidden;
            transition: border-color 0.2s;
        }
        .endpoint-card:hover { border-color: #4b5563; }

        .endpoint-header {
            padding: 1rem 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            user-select: none;
            background: rgba(31, 41, 55, 0.5);
            border-bottom: 1px solid var(--border);
        }

        .method-badge {
            font-family: 'Fira Code', monospace;
            font-weight: 700;
            font-size: 0.8rem;
            padding: 0.25rem 0.6rem;
            border-radius: 6px;
            text-transform: uppercase;
        }
        .method-get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
        .method-post { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
        .method-put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
        .method-patch { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid #8b5cf6; }
        .method-delete { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }

        .endpoint-path {
            font-family: 'Fira Code', monospace;
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--text-primary);
            flex: 1;
        }

        .endpoint-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .endpoint-body {
            padding: 1.25rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
        }
        @media (max-width: 800px) {
            .endpoint-body { grid-template-columns: 1fr; }
        }

        .code-block {
            background: var(--code-bg);
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 1rem;
            font-family: 'Fira Code', monospace;
            font-size: 0.82rem;
            overflow-x: auto;
            color: #cbd5e1;
            line-height: 1.5;
        }

        .block-title {
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .badge-secure {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            padding: 0.2rem 0.5rem;
            border-radius: 999px;
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.4);
            font-weight: 600;
        }
    </style>
</head>
<body>

<header>
    <div class="header-container">
        <div class="logo-area">
            <div class="logo-badge"><i class="fas fa-shield-halved"></i> DEV</div>
            <div>
                <h1>DevMate Portfolio Admin REST API <span class="version-badge">v1.0 (Staff)</span></h1>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Enterprise CRUD & Dynamic Asset Operations</p>
            </div>
        </div>
        <div>
            <span class="badge-secure"><i class="fas fa-lock"></i> Protected by Staff JWT & Role Guard</span>
        </div>
    </div>
</header>

<div class="container">
    <aside class="sidebar">
        <div class="nav-group">
            <div class="nav-title">Authentication</div>
            <a href="#auth-login" class="nav-link">Staff Login (JWT)</a>
            <a href="#auth-refresh" class="nav-link">Refresh Access Token</a>
            <a href="#auth-me" class="nav-link">Current Staff User</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Dynamic Projects</div>
            <a href="#projects-list" class="nav-link">List / Filter Projects</a>
            <a href="#projects-create" class="nav-link">Create Project (Multipart)</a>
            <a href="#projects-detail" class="nav-link">Get / Update / Delete</a>
            <a href="#projects-screenshots" class="nav-link">Upload Screenshots</a>
            <a href="#projects-reorder" class="nav-link">Reorder Projects</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Work Experience</div>
            <a href="#experience-crud" class="nav-link">Full Experience CRUD</a>
            <a href="#experience-workplace" class="nav-link">Workplace Images</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Skills & Certs</div>
            <a href="#skills-crud" class="nav-link">Skills CRUD</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Achievements</div>
            <a href="#achievements-crud" class="nav-link">Achievements CRUD</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Categories</div>
            <a href="#categories-crud" class="nav-link">Categories CRUD</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Profile & SEO</div>
            <a href="#profile-manage" class="nav-link">Personal Profile & Docs</a>
        </div>
        <div class="nav-group">
            <div class="nav-title">Inbox & Analytics</div>
            <a href="#messages-manage" class="nav-link">Contact Inbox</a>
            <a href="#analytics-dashboard" class="nav-link">Live Dashboard Stats</a>
        </div>
    </aside>

    <main class="main-content">
        <section class="auth-banner">
            <h2 style="font-size: 1.15rem; margin-bottom: 0.5rem;"><i class="fas fa-key" style="color: var(--accent-blue);"></i> Authentication Headers</h2>
            <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 0.75rem;">All Admin API endpoints require standard staff authorization. Attach your JWT Bearer token in the <code>Authorization</code> header:</p>
            <div class="code-block">Authorization: Bearer &lt;YOUR_JWT_ACCESS_TOKEN&gt;
X-CSRFToken: &lt;CSRF_TOKEN&gt; (Optional for JWT, required for session requests)</div>
        </section>

        <!-- 1. Authentication -->
        <h2 id="auth-login" style="margin-bottom: 1rem; font-size: 1.3rem;"><i class="fas fa-user-lock"></i> Staff Authentication</h2>

        <div class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-post">POST</span>
                <span class="endpoint-path">/api/v1/admin/auth/login/</span>
                <span class="endpoint-desc">Generate JWT access & refresh tokens</span>
            </div>
            <div class="endpoint-body">
                <div>
                    <div class="block-title">Request Payload (JSON)</div>
                    <pre class="code-block">{
  "username": "admin_username",
  "password": "your_secure_password"
}</pre>
                </div>
                <div>
                    <div class="block-title">Success Response (HTTP 200)</div>
                    <pre class="code-block">{
  "success": true,
  "access": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "mail@logicbyroshan.in",
    "is_staff": true
  }
}</pre>
                </div>
            </div>
        </div>

        <!-- 2. Projects -->
        <h2 id="projects-list" style="margin: 2rem 0 1rem 0; font-size: 1.3rem;"><i class="fas fa-folder-open"></i> Project Management CRUD</h2>

        <div class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-path">/api/v1/admin/projects/</span>
                <span class="endpoint-desc">List all projects with filtering</span>
            </div>
            <div class="endpoint-body">
                <div>
                    <div class="block-title">Query Parameters</div>
                    <pre class="code-block">?status=active|draft|completed
?is_active=true|false
?is_featured=true|false
?category=web-development
?search=portfolio
?page=1&page_size=20</pre>
                </div>
                <div>
                    <div class="block-title">Response (HTTP 200)</div>
                    <pre class="code-block">{
  "success": true,
  "count": 12,
  "results": [
    {
      "id": 1,
      "title": "DevMate Portfolio",
      "slug": "devmate-portfolio",
      "status": "active",
      "is_active": true,
      "technologies_list": ["React", "Django", "PostgreSQL"],
      "screenshots": [...]
    }
  ]
}</pre>
                </div>
            </div>
        </div>

        <div class="endpoint-card" id="projects-create">
            <div class="endpoint-header">
                <span class="method-badge method-post">POST</span>
                <span class="endpoint-path">/api/v1/admin/projects/</span>
                <span class="endpoint-desc">Create new project (Multipart or JSON)</span>
            </div>
            <div class="endpoint-body">
                <div>
                    <div class="block-title">Multipart Form Data Fields</div>
                    <pre class="code-block">title: "AI Code Assistant"
category_id: 2
description: "Rich text description"
technologies: "Python, PyTorch, React"
status: "active"
thumbnail: [File: thumbnail.jpg]
screenshots: [File: shot1.jpg, File: shot2.jpg]</pre>
                </div>
                <div>
                    <div class="block-title">Response (HTTP 201 Created)</div>
                    <pre class="code-block">{
  "success": true,
  "message": "Project 'AI Code Assistant' created successfully!",
  "data": {
    "id": 5,
    "slug": "ai-code-assistant",
    "thumbnail": "/media/projects/thumbnails/...",
    "screenshots": [...]
  }
}</pre>
                </div>
            </div>
        </div>

        <div class="endpoint-card" id="projects-detail">
            <div class="endpoint-header">
                <span class="method-badge method-patch">PATCH</span>
                <span class="endpoint-path">/api/v1/admin/projects/{id}/</span>
                <span class="endpoint-desc">Partial update project fields</span>
            </div>
            <div class="endpoint-body">
                <div>
                    <div class="block-title">Request Body (JSON / Form)</div>
                    <pre class="code-block">{
  "is_featured": true,
  "order": 10
}</pre>
                </div>
                <div>
                    <div class="block-title">Response (HTTP 200)</div>
                    <pre class="code-block">{
  "success": true,
  "message": "Project updated successfully!",
  "data": { ... }
}</pre>
                </div>
            </div>
        </div>

        <!-- 3. Live Analytics -->
        <h2 id="analytics-dashboard" style="margin: 2rem 0 1rem 0; font-size: 1.3rem;"><i class="fas fa-chart-line"></i> Dashboard & Analytics</h2>

        <div class="endpoint-card">
            <div class="endpoint-header">
                <span class="method-badge method-get">GET</span>
                <span class="endpoint-path">/api/v1/admin/analytics/dashboard/</span>
                <span class="endpoint-desc">Real-time aggregate counters and logs</span>
            </div>
            <div class="endpoint-body">
                <div>
                    <div class="block-title">Headers</div>
                    <pre class="code-block">Authorization: Bearer &lt;TOKEN&gt;</pre>
                </div>
                <div>
                    <div class="block-title">Response (HTTP 200)</div>
                    <pre class="code-block">{
  "success": true,
  "data": {
    "projects": { "total": 12, "active": 10, "views": 4520, "likes": 312 },
    "messages": { "total": 24, "unread": 3 },
    "skills": { "total": 18 },
    "experience": { "total": 6 }
  }
}</pre>
                </div>
            </div>
        </div>
    </main>
</div>

</body>
</html>"""
    return HttpResponse(html_content, content_type="text/html")
