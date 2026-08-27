import React, { useState } from 'react';

const ARCHITECTURE_NODES = [
  {
    id: 'clients',
    tier: 'edge',
    title: 'Multi-Client Layer',
    subtitle: 'React Web App + Electron Desktop Client',
    icon: 'fas fa-laptop-code',
    status: 'Operational',
    statusColor: '#4ade80',
    tech: ['React 18', 'Electron', 'Tailwind', 'Vite'],
    metrics: { rps: '1,450 req/s', p99: '18ms', availability: '99.99%' },
    details: 'Handles user authentication, batch card preview composition, CSV/Excel ingestion, and local file storage with optimistic UI updates.',
    connections: ['gateway']
  },
  {
    id: 'gateway',
    tier: 'edge',
    title: 'Nginx API Gateway & Reverse Proxy',
    subtitle: 'SSL Termination & Rate Limiting',
    icon: 'fas fa-shield-alt',
    status: 'Active',
    statusColor: '#38bdf8',
    tech: ['Nginx', 'HTTP/2', 'Brotli', 'Let\'s Encrypt'],
    metrics: { throughput: '45 MB/s', activeConns: '3,200', dropRate: '0.00%' },
    details: 'Provides zero-downtime reverse proxying, Gzip/Brotli compression, IP rate-limiting, and static asset offloading.',
    connections: ['django', 'redis']
  },
  {
    id: 'django',
    tier: 'compute',
    title: 'Django REST Framework Core',
    subtitle: 'Business Logic & RBAC Enforcement',
    icon: 'fab fa-python',
    status: 'Healthy',
    statusColor: '#4ade80',
    tech: ['Python 3.11', 'Django 5', 'DRF', 'JWT Auth'],
    metrics: { latencyAvg: '24ms', workerPool: '8 Gunicorn', errorRate: '0.01%' },
    details: 'Executes transactional workflows, organization RBAC policies, card schema validation, and dispatches asynchronous batch tasks to Celery.',
    connections: ['celery', 'postgres', 'redis']
  },
  {
    id: 'celery',
    tier: 'workers',
    title: 'Celery Distributed Task Workers',
    subtitle: 'Asynchronous Batch Processing Pipeline',
    icon: 'fas fa-cogs',
    status: 'Processing',
    statusColor: '#a78bfa',
    tech: ['Celery 5', 'Pillow', 'OpenCV', 'PyPDF'],
    metrics: { throughput: '120 cards/s', queueDepth: '14 jobs', concurrency: '16 workers' },
    details: 'Processes automated face detection, photo normalization, barcode/QR generation, high-res canvas rendering, and ZIP archive packaging.',
    connections: ['postgres', 'redis', 'storage']
  },
  {
    id: 'redis',
    tier: 'storage',
    title: 'Redis Cache & Task Broker',
    subtitle: 'In-Memory State & Pub/Sub',
    icon: 'fas fa-bolt',
    status: 'Master-Replica',
    statusColor: '#f59e0b',
    tech: ['Redis 7', 'Celery Broker', 'Session Store'],
    metrics: { hitRatio: '94.6%', memoryUsed: '380 MB', opsSec: '12,800 ops/s' },
    details: 'Serves token blacklisting, rate limit buckets, cached school configurations, and distributed task message queues with sub-millisecond latency.',
    connections: ['django', 'celery']
  },
  {
    id: 'postgres',
    tier: 'storage',
    title: 'PostgreSQL Relational Database',
    subtitle: 'ACID Transactions & Partitioned Records',
    icon: 'fas fa-database',
    status: 'Primary + WAL',
    statusColor: '#38bdf8',
    tech: ['PostgreSQL 16', 'JSONB Indexing', 'B-Tree Indexes', 'WAL Replication'],
    metrics: { qps: '2,850 qps', connPool: '40 pgbouncer', dbSize: '4.8 GB' },
    details: 'Stores multi-tenant school schemas, approval states, audit log trails, and structured cardholder data with full referential integrity.',
    connections: ['django', 'celery']
  },
  {
    id: 'storage',
    tier: 'storage',
    title: 'Encrypted Object Storage',
    subtitle: 'Signed URL Media & Backup Vault',
    icon: 'fas fa-cloud-upload-alt',
    status: 'Connected',
    statusColor: '#4ade80',
    tech: ['S3 Compatible', 'AES-256', 'CDN CDN-Edge'],
    metrics: { storedAssets: '180K files', egress: '1.2 TB/mo', redundancy: '99.999999999%' },
    details: 'Houses student photos, generated print-ready PDF batches, and exported archive bundles accessible via time-bounded signed URLs.',
    connections: []
  }
];

