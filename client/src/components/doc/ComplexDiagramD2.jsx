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
        nodes: ['Cloudflare DDoS Filter', 'TLS 1.3 Termination', 'Dual-Stack IPv4/IPv6']
      },
      {
        name: 'Layer 2: Private Application Core',
        color: '#7c3aed',
        icon: 'fas fa-server',
        nodes: ['Gunicorn WSGI Workers', 'DRF Permission Validators', 'Workflow State Machine']
      },
      {
        name: 'Layer 3: Asynchronous Computation',
        color: '#a78bfa',
        icon: 'fas fa-microchip',
        nodes: ['Automated Image Normalization', 'High-Res PDF Renderer', 'QR/Barcode Generator']
      },
      {
        name: 'Layer 4: Data Integrity & Storage',
        color: '#4ade80',
        icon: 'fas fa-database',
        nodes: ['PostgreSQL WAL Replication', 'Redis In-Memory Session Cache', 'Encrypted S3 Media Store']
      }
    ]
  }
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
