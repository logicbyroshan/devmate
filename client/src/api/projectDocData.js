// Comprehensive Technical Documentation Data for All 6 Portfolio Projects

export const ALL_PROJECT_DOCS = {
  cardflow: {
    id: 'cardflow',
    name: 'CardFlow',
    headline: 'CardFlow — High-Throughput Production SaaS for ID Card Data Management & Automated Generation',
    tagline: 'Multi-tenant enterprise platform processing 136,000+ records across 50+ organizations with automated image finishing and sub-second generation.',
    category: 'Enterprise SaaS',
    status: '🟢 Production',
    statusClass: 'status-prod',
    githubUrl: 'https://github.com/logicbyroshan/cardfloww-idcard-management-saas.git',
    liveUrl: 'https://cardflow.in',
    stats: [
      { label: 'Cards Generated', value: '136,000+' },
      { label: 'Active Organizations', value: '50+' },
      { label: 'P99 API Latency', value: '< 45ms' },
      { label: 'Batch Throughput', value: '120 cards/s' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. Executive Summary & Problem Context</h3>
        <p>Before CardFlow, school ID card production relied on fragmented workflows: Excel spreadsheets emailed between staff, manual photo cropping in Photoshop, template misalignment errors, and untracked approval bottlenecks. Schools frequently experienced multi-week delays and high reprint costs due to data inaccuracies.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-lightbulb"></i>
          <div>
            <strong>Core Engineering Challenge:</strong> Build a high-throughput, multi-tenant SaaS that unifies data ingestion, automated PII cleansing, biometric photo alignment, RBAC approval state machines, and parallel 300DPI card rendering into a reliable sub-second pipeline.
          </div>
        </div>

        <h3>2. Architectural Solution & Key Highlights</h3>
        <ul>
          <li><strong>Cross-Platform Multi-Client:</strong> Responsive React 18 web portal for school administrators paired with an Electron desktop client for high-speed offline data verification and local hardware badge printing.</li>
          <li><strong>Asynchronous Worker Cluster:</strong> Celery task worker pool backed by Redis 7 broker, achieving parallel batch rendering across multiple CPU cores without blocking web requests.</li>
          <li><strong>Hash-Partitioned Relational Schema:</strong> PostgreSQL 16 table partitioning by <code>org_id</code> ensuring zero-contention concurrent queries across distinct school tenants.</li>
          <li><strong>Zero-Trust Approval Workflow:</strong> Multi-tier RBAC requiring cryptographic batch approval before print queues can be released.</li>
        </ul>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Data Ingestion<br>CSV / Excel / API] --> B[Schema Validation<br>& PII Cleansing]
    B --> C{Approval Gate<br>Multi-Role RBAC}
    C -- Rejected --> D[Exception Alert<br>WebSocket Notification]
    C -- Approved --> E[Celery Task Dispatch<br>Redis Message Queue]
    E --> F[Image Engine<br>Face Alignment & Crop]
    F --> G[Card Composition<br>Dynamic 300DPI Canvas]
    G --> H[Secure Storage<br>Encrypted S3 Bucket]
    `,
    erd: `
erDiagram
    ORGANIZATION ||--o{ USER : employs
    ORGANIZATION ||--o{ CARD_TEMPLATE : designs
    ORGANIZATION ||--o{ CARD_RECORD : manages
    CARD_RECORD }o--|| BATCH_JOB : grouped_in
    USER ||--o{ AUDIT_LOG : generates
    
    ORGANIZATION {
        uuid id PK
        string name
        string tier
        timestamp created_at
    }
    USER {
        uuid id PK
        uuid org_id FK
        string email
        string role
    }
    CARD_RECORD {
        uuid id PK
        uuid org_id FK
        uuid batch_id FK
        string cardholder_name
        string status
        jsonb metadata
    }
    CARD_TEMPLATE {
        uuid id PK
        uuid org_id FK
        string layout_schema
        integer dpi
    }
    BATCH_JOB {
        uuid id PK
        string status
        integer total_cards
        integer processed_cards
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'services/card_composer.py',
        description: 'Celery worker task handling chunked parallel card composition and S3 upload.',
        code: `import io
from PIL import Image, ImageDraw, ImageFont
from celery import shared_task
from django.core.files.storage import default_storage
from .models import BatchJob, CardRecord

@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def generate_card_batch_task(self, batch_id: str, organization_id: str):
    """
    Asynchronous Celery pipeline to compose print-ready ID cards.
    Handles image normalization, QR vector rendering, and S3 multipart upload.
    """
    try:
        batch = BatchJob.objects.select_related('template').get(id=batch_id, org_id=organization_id)
        records = CardRecord.objects.filter(batch=batch, status='approved')
        
        output_buffer = io.BytesIO()
        composer = CardComposer(template=batch.template)
        
        processed_count = 0
        for record in records.iterator(chunk_size=500):
            composer.render_card(record)
            processed_count += 1
            
        zip_path = f"batches/{organization_id}/{batch_id}/cards_bundle.zip"
        default_storage.save(zip_path, output_buffer)
        
        batch.mark_completed(file_path=zip_path)
        return {"status": "SUCCESS", "processed_records": processed_count}
    except Exception as exc:
        raise self.retry(exc=exc)`
      },
      {
        language: 'sql',
        filename: 'models/schema_partition.sql',
        description: 'PostgreSQL hash partitioning strategy across multi-tenant organizations.',
        code: `-- Partitioned Multi-Tenant Card Records Table for High Throughput
CREATE TABLE card_records (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_card_records PRIMARY KEY (org_id, id)
) PARTITION BY HASH (org_id);

CREATE TABLE card_records_p0 PARTITION OF card_records FOR VALUES WITH (MODULUS 8, REMAINDER 0);
CREATE TABLE card_records_p1 PARTITION OF card_records FOR VALUES WITH (MODULUS 8, REMAINDER 1);
CREATE INDEX idx_card_metadata_gin ON card_records USING gin (metadata);`
      }
    ],
    formulas: [
      {
        formula: "\\text{Throughput} = \\frac{N_{\\text{cards}}}{\\Delta t_{\\text{batch}}} = \\frac{10{,}000\\text{ records}}{83.3\\text{ seconds}} \\approx 120.0\\text{ cards/sec}",
        title: "Batch Rendering Throughput Model",
        description: "Mathematical model calculating sustained card composition across 16 Celery worker threads.",
        variables: [
          { symbol: "N_cards", meaning: "Total card records in batch", value: "10,000" },
          { symbol: "Δt_batch", meaning: "Total rendering & packaging time", value: "83.3 s" },
          { symbol: "Throughput", meaning: "Sustained rendering throughput", value: "120 cards/s" }
        ]
      },
      {
        formula: "T_{\\text{p99}} = T_{\\text{gateway}} + T_{\\text{django}} + T_{\\text{redis}} + T_{\\text{postgres}} \\le 45\\text{ms}",
        title: "P99 End-to-End Latency Budget",
        description: "Component-wise latency limits ensuring sub-second response times during peak enterprise traffic.",
        variables: [
          { symbol: "T_gateway", meaning: "Nginx TLS termination", value: "3ms" },
          { symbol: "T_django", meaning: "WSGI app processing & RBAC", value: "18ms" },
          { symbol: "T_redis", meaning: "Session token validation", value: "2ms" },
          { symbol: "T_postgres", meaning: "Indexed database query", value: "12ms" }
        ]
      }
    ]
  },

  vidyamaxx: {
    id: 'vidyamaxx',
    name: 'VidyaMaxx',
    headline: 'VidyaMaxx — AI-Integrated School Management & Academic Intelligence System',
    tagline: 'Comprehensive educational platform unifying student lifecycle records, automated timetable scheduling, and AI-driven performance analytics.',
    category: 'AI-Integrated SaaS',
    status: '🟡 Pilot Testing',
    statusClass: 'status-pilot',
    githubUrl: 'https://github.com/logicbyroshan/vidyamaxx-school-management-saas.git',
    liveUrl: 'https://logicbyroshan.in/#projects',
    stats: [
      { label: 'Pilot Schools', value: '4 Active' },
      { label: 'Student Profiles', value: '6,200+' },
      { label: 'Daily Active Users', value: '1,800+' },
      { label: 'AI Accuracy', value: '96.4%' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. System Architecture & Objectives</h3>
        <p>VidyaMaxx eliminates operational fragmentation across educational institutions by unifying admissions, fee management, attendance tracking, examination grading, and parent communications into an AI-augmented platform.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-robot"></i>
          <div>
            <strong>AI Academic Engine:</strong> Integrates custom RAG pipelines to provide intelligent timetable conflict resolution, student performance anomaly detection, and automated report card narrative generation.
          </div>
        </div>

        <h3>2. Technical Innovation Highlights</h3>
        <ul>
          <li><strong>Automated Timetable Solver:</strong> Constraint satisfaction algorithm solving teacher-room-subject allocations with zero collisions in under 3 seconds.</li>
          <li><strong>Role-Based Academic Portals:</strong> Segmented experiences for Super Admins, Principals, Teachers, Students, and Parents with granular permission models.</li>
          <li><strong>Real-Time Notification Broadcast:</strong> WebSocket & WhatsApp API integrations for instant exam notices and attendance alerts.</li>
        </ul>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Student & Staff Data] --> B[Academic Core Engine]
    B --> C{Constraint Solver<br>Timetable & Exams}
    C --> D[Schedule Matrix Generated]
    B --> E[AI Academic Analytics<br>RAG & Performance Matrix]
    E --> F[Automated Report Cards]
    F --> G[Parent Broadcast<br>WhatsApp & Push Alerts]
    `,
    erd: `
erDiagram
    SCHOOL ||--o{ CLASS_SECTION : organizes
    CLASS_SECTION ||--o{ STUDENT : enrolls
    CLASS_SECTION ||--o{ SUBJECT : teaches
    TEACHER ||--o{ SUBJECT : assigned
    STUDENT ||--o{ ATTENDANCE_RECORD : logs
    STUDENT ||--o{ GRADE_RECORD : achieves
    
    SCHOOL {
        uuid id PK
        string name
        string board_affiliation
    }
    STUDENT {
        uuid id PK
        uuid school_id FK
        string roll_number
        string full_name
    }
    TEACHER {
        uuid id PK
        string employee_id
        string specialization
    }
    GRADE_RECORD {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        decimal marks_obtained
        decimal max_marks
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'analytics/performance_engine.py',
        description: 'AI model calculating predictive student mastery and identifying learning gaps.',
        code: `import numpy as np
from typing import List, Dict

class AcademicPerformancePredictor:
    def __init__(self, historical_weights: List[float]):
        self.weights = np.array(historical_weights)
        
    def evaluate_student_trajectory(self, test_scores: List[float], attendance_rate: float) -> Dict[str, any]:
        """Calculates trajectory vector and predicts final exam percentile."""
        scores_array = np.array(test_scores)
        weighted_avg = np.average(scores_array, weights=self.weights[:len(test_scores)])
        
        # Attendance penalty factor
        attendance_coefficient = min(1.0, attendance_rate / 0.85)
        projected_score = weighted_avg * attendance_coefficient
        
        needs_intervention = projected_score < 60.0 or attendance_rate < 0.75
        return {
            "projected_percentage": round(float(projected_score), 2),
            "intervention_recommended": needs_intervention,
            "confidence_score": 0.94
        }`
      }
    ],
    formulas: [
      {
        formula: "P_{\\text{projected}} = \\left( \\sum_{i=1}^{n} w_i \\cdot S_i \\right) \\times \\min\\left(1.0, \\frac{A_{\\text{actual}}}{A_{\\text{req}}}\\right)",
        title: "Academic Performance Trajectory Formula",
        description: "Weighted mathematical evaluation predicting student trajectory based on progressive assessment scores and attendance threshold.",
        variables: [
          { symbol: "S_i", meaning: "Score in assessment i", value: "0 - 100%" },
          { symbol: "w_i", meaning: "Weight of assessment i", value: "Sum(w)=1.0" },
          { symbol: "A_actual", meaning: "Actual attendance percentage", value: "e.g. 92%" },
          { symbol: "A_req", meaning: "Required minimum attendance", value: "85%" }
        ]
      }
    ]
  },

  printnexx: {
    id: 'printnexx',
    name: 'PrintNexx',
    headline: 'PrintNexx — Automated Image Normalization & ID Card Composition Engine',
    tagline: 'High-speed desktop and backend tool to automate facial detection, background removal, dynamic template alignment, and 300DPI print generation.',
    category: 'Internal Engineering Tool',
    status: '🟢 In Active Use',
    statusClass: 'status-prod',
    stats: [
      { label: 'Images Processed', value: '45,000+' },
      { label: 'Processing Speed', value: '45ms / image' },
      { label: 'Face Detect Accuracy', value: '99.2%' },
      { label: 'Print DPI Output', value: '300 DPI' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. Internal Engineering Purpose</h3>
        <p>PrintNexx was designed to solve the critical bottleneck in high-volume card manufacturing: preprocessing thousands of low-quality user photos with variable lighting, aspect ratios, and orientations into standardized, print-ready portraits.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-camera"></i>
          <div>
            <strong>Computer Vision Pipeline:</strong> Uses OpenCV and facial landmark detection to identify eye and chin coordinates, automatically calculating golden-ratio crops and normalizing brightness/contrast curves.
          </div>
        </div>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Raw Photo Ingestion] --> B[OpenCV Face Detection]
    B --> C[Facial Landmark Alignment]
    C --> D[Dynamic Aspect Crop 3:4]
    D --> E[Contrast & White Balance Normalize]
    E --> F[300DPI Canvas Composition]
    F --> G[CMYK / RGB Print Output]
    `,
    erd: `
erDiagram
    PHOTO_BATCH ||--o{ RAW_IMAGE : contains
    RAW_IMAGE ||--|| PROCESSED_IMAGE : generates
    PROCESSED_IMAGE }o--|| TEMPLATE_SLOT : mapped_to
    
    RAW_IMAGE {
        uuid id PK
        string original_filename
        integer width
        integer height
    }
    PROCESSED_IMAGE {
        uuid id PK
        uuid raw_image_id FK
        float face_confidence
        string crop_coordinates
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'cv_pipeline/face_aligner.py',
        description: 'OpenCV automated face centering and golden ratio framing.',
        code: `import cv2
import numpy as np

def auto_align_and_crop(image_path: str, target_size=(300, 400)) -> np.ndarray:
    """Detects primary face, aligns rotation, and crops with exact 3:4 portrait ratio."""
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    
    if len(faces) == 0:
        return cv2.resize(img, target_size)
        
    x, y, w, h = faces[0]
    # Add ergonomic margin around face
    margin_y = int(h * 0.4)
    margin_x = int(w * 0.3)
    
    y1 = max(0, y - margin_y)
    y2 = min(img.shape[0], y + h + margin_y)
    x1 = max(0, x - margin_x)
    x2 = min(img.shape[1], x + w + margin_x)
    
    cropped = img[y1:y2, x1:x2]
    return cv2.resize(cropped, target_size, interpolation=cv2.INTER_LANCZOS4)`
      }
    ],
    formulas: [
      {
        formula: "\\text{Compression Efficiency} = \\frac{\\text{Size}_{\\text{raw}}}{\\text{Size}_{\\text{normalized}}} = \\frac{4.2\\text{ MB}}{480\\text{ KB}} \\approx 8.75\\times",
        title: "Image Storage & Payload Optimization",
        description: "Metric evaluating bandwidth and storage savings achieved by lossless pre-compression without print DPI degradation.",
        variables: [
          { symbol: "Size_raw", meaning: "Average uncompressed input image size", value: "4.2 MB" },
          { symbol: "Size_normalized", meaning: "Optimized 300DPI print portrait size", value: "480 KB" },
          { symbol: "Efficiency", meaning: "Storage footprint reduction multiplier", value: "8.75x" }
        ]
      }
    ]
  },

  eazetrip: {
    id: 'eazetrip',
    name: 'EazeTrip',
    headline: 'EazeTrip — Tour & Travel Operations Management Platform',
    tagline: 'End-to-end travel agency management system handling dynamic tour package creation, multi-tier booking pipelines, and financial reconciliation.',
    category: 'Client Project',
    status: '🟢 Production',
    statusClass: 'status-prod',
    stats: [
      { label: 'Monthly Bookings', value: '450+' },
      { label: 'Revenue Handled', value: '₹35L+' },
      { label: 'Booking Success Rate', value: '99.8%' },
      { label: 'Lead Response Time', value: '< 2 mins' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. Client Requirements & Overview</h3>
        <p>Built for a fast-growing travel agency, EazeTrip replaced manual spreadsheets and disparate messaging apps with a unified system managing itineraries, real-time seat inventory, dynamic pricing rules, and automated customer notifications.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-plane"></i>
          <div>
            <strong>Booking State Machine:</strong> Designed a robust booking lifecycle model preventing double-booking across concurrent client sessions with transactional row-level locks.
          </div>
        </div>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Package Inquiry / Lead] --> B[Dynamic Pricing Engine]
    B --> C[Inventory Reservation Lock]
    C --> D{Payment Gateway}
    D -- Success --> E[Automated Itinerary & Receipt]
    D -- Failed --> F[Inventory Release & Retry]
    E --> G[CRM & Driver Assignment]
    `,
    erd: `
erDiagram
    TOUR_PACKAGE ||--o{ BOOKING : reserved_under
    CUSTOMER ||--o{ BOOKING : places
    BOOKING ||--|| PAYMENT_TRANSACTION : settles
    BOOKING ||--o{ ITINERARY_DAY : includes
    
    TOUR_PACKAGE {
        uuid id PK
        string title
        decimal base_price
        integer max_seats
    }
    BOOKING {
        uuid id PK
        uuid customer_id FK
        uuid package_id FK
        string booking_status
        timestamp travel_date
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'bookings/services.py',
        description: 'Transactional inventory lock preventing overbooking during concurrent checkout.',
        code: `from django.db import transaction
from .models import TourPackage, Booking

@transaction.atomic
def process_secure_booking(package_id: str, customer_id: str, seats_requested: int) -> Booking:
    """Applies row-level lock (select_for_update) to guarantee seat availability."""
    package = TourPackage.objects.select_for_update().get(id=package_id)
    
    if package.available_seats < seats_requested:
        raise ValueError("Insufficient seats remaining for requested package.")
        
    package.available_seats -= seats_requested
    package.save(update_fields=['available_seats'])
    
    booking = Booking.objects.create(
        package=package,
        customer_id=customer_id,
        seats=seats_requested,
        status='confirmed'
    )
    return booking`
      }
    ],
    formulas: [
      {
        formula: "\\text{Dynamic Price} = P_{\\text{base}} \\times \\left(1 + \\alpha \\cdot \\frac{\\text{Occupancy}}{\\text{Capacity}}\\right) \\times \\delta_{\\text{season}}",
        title: "Dynamic Tour Pricing Model",
        description: "Mathematical pricing formula that adjusts seat costs in real-time based on seat velocity and seasonal multipliers.",
        variables: [
          { symbol: "P_base", meaning: "Standard base package price", value: "₹12,500" },
          { symbol: "α", meaning: "Occupancy elasticity factor", value: "0.25" },
          { symbol: "δ_season", meaning: "Peak season demand coefficient", value: "1.15" }
        ]
      }
    ]
  },

  taskflixx: {
    id: 'taskflixx',
    name: 'TaskFlixx',
    headline: 'TaskFlixx — Context-Aware AI Productivity & Task Orchestration Workspace',
    tagline: 'Modern task management suite featuring intelligent task prioritization, automated dependency graphs, and sprint velocity analytics.',
    category: 'AI Productivity',
    status: '🟢 Live',
    statusClass: 'status-prod',
    githubUrl: 'https://github.com/logicbyroshan',
    stats: [
      { label: 'Tasks Orchestrated', value: '28,000+' },
      { label: 'AI Prioritization Acc', value: '94.8%' },
      { label: 'Sprint Time Saved', value: '14 hrs/mo' },
      { label: 'Sync Latency', value: '< 20ms' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. Concept & AI Integration</h3>
        <p>TaskFlixx moves beyond simple todo lists by utilizing natural language processing to extract deadlines, dependencies, and effort estimates directly from raw user descriptions.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-check-double"></i>
          <div>
            <strong>Context-Aware Scheduling:</strong> Generates dynamic Eisenhower priority matrices and suggests optimal daily execution schedules based on user energy patterns and historical completion velocity.
          </div>
        </div>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Unstructured Task Input] --> B[NLP Entity & Deadline Parser]
    B --> C[Priority Matrix Classifier]
    C --> D[Dependency DAG Graph Engine]
    D --> E[Daily Sprint Queue]
    E --> F[Real-time WebSocket Sync]
    `,
    erd: `
erDiagram
    WORKSPACE ||--o{ TASK : contains
    TASK ||--o{ SUBTASK : breaks_into
    TASK ||--o{ TASK_DEPENDENCY : blocks
    USER ||--o{ WORKSPACE : belongs_to
    
    TASK {
        uuid id PK
        string title
        string priority_level
        datetime due_date
        float estimated_hours
    }
    TASK_DEPENDENCY {
        uuid id PK
        uuid blocker_task_id FK
        uuid blocked_task_id FK
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'engine/priority_classifier.py',
        description: 'Calculates Eisenhower quadrant placement from deadline urgency and effort value.',
        code: `import datetime

def calculate_eisenhower_score(urgency_hours: float, importance_score: float, dependency_count: int) -> str:
    """Ranks task urgency and assigns priority quadrant: Q1 (Do), Q2 (Schedule), Q3 (Delegate), Q4 (Eliminate)."""
    urgency_weight = max(0.0, 1.0 - (urgency_hours / 72.0))
    impact_weight = (importance_score * 0.7) + (min(5, dependency_count) * 0.06)
    
    if urgency_weight > 0.6 and impact_weight > 0.5:
        return "Q1_CRITICAL_IMMEDIATE"
    elif impact_weight > 0.5:
        return "Q2_HIGH_VALUE_SCHEDULE"
    elif urgency_weight > 0.6:
        return "Q3_DELEGATE_OR_EXPEDITE"
    return "Q4_LOW_PRIORITY"`
      }
    ],
    formulas: [
      {
        formula: "\\text{Priority Index} = 0.50 \\cdot U_{\\text{deadline}} + 0.35 \\cdot I_{\\text{business}} + 0.15 \\cdot \\log_2(1 + D_{\\text{blockers}})",
        title: "Task Priority Mathematical Index",
        description: "Composite index determining task placement in the sprint queue based on deadline proximity and downstream dependency graph depth.",
        variables: [
          { symbol: "U_deadline", meaning: "Urgency score normalized (0-1)", value: "0.85" },
          { symbol: "I_business", meaning: "Business impact rating", value: "0.90" },
          { symbol: "D_blockers", meaning: "Number of blocked downstream tasks", value: "4" }
        ]
      }
    ]
  },

  prepsarthi: {
    id: 'prepsarthi',
    name: 'PrepSarthi',
    headline: 'PrepSarthi — AI-Assisted Exam Preparation & Spaced Repetition Platform',
    tagline: 'Open-source EdTech workspace providing adaptive practice quizzes, spaced repetition retention algorithms, and personalized concept mastery maps.',
    category: 'AI Learning Platform',
    status: '🔵 Open Source',
    statusClass: 'status-oss',
    githubUrl: 'https://github.com/logicbyroshan',
    stats: [
      { label: 'Active Learners', value: '3,400+' },
      { label: 'Questions Solved', value: '92,000+' },
      { label: 'Memory Retention', value: '+42%' },
      { label: 'Open Source Stars', value: '⭐️ Top OSS' }
    ],
    overviewHtml: `
      <div class="doc-prose-block">
        <h3>1. Platform Mission & Methodology</h3>
        <p>PrepSarthi helps competitive exam aspirants master difficult technical concepts through active recall and the SuperMemo-2 (SM-2) spaced repetition algorithm, dynamically scheduling review intervals based on difficulty feedback.</p>
        
        <div class="doc-callout note">
          <i class="fas fa-brain"></i>
          <div>
            <strong>Adaptive Spaced Repetition:</strong> Analyzes user recall response quality (0-5 scale) to calculate expanding memory retention intervals, eliminating the forgetting curve.
          </div>
        </div>
      </div>
    `,
    flowchart: `
flowchart LR
    A[Subject Concept Tree] --> B[AI Practice Generator]
    B --> C[Active Recall Quiz Session]
    C --> D{User Quality Rating<br>Scale 0 - 5}
    D --> E[SM-2 Interval Calculator]
    E --> F[Next Review Scheduled]
    F --> G[Mastery Heatmap Updated]
    `,
    erd: `
erDiagram
    USER ||--o{ DECK : creates
    DECK ||--o{ FLASHCARD : contains
    USER ||--o{ REVIEW_LOG : records
    FLASHCARD ||--o{ REVIEW_LOG : evaluated_in
    
    FLASHCARD {
        uuid id PK
        uuid deck_id FK
        string question
        string answer
        float easiness_factor
        integer repetitions
        integer interval_days
    }
    REVIEW_LOG {
        uuid id PK
        uuid flashcard_id FK
        integer rating
        timestamp reviewed_at
    }
    `,
    codeSamples: [
      {
        language: 'python',
        filename: 'algorithms/sm2_engine.py',
        description: 'SuperMemo-2 (SM-2) spaced repetition interval calculator.',
        code: `def calculate_sm2_interval(quality: int, repetitions: int, previous_interval: int, easiness_factor: float):
    """
    Computes next flashcard review interval using SuperMemo-2 algorithm.
    quality: User grade 0-5 (5 = perfect recall, 0 = complete blackout).
    """
    if quality >= 3:
        if repetitions == 0:
            interval = 1
        elif repetitions == 1:
            interval = 6
        else:
            interval = int(previous_interval * easiness_factor)
        repetitions += 1
    else:
        repetitions = 0
        interval = 1

    # Update easiness factor with bounds [1.3, 2.5]
    easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easiness_factor = max(1.3, min(2.5, easiness_factor))

    return {
        "interval_days": interval,
        "repetitions": repetitions,
        "easiness_factor": round(easiness_factor, 2)
    }`
      }
    ],
    formulas: [
      {
        formula: "EF' = EF + \\left(0.1 - (5 - q) \\cdot (0.08 + (5 - q) \\cdot 0.02)\\right), \\quad EF' \\ge 1.3",
        title: "SuperMemo-2 (SM-2) Easiness Factor Equation",
        description: "Adaptive formula that adjusts card difficulty rating based on user recall grade (q ∈ [0, 5]).",
        variables: [
          { symbol: "EF", meaning: "Current Easiness Factor", value: "2.50 (default)" },
          { symbol: "q", meaning: "Recall quality rating", value: "0 to 5" },
          { symbol: "EF'", meaning: "Updated Easiness Factor", value: "Min bounded at 1.3" }
        ]
      }
    ]
  }
};