export default function InteractiveArchitecture() {
  const [selectedNodeId, setSelectedNodeId] = useState('django');
  const [activeTier, setActiveTier] = useState('all');

  const selectedNode = ARCHITECTURE_NODES.find(n => n.id === selectedNodeId) || ARCHITECTURE_NODES[0];

  const filteredNodes = ARCHITECTURE_NODES.filter(node => {
    if (activeTier === 'all') return true;
    return node.tier === activeTier;
  });

  return (
    <div className="doc-interactive-arch-card">
      <div className="doc-interactive-arch-header">
        <div>
          <span className="doc-badge-pill">
            <i className="fas fa-network-wired"></i> Interactive React Flow Architecture
          </span>
          <h4 className="doc-arch-title">High-Availability System Topology & Telemetry</h4>
        </div>

        {/* Tier Filter Tabs */}
        <div className="doc-arch-filter-tabs">
          <button 
            className={`doc-arch-tab ${activeTier === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTier('all')}
          >
            All Tiers
          </button>
          <button 
            className={`doc-arch-tab ${activeTier === 'edge' ? 'active' : ''}`}
            onClick={() => setActiveTier('edge')}
          >
            Edge &amp; Gateway
          </button>
          <button 
            className={`doc-arch-tab ${activeTier === 'compute' ? 'active' : ''}`}
            onClick={() => setActiveTier('compute')}
          >
            Compute &amp; APIs
          </button>
          <button 
            className={`doc-arch-tab ${activeTier === 'workers' ? 'active' : ''}`}
            onClick={() => setActiveTier('workers')}
          >
            Workers &amp; Queues
          </button>
          <button 
            className={`doc-arch-tab ${activeTier === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTier('storage')}
          >
            Data &amp; Cache
          </button>
        </div>
      </div>

      <p className="doc-arch-instructions">
        <i className="fas fa-mouse-pointer"></i> Click any node to inspect runtime configuration, connected dependencies, and live performance metrics.
      </p>

      <div className="doc-arch-workspace">
        {/* Node Graph Canvas */}
        <div className="doc-arch-canvas">
          <div className="doc-arch-nodes-grid">
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isConnected = selectedNode.connections.includes(node.id) || node.connections.includes(selectedNode.id);

              return (
                <div 
                  key={node.id}
                  className={`doc-arch-node ${isSelected ? 'selected' : ''} ${isConnected && !isSelected ? 'connected-peer' : ''}`}
                  onClick={() => setSelectedNodeId(node.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="doc-arch-node-top">
                    <div className="doc-arch-node-icon">
                      <i className={node.icon}></i>
                    </div>
                    <span 
                      className="doc-arch-node-status"
                      style={{ color: node.statusColor, borderColor: `${node.statusColor}55`, background: `${node.statusColor}18` }}
                    >
                      <span className="status-dot" style={{ background: node.statusColor }}></span>
                      {node.status}
                    </span>
                  </div>

                  <h5 className="doc-arch-node-title">{node.title}</h5>
                  <div className="doc-arch-node-subtitle">{node.subtitle}</div>

                  <div className="doc-arch-node-tags">
                    {node.tech.slice(0, 3).map((t, i) => (
                      <span key={i} className="doc-node-pill">{t}</span>
                    ))}
                    {node.tech.length > 3 && <span className="doc-node-pill">+{node.tech.length - 3}</span>}
                  </div>

                  {isSelected && (
                    <div className="doc-arch-node-active-beacon">
                      <span className="beacon-pulse"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Telemetry Inspector Panel */}
        <div className="doc-arch-inspector">
          <div className="doc-inspector-header">
            <div className="doc-inspector-title-wrap">
              <div className="doc-inspector-icon">
                <i className={selectedNode.icon}></i>
              </div>
              <div>
                <h5 className="doc-inspector-title">{selectedNode.title}</h5>
                <span className="doc-inspector-tier-badge">{selectedNode.tier.toUpperCase()} TIER</span>
              </div>
            </div>
          </div>

          <div className="doc-inspector-body">
            <p className="doc-inspector-desc">{selectedNode.details}</p>

            <div className="doc-inspector-section-title">Telemetry &amp; Benchmarks</div>
            <div className="doc-inspector-metrics-grid">
              {Object.entries(selectedNode.metrics).map(([key, val]) => (
                <div key={key} className="doc-inspector-metric-card">
                  <span className="metric-label">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                  <span className="metric-value">{val}</span>
                </div>
              ))}
            </div>

            <div className="doc-inspector-section-title">Technology Stack</div>
            <div className="doc-inspector-tech-list">
              {selectedNode.tech.map((t, idx) => (
                <span key={idx} className="doc-tech-pill-highlight">
                  <i className="fas fa-check-circle"></i> {t}
                </span>
              ))}
            </div>

            <div className="doc-inspector-section-title">Downstream / Upstream Links</div>
            <div className="doc-inspector-connections">
              {selectedNode.connections.length > 0 ? (
                selectedNode.connections.map(targetId => {
                  const target = ARCHITECTURE_NODES.find(n => n.id === targetId);
                  return (
                    <button 
                      key={targetId} 
                      className="doc-conn-chip"
                      onClick={() => setSelectedNodeId(targetId)}
                    >
                      <i className="fas fa-arrow-right"></i>
                      <span>{target?.title || targetId}</span>
                    </button>
                  );
                })
              ) : (
                <span className="doc-conn-none">Leaf node / Storage sink</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
