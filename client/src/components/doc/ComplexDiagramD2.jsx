import React, { useState } from 'react';

const D2_DIAGRAM_SCENARIOS = {
  cardflow: {
    title: 'CardFlow Multi-Tenant VPC & Security Rings',
    d2Code: `vpc: Enterprise VPC {
  public_subnet: Public DMZ {
    alb: Application Load Balancer {
      shape: hexagon
    }
    waf: AWS WAF + DDoS Shield
  }
  
  app_subnet: Private App Subnet {
    django_cluster: Django App Cluster (Gunicorn) {
      instances: 4x c6i.large
    }
    celery_pool: Celery Worker Pool (16 concurrency)
  }
  
  data_subnet: Isolated Data Subnet {
    postgres_ha: PostgreSQL 16 Primary-Standby {
      shape: cylinder
    }
    redis_sentinel: Redis Cluster (In-Memory State)
  }
  
  storage_vault: Encrypted S3 Bucket (AES-256)
  
  alb -> django_cluster: SSL Terminated (gRPC/HTTPS)
  django_cluster -> celery_pool: Redis Task Queue
  celery_pool -> storage_vault: Direct Signed Multipart Upload
  celery_pool -> postgres_ha: Batch Commit Records
}`,
    layers: [
      {
        name: 'Layer 1: Edge & Public DMZ',
        color: '#38bdf8',
        icon: 'fas fa-shield-alt',
        nodes: ['Cloudflare DDoS Filter', 'TLS 1.3 Termination', 'Dual-Stack IPv4/IPv6'],
      },
      {
        name: 'Layer 2: Private Application Core',
        color: '#7c3aed',
        icon: 'fas fa-server',
        nodes: ['Gunicorn WSGI Workers', 'DRF Permission Validators', 'Workflow State Machine'],
      },
      {
        name: 'Layer 3: Asynchronous Computation',
        color: '#a78bfa',
        icon: 'fas fa-microchip',
        nodes: ['Automated Image Normalization', 'High-Res PDF Renderer', 'QR/Barcode Generator'],
      },
      {
        name: 'Layer 4: Data Integrity & Storage',
        color: '#4ade80',
        icon: 'fas fa-database',
        nodes: ['PostgreSQL WAL Replication', 'Redis In-Memory Session Cache', 'Encrypted S3 Media Store'],
      },
    ],
  },

  vidyamaxx: {
    title: 'VidyaMaxx AI-Integrated School Management Architecture',
    d2Code: `school_cloud: VidyaMaxx Hybrid Cloud {
  edge_gateway: API Gateway & Auth Guard {
    shape: hexagon
    rate_limiter: Redis Token Bucket
    jwt_auth: Multi-Tenant RBAC Guard
  }

  core_services: Application Cluster {
    academic_api: Academic & Grading Engine
    attendance_svc: Biometric & RFID Ingestion
    timetable_ai: Genetic Timetable Optimizer
  }

  ai_orchestrator: LLM & RAG Pipeline {
    rag_engine: LangChain / LlamaIndex
    vector_db: pgvector Embedding Store
    qwen_inference: Local Qwen3 AI Engine
  }

  storage_layer: Distributed Persistence {
    postgres_main: PostgreSQL 16 Multi-Tenant
    redis_cache: Redis State & Real-time PubSub
  }

  edge_gateway -> core_services: Authenticated REST / WebSocket
  core_services -> ai_orchestrator: Student Performance Context
  ai_orchestrator -> vector_db: Semantic Similarity Search
  core_services -> storage_layer: ACID Operations
}`,
    layers: [
      {
        name: 'Layer 1: Edge Gateway & Multi-Tenant RBAC',
        color: '#38bdf8',
        icon: 'fas fa-shield-alt',
        nodes: ['School-Scoped JWT Auth', 'Token Bucket Rate Limiting', 'Role Permission Guards'],
      },
      {
        name: 'Layer 2: Core Academic & Operations Services',
        color: '#7c3aed',
        icon: 'fas fa-school',
        nodes: ['Grading & Report Card Engine', 'Biometric Attendance Ingestion', 'Automated Timetable Optimizer'],
      },
      {
        name: 'Layer 3: AI Assistant & RAG Pipeline',
        color: '#a78bfa',
        icon: 'fas fa-brain',
        nodes: ['Contextual RAG Retriever', 'pgvector Semantic Embeddings', 'Student Progress Predictor'],
      },
      {
        name: 'Layer 4: Distributed Database & Cache',
        color: '#4ade80',
        icon: 'fas fa-database',
        nodes: ['PostgreSQL 16 Multi-Tenant DB', 'Redis Pub/Sub Real-time Hub', 'Encrypted Backup Vault'],
      },
    ],
  },

  printnexx: {
    title: 'PrintNexx Desktop Image Pipeline & Card Processing Architecture',
    d2Code: `desktop_pipeline: PrintNexx Engine {
  ui_layer: Electron & React Desktop GUI {
    file_watcher: Hot Folder Image Monitor
    preview_canvas: WebGL 300-DPI Visualizer
  }

  cv_worker: Python OpenCV Native Subprocess {
    face_detect: Haar Cascade / MTCNN Face Locator
    auto_crop: Aspect Ratio Auto-Crop (3:4)
    color_balance: Histogram Equalization & Tone Curve
  }

  batch_export: High-DPI Output Pipeline {
    pdf_compiler: PyPDF High-Res Thermal Layout
    barcode_gen: Code128 & QR Code Vector Renderer
    zip_archiver: Multi-Threaded Zip Streamer
  }

  ui_layer -> cv_worker: IPC Raw Image Buffers
  cv_worker -> batch_export: Normalized High-DPI Bitmaps
}`,
    layers: [
      {
        name: 'Layer 1: Desktop Shell & Hot Folder Watcher',
        color: '#38bdf8',
        icon: 'fas fa-desktop',
        nodes: ['Electron Main Process', 'Native File System Watcher', 'WebGL Real-Time Card Preview'],
      },
      {
        name: 'Layer 2: Computer Vision Processing Core',
        color: '#7c3aed',
        icon: 'fas fa-eye',
        nodes: ['OpenCV Face Detection & Alignment', 'Histogram Tone Equalization', 'Intelligent Margin Cropping'],
      },
      {
        name: 'Layer 3: Vector & Code Generation',
        color: '#a78bfa',
        icon: 'fas fa-barcode',
        nodes: ['Code128 Vector Barcodes', 'High-Density QR Code Generator', 'Dynamic Badge Overlays'],
      },
      {
        name: 'Layer 4: High-DPI Print Batch Compiler',
        color: '#4ade80',
        icon: 'fas fa-print',
        nodes: ['300 DPI Thermal Card Compositor', 'Multi-Page Sheet PDF Compiler', 'Direct Parallel Print Spooler'],
      },
    ],
  },

  eazetrip: {
    title: 'EazeTrip Tour Operations & Booking Engine Architecture',
    d2Code: `travel_platform: EazeTrip System {
  customer_edge: Web & Mobile Booking Portal {
    search_bar: Multi-Criteria Destination Filter
    booking_checkout: Razorpay / Stripe Payment Gateway
  }

  booking_core: Django REST Application Cluster {
    inventory_svc: Seat & Room Real-Time Allocation
    pricing_engine: Dynamic Pricing & Discount Rules
    voucher_gen: Automated PDF Ticket & Itinerary Compiler
  }

  data_vault: PostgreSQL & Redis {
    booking_db: PostgreSQL ACID Transaction Log
    session_redis: Real-Time Seat Hold Lock (10-min TTL)
  }

  customer_edge -> booking_core: HTTPS REST / Webhooks
  booking_core -> data_vault: Distributed Lock & Inventory Commit
}`,
    layers: [
      {
        name: 'Layer 1: Customer Booking Edge',
        color: '#38bdf8',
        icon: 'fas fa-plane-departure',
        nodes: ['Multi-Criteria Search Filter', 'Razorpay / Stripe Gateway', 'Mobile Itinerary View'],
      },
      {
        name: 'Layer 2: Tour Operations Core Logic',
        color: '#7c3aed',
        icon: 'fas fa-suitcase-rolling',
        nodes: ['Dynamic Tour Package Builder', 'Real-Time Seat & Room Allocation', 'Automated PDF Voucher Compiler'],
      },
      {
        name: 'Layer 3: Real-Time State & Concurrency Lock',
        color: '#a78bfa',
        icon: 'fas fa-lock',
        nodes: ['Redis Distributed Inventory Locks', '10-Minute Cart Reservation TTL', 'Idempotent Payment Webhooks'],
      },
      {
        name: 'Layer 4: Relational ACID Transactions',
        color: '#4ade80',
        icon: 'fas fa-database',
        nodes: ['PostgreSQL Booking Ledger', 'Customer CRM & History', 'Vendor Settlement Logs'],
      },
    ],
  },

  taskflixx: {
    title: 'TaskFlixx AI Task State Machine & Priority Scheduler',
    d2Code: `task_system: TaskFlixx Cloud {
  frontend_app: React SPA Client {
    drag_drop: Kanban Board State Manager
    voice_input: Web Speech Audio Transcriber
  }

  task_backend: Django REST & Celery {
    task_crud: CRUD & State Transition Engine
    ai_classifier: LLM Auto-Categorization & Priority Estimator
    reminder_scheduler: Celery Beat Cron Reminder
  }

  storage: Database & Queue {
    task_db: PostgreSQL Indexed by User & Priority
    event_queue: Redis Stream Notification Broker
  }

  frontend_app -> task_backend: REST API & WebSockets
  task_backend -> storage: Persistent Commit & Periodic Dispatch
}`,
    layers: [
      {
        name: 'Layer 1: Interactive Client UI',
        color: '#38bdf8',
        icon: 'fas fa-tasks',
        nodes: ['Optimistic Drag & Drop Kanban', 'Voice Input Audio Transcriber', 'Real-Time WebSocket Sync'],
      },
      {
        name: 'Layer 2: AI Classification & State Machine',
        color: '#7c3aed',
        icon: 'fas fa-brain',
        nodes: ['LLM Task Urgency Classifier', 'Explicit State Transition Guards', 'Subtask Decomposition Engine'],
      },
      {
        name: 'Layer 3: Asynchronous Scheduler',
        color: '#a78bfa',
        icon: 'fas fa-clock',
        nodes: ['Celery Beat Periodic Dispatcher', 'Push & Email Alert Worker', 'Habit Streak Tracker'],
      },
      {
        name: 'Layer 4: High-Performance Data Persistence',
        color: '#4ade80',
        icon: 'fas fa-database',
        nodes: ['PostgreSQL Composite Indexed DB', 'Redis Real-Time Session Store', 'Encrypted Activity Audit Trail'],
      },
    ],
  },

  prepsarthi: {
    title: 'PrepSarthi AI Learning & Exam Preparation Architecture',
    d2Code: `edtech_system: PrepSarthi AI {
  learner_portal: React Adaptive Study Portal {
    quiz_engine: Interactive Timed Practice Engine
    flashcards: Spaced Repetition SRS Deck
  }

  ai_tutor_core: RAG & Evaluation Services {
    rag_retriever: Syllabus Knowledge Vector Matcher
    question_gen: LLM Synthetic Practice Question Generator
    analytics_svc: Weakness Heatmap & Mastery Indexer
  }

  persistence: Vector & Relational Store {
    qdrant_vector: High-Dimensional Syllabus Embeddings
    postgres_main: Question Bank & Student Score History
  }

  learner_portal -> ai_tutor_core: User Answer Submissions
  ai_tutor_core -> persistence: Semantic Query & History Log
}`,
    layers: [
      {
        name: 'Layer 1: Adaptive Learner Portal',
        color: '#38bdf8',
        icon: 'fas fa-graduation-cap',
        nodes: ['Timed Adaptive Test Runner', 'SM-2 Spaced Repetition Flashcards', 'Real-Time Progress Dashboard'],
      },
      {
        name: 'Layer 2: AI Question Generator & Evaluator',
        color: '#7c3aed',
        icon: 'fas fa-robot',
        nodes: ['LLM Dynamic MCQ & Coding Question Gen', 'Step-by-Step Solution Explainer', 'Conceptual Weakness Heatmap'],
      },
      {
        name: 'Layer 3: Knowledge Base & Vector Retrieval',
        color: '#a78bfa',
        icon: 'fas fa-brain',
        nodes: ['Syllabus RAG Vector Retrieval', 'Semantic Question Similarity Deduplication', 'Difficulty Calibration Engine'],
      },
      {
        name: 'Layer 4: Performance Analytics & Scoring',
        color: '#4ade80',
        icon: 'fas fa-chart-line',
        nodes: ['PostgreSQL Student Score Database', 'Redis Leaderboard & Fast Caching', 'Automated PDF Performance Reports'],
      },
    ],
  },
};

export default function ComplexDiagramD2({ scenarioKey = 'cardflow' }) {
  const scenario = D2_DIAGRAM_SCENARIOS[scenarioKey] || D2_DIAGRAM_SCENARIOS.cardflow;
  const [activeTab, setActiveTab] = useState('visual');
  const [copied, setCopied] = useState(false);

  const handleCopyD2 = () => {
    navigator.clipboard.writeText(scenario.d2Code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="doc-d2-card">
      <div className="doc-d2-header">
        <div>
          <span className="doc-badge-pill">
            <i className="fas fa-cubes"></i> D2 Complex System Architecture
          </span>
          <h4 className="doc-d2-title">{scenario.title}</h4>
        </div>
        <div className="doc-d2-actions">
          <button 
            className={`doc-ctrl-btn ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <i className="fas fa-layer-group"></i> Architecture Map
          </button>
          <button 
            className={`doc-ctrl-btn ${activeTab === 'd2spec' ? 'active' : ''}`}
            onClick={() => setActiveTab('d2spec')}
          >
            <i className="fas fa-file-code"></i> D2 Language Spec
          </button>
          <button 
            className="doc-ctrl-btn"
            onClick={handleCopyD2}
            title="Copy D2 Code"
          >
            <i className={copied ? 'fas fa-check' : 'far fa-copy'}></i>
            {copied ? 'Copied D2!' : 'Copy D2'}
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="doc-d2-visual-container">
          <div className="doc-d2-layers-grid">
            {scenario.layers.map((layer, idx) => (
              <div 
                key={idx} 
                className="doc-d2-layer-card"
                style={{ borderLeft: `3px solid ${layer.color}` }}
              >
                <div className="doc-d2-layer-header">
                  <span className="doc-d2-layer-icon" style={{ color: layer.color }}>
                    <i className={layer.icon}></i>
                  </span>
                  <h5 className="doc-d2-layer-name">{layer.name}</h5>
                </div>
                <div className="doc-d2-layer-nodes">
                  {layer.nodes.map((node, nIdx) => (
                    <div key={nIdx} className="doc-d2-node-pill">
                      <span className="node-bullet" style={{ background: layer.color }}></span>
                      <span>{node}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="doc-d2-spec-view">
          <pre><code>{scenario.d2Code.trim()}</code></pre>
        </div>
      )}
    </div>
  );
}
